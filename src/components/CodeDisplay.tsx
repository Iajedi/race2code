import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeDisplayProps {
  code: string;
  currentExplanation: {
    lineNumbers?: number[]; // Make it optional
    highlightWords?: string[]; // Make it optional
  };
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, currentExplanation }) => {
  const codeLines = code.split('\n');
  const { lineNumbers = [], highlightWords = [] } = currentExplanation || {}; // Default values

  const customStyle = {
    backgroundColor: 'transparent',
    padding: '1rem',
    margin: 0,
    borderRadius: '0.5rem',
  };

  return (
    <div className="relative font-mono text-sm normal-case">
      {/* Highlight lines */}
      <div className="absolute inset-0 pointer-events-none">
        {lineNumbers.map((lineNum) => (
          <div
            key={lineNum}
            className="bg-blue-500/20 w-full"
            style={{
              position: 'absolute',
              top: `${(lineNum - 1) * 24}px`,
              height: '24px',
            }}
          />
        ))}
      </div>

      {/* Syntax-highlighted code */}
      <SyntaxHighlighter
        language="javascript"
        style={atomDark}
        customStyle={customStyle}
        wrapLines={true}
        lineProps={(lineNumber) => ({
          style: {
            display: 'block',
            width: '100%',
            height: '24px',
          },
        })}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};