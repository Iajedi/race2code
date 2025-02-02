import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { CodeDisplay } from '../components/CodeDisplay';
import { TranscriptChat } from '../components/TranscriptChat';
import { AudioVisualizer } from '../components/AudioVisualizer';

const OPENAI_API_KEY = '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';

// Example code to explain
const codeExample = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 5 fibonacci numbers
const result = [];
for (let i = 0; i < 5; i++) {
  result.push(fibonacci(i));
}

console.log(result);`;

function TalkBot() {
  const location = useLocation();
  const uploadedCode = location.state?.code;
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3000); // 3 seconds per step
  const [explanations, setExplanations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAudioVisualizer, setShowAudioVisualizer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleTranscript = (transcript: string) => {
    setTranscript(transcript);
    console.log('Transcript:', transcript);
  };

  const fetchExplanations = async (code: string) => {
    if (!code) return;
    setIsLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: `
              
*Important:** Do not use markdown, backticks (\`\`\`), or code blocks in the explanation. Return the explanation as plain text.

Explain the following code given the following rules:
1. **Split the code into logical blocks** based on function definitions, loops, conditionals, and key expressions. 
2. Each block should be **at least 2-3 lines** but **no longer than 10 lines**.
3. If a function has multiple parts (e.g., base case and recursive case), **split them separately**.
4. For loops, **include all iterations** in one block.
5. For variable initialization, **group related statements**.
              
For each block of code, provide:
1. A brief description of the block.
2. Key programming concepts used.
3. Any notable code patterns or structures.

Return the explanation as an array of objects, where each object contains:
- blockCode: the block of code being explained
- explanation: the explanation of that block.

Code:
${code}`,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch explanations');

      const rawData = await response.json();
      console.log('Raw response data:', rawData);

      const explanationString = rawData.choices[0].message.content;
      const sanitizedString = explanationString.replace(/[\x00-\x1F\x7F]/g, '');
      const responseData = JSON.parse(sanitizedString);

      setExplanations(responseData);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch explanations. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanations(uploadedCode);
  }, [uploadedCode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < explanations.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
    } else if (currentStep >= explanations.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, speed, explanations]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleBlockSelect = (blockIndex: number) => {
    setCurrentStep(blockIndex);
  };

  const handleVisualizerReady = useCallback(async (analyser: AnalyserNode) => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      
      const audioContext = analyser.context;
      const source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyser);
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setIsRecording(false);
    }
  }, []);

  const handleToggleView = () => {
    if (showAudioVisualizer && isRecording) {
      // Clean up audio stream when switching away from visualizer
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsRecording(false);
    }
    setShowAudioVisualizer(!showAudioVisualizer);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Interactive Code Explanation</h1>

        {isLoading ? (
          <div className="text-center text-gray-400">Loading explanations from OpenAI...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left side - Code Display */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div>
                  {explanations.map((block, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 cursor-pointer transition-colors"
                      style={{ backgroundColor: currentStep === index ? '#2d3748' : 'transparent' }}
                      onClick={() => handleBlockSelect(index)}
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-center text-white flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <CodeDisplay
                          code={block.blockCode}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Toggle between AudioVisualizer and TranscriptChat */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleToggleView}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    {showAudioVisualizer ? (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        <span>Show Transcript</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        <span>Show Visualizer</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="h-[500px]">
                  {showAudioVisualizer ? (
                    <AudioVisualizer
                        isRecording={isRecording}
                        onVisualizerReady={handleVisualizerReady}
                        onRecordingComplete={setAudioBlob}
                        onTranscript={handleTranscript}
                        onTranscriptionError={console.error}
                        isTranscribing={isTranscribing}
                        setIsTranscribing={setIsTranscribing}                  
                  />
                  ) : (
                    <TranscriptChat
                      explanations={explanations}
                      currentStep={currentStep}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={handleReset}
                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-gray-700 rounded-lg px-3 py-2"
              >
                <option value={1500}>Fast</option>
                <option value={3000}>Normal</option>
                <option value={5000}>Slow</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TalkBot;