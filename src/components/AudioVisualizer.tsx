import React, { useRef, useEffect, useState } from 'react';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

interface AudioVisualizerProps {
  isRecording: boolean;
  onVisualizerReady: (analyser: AnalyserNode) => void;
  onRecordingComplete: (blob: Blob) => void;
  onTranscript: (transcript: string) => void;
  onTranscriptionError: (error: string) => void;
  isTranscribing: boolean;
  setIsTranscribing: (isTranscribing: boolean) => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isRecording,
  onVisualizerReady,
  onRecordingComplete,
  onTranscript,
  onTranscriptionError,
  isTranscribing,
  setIsTranscribing
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isLocalRecording, setIsLocalRecording] = useState(false);

  // Initialize the audio context and analyser
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    if (!analyserRef.current) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      onVisualizerReady(analyser);
    }

    const animate = () => {
      if (!isRecording) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        return;
      }

      const analyser = analyserRef.current!;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const percent = value / 255;
        
        const angle = (i * 2 * Math.PI) / bufferLength;
        const length = radius * (1 + percent * 0.5);

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * length;
        const y2 = centerY + Math.sin(angle) * length;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `hsla(${(i * 360) / bufferLength}, 80%, 60%, ${percent})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${(i * 360) / bufferLength}, 80%, 60%, 0.5)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    if (isRecording) {
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRecording, onVisualizerReady]);

  // Start recording
  const startRecording = async () => {
    if (mediaRecorderRef.current) return;

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        await sendToWhisperAPI(audioBlob);
      };

      mediaRecorder.start();
      setIsLocalRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      onTranscriptionError('Failed to start recording. Please check microphone permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      setIsLocalRecording(false);
    }
  };

  console.log(OPENAI_API_KEY);

  // Send audio to OpenAI's Whisper API
  const sendToWhisperAPI = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('model', 'whisper-1');

    setIsTranscribing(true);
    onTranscriptionError('');

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to fetch transcript');

      const data = await response.json();
      onTranscript(data.text);
    } catch (err) {
      console.error(err);
      onTranscriptionError('Failed to fetch transcript. Check the console for details.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <canvas 
        ref={canvasRef} 
        className="w-full h-[500px]"
        style={{ background: 'transparent' }}
      />
      <button
        onClick={isLocalRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isTranscribing ? 'Transcribing...' : (isLocalRecording ? 'Stop Recording' : 'Start Recording')}
      </button>
    </div>
  );
};