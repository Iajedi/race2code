// src/pages/StartScreen.tsx
// import { useNavigate } from 'react-router-dom';
import NavButton from '../components/NavButton';

const StartScreen: React.FC = () => {
  // const navigate = useNavigate();

  // const handleStartGame = () => {
  //   navigate('/courses');
  // };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-black">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
          Race2Code
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          Are you ready to hit the track?
        </p>

        <NavButton 
          destination='/courses'
        >
          Start Racing
        </NavButton>

        <div className="h-4"></div>

        <NavButton destination='/upload'>
          Get Pitstop Tyres (Help with code)
        </NavButton>

      </div>
    </div>
  );
};

export default StartScreen;