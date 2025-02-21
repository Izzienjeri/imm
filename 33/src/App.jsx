import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_GAME_SPEED = 100;
const GAME_SPEED_INCREMENT = 15;
const INITIAL_SNAKE = [{ x: 5, y: 5 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const APPLES_PER_LEVEL = 3;
const STAR_COUNT = 100;

// --- Theme Definition ---
// Consolidating color definitions for better maintainability
const theme = {
  colors: {
    white: "text-white",
    black: "text-black",
    gray500: "bg-gray-500",
    red500: "text-red-500",
    red600: "text-red-600",
    green400: "text-green-400",
    green500: "text-green-500",
    indigo200: "bg-indigo-200",
    indigo400: "ring-indigo-400",
    indigo500: "bg-indigo-500",
    indigo600: "text-indigo-600",
    indigo700: "text-indigo-700",
    yellow300: "bg-yellow-300",
    blue400: "from-blue-400",
    purple500: "to-purple-500",
    purple600: "to-purple-600",
    black70: "bg-black/70",
    white80: "bg-white/80",
  },
};

// --- Helper Functions ---

/**
 * Generates a new food item at a random position on the grid,
 * ensuring it doesn't overlap with the snake.
 * @param {number} gridSize - The size of the game grid.
 * @param {Array<{x: number, y: number}>} snake - The current snake segments.
 * @returns {{x: number, y: number}} - The coordinates of the new food item.
 */
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

/**
 * Checks if the snake's head has collided with its body.
 * @param {{x: number, y: number}} head - The coordinates of the snake's head.
 * @param {Array<{x: number, y: number}>} snake - The current snake segments.
 * @returns {boolean} - True if a collision has occurred, false otherwise.
 */
function checkCollision(head, snake) {
  return snake
    .slice(1) // Exclude the head from collision check
    .some((segment) => segment.x === head.x && segment.y === head.y);
}

// --- Components ---

const Apple = () => (
  <motion.svg
    width="1.5rem"
    height="1.5rem"
    viewBox="0 0 24 24"
    fill="red"
    stroke="none"
    strokeWidth="0"
    strokeLinecap="round"
    strokeLinejoin="round"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ duration: 0.2, type: "spring", stiffness: 120 }}
    alt="Apple"
    aria-label="Apple"
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
    aria-hidden="true"
  />
));

const SnakeSegment = React.memo(({ isHead, gameOver }) => {
  const mouthColor = gameOver ? "red" : "white";
  const mouthClasses = `absolute w-[60%] h-[2px] rounded-full ${
    gameOver ? "rotate-180" : ""
  } ${gameOver ? "rounded-b-full" : "rounded-t-full"} ${
    gameOver ? "bg-red-500" : "bg-white"
  } top-[60%] left-[20%]`;

  return (
    <>
      <div
        className={`absolute w-1 h-1 rounded-full ${theme.colors.yellow300} top-[20%] left-[20%]`}
        aria-hidden="true"
      />
      <div
        className={`absolute w-1 h-1 rounded-full ${theme.colors.yellow300} top-[20%] right-[20%]`}
        aria-hidden="true"
      />
      <div className={mouthClasses} aria-hidden="true" />
    </>
  );
});

function App() {
  // --- State Variables ---
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
  const [audioStarted, setAudioStarted] = useState(false);
  const [pauseButtonToggle, setPauseButtonToggle] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // --- Ref Variables ---
  const gameInterval = useRef(null);
  const appRef = useRef(null);
  const eatSynth = useRef(null);
  const gameOverSynth = useRef(null);
  const hasEaten = useRef(false);

  // --- Audio Constants ---
  const EAT_NOTE = "C4";
  const GAME_OVER_NOTE = "D3";
  const TONE_DURATION = "16n";

  // --- Audio Effects ---

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

  // --- Star Generation Effects ---

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

  // --- Game Logic ---
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

  // --- Game Loop Effect ---
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
    setPauseButtonToggle(false);

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

  // --- Input handling ---

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "w":
        case "ArrowUp":
          changeDirection({ x: 0, y: -1 });
          break;
        case "s":
        case "ArrowDown":
          changeDirection({ x: 0, y: 1 });
          break;
        case "a":
        case "ArrowLeft":
          changeDirection({ x: -1, y: 0 });
          break;
        case "d":
        case "ArrowRight":
          changeDirection({ x: 1, y: 0 });
          break;
        case "Enter":
          if (gameOver) resetGame();
          break;
        case " ":
          if (!audioStarted) {
            startAudioContext();
          } else {
            if (!gameOver) {
              setIsPaused((prev) => !prev);
              setPauseButtonToggle((prev) => !prev);
            }
          }
          break;
        default:
          break;
      }
    },
    [
      changeDirection,
      gameOver,
      resetGame,
      audioStarted,
      startAudioContext,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // --- Device Detection ---
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const isTablet = width >= 768 && width < 1024 && height > 400;
      const isMobile = width < 768 && height > 400;

      setIsDesktop(!(isTablet || isMobile));
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // --- Rendering Methods ---

  const renderSnakeSegment = useCallback(
    (segment, index) => {
      const isHead = index === 0;
      const baseClass =
        "w-6 h-6 rounded-md bg-gradient-to-br from-blue-400 to-purple-600";

      return (
        <div
          key={index}
          className={`${baseClass} relative`}
          aria-hidden={!isHead}
        >
          {isHead && <SnakeSegment isHead={true} gameOver={gameOver} />}
        </div>
      );
    },
    [gameOver]
  );

  // --- Pause Handling ---
  const togglePause = useCallback(() => {
    if (!gameOver) {
      setIsPaused((prev) => !prev);
      setPauseButtonToggle((prev) => !prev);
    }
  }, [gameOver]);

  const pauseButtonClasses = `p-2 rounded-full ${theme.colors.white} shadow-md focus:outline-none focus:ring-2 ${theme.colors.indigo400} ${
    gameOver
      ? `${theme.colors.gray500} cursor-not-allowed`
      : `${theme.colors.indigo500} hover:${theme.colors.indigo600}`
  }`;

  const gridCells = useMemo(() => {
    const cells = [];
    for (let index = 0; index < GRID_SIZE * GRID_SIZE; index++) {
      const x = index % GRID_SIZE;
      const y = Math.floor(index / GRID_SIZE);
      const isSnake = snake.some(
        (segment) => segment.x === x && segment.y === y
      );
      const isFood = food.x === x && food.y === y;

      let cellClass = "w-6 h-6 flex items-center justify-center";

      let content = null;

      if (isSnake) {
        content = renderSnakeSegment(
          snake.find((segment) => segment.x === x && segment.y === y),
          snake.findIndex((segment) => segment.x === x && segment.y === y)
        );
      } else if (isFood) {
        content = <Apple />;
        cellClass += " items-center justify-center";
      } else {
        cellClass += " bg-transparent";
      }

      cells.push(
        <div key={index} className={cellClass} role="gridcell">
          {content}
        </div>
      );
    }
    return cells;
  }, [snake, food, renderSnakeSegment]);

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden pt-8 bg-gradient-to-b from-[#000428] to-[#004e92] font-sans text-gray-700"
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
        className={`text-4xl md:text-4xl lg:text-6xl font-extrabold mb-4 md:mb-8 ${theme.colors.white} tracking-tight drop-shadow-md z-10 flex items-center`}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)" }}
      >
        <Worm
          className={`mr-2 ${theme.colors.green400}`}
          size={30}
          md:size={40}
        />{" "}
        <span>Cosmic</span>{" "}
        <span className={theme.colors.green400}>Nibbler</span>
      </motion.h1>

      <motion.div
        className={`mb-4 md:mb-8 px-4 py-2 rounded-full ${theme.colors.white80} backdrop-blur-sm shadow-lg text-base md:text-xl font-semibold z-10 flex items-center justify-between`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        aria-label="Game Status"
      >
        <div>
          Score: <span className={theme.colors.indigo600}>{score}</span> | High
          Score: <span className={theme.colors.indigo600}>{highScore}</span>
        </div>
        <div className="mx-2">
          | Level: <span className={theme.colors.indigo600}>{level}</span>
        </div>
        <div className="mx-2"></div>
        <button
          className={pauseButtonClasses}
          onClick={togglePause}
          aria-label="Pause Game"
          disabled={gameOver}
        >
          {pauseButtonToggle ? (
            <Play className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Pause className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </motion.div>

      <AnimatePresence>
        {["Level Up!", "+1 point!"].includes(message) && (
          <motion.div
            className={`absolute top-4 left-1/2 transform -translate-x-1/2 p-2 md:p-3 rounded-full shadow-md font-medium z-20 text-sm md:text-base ${
              message === "Level Up!"
                ? `${theme.colors.indigo200} ${theme.colors.indigo700}`
                : theme.colors.green500
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
          className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center ${theme.colors.black70} rounded-2xl z-30`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          aria-label="Game Paused"
        >
          <div
            className={`${theme.colors.white} text-3xl md:text-4xl font-bold text-shadow-md`}
          >
            Game Paused
          </div>
          <button
            className={`mt-4 bg-gradient-to-r ${theme.colors.indigo500} ${theme.colors.purple500} hover:${theme.colors.indigo600} hover:${theme.colors.purple600} ${theme.colors.white} font-bold py-2 px-4 md:py-3 md:px-5 rounded-xl focus:outline-none focus:shadow-outline transition-colors duration-300`}
            onClick={togglePause}
            aria-label="Resume Game"
          >
            Resume Game
          </button>
        </motion.div>
      )}

      <div className="relative z-10">
        <motion.div
          className="rounded-2xl shadow-2xl overflow-hidden max-w-md mx-4 sm:mx-auto grid bg-opacity-80"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(1rem, 1.5rem))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(1rem, 1.5rem))`,
            backgroundColor: "rgba(52, 73, 94, 0.8)",
          }}
          aria-label="Game Board"
          role="grid"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          {gridCells}
        </motion.div>

        {gameOver && (
          <motion.div
            className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center ${theme.colors.black70} rounded-2xl`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            aria-label="Game Over"
          >
            <div
              className={`text-3xl md:text-4xl font-bold mb-4 flex items-center space-x-2 ${theme.colors.red500} text-shadow-md`}
              style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)" }}
            >
              <Skull
                className={`${theme.colors.red600} animate-pulse`}
                size={30}
                md:size={40}
                aria-hidden="true"
              />
              Game Over!
            </div>
            <button
              className={`bg-gradient-to-r ${theme.colors.indigo500} ${theme.colors.purple500} hover:${theme.colors.indigo600} hover:${theme.colors.purple600} ${theme.colors.white} font-bold py-2 px-4 md:py-3 md:px-5 rounded-xl focus:outline-none focus:shadow-outline transition-colors duration-300`}
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
        <div
          className={`${theme.colors.white} ${
            isDesktop ? "block" : "hidden"
          }  mb-4 italic`}
        >
          <i>
            Use <b>W</b>, <b>A</b>, <b>S</b>, <b>D</b> keys to move the snake. Press{" "}
            <b>Spacebar</b> to pause/resume.
          </i>
        </div>

        {!isDesktop && (
          <div className="flex flex-col items-center w-full">
            <div className="flex justify-center w-full">
              <button
                className={`p-4 md:p-6 rounded-full ${theme.colors.indigo500} hover:${theme.colors.indigo600} ${theme.colors.white} shadow-md focus:outline-none focus:ring-2 ${theme.colors.indigo400}`}
                onClick={() => changeDirection({ x: 0, y: -1 })}
                aria-label="Move Up"
              >
                <ArrowUp className="w-6 h-6 md:w-8 md:h-8" aria-hidden="true" />
              </button>
            </div>

            <div className="flex justify-center w-full mt-2 md:mt-4">
              <button
                className={`p-4 md:p-6 rounded-full ${theme.colors.indigo500} hover:${theme.colors.indigo600} ${theme.colors.white} shadow-md focus:outline-none focus:ring-2 ${theme.colors.indigo400} mr-4`}
                onClick={() => changeDirection({ x: -1, y: 0 })}
                aria-label="Move Left"
              >
                <ArrowLeft
                  className="w-6 h-6 md:w-8 md:h-8"
                  aria-hidden="true"
                />
              </button>
              <button
                className={`p-4 md:p-6 rounded-full ${theme.colors.indigo500} hover:${theme.colors.indigo600} ${theme.colors.white} shadow-md focus:outline-none focus:ring-2 ${theme.colors.indigo400} ml-4`}
                onClick={() => changeDirection({ x: 1, y: 0 })}
                aria-label="Move Right"
              >
                <ArrowRight
                  className="w-6 h-6 md:w-8 md:h-8"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="flex justify-center w-full mt-2 md:mt-4">
              <button
                className={`p-4 md:p-6 rounded-full ${theme.colors.indigo500} hover:${theme.colors.indigo600} ${theme.colors.white} shadow-md focus:outline-none focus:ring-2 ${theme.colors.indigo400}`}
                onClick={() => changeDirection({ x: 0, y: 1 })}
                aria-label="Move Down"
              >
                <ArrowDown
                  className="w-6 h-6 md:w-8 md:h-8"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default App;