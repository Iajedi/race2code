// Define our game state interface
interface GameState {
  distance: number;
  velocity: number;
  isAccelerating: boolean;
  isGameComplete: boolean;
}

// Define our physics constants
const GAME_CONSTANTS = {
  // Increased acceleration for more exciting gameplay
  ACCELERATION: 400, // Increased from 20 to 200 pixels/second²
  DECELERATION: -50, // Increased from -10 to -100 pixels/second²
  FINISH_LINE: 10000,
  MAX_VELOCITY: 800, // Added maximum velocity cap
  FPS: 60
} as const;

// Define our initial state as a constant to ensure consistent reset
const INITIAL_STATE: GameState = {
  distance: 0,
  velocity: 0,
  isAccelerating: false,
  isGameComplete: false
};

import { useState, useEffect, useRef } from 'react';

const RacingGame: React.FC = (numCheckpoints) => {
  // Initialize state with type safety
  const [gameState, setGameState] = useState<GameState>({
    distance: 0,
    velocity: 0,
    isAccelerating: false,
    isGameComplete: false
  });

  // Use refs for animation frame handling
  const animationFrameRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Add a reset function to handle game restart
  const handleReset = (): void => {
    // Cancel any ongoing animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    // Reset the last update time
    lastUpdateTimeRef.current = Date.now();
    // Reset the game state to initial values
    setGameState(INITIAL_STATE);
    // Start a new animation frame
    animationFrameRef.current = requestAnimationFrame(updatePhysics);
  };

  // Physics update function using SUVAT equations
  const updatePhysics = (): void => {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = currentTime;

    setGameState(prevState => {
      if (prevState.isGameComplete) return prevState;

      // Calculate new velocity with acceleration
      const acceleration = prevState.isAccelerating
        ? GAME_CONSTANTS.ACCELERATION
        : GAME_CONSTANTS.DECELERATION;

      // Calculate new velocity with a maximum speed cap
      const newVelocity = Math.min(
        Math.max(0, prevState.velocity + acceleration * deltaTime),
        GAME_CONSTANTS.MAX_VELOCITY
      );

      // Calculate displacement using SUVAT equation: s = ut + (1/2)at²
      const displacement = prevState.velocity * deltaTime +
        0.5 * acceleration * deltaTime * deltaTime;

      // Calculate new distance
      const newDistance = prevState.distance + displacement;

      // Check if game is complete
      if (newDistance >= GAME_CONSTANTS.FINISH_LINE) {
        return {
          ...prevState,
          distance: GAME_CONSTANTS.FINISH_LINE,
          isGameComplete: true,
          velocity: 0
        };
      }

      return {
        ...prevState,
        distance: newDistance,
        velocity: newVelocity
      };
    });

    animationFrameRef.current = requestAnimationFrame(updatePhysics);
  };

  // Effect for handling the game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isAccelerating]);

  // Event handlers with proper typing
  const handleAccelerateStart = (): void => {
    if (!gameState.isGameComplete) {
      setGameState(prev => ({ ...prev, velocity: 500 }));
    }
  };

  const handleAccelerateEnd = (): void => {
    setGameState(prev => ({ ...prev, isAccelerating: false }));
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      {/* Racing Scene - Added relative positioning and z-index management */}
      <div className="w-full h-1/2 bg-gray-800 relative overflow-hidden">
        {/* Track - Lowered z-index */}
        <div
          className="absolute inset-0 z-0"
          style={{
            // Replace the gradient with your image URL
            backgroundImage: `url('/track.png')`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: "contain",
            transform: `translateX(-${gameState.distance}px)`,
            width: '700%', // Make sure we have enough room for the repeating background
            height: "100%",
            transition: 'transform 16ms linear'
          }}
        />

        {/* Finish line - Middle z-index */}
        <div
          className="absolute top-0 h-full w-8 bg-red-600 z-10"
          style={{
            left: `calc(50% + ${GAME_CONSTANTS.FINISH_LINE - gameState.distance}px)`
          }}
        />

        {/* Car - Highest z-index and improved visibility */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative w-[200px] h-[100px]">
            {/* Main body with shadow for depth */}
            <div className="absolute bottom-0 w-full h-[60px] bg-red-500 rounded-lg shadow-xl" />

            {/* Hood with gradient for better visibility */}
            <div className="absolute bottom-[40px] left-[40px] w-[120px] h-[40px] bg-gradient-to-r from-red-600 to-red-500 rounded-t-lg" />

            {/* Windows with glare effect */}
            <div className="absolute bottom-[45px] left-[60px] w-[80px] h-[30px] bg-blue-400 rounded-sm 
                          before:content-[''] before:absolute before:inset-0 before:bg-white before:opacity-20" />

            {/* Wheels with rotation animation */}
            <div className="absolute bottom-[-10px] left-[30px] w-[40px] h-[40px] bg-gray-800 rounded-full 
                          border-4 border-gray-700" />
            <div className="absolute bottom-[-10px] right-[30px] w-[40px] h-[40px] bg-gray-800 rounded-full 
                          border-4 border-gray-700" />
          </div>
        </div>

        {/* Speed indicator */}
        <div className="absolute top-4 left-4 text-white text-lg font-bold z-30">
          Speed: {Math.round(gameState.velocity)} px/s
        </div>

        {/* Game complete overlay */}
        {gameState.isGameComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
            <div className="text-white text-4xl font-bold">
              Finish!
            </div>
          </div>
        )}
      </div>

      {/* Controls Container */}
      <div className="w-full h-1/2 bg-white p-4">
        <button
          onMouseDown={handleAccelerateStart}
          onMouseUp={handleAccelerateEnd}
          onMouseLeave={handleAccelerateEnd}
          onTouchStart={handleAccelerateStart}
          onTouchEnd={handleAccelerateEnd}
          disabled={gameState.isGameComplete}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Hold to Accelerate
        </button>

        {gameState.isGameComplete && (
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 
                       transition-all duration-300 ease-in-out"
          >
            Play Again
          </button>
        )}

        {/* Progress bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-100"
            style={{ width: `${(gameState.distance / GAME_CONSTANTS.FINISH_LINE) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default RacingGame;