import { useNavigate } from 'react-router-dom';
import Button from '../components/button';

const StartScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/courses');
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-black">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
          Racing Challenge
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          Are you ready to hit the track?
        </p>
        <Button 
          onClick={handleStartGame}
        >
          Start Racing
        </Button>
      </div>
    </div>
  );
};

export default StartScreen;
