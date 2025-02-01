import { Link } from 'react-router-dom';

const StartScreen: React.FC = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-black">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
          Racing Challenge
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          Are you ready to hit the track?
        </p>

        <Link to="/game">
          <button
            className="px-8 py-4 bg-red-600 text-white text-2xl rounded-lg
                    hover:bg-red-700 transition-all duration-300 ease-in-out
                    transform hover:scale-105 hover:shadow-xl
                    border-2 border-red-400"
          >
            Start Racing
          </button>
        </Link>
      </div>
    </div>
  );
};

export default StartScreen;
