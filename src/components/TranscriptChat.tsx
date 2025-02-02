import React from 'react';

interface TranscriptChatProps {
  explanations: Array<{
    blockCode: string;
    explanation: string;
  }>;
  currentStep: number;
}

export const TranscriptChat: React.FC<TranscriptChatProps> = ({ explanations, currentStep }) => {
  return (
    <div className="transcript-chat space-y-4 h-[500px] overflow-y-auto">
      {explanations.slice(0, currentStep + 1).map((explanation, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg ${
            index === currentStep
              ? 'bg-blue-500/20 border border-blue-500/30'
              : 'bg-gray-700/50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              {index + 1}
            </div>
            <div>
              <p className="text-gray-200">{explanation.explanation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};