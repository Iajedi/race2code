import { useEffect, useMemo, useState } from "react"
import "../App.css"
import { GameProvider, useGameContext } from "../providers/GameProvider"
import MCQ from "./MCQ"

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
  const { isQuestionsGenerated, setIsQuestionsGenerated, currentQuestionIdx, setCurrentQuestionIdx, questions } = useGameContext()

  const currQuestion = useMemo(() => questions[currentQuestionIdx], [questions, currentQuestionIdx])


  useEffect(() => {
    console.log("currentQuestionIdx updated in game.tsx:", currentQuestionIdx)
  }, [currentQuestionIdx])

  return (
    <GameProvider>
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
    </GameProvider>
  )
}

export default GameWrapper
