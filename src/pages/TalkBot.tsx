import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { CircularVisualizer } from '../components/CircularVisualizer';
import { AudioWaveform } from '../components/AudioWaveform';
import { useLocation } from 'react-router-dom';

import { BuiltInKeyword, Porcupine } from "@picovoice/porcupine-web";
import { usePorcupine } from '@picovoice/porcupine-react';

const TalkBot: React.FC = () => {
  const location = useLocation();
  const file = location.state?.file as File | undefined;
  const [codeBlocks, setCodeBlocks] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string>('');
  const [hotwordDetected, setHotwordDetected] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const porcupineRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

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

  const splitCodeIntoBlocks = (code: string): string[] => {
    return code.split(/\n\s*\n/).map((block) => block.trim());
  };

  useEffect(() => {
    const initPorcupine = async () => {
      try {
        const accessKey = process.env.PORCUPINE_KEY;
        porcupineRef.current = await PorcupineWorkerFactory.create(
          accessKey,
          [{ builtin: BuiltInKeyword.Google }], // Use the default keyword "Hey Google"
          (keywordIndex) => {
            setHotwordDetected(true);
            startRecording();
          }
        );
      } catch (err) {
        setError('Failed to initialize hotword detection.');
      }
    };

    initPorcupine();

    return () => {
      if (porcupineRef.current) {
        porcupineRef.current.terminate();
      }
    };
  }, []);

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

  const processAudio = async (audioBlob: Blob) => {
    console.log('Audio recorded:', audioBlob);
  };

  return (
    <div className="w-screen h-screen flex bg-gradient-to-b from-blue-900 to-black font-sans">
      <div className="w-1/2 p-8 border-r border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Code Blocks</h2>
        <div className="bg-gray-800 p-4 rounded-lg">
          {codeBlocks.map((block, index) => (
            <div key={index} className="mb-4 flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm mr-4">
                {index + 1}
              </div>
              <pre className="text-white text-sm font-mono bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 flex-1">
                <code>{block}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/2 p-8 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-8 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white">Talk to GPTeacher</h1>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl"></div>
            <CircularVisualizer isRecording={isRecording} onVisualizerReady={(analyser: AnalyserNode) => {
              analyserRef.current = analyser;
            }} />
          </div>
          {error ? (
            <p className="text-red-400 text-center max-w-md">{error}</p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button className={`p-4 rounded-full transition-all transform hover:scale-110 ${isRecording ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}>
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