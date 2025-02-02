import { useCallback, useMemo, useState } from 'react'
import "../App.css"
import { useGameContext } from '../providers/GameProvider'
import Modal from '../components/Modal'
import { useNavigate } from 'react-router-dom'

const API_KEY = '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'
// const API_KEY = import.meta.env.OPENAI_API_KEY
console.log(API_KEY)

// Function to randomly generate a multiple-choice question
function MCQ(props: { nextQuestion: any }) {
  const navigate = useNavigate();
  const { questions, currentQuestionIdx, setCurrentQuestionIdx, setScore, setIsCorrect, setIsIncorrect } = useGameContext();

  const question = useMemo(() => questions[currentQuestionIdx], [questions, currentQuestionIdx]);
  const [isCorrectFirstTime, setIsCorrectFirstTime] = useState<boolean>(true);

  const [isExplanationOpen, setIsExplanationOpen] = useState(false);


  const handleOptionClick = useCallback((optionIdx: number) => {
    if (optionIdx === question.correctAnswerIdx) {
      // Correct
      if (isCorrectFirstTime) {
        setScore((prev: number) => prev + 1);
        setCurrentQuestionIdx((prev: number) => prev + 1);
        props.nextQuestion();
      } else {
        setIsExplanationOpen(true);
        setIsCorrectFirstTime(true);
      }
      setIsCorrect(true);
    } else {
      // Incorrect
      setIsCorrectFirstTime(false);
      setIsIncorrect(true);

    }
  }, [isCorrectFirstTime, question]);

  return (
    <div className="w-full flex flex-col items-center justify-around bg-green-800 p-4 gap-4">
      <h2 className="text-xl font-semibold w-full text-left text-white">{question ? question.question : "Loading..."}</h2>
      <div className="grid grid-cols-2 gap-4 h-96 w-full">
        {question && question.options.map((option: string, index: number) => (
          <button
            key={index}
            className={`p-4 text-lg font-medium rounded-lg shadow-md transition duration-200`}
            onClick={() => handleOptionClick(index)}
          >
            {option}
          </button>
        ))}
      </div>
      <Modal 
        isOpen={isExplanationOpen} 
        onClose={() => {
          if (currentQuestionIdx < questions.length) {
            setCurrentQuestionIdx((prev: number) => prev + 1);
          }
          setIsExplanationOpen(false);
          props.nextQuestion();
        }}
        title={'Explanation'}
        description={question?.explanation || ''}
        >
        <div/>
      </Modal>
    </div>
  )
}

export default MCQ