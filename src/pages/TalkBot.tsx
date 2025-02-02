import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CodeDisplay } from '../components/CodeDisplay';
import { TranscriptChat } from '../components/TranscriptChat';
import { AudioVisualizer } from '../components/AudioVisualizer';
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
interface Explanation {
  blockCode: string;
  explanation: string;
  detailedExplanation?: string;
}

function TalkBot() {
  const navigate = useNavigate();
  const location = useLocation();
  const uploadedCode = location.state?.code;
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3000); // 3 seconds per step
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAudioVisualizer, setShowAudioVisualizer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateSpeech = async (text: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'alloy',
          speed: 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (err) {
      console.error('Error generating speech:', err);
    }
  };

  const handleTranscript = async (transcript: string) => {
    setTranscript(transcript);
    console.log('Transcript:', transcript);

    const allBlocksContext = explanations.map((block, index) => `
      Block ${index + 1}:
      ${block.blockCode}
    `).join('\n\n');

    const prompt = `
      Context: The user has access to the following blocks of code:
  
      ${allBlocksContext}
    
      Based on their question in the transcript below, identify which block(s) of code they're asking about 
      and provide a detailed explanation focusing on the aspects they're asking about.
  
      Transcript: ${transcript}

      Rules: Provide a clear explanation in plain text as if you were a teacher explaining it to a student. 
      Let the explanation be more natural and conversational, instead of being stiff and formal. 
      Do not use special characters, bullet points, or formatting. 
      Ensure the explanation is easy to understand and directly answers the question. You can use metaphors or examples to make it easier to understand.
      Do not add headers or bullet points like "1. 2. 3." or "A. B. C.", etc, during the explanation.
  
      Please provide a specific answer to any points or questions raised in the transcript.
    `;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch detailed explanation');

      const data = await response.json();
      const detailedExplanation = data.choices[0].message.content;

      setExplanations(prevExplanations => {
        const newExplanations = [...prevExplanations];
        newExplanations[currentStep] = {
          ...newExplanations[currentStep],
          detailedExplanation: detailedExplanation
        };
        return newExplanations;
      });

      // Generate speech from the detailed explanation
      console.log('Detailed Explanation:', detailedExplanation);
      await generateSpeech(detailedExplanation);

    } catch (err) {
      console.error('Error fetching detailed explanation:', err);
    }
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
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `
              Explain the following code given the following rules:
              1. Split the code into logical blocks based on function definitions, loops, conditionals, and key expressions. 
              2. Each block should be at least 2-3 lines but no longer than 10 lines.
              3. If a function has multiple parts (e.g., base case and recursive case), split them separately.
              4. For loops, include all iterations in one block.
              5. For variable initialization, group related statements.
              
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

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

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

        <audio
          ref={audioRef}
          className="hidden"
          controls
          onEnded={() => setIsPlaying(false)}
        />

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
                        <CodeDisplay code={block.blockCode} />
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

              <button
                onClick={() => {
                  navigate("/game", {
                    state: {
                      progStr: explanations.map((block, index) => `
                  Block ${index + 1}:
                  ${block.blockCode}
                `).join('\n\n')
                    }
                  })
                }}
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
              >
                Generate Game
              </button>

            </div>

            {/*
            {audioUrl && (
              <div className="mt-4 flex justify-center items-center gap-4">
                <button
                  onClick={() => audioRef.current?.play()}
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                >
                  Play Explanation
                </button>
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                    }
                  }}
                  className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-600"
                >
                  Stop
                </button>
              </div>
            )} */}
          </>
        )}
      </div>
    </div>
  );
}

export default TalkBot;