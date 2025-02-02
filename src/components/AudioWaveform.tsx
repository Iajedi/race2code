import React from 'react';

interface AudioWaveformProps {
  isActive?: boolean;
  color?: string;
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive = true,
  color = '#3b82f6',
  barCount = 20,
}) => {
  return (
    <div className="flex items-center gap-[2px] h-12">
      {[...Array(barCount)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-75 ${
            isActive ? 'animate-waveform' : 'h-2'
          }`}
          style={{
            backgroundColor: color,
            animation: isActive ? `waveform 0.5s linear infinite ${i * 0.05}s` : 'none',
          }}
        />
      ))}
    </div>
  );
};