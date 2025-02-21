import React, { useState, useEffect, useRef, useCallback } from "react";
import "tailwindcss/tailwind.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Skull,
  Worm,
  Pause,
  Play,
} from "lucide-react";
import * as Tone from "tone";

const GRID_SIZE = 20;
const INITIAL_GAME_SPEED = 100;
const GAME_SPEED_INCREMENT = 15;
const INITIAL_SNAKE = [{ x: 5, y: 5 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const APPLES_PER_LEVEL = 3;
const STAR_COUNT = 100;

const Apple = () => (
  <motion.svg
    width="1.5rem"
    height="1.5rem"
    viewBox="0 0 24 24"
    fill="#F44336"
    stroke="none"
    strokeWidth="0"
    strokeLinecap="round"
    strokeLinejoin="round"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ duration: 0.2, type: "spring", stiffness: 120 }}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <path d="M12 4a8 8 0 0 1 8 8" opacity=".2" />
    <path d="M12 20a8 8 0 0 0 8-8" opacity=".2" />
    <path d="M14.5 9a2.5 2.5 0 0 1 0 5" opacity=".3" />
    <path
      d="M15 8.5C16.5 7 19 6 19 6s-1.5 1.5-3 2"
      stroke="#689F38"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </motion.svg>
);

const Star = React.memo(({ x, y, size }) => (
  <div
    className="absolute rounded-full bg-white opacity-50 pointer-events-none"
    style={{
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
    }}
  />
));

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(() =>
    generateFood(GRID_SIZE, INITIAL_SNAKE)
  );
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [highScore, setHighScore] = useState(
    () => localStorage.getItem("highScore") || 0
  );
  const [stars, setStars] = useState([]);
  const [level, setLevel] = useState(1);
  const [applesEatenThisLevel, setApplesEatenThisLevel] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_GAME_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const gameInterval = useRef(null);
  const appRef = useRef(null);
  const eatSynth = useRef(null);
  const gameOverSynth = useRef(null);
  const hasEaten = useRef(false);
  const [audioStarted, setAudioStarted] = useState(false);

  const EAT_NOTE = "C4";
  const GAME_OVER_NOTE = "D3";
  const TONE_DURATION = "16n";

  const startAudioContext = useCallback(() => {
    Tone.start();
    setAudioStarted(true);
  }, []);

  useEffect(() => {
    if (audioStarted) {
      eatSynth.current = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
      }).toDestination();

      gameOverSynth.current = new Tone.Synth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.3 },
      }).toDestination();
    }

    return () => {
      eatSynth.current?.dispose();
      gameOverSynth.current?.dispose();
    };
  }, [audioStarted]);

  const generateStars = useCallback(() => {
    if (!appRef.current) return;

    const appWidth = appRef.current.offsetWidth;
    const appHeight = appRef.current.offsetHeight;

    const newStars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * appWidth,
      y: Math.random() * appHeight,
      size: Math.random() * 2 + 0.5,
    }));

    setStars(newStars);
  }, []);

  useEffect(() => {
    generateStars();

    const handleResize = () => generateStars();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [generateStars]);

  const moveSnake = useCallback(() => {
    if (isPaused) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE ||
      checkCollision(head, snake)
    ) {
      setGameOver(true);
      clearInterval(gameInterval.current);
      if (audioStarted && gameOverSynth.current) {
        gameOverSynth.current?.triggerAttackRelease(
          GAME_OVER_NOTE,
          TONE_DURATION
        );
      }
      return;
    }

    let newSnake = [head, ...snake];
    let newFood = food;
    let newScore = score;
    let newApplesEaten = applesEatenThisLevel;
    let newGameSpeed = gameSpeed;
    let newLevel = level;

    if (head.x === food.x && head.y === food.y) {
      newFood = generateFood(GRID_SIZE, newSnake);
      newScore++;
      if (audioStarted && eatSynth.current) {
        eatSynth.current?.triggerAttackRelease(EAT_NOTE, "8n");
      }
      setMessage("+1 point!");
      setTimeout(() => setMessage(""), 750);
      newApplesEaten++;
      hasEaten.current = true;

      if (newApplesEaten >= APPLES_PER_LEVEL) {
        newLevel++;
        newApplesEaten = 0;
        newGameSpeed = Math.max(20, gameSpeed - GAME_SPEED_INCREMENT);
        setMessage("Level Up!");
        setTimeout(() => setMessage(""), 1500);
      }
      setFood(newFood);
      setScore(newScore);
    } else {
      newSnake = newSnake.slice(0, newSnake.length - 1);
    }

    setSnake(newSnake);
    setLevel(newLevel);
    setApplesEatenThisLevel(newApplesEaten);
    setGameSpeed(newGameSpeed);
  }, [
    snake,
    direction,
    food,
    score,
    applesEatenThisLevel,
    gameSpeed,
    level,
    isPaused,
    audioStarted,
  ]);

  useEffect(() => {
    clearInterval(gameInterval.current);
    if (!gameOver && !isPaused) {
      gameInterval.current = setInterval(moveSnake, gameSpeed);
    }
    return () => clearInterval(gameInterval.current);
  }, [moveSnake, gameOver, gameSpeed, isPaused]);

  const changeDirection = useCallback(
    (newDirection) => {
      if (
        (newDirection.x !== 0 && direction.x !== 0) ||
        (newDirection.y !== 0 && direction.y !== 0)
      ) {
        return;
      }
      setDirection(newDirection);
    },
    [direction]
  );

  const resetGame = useCallback(() => {
    clearInterval(gameInterval.current);
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(GRID_SIZE, INITIAL_SNAKE));
    setGameOver(false);
    setIsPaused(false);
    hasEaten.current = false;

    setHighScore((prevScore) => {
      const updatedHighScore = score > prevScore ? score : prevScore;
      localStorage.setItem("highScore", updatedHighScore);
      return updatedHighScore;
    });

    setScore(0);
    setMessage("");
    setLevel(1);
    setApplesEatenThisLevel(0);
    setGameSpeed(INITIAL_GAME_SPEED);

    gameInterval.current = setInterval(moveSnake, gameSpeed);
  }, [moveSnake, score, gameSpeed]);

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "w":
          changeDirection({ x: 0, y: -1 });
          break;
        case "s":
          changeDirection({ x: 0, y: 1 });
          break;
        case "a":
          changeDirection({ x: -1, y: 0 });
          break;
        case "d":
          changeDirection({ x: 1, y: 0 });
          break;
        case "Enter":
          if (gameOver) resetGame();
          break;
        case " ":
          if (!audioStarted) {
            startAudioContext();
          } else {
            setIsPaused((prev) => !prev);
          }
          break;
        default:
          break;
      }
    },
    [changeDirection, gameOver, resetGame, audioStarted, startAudioContext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const SnakeSegment = React.memo(({ isHead, gameOver }) => {
    const mouthColor = gameOver ? "red" : "white";
    const mouthStyle = gameOver
      ? {
          top: "60%",
          left: "20%",
          width: "60%",
          height: "2px",
          borderRadius: "0 0 50% 50%",
          transform: "rotate(180deg)",
          backgroundColor: mouthColor,
        }
      : {
          top: "60%",
          left: "20%",
          width: "60%",
          height: "2px",
          borderRadius: "50% 50% 0 0",
          backgroundColor: mouthColor,
        };

    return (
      <>
        <div
          className="absolute w-1 h-1 rounded-full bg-yellow-300"
          style={{ top: "20%", left: "20%" }}
        />
        <div
          className="absolute w-1 h-1 rounded-full bg-yellow-300"
          style={{ top: "20%", right: "20%" }}
        />
        <div className="absolute" style={mouthStyle} />
      </>
    );
  });

  const renderSnakeSegment = useCallback(
    (segment, index) => {
      const isHead = index === 0;
      const baseClass =
        "w-6 h-6 rounded-md bg-gradient-to-br from-blue-400 to-purple-600";

      return (
        <div key={index} className={baseClass} style={{ position: "relative" }}>
          {isHead && <SnakeSegment isHead={true} gameOver={gameOver} />}
        </div>
      );
    },
    [gameOver]
  );

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const pauseButtonClasses = `p-2 rounded-full text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
    gameOver
      ? "bg-gray-500 cursor-not-allowed"
      : "bg-indigo-500 hover:bg-indigo-600"
  }`;

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center min-h-screen font-sans text-gray-900 overflow-hidden pt-8"
      style={{
        background: "#000428",
        background: "-webkit-linear-gradient(to bottom, #000428, #004e92)",
        background: "linear-gradient(to bottom, #000428, #004e92)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75, ease: "easeInOut" }}
      aria-label="Snake Game Container"
      ref={appRef}
      onClick={!audioStarted ? startAudioContext : undefined}
    >
      {stars.map((star, index) => (
        <Star key={index} x={star.x} y={star.y} size={star.size} />
      ))}

      <motion.h1
        className="text-4xl md:text-4xl lg:text-6xl font-extrabold mb-4 md:mb-8 text-white tracking-tight drop-shadow-md z-10 flex items-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)" }}
      >
        <Worm className="mr-2 text-green-400" size={30} md:size={40} />{" "}
        <span>Cosmic</span> <span className="text-green-400">Nibbler</span>
      </motion.h1>

      <motion.div
        className="mb-4 md:mb-8 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg text-base md:text-xl font-semibold z-10 flex items-center justify-between"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      >
        <div>
          Score: <span className="text-indigo-600">{score}</span> | High Score:{" "}
          <span className="text-indigo-600">{highScore}</span>
        </div>

        <div className="mx-2">
          | Level: <span className="text-indigo-600">{level}</span>
        </div>

        <div className="mx-2"> {/* Added spacing here */} </div>

        <button
          className={pauseButtonClasses}
          onClick={togglePause}
          aria-label="Pause Game"
          disabled={gameOver}
        >
          {isPaused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </button>
      </motion.div>

      <AnimatePresence>
        {["Level Up!", "+1 point!"].includes(message) && (
          <motion.div
            className={`absolute top-4 left-1/2 transform -translate-x-1/2 p-2 md:p-3 rounded-full shadow-md font-medium z-20 text-sm md:text-base ${
              message === "Level Up!"
                ? "bg-indigo-200 text-indigo-700"
                : "text-green-500"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            aria-live="polite"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {isPaused && !gameOver && (
        <motion.div
          className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black/70 rounded-2xl z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-3xl md:text-4xl font-bold text-white text-shadow-md">
            Game Paused
          </div>
          <button
            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-2 px-4 md:py-3 md:px-5 rounded-xl focus:outline-none focus:shadow-outline transition-colors duration-300"
            onClick={togglePause}
            aria-label="Resume Game"
          >
            Resume Game
          </button>
        </motion.div>
      )}

      <div className="relative z-10">
        <motion.div
          className="rounded-2xl shadow-2xl overflow-hidden max-w-md"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(1rem, 1.5rem))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(1rem, 1.5rem))`,
            display: "grid",
            backgroundColor: "rgba(52, 73, 94, 0.8)",
          }}
          aria-label="Game Board"
          role="grid"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const isSnake = snake.some(
              (segment) => segment.x === x && segment.y === y
            );
            const isFood = food.x === x && food.y === y;

            let cellClass = "w-6 h-6 flex items-center justify-center";

            if (isSnake) {
              return (
                <div key={index} className={cellClass} role="gridcell">
                  {isSnake &&
                    renderSnakeSegment(
                      snake.find(
                        (segment) => segment.x === x && segment.y === y
                      ),
                      snake.findIndex(
                        (segment) => segment.x === x && segment.y === y
                      )
                    )}
                </div>
              );
            } else if (isFood) {
              cellClass += " items-center justify-center";
            } else {
              cellClass += " bg-transparent";
            }

            return (
              <div key={index} className={cellClass} role="gridcell">
                {isFood && <Apple />}
              </div>
            );
          })}
        </motion.div>

        {gameOver && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black/70 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div
              className="text-3xl md:text-4xl font-bold mb-4 flex items-center space-x-2 text-red-500 text-shadow-md"
              style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)" }}
            >
              <Skull
                className="text-red-600 animate-pulse"
                size={30}
                md:size={40}
              />
              Game Over!
            </div>
            <button
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-2 px-4 md:py-3 md:px-5 rounded-xl focus:outline-none focus:shadow-outline transition-colors duration-300"
              onClick={resetGame}
              aria-label="Play Again"
              tabIndex="0"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </div>
      <div className="mt-4 md:mt-8 z-10 flex flex-col items-center">
        <div className="hidden md:block text-white mb-4 italic">
          <i>
            Use <b>W</b>, <b>A</b>, <b>S</b>, <b>D</b> keys to move the snake.
            Press <b>Spacebar</b> to pause/resume.
          </i>
        </div>

        <div className="md:hidden flex flex-col items-center">
          <div className="flex justify-center space-x-4 md:space-x-6">
            <button
              className="p-4 md:p-6 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onClick={() => changeDirection({ x: 0, y: -1 })}
              aria-label="Move Up"
            >
              <ArrowUp className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>
          <div className="flex justify-center space-x-4 md:space-x-6 mt-2 md:mt-4">
            <button
              className="p-4 md:p-6 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onClick={() => changeDirection({ x: -1, y: 0 })}
              aria-label="Move Left"
            >
              <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button
              className="p-4 md:p-6 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onClick={() => changeDirection({ x: 1, y: 0 })}
              aria-label="Move Right"
            >
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>
          <div className="flex justify-center space-x-4 md:space-x-6 mt-2 md:mt-4">
            <button
              className="p-4 md:p-6 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onClick={() => changeDirection({ x: 0, y: 1 })}
              aria-label="Move Down"
            >
              <ArrowDown className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function generateFood(gridSize, snake) {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (
    snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
  );

  return newFood;
}

function checkCollision(head, snake) {
  return snake
    .slice(1)
    .some((segment) => segment.x === head.x && segment.y === head.y);
}

export default App;
