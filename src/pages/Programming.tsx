import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const initialSentence = [
  { id: '1', type: 'text', content: 'The' },
  { id: '2', type: 'blank', content: '' },
  { id: '3', type: 'text', content: 'jumps over the' },
  { id: '4', type: 'blank', content: '' },
  { id: '5', type: 'text', content: '.' }
];

const initialWords = [
  { id: 'word-1', content: 'quick' },
  { id: 'word-2', content: 'lazy' },
  { id: 'word-3', content: 'fox' },
  { id: 'word-4', content: 'dog' }
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
      className="bg-blue-200 p-2 rounded shadow cursor-move"
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
      className={`border-dashed border-2 border-gray-400 min-w-[60px] min-h-[40px] p-2 text-center bg-gray-100 rounded flex items-center justify-center ${isOver ? 'bg-green-100' : ''}`}
    >
      {part.content || '____'}
    </div>
  );
};

export default function DragDropSentenceGame() {
  const [sentence, setSentence] = useState(initialSentence);
  const [words, setWords] = useState(initialWords);

  const handleDrop = (blankId, item) => {
    setSentence((prev) =>
      prev.map((part) => (part.id === blankId ? { ...part, content: item.content } : part))
    );
    setWords((prev) => prev.filter((word) => word.id !== item.id));
  };

  const returnToPool = (word) => {
    setWords((prev) => [...prev, word]);
    setSentence((prev) =>
      prev.map((part) => (part.content === word.content ? { ...part, content: '' } : part))
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Finish the Sentence</h1>
        <div className="flex gap-2">
          {sentence.map((part) =>
            part.type === 'text' ? (
              <span key={part.id}>{part.content}</span>
            ) : (
              <BlankSpace key={part.id} part={part} onDrop={handleDrop} />
            )
          )}
        </div>

        <div className="flex gap-2 mt-4 border-t pt-2">
          {words.map((word) => (
            <DraggableWord key={word.id} word={word} />
          ))}
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-semibold">Return Words to Pool</h2>
          <div className="flex gap-2">
            {sentence
              .filter((part) => part.type === 'blank' && part.content)
              .map((part) => (
                <button
                  key={part.id}
                  onClick={() => returnToPool({ id: `word-${part.content}`, content: part.content })}
                  className="bg-red-200 p-2 rounded shadow cursor-pointer"
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
