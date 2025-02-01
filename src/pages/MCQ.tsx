import { useCallback, useEffect, useMemo, useState } from 'react'
import "../App.css"
import { useGameContext } from '../providers/GameProvider'

const API_KEY = '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'
// const API_KEY = import.meta.env.OPENAI_API_KEY
console.log(API_KEY)

// Function to randomly generate a multiple-choice question
function MCQ() {
  const { questions, currentQuestionIdx, setCurrentQuestionIdx } = useGameContext();

  const question = useMemo(() => questions[currentQuestionIdx], [questions, currentQuestionIdx]);
  const [selectedOption, setSelectedOption] = useState<number|null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean|null>(null);

  const handleOptionClick = useCallback((optionIdx: number) => {
    setSelectedOption(optionIdx);
    setIsCorrect(optionIdx === question.correctAnswerIdx);
  }, [question]);

  const handleContinue = useCallback(() => {
    console.log("continue pressed")
    setCurrentQuestionIdx((prev: number) => prev + 1);
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-around min-h-screen bg-green-800 p-4 gap-4">
      <h2 className="text-xl font-semibold w-full text-left text-white">{question.question}</h2>
      <div className="grid grid-cols-2 gap-4 h-96 w-full">
        {question.options.map((option: string, index: number) => (
          <button
            key={index}
            className={`p-4 text-lg font-medium rounded-lg shadow-md transition duration-200`}
            onClick={() => handleOptionClick(index)}
          >
            {option}
          </button>
        ))}
      </div>
      {/* <Modal isOpen={selectedOption !== null} onClose={() => setSelectedOption(null)} title="Result" children={<></>} /> */}
      {selectedOption !== null && (
        <div>
          {isCorrect ? (
            <div>
              <p>✅ Correct!</p>
              <button onClick={handleContinue}>Continue</button>
            </div>
          ) : (
            <p className="mt-4 text-center text-lg font-semibold">
              ❌ Incorrect! Try again.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default MCQ
