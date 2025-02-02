import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const API_KEY = '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';

const initialCode = [
  { id: '1', type: 'text', content: 'function' },
  { id: '2', type: 'blank', content: '' },
  { id: '3', type: 'text', content: '() {' },
  { id: '4', type: 'newline', content: '\n' },
  { id: '5', type: 'text', content: '  return' },
  { id: '6', type: 'blank', content: '' },
  { id: '7', type: 'text', content: ';' },
  { id: '8', type: 'newline', content: '\n' },
  { id: '9', type: 'text', content: '}' }
];

const initialWords = [
  { id: 'word-1', content: 'myFunction' },
  { id: 'word-2', content: '"Hello, World!"' },
  { id: 'word-3', content: 'console.log' },
  { id: 'word-4', content: 'greet' }
];

const DraggableWord = ({ word }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'WORD',
    item: { id: word.id, content: word.content },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));


  return (
    <div
      ref={drag}
      className="bg-blue-200 p-2 rounded shadow cursor-move font-mono"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {word.content}
    </div>
  );
};

const BlankSpace = ({ part, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'WORD',
    drop: (item) => onDrop(part.id, item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const getBackgroundColor = () => {
    if (part.isCorrect === true) return 'bg-green-400';  // Green if correct
    if (part.isCorrect === false) return 'bg-red-400';   // Red if incorrect
    if (isOver) return 'bg-green-100';                   // Hover effect
    return 'bg-gray-600';                                // Default
  };

  return (
    <span
      ref={drop}
      className={`border-b-2 border-dashed border-gray-400 px-1 mx-1 text-center rounded-sm font-mono ${getBackgroundColor()}`}
      style={{
        display: 'inline-flex',
        minWidth: part.content ? 'auto' : '40px',
        padding: '2px 4px',
      }}
    >
      {part.content || '____'}
    </span>
  );
};



export default function Programming() {
  const [code, setCode] = useState([]);
  const [words, setWords] = useState([]);
  const [generatedAnswers, setGeneratedAnswers] = useState([]); // Store correct answers
  const [feedbackMessage, setFeedbackMessage] = useState('');


  const fetchCodeData = useCallback(async () => {
    const prompt = `Generate a different simple Python code snippet suitable for beginners. 
    Ensure it's unique from common examples like 'greet' functions. It can involve simple loops, conditionals, or basic math. 
    Keep it under 5 lines and return it as plain text. Do not include any comments or python tags.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
        }),
      });

      const data = await response.json();
      const codeSnippet = data.choices[0].message.content.split('\n');

      const generatedCode = [];
      const generatedWords = [];
      const answers = []; // Store correct answers here
      let idCounter = 1;
      const MAX_BLANKS = 3;
      let blankCounter = 0;

      codeSnippet.forEach((line) => {
        if (line.trim() === '') {
          generatedCode.push({ id: `${idCounter++}`, type: 'newline', content: '\n' });
        } else {
          const wordsInLine = line.split(/(\s+)/);
          wordsInLine.forEach((word) => {
            if (/\s+/.test(word)) {
              generatedCode.push({ id: `${idCounter++}`, type: 'text', content: word });
            } else if (blankCounter < MAX_BLANKS && Math.random() < 0.3) {
              const blankId = `${idCounter++}`;
              generatedCode.push({ id: blankId, type: 'blank', content: '' });
              generatedWords.push({ id: `word-${idCounter}`, content: word });
              answers.push({ id: blankId, correctContent: word }); // Store correct answer
              blankCounter++;
            } else {
              generatedCode.push({ id: `${idCounter++}`, type: 'text', content: word });
            }
          });
          generatedCode.push({ id: `${idCounter++}`, type: 'newline', content: '\n' });
        }
      });

      setCode(generatedCode);
      setWords(generatedWords);
      setGeneratedAnswers(answers); // Save correct answers

    } catch (error) {
      console.error('Error fetching code:', error);
    }
  }, []);

  useEffect(() => {
    fetchCodeData(); // Initial load
  }, [fetchCodeData]);

  const handleDrop = (blankId, item) => {
    setCode((prev) => {
      const updatedCode = prev.map((part) =>
        part.id === blankId ? { ...part, content: item.content } : part
      );

      // Check if all blanks are filled
      const allFilled = updatedCode.every(
        (part) => part.type !== 'blank' || part.content !== ''
      );

      if (allFilled) {
        validateAnswers(updatedCode); // Trigger validation when all blanks are filled
      }

      return updatedCode;
    });

    setWords((prev) => prev.filter((word) => word.id !== item.id));
  };

  const validateAnswers = (currentCode) => {
    setCode((prevCode) =>
      prevCode.map((part) => {
        if (part.type === 'blank') {
          const answer = generatedAnswers.find((ans) => ans.id === part.id);
          if (answer) {
            return {
              ...part,
              isCorrect: part.content === answer.correctContent,
            };
          }
        }
        return part;
      })
    );
  
    const allCorrect = currentCode.every(
      (part) =>
        part.type !== 'blank' ||
        part.content === generatedAnswers.find((ans) => ans.id === part.id)?.correctContent
    );
  
    if (allCorrect) {
      setFeedbackMessage('🎉 Great job! Loading new code...');
      // 🚀 Reload after 2 seconds for better UX
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      setFeedbackMessage('❌ Some answers are incorrect. Try again!');
    }
  };
  
  

  const returnToPool = (word) => {
    setWords((prev) => [...prev, word]);
    setCode((prev) =>
      prev.map((part) => (part.content === word.content ? { ...part, content: '' } : part))
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Complete the Code</h1>

        <pre className="bg-gray-800 text-white p-4 rounded">
          <code className="font-mono">
            {code.map((part) => {
              if (part.type === 'text') {
                return (
                  <span key={part.id} className="text-green-400">
                    {part.content}{' '}
                  </span>
                );
              } else if (part.type === 'blank') {
                return <BlankSpace key={part.id} part={part} onDrop={handleDrop} />;
              } else if (part.type === 'newline') {
                return <br key={part.id} />;
              }
              return null;
            })}
          </code>
        </pre>

        {feedbackMessage && (
          <div
            className={`mt-4 p-3 rounded text-center font-bold ${
              feedbackMessage.includes('Great job') ? 'bg-green-300 text-green-800' : 'bg-red-300 text-red-800'
            }`}
          >
            {feedbackMessage}
          </div>
        )}


        <div className="flex gap-2 mt-4 border-t pt-2">
          {words.map((word) => (
            <DraggableWord key={word.id} word={word} />
          ))}
        </div>


        <div className="mt-4">
          <h2 className="text-lg font-semibold">Return Words to Pool</h2>
          <div className="flex gap-2">
            {code
              .filter((part) => part.type === 'blank' && part.content)
              .map((part) => (
                <button
                  key={part.id}
                  onClick={() =>
                    returnToPool({ id: `word-${part.content}`, content: part.content })
                  }
                  className="bg-red-200 p-2 rounded shadow cursor-pointer font-mono"
                >
                  {part.content}
                </button>
              ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
