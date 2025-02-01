import { useCallback, useMemo, useState } from 'react'
import "../App.css"
import { useGameContext } from '../providers/GameProvider'

// const API_KEY = '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'
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY


// Function to randomly generate a multiple-choice question
function MCQ() {
  const { questions, currentQuestionIdx, setCurrentQuestionIdx, setScore, setIsCorrect, setIsIncorrect } = useGameContext();

  const question = useMemo(() => questions[currentQuestionIdx], [questions, currentQuestionIdx]);
  const [isCorrectFirstTime, setIsCorrectFirstTime] = useState<boolean>(true);

  const handleOptionClick = (optionIdx: number) => {
    setSelectedOption(optionIdx);
    setIsCorrect(optionIdx === correctAnswerIdx);
  };

  const fetchQuestion = useCallback(async () => {
    const prompt = `
    Generate a random multiple-choice question on beginner programming questions.
    Give questions that are useful for learning computer science. 
    Respond strictly in this JSON format:
    {
      "question": "Your question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": Index 0-3 for the correct answer
    }
    Ensure options are distinct and only one correct answer is provided.
    
    Here is a sample response:
    {
      "question": "What is the faster programming language?",
      "options": ["Perl", "Python", "Swift", "C"],
      "answer": 3
    
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

        const data = await response.json();
        const jsonResponse = JSON.parse(data.choices[0].message.content);

        setQuestion(jsonResponse.question)
        setOptions(jsonResponse.options)
        console.log(jsonResponse);

    } catch (error) {
        console.error('Error:', error);
    }
  }, [isCorrectFirstTime, question]);

  return (
    <div className="w-screen h-auto flex flex-col items-center justify-around bg-green-800 p-4 gap-4">
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
    </div>
  )
}

export default MCQ
