// Define our game state interface
interface GameState {
  distance: number;
  velocity: number;
  isAccelerating: boolean;
  isGameComplete: boolean;
  currCheckpoint: number;
  isDoorClosed: boolean;
  isCountingDown: boolean;
  countdownValue: number | 'GO!' | null;
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
  FPS: 60,
  COUNTDOWN_DURATION: 1000 // MS
} as const;

// Define our initial state as a constant to ensure consistent reset
const INITIAL_STATE: GameState = {
  distance: 0,
  velocity: 0,
  isAccelerating: false,
  isGameComplete: false,
  currCheckpoint: 1,
  isDoorClosed: true,
  isCountingDown: true, // Start with countdown active
  countdownValue: 3    // Start from 3
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
    isDoorClosed: true,
    isCountingDown: true, // Start with countdown active
    countdownValue: 3    // Start from 3
  });

  // Use refs for animation frame handling
  const animationFrameRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Handle the countdown sequence
  useEffect(() => {
    // Only proceed if we're in countdown mode
    if (gameState.isCountingDown && gameState.countdownValue !== null) {
      const timer = setTimeout(() => {
        setGameState(prev => {
          // If current value is 1, show 'GO!' next
          if (prev.countdownValue === 1) {
            return {
              ...prev,
              countdownValue: 'GO!',
              velocity: 600 // Set initial velocity on GO!
            };
          }
          // If current value is 'GO!', end countdown
          if (prev.countdownValue === 'GO!') {
            return {
              ...prev,
              isCountingDown: false,
              countdownValue: null
            };
          }
          // Otherwise, decrease the counter by 1
          return {
            ...prev,
            countdownValue: typeof prev.countdownValue === 'number' ? prev.countdownValue - 1 : null
          };
        });
      }, GAME_CONSTANTS.COUNTDOWN_DURATION);

      return () => clearTimeout(timer);
    }
  }, [gameState.countdownValue, gameState.isCountingDown]);

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

  // Start physics loop when component mounts or resets
  useEffect(() => {
    // Clear any existing animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    // Reset the last update time
    lastUpdateTimeRef.current = Date.now();
    // Start the physics loop
    animationFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isCountingDown]); // Re-run when countdown state changes

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
          isDoorClosed: false,
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

  // Event handlers with proper typing
  const handleAccelerateStart = (): void => {
    if (!gameState.isGameComplete) {
      setGameState(prev => ({ ...prev, velocity: 500, isDoorClosed: true }));
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
              className="absolute top-0 h-full w-8 bg-red-800 z-10" key={index}
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

        {gameState.countdownValue !== null && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
              className="text-8xl font-bold text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] transform scale-150 transition-all duration-300"
              style={{
                animation: 'countdown 1s ease',
                animationIterationCount: "infinite",
                animationDuration: "1s",
              }}
            >
              {gameState.countdownValue}
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

        <button
          onMouseDown={handleAccelerateStart}
          onMouseUp={handleAccelerateEnd}
          onMouseLeave={handleAccelerateEnd}
          onTouchStart={handleAccelerateStart}
          onTouchEnd={handleAccelerateEnd}
          disabled={gameState.isGameComplete}
          className="absolute bottom-4 left-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     disabled:bg-gray-400 disabled:cursor-not-allowed z-30"
        >
          Hold to Accelerate
        </button>

        {/* Game complete overlay */}
        {gameState.isGameComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40" style={{
            animation: "fadeInAnimation ease 1s",
            animationIterationCount: "1",
            animationFillMode: "forwards",
          }}>
            <div className="text-white text-4xl font-bold">
              Finish!
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 
                       transition-all duration-300 ease-in-out"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Controls Container */}
      <div className="w-full h-1/2 bg-white p-4 relative overflow-hidden">
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0' style={{
          backgroundImage: `url('src/assets/door_left.png')`,
          backgroundSize: "100% 100%",
          width: "100%",
          height: "100%",
          transform: `translateX(${gameState.isDoorClosed ? 0 : -50}%)`,
          imageRendering: "pixelated",
          transition: 'transform 250ms ease-in-out'
        }} />

        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0' style={{
          backgroundImage: `url('src/assets/door_right.png')`,
          backgroundSize: "100% 100%",
          width: "100%",
          height: "100%",
          transform: `translateX(${gameState.isDoorClosed ? 0 : 50}%)`,
          imageRendering: "pixelated",
          transition: 'transform 250ms ease-in-out'
        }} />
      </div>
    </div>
  );
};
