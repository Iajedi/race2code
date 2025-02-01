import { useCallback, useEffect, useState } from 'react'
import "../App.css"

// const API_KEY = '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'
const API_KEY = import.meta.env.OPENAI_API_KEY

// Function to randomly generate a multiple-choice question
function Programming() {

  const [blanks, setBlanks] = useState({
    blank1: '',
    blank2: '',
  })

  const components = ['5', 'i', 'int'];

  const handleDragStart = (e, value) => {
    e.dataTransfer.setData('text/plain', value);
  };

  const handleDrop = (e, blankKey) => {
    const value = e.dataTransfer.getData('text/plain');
    setBlanks((prev) => ({ ...prev, [blankKey]: value }));
    e.preventDefault();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const checkAnswer = () => {
    if (blanks.blank1 === 'int' && blanks.blank2 === 'i') {
      alert('✅ Correct!');
    } else {
      alert('❌ Incorrect! Try again.');
    }
  };

  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const correctAnswerIdx = 2; // I don't need this

  const [selectedOption, setSelectedOption] = useState<number|null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean|null>(null);

  const handleOptionClick = (optionIdx: number) => {
    setSelectedOption(optionIdx);
    setIsCorrect(optionIdx === correctAnswerIdx);
  };

  const fetchQuestion = useCallback(async () => {
    const prompt = `
    Generate a random fill-in-the-blankd question on beginner level.
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
            model: 'gpt-4o-latest',
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
  }, [])

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion])


  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center min-h-screen bg-green-800">
      <div className="">
        <h2 className="text-xl font-semibold text-center mb-4">{question}</h2>
        <div className="grid grid-cols-2 gap-4 bg-red-900">
          hi
          {options.map((option, index) => (
            <button
              key={index}
              className={`p-4 text-lg font-medium rounded-lg shadow-md transition duration-200`}
              onClick={() => handleOptionClick(index)}
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

export default Programming
