import { useNavigate } from 'react-router-dom';
import Button from '../components/button';

const CourseSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleTopicSelection = (topic: string) => {
    navigate('/racing?topic=' + topic);
  };

  // const topics: { [key: string]: string } = {
  //   "programmingBasics":"Programming Basics",
  //   "pythonBasics": "Python Basics",
  //   "cBasics": "C Basics",
  // }
  const topics: string[] = [
    "Programming Basics",
    "Python Basics",
    "C Basics",
  ]

  const topicButtons = []
  for (let key in topics) {
    topicButtons.push(<Button onClick={() => handleTopicSelection(topics[key])} className='mx-3'> {topics[key]} </Button>)
    
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-black">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
          Choose Your Course
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          Which topic would you like to learn about
        </p>
        {topicButtons}
      </div>
    </div>
  );
};

export default CourseSelection;
