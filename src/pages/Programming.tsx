import { DragEvent, useCallback, useEffect, useState } from 'react'
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

  const handleDragStart = (e: DragEvent<HTMLDivElement>, value: string) => {
    e.dataTransfer.setData('text/plain', value);
  };

  const handleDrop = (e: DragEvent<HTMLSpanElement>, blankKey: string) => {
    const value = e.dataTransfer.getData('text/plain');
    setBlanks((prev) => ({ ...prev, [blankKey]: value }));
    e.preventDefault();
  };

  const handleDragOver = (e: DragEvent<HTMLSpanElement>) => {
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
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>🧩 Fill-in-the-Blank (Drag & Drop)</h1>
      <p>Drag the correct components into the blanks to complete the code:</p>

      <pre
        style={{
          background: '#f4f4f4',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '16px',
        }}
      >
        {'int i = 0;\nwhile ('}
        <span
          onDrop={(e) => handleDrop(e, 'blank1')}
          onDragOver={handleDragOver}
          style={{
            display: 'inline-block',
            minWidth: '40px',
            padding: '5px',
            backgroundColor: '#ddd',
            border: '1px dashed #999',
            textAlign: 'center',
          }}
        >
          {blanks.blank1 || '____'}
        </span>
        {' < '}
        <span
          onDrop={(e) => handleDrop(e, 'blank2')}
          onDragOver={handleDragOver}
          style={{
            display: 'inline-block',
            minWidth: '40px',
            padding: '5px',
            backgroundColor: '#ddd',
            border: '1px dashed #999',
            textAlign: 'center',
          }}
        >
          {blanks.blank2 || '____'}
        </span>
        {') {\n  i++;\n}'}
      </pre>

      <h3>🧱 Components:</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        {components.map((comp, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, comp)}
            style={{
              padding: '10px 15px',
              backgroundColor: '#90caf9',
              borderRadius: '5px',
              cursor: 'grab',
              userSelect: 'none',
              border: '1px solid #1976d2',
            }}
          >
            {comp}
          </div>
        ))}
      </div>

      <button
        onClick={checkAnswer}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Submit Answer
      </button>
    </div>
  );
}

export default Programming
