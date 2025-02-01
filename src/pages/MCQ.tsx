import { useState } from 'react'
import "../App.css"

const API_KEY = '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'

// Function to randomly generate a multiple-choice question
function MCQ() {
  const question = "What is the capital of France?";
  const options = ["Berlin", "Madrid", "Paris", "Rome"];
  const correctAnswerIdx = 2; // Starts from index 0

  const [selectedOption, setSelectedOption] = useState<number|null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean|null>(null);

  const handleOptionClick = (optionIdx: number) => {
    setSelectedOption(optionIdx);
    setIsCorrect(optionIdx === correctAnswerIdx);
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center min-h-screen bg-green-800">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
        <h2 className="text-xl font-semibold text-center mb-4">{question}</h2>
        <div className="grid grid-cols-2 gap-4">
          {options.map((option, index) => (
            <button
              key={index}
              className={`p-4 text-lg font-medium rounded-lg shadow-md transition duration-200 ${
                selectedOption === option
                  ? isCorrect
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {selectedOption && (
          <p className="mt-4 text-center text-lg font-semibold">
            {isCorrect ? "✅ Correct!" : "❌ Incorrect! Try again."}
          </p>
        )}
      </div>
    </div>
  )
}

export default MCQ
