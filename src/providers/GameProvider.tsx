import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

// Create the context
const GameContext = createContext<any>(null);

const API_KEY = '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'

// Provider component

interface Question {
  isMCQ: boolean;
  question: string;
  options: string[];
  correctAnswerIdx: number;
  explanation: string;
}



export const GameProvider = ({ children }: { children: React.ReactNode}) => {
  // Parameters:
  // - an array of questions

  const topic = 'Basic Programming Concepts';
  const [isQuestionsGenerated, setIsQuestionsGenerated] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [questions, setQuestions] = useState<Question[]|null>(null);
  const [score, setScore] = useState(0)
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isIncorrect, setIsIncorrect] = useState<boolean>(false);

  useEffect(() => {
    if (!isQuestionsGenerated) {
      fetchQuestions();
    }
  }, [isQuestionsGenerated])

  useEffect(() => {
    console.log("Score:", score)
  }, [score])

  const fetchQuestions = useCallback(async () => {
    const prompt = `
    Generate five random multiple-choice questions on ${topic}.
    Give questions that are useful for learning computer science. 
    Respond with an array of JSONs, which are in this format:
    {
      "isMCQ": boolean (all of them must be true),
      "question": "Your question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIdx": Index 0-3 for the correct answer,
      "explanation": "Explanation for the correct answer"
    }
    Do not surround your response with \`\`\`json.
    Strictly reply with pure text.
    Ensure options are distinct and only one correct answer is provided.
    
    Here is a sample JSON in the array:
    {
      "isMCQ": true,
      "question": "What is the faster programming language?",
      "options": ["Perl", "Python", "Swift", "C"],
      "correctAnswerIdx": 3,
      "explanation": "Explanation for the correct answer"
    }`;
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
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.choices[0].message.content)
        if (!data.choices[0].message.content) {
          console.error('Error:', data);
          return;
        }

        const jsonResponse = JSON.parse(data.choices[0].message.content);
        setQuestions(jsonResponse)
        setIsQuestionsGenerated(true);

      } else {
        throw new Error('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [])

  return (
    <GameContext.Provider value={{ isQuestionsGenerated, setIsQuestionsGenerated, currentQuestionIdx, setCurrentQuestionIdx, questions, score, setScore, isCorrect, setIsCorrect, isIncorrect, setIsIncorrect }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the context
export const useGameContext = () => useContext(GameContext);
