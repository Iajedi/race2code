import React, { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { CircularVisualizer } from '../components/CircularVisualizer';
import { AudioWaveform } from '../components/AudioWaveform';
import { useLocation } from 'react-router-dom';

const TalkBot: React.FC = () => {
  const location = useLocation();
  const file = location.state?.file as File | undefined;
  const [codeBlocks, setCodeBlocks] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  // Analyze the uploaded Python file and split into labeled code blocks
  useEffect(() => {
    if (file) {
      const analyzeFile = async () => {
        const fileContent = await file.text();
        const blocks = splitCodeIntoBlocks(fileContent);
        setCodeBlocks(blocks);
      };
      analyzeFile();
    }
  }, [file]);

  // Mock function to split code into labeled blocks
  const splitCodeIntoBlocks = (code: string): string[] => {
    return code.split(/\n\s*\n/).map((block) => block.trim());
  };

  // Handle starting the audio visualizer
  const handleVisualizerReady = useCallback(async (analyser: AnalyserNode) => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);

      const audioContext = analyser.context;
      const source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyser);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to use the visualizer.');
      setIsRecording(false);
    }
  }, []);

  // Toggle recording state
  const toggleRecording = () => {
    if (!isRecording && stream) {
      setIsRecording(true);
    } else if (isRecording) {
      setIsRecording(false);
    }
  };

  return (
    <div className="w-screen h-screen flex bg-gradient-to-b from-blue-900 to-black font-sans">
      {/* Left Side: Code Blocks */}
      <div className="w-1/2 p-8 border-r border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Code Blocks</h2>
        <div className="bg-gray-800 p-4 rounded-lg">
          {codeBlocks.map((block, index) => (
            <div key={index} className="mb-4 flex items-start">
              {/* Round Circle Label */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm mr-4">
                {index + 1}
              </div>

              {/* Code Block */}
              <pre className="text-white text-sm font-mono bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 flex-1">
                <code>{block}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Audio Visualizer */}
      <div className="w-1/2 p-8 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-8 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white">Talk to GPTeacher</h1>

          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl"></div>
            <CircularVisualizer
              isRecording={isRecording}
              onVisualizerReady={handleVisualizerReady}
            />
          </div>

          {error ? (
            <p className="text-red-400 text-center max-w-md">{error}</p>
          ) : (
            <button
              onClick={toggleRecording}
              className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
          )}

          <p className="text-gray-400 text-center">
            {isRecording ? 'Recording...' : 'Click the microphone to start'}
          </p>

          {/* Audio Waveform */}
          <AudioWaveform isActive={isRecording} color="#3b82f6" barCount={20} />
        </div>
      </div>
    </div>
  );
};

export default TalkBot;