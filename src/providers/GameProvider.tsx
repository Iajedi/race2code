import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useSearchParams } from 'react-router-dom';

// Create the context
const GameContext = createContext<any>(null);
interface MCQQuestion {
  isMCQ: true;
  question: string;
  options: string[];
  correctAnswerIdx: number;
  explanation: string;
}

// Example structure for a programming question
interface ProgrammingQuestion {
  isMCQ: false;
  question: string;
  code: string;
  fragments: string[];       // possible code fragments to drag 
  correctSequence: string[]; // correct arrangement to fill the placeholders
  explanation: string;
}

interface GameProviderProps {
  progStr: string | null;
  children: React.ReactNode
}

export type Question = MCQQuestion | ProgrammingQuestion;

export const GameProvider = (props: GameProviderProps) => {
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic');

  const [isQuestionsGenerated, setIsQuestionsGenerated] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isIncorrect, setIsIncorrect] = useState<boolean>(false);

  useEffect(() => {
    if (!isQuestionsGenerated) {
      fetchQuestions();
    }
  }, [isQuestionsGenerated]);

  useEffect(() => {
    console.log("Score:", score);
  }, [score]);

  const fetchQuestions = useCallback(async () => {
    console.log(`The topic is ${topic}`);
    console.log(`The prog str is ${props.progStr}`);
    // Modify the prompt to request a mixture of MCQ and programming fill-in questions
    const prompt = !props.progStr ? `
    Generate an array of 5 computer science questions on the topic "${topic}".
    Make some of them multiple choice (where "isMCQ" is true) and at least one fill-in code question (where "isMCQ" is false).
    
    For multiple choice questions:
    {
      "isMCQ": true,
      "question": "<question text>",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIdx": <number between 0 and 3>,
      "explanation": "<explanation>"
    }

    For programming questions:
    {
      "isMCQ": false,
      "question": "<instruction or question prompt>",
      "code": "<string of code with placeholders ?0, ?1, etc.>",
      "fragments": ["<possible code fragment 1>", "<fragment 2>", ...],
      "correctSequence": ["<correct fragment for ?0>", "<for ?1>", ...],
      "explanation": "<explanation>"
    }

    Return only valid JSON (no markdown).
    ` : `
    Generate an array of 5 computer science questions based on the given Python program, where questions are asked about each specific block in the program.
    Each question should focus on a specific detail of one of the four code blocks.  

    - Each question must focus on **concepts** related to a specific code block, such as recursion, loops, data structures, or OOP principles.  
    - Do **not** ask about specific variable names, function names, or exact values.  
    - Only ask about the theoretical concepts demonstrated in the code.  
    - DO NOT ASK QUESTIONS REFERRING TO CODE BLOCKS.
    - An example question would be "What is the purpose of a function <function used in the code>?"

    Each question must follow this format:  
    {  
      "isMCQ": true,  
      "question": "<question text about a specific detail of the block>",  
      "options": ["A", "B", "C", "D"],  
      "correctAnswerIdx": <number between 0 and 3>,  
      "explanation": "<explanation>"
    }
      
    Python program (in blocks):
    You MUST return ONLY valid JSON (no markdown).
    ${props.progStr}
    `;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Raw response from GPT:', data.choices[0].message.content);
        if (!data.choices[0].message.content) {
          console.error('Error:', data);
          return;
        }

        // Attempt to parse the response as JSON
        const jsonResponse = JSON.parse(data.choices[0].message.content);
        setQuestions(jsonResponse as Question[]);
        setIsQuestionsGenerated(true);
      } else {
        throw new Error('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [topic]);

  return (
    <GameContext.Provider
      value={{
        isQuestionsGenerated,
        setIsQuestionsGenerated,
        currentQuestionIdx,
        setCurrentQuestionIdx,
        questions,
        score,
        setScore,
        isCorrect,
        setIsCorrect,
        isIncorrect,
        setIsIncorrect
      }}
    >
      {props.children}
    </GameContext.Provider>
  );
};

// Custom hook to use the context
export const useGameContext = () => useContext(GameContext);
