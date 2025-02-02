import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { CircularVisualizer } from '../components/CircularVisualizer';
import { AudioWaveform } from '../components/AudioWaveform';
import { useLocation } from 'react-router-dom';

const OPENAI_API_KEY = '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';

const TalkBot = () => {
  const location = useLocation();
  const file = location.state?.file;
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [hotwordDetected, setHotwordDetected] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const analyserRef = useRef(null);

  const EXPLANATION_PROMPT = `
Please analyze this Python code that has been split into numbered blocks. 
For each block starting with '# --- Block X ---', provide:
1. A brief description of its functionality
2. Key programming concepts used
3. Any notable code patterns or structures

Return a JSON object where keys are block numbers (as integers) and values 
are explanations (as strings). Use plain English and avoid technical jargon.

Example response:
{
  "1": "This block initializes the main application configuration...",
  "2": "Here we define the database connection helper function..."
}

Code to analyze:
`;

  const splitCodeIntoBlocks = (code) => {
    return code.split(/\n\s*\n/).map((block, index) => {
      return `# --- Block ${index + 1} ---\n${block.trim()}`;
    });
  };

  const getExplanation = async (fullCode) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: EXPLANATION_PROMPT + fullCode }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Explanation failed');
      const data = await response.json();
      setExplanations(data.choices[0].message.content);
    } catch (err) {
      console.error(err);
      setError('Failed to get explanations');
    }
  };

  useEffect(() => {
    if (file) {
      const analyzeFile = async () => {
        setIsLoading(true);
        try {
          const fileContent = await file.text();
          const blocks = splitCodeIntoBlocks(fileContent);
          setCodeBlocks(blocks);
          await getExplanation(blocks.join('\n\n')); // Send labeled code
        } finally {
          setIsLoading(false);
        }
      };
      analyzeFile();
    }
  }, [file]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        processAudio(audioBlob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      analyserRef.current = audioContext.createAnalyser();
      source.connect(analyserRef.current);
      detectSilence();
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
    }
  };

  const detectSilence = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkSilence = () => {
      analyser.getByteFrequencyData(dataArray);
      const isSilent = dataArray.every((value) => value < 10);
      if (isSilent && mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setHotwordDetected(false);
      } else {
        requestAnimationFrame(checkSilence);
      }
    };
    checkSilence();
  };

  const processAudio = async (audioBlob) => {
    console.log('Audio recorded:', audioBlob);
    // Add your logic to process the recorded audio here
  };

  return (
    <div className="w-screen h-screen flex bg-gradient-to-b from-blue-900 to-black font-sans">
      <div className="w-1/2 p-8 border-r border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Code Blocks</h2>
        <div className="bg-gray-800 p-4 rounded-lg">
          {codeBlocks.map((block, index) => (
            <div
              key={index}
              className="mb-4 flex items-start"
              onClick={() => setSelectedBlock(index + 1)}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm mr-4">
                {index + 1}
              </div>
              <pre className="text-white text-sm font-mono bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 flex-1">
                <code>{block}</code>
              </pre>
            </div>
          ))}
        </div>

        {selectedBlock && explanations[selectedBlock] && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-white font-bold mb-2">Explanation for Block {selectedBlock}</h3>
            <p className="text-gray-200">{explanations[selectedBlock]}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-white mt-4">
            Analyzing code with AI...
          </div>
        )}
      </div>

      <div className="w-1/2 p-8 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-8 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white">Talk to GPTeacher</h1>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl"></div>
            <CircularVisualizer isRecording={isRecording} onVisualizerReady={(analyser) => {
              analyserRef.current = analyser;
            }} />
          </div>
          {error ? (
            <p className="text-red-400 text-center max-w-md">{error}</p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button
                className={`p-4 rounded-full transition-all transform hover:scale-110 ${isRecording ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}
                onClick={() => {
                  if (isRecording) {
                    mediaRecorderRef.current?.stop();
                  } else {
                    startRecording();
                  }
                }}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <p className="text-gray-400 text-center">{hotwordDetected ? 'Listening...' : 'Say "Hey Google" to start'}</p>
            </div>
          )}
          <AudioWaveform isActive={isRecording} color="#3b82f6" barCount={20} />
        </div>
      </div>
    </div>
  );
};

export default TalkBot;