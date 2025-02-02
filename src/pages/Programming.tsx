import { useState, useEffect, useMemo } from 'react';
import { useGameContext } from '../providers/GameProvider';
import Modal from '../components/Modal';

/**
 * This component handles the "fill in the blanks" style coding questions.
 * 
 * Assumes the question object (when isMCQ === false) may have the structure:
 * {
 *   isMCQ: false,
 *   question: string,
 *   code: string,  // The code template with placeholders, e.g. "... ?0 ..."
 *   fragments: string[],  // The array of fragments to drag
 *   correctSequence: string[], // The correct arrangement for each placeholder
 *   explanation: string
 * }
 */

export default function Programming() {
  const {
    questions,
    currentQuestionIdx,
    setCurrentQuestionIdx,
    setScore,
    setIsCorrect,
    setIsIncorrect,
  } = useGameContext();

  const question = useMemo(() => questions[currentQuestionIdx], [questions, currentQuestionIdx]);

  // Keep track of how the user arranges the code fragments
  // If there are N placeholders, we track an array of length N 
  // that stores which fragment index is currently dropped in each placeholder.
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);

  // For controlling explanation modal
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  // Initialize our userAnswers array whenever we switch to a new question
  useEffect(() => {
    if (question && !question.isMCQ) {
      // If we have N placeholders in code, set them initially to null
      // The question might store placeholders as '?0', '?1', etc.
      // Or we just take the length of question.correctSequence for initialization
      setUserAnswers(Array(question.correctSequence.length).fill(null));
    }
  }, [question]);

  // Handler for dragging an option
  // You might need more elaborate drag & drop logic, but here’s a simplified approach.
  const handleDragStart = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', String(index));
  };

  // Handler for dropping an option in a placeholder
  const handleDrop = (placeholderIdx: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fragmentIndexStr = e.dataTransfer.getData('text/plain');
    const fragmentIndex = parseInt(fragmentIndexStr, 10);

    // If valid index, place the fragment into that placeholder
    if (!isNaN(fragmentIndex)) {
      const updatedAnswers = [...userAnswers];
      updatedAnswers[placeholderIdx] = question.fragments[fragmentIndex];
      setUserAnswers(updatedAnswers);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Needed so drop event is allowed
    e.preventDefault();
  };

  // Check if user’s arrangement matches the correct arrangement
  const handleSubmit = () => {
    if (!question) return;
    const isAllFilled = userAnswers.every((ans) => ans !== null);
    if (!isAllFilled) {
      // If not all placeholders are filled, mark as incorrect 
      setIsIncorrect(true);
      return;
    }

    const isMatch = userAnswers.every(
      (fragment, idx) => fragment === question.correctSequence[idx]
    );

    if (isMatch) {
      setScore((prev: number) => prev + 1);
      setIsCorrect(true);
      setIsExplanationOpen(true);
    } else {
      setIsIncorrect(true);
    }
  };

  // Move to the next question
  const goNext = () => {
    if (currentQuestionIdx < questions.length) {
      setCurrentQuestionIdx((prev: number) => prev + 1);
    }
    setIsExplanationOpen(false);
    setIsCorrect(false);
    setIsIncorrect(false);
  };

  if (!question || question.isMCQ) {
    return null;
  }

  /**
   * Example code rendering strategy:
   * We'll split the question.code string on placeholders like ?0, ?1, etc.
   * Then each placeholder becomes a drop zone. This is just one approach.
   * 
   * E.g. If question.code = "function test() {\n  while (?0) {\n    ?1\n  }\n}"
   * We split on the tokens `?0`, `?1`, ... and render placeholders in their place.
   */
  // A naive approach: For n placeholders, we do code.split('?0') -> placeholders[0], placeholder for ?0, placeholders[1], placeholder for ?1, ...
  // For a robust approach, you'd do something more dynamic or use a template engine.
  
  // We'll assume the placeholders are in order: ?0, ?1, ?2...
  const codeFragments = question.code.split(/\?(\d+)/); 
  // This will split e.g. "some ?0 code ?1 stuff" into ["some ", "0", " code ", "1", " stuff"]
  // The even indices in the array are code text, the odd indices are placeholder indices.

  const renderCodeWithPlaceholders = () => {
    const elements = [];
    for (let i = 0; i < codeFragments.length; i++) {
      // Even indices are code, odd are placeholder references
      if (i % 2 === 0) {
        // Just text
        elements.push(
          <span key={`text-${i}`}>{codeFragments[i]}</span>
        );
      } else {
        // placeholder
        const phIndex = parseInt(codeFragments[i], 10); 
        const value = userAnswers[phIndex];
        elements.push(
          <span
            key={`placeholder-${i}`}
            onDrop={handleDrop(phIndex)}
            onDragOver={handleDragOver}
            style={{
              display: 'inline-block',
              minWidth: '70px',
              minHeight: '24px',
              backgroundColor: '#222',
              color: '#fff',
              margin: '0 4px',
              borderRadius: '4px',
              textAlign: 'center',
              cursor: 'move',
            }}
          >
            {value || 'DROP HERE'}
          </span>
        );
      }
    }
    return elements;
  };

  return (
    <div className="w-full flex flex-col items-center justify-around bg-green-800 p-4 gap-4">
      <h2 className="text-xl font-semibold w-full text-left text-white">
        {question.question}
      </h2>

      {/* Code area */}
      <pre className="text-white bg-black p-4 rounded-lg whitespace-pre-wrap max-w-3xl">
        {renderCodeWithPlaceholders()}
      </pre>

      <div className="flex flex-wrap gap-4 w-full items-center justify-center">
        {/* Draggable fragments */}
        {question.fragments.map((fragment: string, index: number) => (
          <div
            key={index}
            draggable
            onDragStart={handleDragStart(index)}
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-move"
          >
            {fragment}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-yellow-500 text-black px-4 py-2 rounded-lg mt-4"
      >
        Check Answer
      </button>

      {/* Explanation Modal */}
      <Modal
        isOpen={isExplanationOpen}
        onClose={goNext}
        title="Explanation"
        description={question.explanation || ""}
      >
        <div />
      </Modal>
    </div>
  );
}
