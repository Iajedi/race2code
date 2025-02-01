// Define our game state interface
interface GameState {
  distance: number;
  velocity: number;
  isAccelerating: boolean;
  isGameComplete: boolean;
  currCheckpoint: number;
}

interface RacingGameProps {
  numCheckpoints: number;
  topicId: string;
}

// Define our physics constants
const GAME_CONSTANTS = {
  // Increased acceleration for more exciting gameplay
  ACCELERATION: 600, // Increased from 20 to 200 pixels/second²
  DECELERATION: -25, // Increased from -10 to -100 pixels/second²
  FINISH_LINE: 10000,
  MAX_VELOCITY: 1200, // Added maximum velocity cap
  FPS: 60
} as const;

// Define our initial state as a constant to ensure consistent reset
const INITIAL_STATE: GameState = {
  distance: 0,
  velocity: 0,
  isAccelerating: false,
  isGameComplete: false,
  currCheckpoint: 1,
};

import { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../providers/GameProvider';

export default function RacingGame(props: RacingGameProps) {
  const { isCorrect, setIsCorrect, isIncorrect, setIsIncorrect } = useGameContext();

  useEffect(() => {
    if (isCorrect) {
      setIsIncorrect(false)
      const timer = setTimeout(() => {
        setIsCorrect(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isCorrect])

  useEffect(() => {
    if (isIncorrect) {
      setIsCorrect(false)
      const timer = setTimeout(() => {
        setIsIncorrect(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isIncorrect])
  // Initialize state with type safety
  const [gameState, setGameState] = useState<GameState>({
    distance: 0,
    velocity: 0,
    isAccelerating: false,
    isGameComplete: false,
    currCheckpoint: 1,
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

      var currCheckpointDist = GAME_CONSTANTS.FINISH_LINE / (props.numCheckpoints + 1) * prevState.currCheckpoint;
      const CKPT_DIST_PADDING = 100;
      if (newDistance >= currCheckpointDist - CKPT_DIST_PADDING && (prevState.currCheckpoint - 1) < props.numCheckpoints) {
        var nextCheckpoint = prevState.currCheckpoint + 1;
        return {
          ...prevState,
          currCheckpoint: nextCheckpoint,
          distance: currCheckpointDist - CKPT_DIST_PADDING + 1,
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
    <div className="w-full flex flex-col items-center justify-center">
      {/* Racing Scene - Added relative positioning and z-index management */}
      <div style={{height: 200}} className="w-full bg-gray-800 relative overflow-hidden">
        {/* Track - Lowered z-index */}
        <div
          className="absolute inset-0 z-0"
          style={{
            // Replace the gradient with your image URL
            backgroundImage: `url('src/assets/track.png')`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: "contain",
            transform: `translateX(-${gameState.distance}px)`,
            width: '800%', // Make sure we have enough room for the repeating background
            height: "100%",
            transition: 'transform 16ms linear'
          }}
        />

        <div
          className="absolute top-0 h-full z-10"
          style={{
            backgroundImage: `url('src/assets/finish_line.png')`,
            width: "60px",
            height: "600px",
            left: `calc(50% + ${GAME_CONSTANTS.FINISH_LINE - gameState.distance}px)`
          }}
        />

        {
          Array.from({ length: props.numCheckpoints }).map((_, index) =>
            <div
              className="absolute top-0 h-full w-8 bg-red-600 z-10" key={index}
              style={{
                left: `calc(50% + ${(GAME_CONSTANTS.FINISH_LINE / (props.numCheckpoints + 1) * (index + 1)) - gameState.distance}px)`
              }}
            ></div>
          )}

        {/* Car - Highest z-index and improved visibility */}
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20' style={{
          backgroundImage: `url('src/assets/car.png')`,
          width: "200px",
          height: "100px",
        }} />

        {/* Question number indicator */}
        {!gameState.isGameComplete && <div className="absolute bottom-4 right-4 text-white text-lg font-bold z-30">
          Round: {gameState.currCheckpoint - 1}/{props.numCheckpoints}
        </div>
        }

        {/* Game complete overlay */}
        {gameState.isGameComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-40">
            <div className="text-white text-4xl font-bold">
              Finish!
            </div>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center z-100">
          {isCorrect && (
            <div className="bg-green-500 rounded px-4 py-2">
              <p className="text-white">Correct!</p>
            </div>
          )}
          {isIncorrect && (
            <div className="bg-red-500 rounded px-4 py-2">
              <p className="text-white">Incorrect!</p>
            </div>
          )}
        </div>
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
      </div>
    </div>
  );
};
