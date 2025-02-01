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

  return (
    <div
      ref={drop}
      className={`border-dashed border-2 border-gray-400 min-w-[80px] min-h-[30px] p-1 text-center bg-gray-600 rounded flex items-center justify-center font-mono ${isOver ? 'bg-green-100' : ''}`}
    >
      {part.content || '____'}
    </div>
  );
};

export default function Programming() {
  const [code, setCode] = useState([]);
  const [words, setWords] = useState([]);

  const fetchCodeData = useCallback(async () => {
    const prompt = `Generate a simple Python code snippet on a beginner level, maximum 5 lines. 
    Give your response in a string.
    Here is a sample response:
    
    def greet(name):
    print(f"Hello, {name}!")
    greet("Alice")`;

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
          temperature: 0.7
        })
      });

      const data = await response.json();
      const codeSnippet = data.choices[0].message.content.split('\n');

      console.log('Code snippet:', codeSnippet);

      const generatedCode = [];
      const generatedWords = [];
      let idCounter = 1;

      const MAX_BLANKS = 3;  // Maximum number of blanks
      let blankCounter = 0;  // Counter to track blanks created
      
      codeSnippet.forEach((line) => {
        if (line.trim() === '') {
          generatedCode.push({ id: `${idCounter++}`, type: 'newline', content: '\n' });
        } else {
          const wordsInLine = line.split(/(\s+)/); // Split by spaces while keeping them
      
          wordsInLine.forEach((word) => {
            if (/\s+/.test(word)) {
              // If the word is whitespace, add it as text without blanking
              generatedCode.push({ id: `${idCounter++}`, type: 'text', content: word });
            } else if (blankCounter < MAX_BLANKS && Math.random() < 0.3) {
              // Blank out non-whitespace words if limit isn't reached
              generatedCode.push({ id: `${idCounter++}`, type: 'blank', content: '' });
              generatedWords.push({ id: `word-${idCounter}`, content: word });
              blankCounter++;
            } else {
              // Add normal text if not blanked
              generatedCode.push({ id: `${idCounter++}`, type: 'text', content: word });
            }
          });
      
          generatedCode.push({ id: `${idCounter++}`, type: 'newline', content: '\n' });
        }
      });
      
      
      
      setCode(generatedCode);
      setWords(generatedWords);

    } catch (error) {
      console.error('Error fetching code:', error);
    }
  }, [API_KEY]);

  useEffect(() => {
    fetchCodeData(); // Initial load
  }, [fetchCodeData]);

  const handleDrop = (blankId: any, item: { content: any; id: any; }) => {
    setCode((prev) =>
      prev.map((part) => (part.id === blankId ? { ...part, content: item.content } : part))
    );
    setWords((prev) => prev.filter((word) => word.id !== item.id));
  };

  const returnToPool = (word: { id: string; content: any; }) => {
    setWords((prev) => [...prev, word]);
    setCode((prev) =>
      prev.map((part) => (part.content === word.content ? { ...part, content: '' } : part))
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Complete the Code</h1>
        <button onClick={fetchCodeData} className="bg-green-500 text-white p-2 rounded mb-4">Generate New Code</button>

        <pre className="bg-gray-800 text-white p-4 rounded">
          <code className="font-mono">
            {code.map((part) => {
              if (part.type === 'text') {
                return <span key={part.id} className="text-green-400">{part.content} </span>;
              } else if (part.type === 'blank') {
                return <BlankSpace key={part.id} part={part} onDrop={handleDrop} />;
              } else if (part.type === 'newline') {
                return <br key={part.id} />;
              }
              return null;
            })}
          </code>
        </pre>

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
                  onClick={() => returnToPool({ id: `word-${part.content}`, content: part.content })}
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