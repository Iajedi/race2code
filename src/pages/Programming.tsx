import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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

export default function DragDropSentenceGame() {
  const [sentence, setSentence] = useState(initialSentence);
  const [words, setWords] = useState(initialWords);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Dragging from the word pool to a blank
    if (destination.droppableId.startsWith('blank-') && source.droppableId === 'words-pool') {
      const targetBlankId = destination.droppableId.split('-')[1];

      setSentence((prev) =>
        prev.map((part) => {
          if (part.id === targetBlankId && part.content === '') {
            return { ...part, content: words.find((w) => w.id === draggableId).content };
          }
          return part;
        })
      );

      setWords((prev) => prev.filter((word) => word.id !== draggableId));
    }

    // Dragging from a blank back to the word pool
    if (destination.droppableId === 'words-pool' && source.droppableId.startsWith('blank-')) {
      const sourceBlankId = source.droppableId.split('-')[1];
      const wordContent = sentence.find((part) => part.id === sourceBlankId).content;

      if (wordContent) {
        setWords((prev) => [...prev, { id: draggableId, content: wordContent }]);

        setSentence((prev) =>
          prev.map((part) =>
            part.id === sourceBlankId ? { ...part, content: '' } : part
          )
        );
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Finish the Sentence</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-2">
          {sentence.map((part) =>
            part.type === 'text' ? (
              <span key={part.id}>{part.content}</span>
            ) : (
              <Droppable droppableId={`blank-${part.id}`} key={part.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="border-dashed border-2 border-gray-400 min-w-[60px] min-h-[40px] p-2 text-center bg-gray-100 rounded flex items-center justify-center"
                  >
                    {part.content ? (
                      <Draggable draggableId={`blank-${part.id}`} index={0} key={part.id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-green-200 p-2 rounded shadow cursor-move"
                          >
                            {part.content}
                          </div>
                        )}
                      </Draggable>
                    ) : (
                      '____'
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )
          )}
        </div>

        <Droppable droppableId="words-pool" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-2 mt-4 border-t pt-2"
            >
              {words.map((word, index) => (
                <Draggable draggableId={word.id} index={index} key={word.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-blue-200 p-2 rounded shadow cursor-move"
                    >
                      {word.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
