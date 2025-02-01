import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Initial data
const components = [
  { id: '1', content: '5' },
  { id: '2', content: 'i' },
  { id: '3', content: 'int' },
];

const correctOrder = ['2', '1', '3']; // Correct sequence: 'i', '5', 'int'

function Programming() {
  const [blanks, setBlanks] = useState({
    blank1: null,
    blank2: null,
    blank3: null,
  });

  const [items, setItems] = useState(components);
  const [feedback, setFeedback] = useState('');

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Handle dropping into blanks
    if (destination.droppableId.startsWith('blank')) {
      const blankKey = destination.droppableId;

      // Prevent dropping if the blank is already filled
      if (blanks[blankKey]) return;

      setBlanks((prev) => ({
        ...prev,
        [blankKey]: items.find((item) => item.id === draggableId),
      }));

      // Remove item from the draggable components list
      setItems((prev) => prev.filter((item) => item.id !== draggableId));
    }

    // Handle dragging back to the component list
    if (destination.droppableId === 'components' && source.droppableId !== 'components') {
      const blankKey = source.droppableId;
      const draggedItem = blanks[blankKey];

      setBlanks((prev) => ({
        ...prev,
        [blankKey]: null,
      }));

      setItems((prev) => [...prev, draggedItem]);
    }
  };

  const checkAnswer = () => {
    const userAnswers = [blanks.blank1, blanks.blank2, blanks.blank3];

    const isCorrect = userAnswers.every(
      (answer, index) => answer && answer.id === correctOrder[index]
    );

    if (isCorrect) {
      setFeedback('✅ Correct!');
    } else {
      setFeedback('❌ Incorrect! Try again.');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>🧩 Fill-in-the-Blank (Drag & Drop)</h1>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Code Snippet */}
        <pre
          style={{
            background: '#f4f4f4',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '16px',
            display: 'flex',
            gap: '5px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {'int '}
          {['blank1', 'blank2', 'blank3'].map((blankKey, index) => (
            <Droppable droppableId={blankKey} key={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    minWidth: '50px',
                    minHeight: '40px',
                    backgroundColor: snapshot.isDraggingOver ? '#b3e5fc' : '#ddd',
                    border: '2px dashed #90a4ae',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '5px',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {blanks[blankKey] && (
                    <Draggable draggableId={blanks[blankKey].id} index={0}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#90caf9',
                            borderRadius: '4px',
                            border: '1px solid #1976d2',
                            cursor: 'grab',
                            userSelect: 'none',
                            ...provided.draggableProps.style,
                          }}
                        >
                          {blanks[blankKey].content}
                        </div>
                      )}
                    </Draggable>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
          {';'}
        </pre>

        {/* Components to Drag */}
        <h3>🧱 Components:</h3>
        <Droppable droppableId="components" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                padding: '10px',
                backgroundColor: '#f0f0f0',
                borderRadius: '5px',
              }}
            >
              {items.map((item, index) => (
                <Draggable draggableId={item.id} index={index} key={item.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: '#90caf9',
                        borderRadius: '5px',
                        border: '1px solid #1976d2',
                        cursor: 'grab',
                        userSelect: 'none',
                        ...provided.draggableProps.style,
                      }}
                    >
                      {item.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={checkAnswer}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Submit Answer
      </button>

      {feedback && <p style={{ marginTop: '10px' }}>{feedback}</p>}
    </div>
  );
}

export default Programming;
