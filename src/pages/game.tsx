import { useEffect, useMemo } from "react"
import "../App.css"
import { GameProvider, useGameContext } from "../providers/GameProvider"
import MCQ from "./MCQ"
import RacingGame from "./Racing"

const API_KEY = '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'
// const API_KEY = import.meta.env.OPENAI_API_KEY
console.log(API_KEY)

// Function to randomly generate a multiple-choice question
function GameWrapper() {
  return (
    <GameProvider>
      <Game/>
    </GameProvider>
  )
}
function Game() {
  const { isQuestionsGenerated, currentQuestionIdx, setCurrentQuestionIdx, questions, score, setIsCorrect, setIsIncorrect } = useGameContext()

  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 py-2">
        <p>Score: {score}</p>
      </div>
      <RacingGame numCheckpoints={5} topicId='' />
      { isQuestionsGenerated ? (
        questions[currentQuestionIdx].isMCQ ? (
          <MCQ/>
        ) : (
          <div>Not MCQ</div>
        )
      ) : (
        // Loading
        <div>Loading...</div>
      )}
    </div>
  )
}

export default GameWrapper
