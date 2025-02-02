import React, { useRef, useEffect } from 'react';

interface CircularVisualizerProps {
  isRecording: boolean;
  onVisualizerReady: (analyser: AnalyserNode) => void;
}

export const CircularVisualizer: React.FC<CircularVisualizerProps> = ({ 
  isRecording,
  onVisualizerReady 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Set canvas size with device pixel ratio for sharp rendering
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

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Center point
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;

      // Draw circular visualizer
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const percent = value / 255;
        
        const angle = (i * 2 * Math.PI) / bufferLength;
        const length = radius * (1 + percent * 0.5); // Extend outward based on frequency

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

        // Add glow effect
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

  return (
    <canvas 
      ref={canvasRef} 
      className="w-[400px] h-[400px]"
      style={{ background: 'transparent' }}
    />
  );
};