import React, {
  StrictMode,
  useState,
  useEffect,
  useRef,
  FormEvent,
} from "react";
import { createRoot } from "react-dom/client";
import { Clock, Gift, UserMinus, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import "./App.css"; // Keep this if you have global styles

// --- INTERFACES ---
interface Theme {
  colors: {
    background: string;
    backgroundFrom: string;
    backgroundTo: string;
    backgroundVia: string;
    textPrimary: string;
    success: string;
    error: string;
    info: string;
    successText: string;
    errorText: string;
    infoText: string;
    borderSuccess: string;
    borderError: string;
    borderInfo: string;
    successBg: string;
    errorBg: string;
    infoBg: string;
    gray: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    pink: {
      50: string;
      200: string;
      300: string;
      500: string;
      600: string;
      700: string;
    };
    white: string;
    red: {
      500: string;
      700: string;
    };
    purple: {
      50: string;
      200: string;
      300: string;
      500: string;
      600: string;
    };
    shadow: {
      purple: string;
    };
    black: {
      400: string;
      900: string;
    };
    notificationPurple: string;
    notificationInfo: string;
  };
  font: {
    sans: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
    inter: string;
  };
  shadow: {
    md: string;
    lg: string;
    xl: string;
    sm: string;
  };
  transition: string;
  effect: {
    transform: string;
    pulse: string;
    fadeIn: string;
    dropShadow: string;
  };
}

interface NotificationState {
  message: string | null;
  type: "success" | "error" | "info";
  visible: boolean;
}

// --- THEME ---
const theme: Theme = {
  colors: {
    background: "bg-gradient-to-br",
    backgroundFrom: "from-purple-300",
    backgroundTo: "to-blue-200",
    backgroundVia: "via-pink-100",
    textPrimary: "text-[#31081f]",
    success: "bg-green-100",
    error: "bg-red-100",
    info: "bg-blue-100",
    successText: "text-green-800",
    errorText: "text-red-800",
    infoText: "text-blue-800",
    borderSuccess: "border-green-300",
    borderError: "border-red-300",
    borderInfo: "border-blue-300",
    successBg: "bg-green-50",
    errorBg: "bg-red-50",
    infoBg: "bg-blue-50",
    gray: {
      50: "bg-gray-50",
      100: "bg-gray-100",
      200: "bg-gray-200",
      300: "border-gray-300",
      400: "text-gray-400",
      500: "text-gray-500",
      600: "text-gray-600",
      700: "text-gray-700",
      800: "text-gray-800",
      900: "text-gray-900",
    },
    pink: {
      50: "bg-pink-50",
      200: "border-pink-200",
      300: "focus:ring-pink-300",
      500: "text-pink-500",
      600: "text-pink-600",
      700: "text-pink-700",
    },
    white: "text-white",
    red: {
      500: "text-red-500",
      700: "text-red-700",
    },
    purple: {
      50: "bg-purple-50",
      200: "focus:ring-purple-200",
      300: "hover:bg-purple-300",
      500: "text-purple-500",
      600: "bg-gradient-to-r from-pink-600 to-purple-600",
    },
    shadow: {
      purple: "focus:ring-purple-200",
    },
    black: {
      400: "placeholder-gray-500",
      900: "text-gray-900",
    },
    notificationPurple: "bg-purple-200",
    notificationInfo: "border-blue-500",
  },
  font: {
    sans: "font-sans",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
    inter: "font-inter",
  },
  shadow: {
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-2xl",
    sm: "shadow-sm",
  },
  transition: "transition-colors duration-300",
  effect: {
    transform: "transform hover:scale-105 transition-transform duration-200",
    pulse: "animate-pulse",
    fadeIn: "fade-in",
    dropShadow: "drop-shadow-md",
  },
}

// --- HELPER FUNCTIONS ---
const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// --- COMPONENTS ---
// Notification Component: Displays notifications to the user.
const Notification: React.FC<{
  notification: NotificationState;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  if (!notification.visible || !notification.message) {
    return null;
  }

  const { type, message } = notification;
  const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);

  const iconMap = {
    success: (
      <svg
        className="w-4 h-4 mr-0.5"
        fill="none"
        stroke={theme.colors.successText}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        ></path>
      </svg>
    ),
    error: (
      <svg
        className="w-4 h-4 mr-0.5"
        fill="none"
        stroke={theme.colors.errorText}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    ),
    info: (
      <svg
        className="w-4 h-4 mr-0.5"
        fill="none"
        stroke={theme.colors.infoText}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
    ),
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-full max-w-[200px] sm:max-w-[300px] md:max-w-md"
      role="alert"
      aria-live="polite"
    >
      <div
        className={`shadow-md rounded-md py-2 px-4 flex items-center justify-between border-l-4
                    ${theme.colors.notificationInfo} ${theme.colors.textPrimary} ${theme.colors.notificationPurple} ${theme.font.inter}`}
      >
        <div className="flex items-center">
          {iconMap[type]}
          <span className={`text-sm sm:text-base ${theme.colors.textPrimary}`}>
            {message}
          </span>
        </div>

        <button
          className="focus:outline-none"
          onClick={onClose}
          aria-label="Close Notification"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke={theme.colors.textPrimary}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Raffle App Component
const App: React.FC = () => {
  // State variables
  const [prize] = useState("A Luxurious Getaway"); // The prize to be won
  const [timeRemaining, setTimeRemaining] = useState(10000); // Time remaining in the raffle (in ms)
  const [entries, setEntries] = useState<string[]>([]); // List of names entered in the raffle
  const [winner, setWinner] = useState<string | null>(null); // The name of the winner
  const [timerActive, setTimerActive] = useState(true); // Boolean to control the timer
  const [name, setName] = useState(""); // Input field value for entering the name
  const [notification, setNotification] = useState<NotificationState>({ // Notification state
    message: null,
    type: "success",
    visible: false,
  });

  // Refs
  const notificationTimeout = useRef<number | null>(null); // Ref to store the notification timeout ID
  const winnerRef = useRef<HTMLDivElement>(null); // Ref to the winner's div for scrolling
  const entriesRef = useRef<HTMLDivElement>(null); // Ref to the entries' div for scrolling
  const canvasRef = useRef<HTMLCanvasElement>(null); // Ref to the canvas element for confetti
  const confettiAnimationId = useRef<number | null>(null); // Ref to store the confetti animation ID
  const synthRef = useRef<Tone.Synth | null>(null); // Ref to store the Tone.Synth instance

  // Notification function: Displays a notification message to the user.
  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "success",
    duration: number = 3000
  ) => {
    clearTimeout(notificationTimeout.current); // Clear any existing timeout

    setNotification({ message, type, visible: true });

    notificationTimeout.current = setTimeout(() => {
      setNotification((prevState) => ({ ...prevState, visible: false }));
      notificationTimeout.current = null;
    }, duration);
  };

  // Close Notification: Closes the notification.
  const closeNotification = () => {
    setNotification((prevState) => ({ ...prevState, visible: false }));
    clearTimeout(notificationTimeout.current);
    notificationTimeout.current = null;
  };

  // Pick Winner Function: Randomly selects a winner from the list of entries.
  const pickWinner = () => {
    if (entries.length > 0) {
      const randomIndex = Math.floor(Math.random() * entries.length);
      const winningEntry = entries[randomIndex];
      setWinner(winningEntry);
      startConfetti();
      playTone();

      setTimeout(() => {
        stopConfetti();
      }, 2000);

      setTimeout(() => {
        winnerRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      setWinner("Oops! Looks like no one participated.");
      showNotification("No entries found.  Unable to pick a winner.", "info");
    }
  };

  // Timer effect: Manages the raffle timer.
  useEffect(() => {
    let intervalId: number | undefined;

    if (timerActive) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => {
          const newTime = prevTime - 1000;
          if (newTime <= 0) {
            clearInterval(intervalId);
            setTimerActive(false);
            pickWinner();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [entries, timerActive]);

  // Handle Submit Form: Adds a name to the list of entries when the form is submitted.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      showNotification("Please enter your name.", "error");
      return;
    }

    if (entries.includes(trimmedName)) {
      showNotification("You can only enter your name once!", "error");
      return;
    }

    setEntries((prevEntries) => [...prevEntries, trimmedName]);
    showNotification(`Thank you, ${trimmedName} for entering!`, "success");
    setName("");

    setTimeout(() => {
      entriesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Remove Entry: Removes an entry from the list.
  const handleRemoveEntry = (entryToRemove: string) => {
    setEntries((prevEntries) =>
      prevEntries.filter((entry) => entry !== entryToRemove)
    );
    showNotification(`${entryToRemove} removed from the raffle.`, "info");
  };

  // Reset Timer: Resets the timer and other states to start a new raffle.
  const handleResetTimer = () => {
    setTimeRemaining(10000);
    setTimerActive(true);
    setWinner(null);
    stopConfetti();
    showNotification("Timer reset!", "info");
  };

  // Confetti effect functions
  const startConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiParticles = Array(75)
      .fill(null)
      .map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        radius: Math.random() * 5 + 2,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.08 + 0.04,
        tiltAngle: 0,
      }));

    const animateConfetti = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiParticles.forEach((particle) => {
        particle.tiltAngle += particle.tiltAngleIncremental;
        particle.y += (Math.cos(particle.tiltAngle) + particle.radius / 2) / 2;
        particle.x += Math.sin(particle.tiltAngle);
        particle.tilt = Math.sin(particle.tiltAngle - particle.tiltAngle / 3) * 12;

        ctx.beginPath();
        ctx.ellipse(
          particle.x,
          particle.y,
          particle.radius,
          particle.radius / 2,
          (particle.tilt * Math.PI) / 180,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = particle.color;
        ctx.fill();

        if (particle.y > canvas.height) {
          particle.x = Math.random() * canvas.width;
          particle.y = -particle.radius;
        }
      });

      confettiAnimationId.current = requestAnimationFrame(animateConfetti);
    };

    animateConfetti();
  };

  // Stop Confetti: Stops the confetti animation.
  const stopConfetti = () => {
    if (confettiAnimationId.current) {
      cancelAnimationFrame(confettiAnimationId.current);
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Play Tone: Plays a sound using Tone.js when a winner is picked.
  const playTone = async () => {
    try {
      await Tone.start();
      if (!synthRef.current) {
        synthRef.current = new Tone.Synth().toDestination();
      }
      synthRef.current.triggerAttackRelease("C4", "0.5");
    } catch (error) {
      console.error("Error playing tone:", error);
    }
  };

  // Dispose synth when component unmounts
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      className={`min-h-screen ${theme.colors.background} ${theme.colors.backgroundFrom} ${theme.colors.backgroundTo} ${theme.colors.backgroundVia} ${theme.colors.textPrimary} ${theme.font.sans} antialiased flex flex-col overflow-hidden py-6 ${theme.font.inter}`}
    >
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 10 }}
      />
      {/* Notification Component */}
      <Notification notification={notification} onClose={closeNotification} />

      <div className="flex justify-center items-center flex-grow">
        <motion.div
          className={`rounded-3xl ${theme.shadow.xl} p-6 sm:p-12 w-full max-w-2xl mx-4 my-8 relative ${theme.font.inter}`}
          style={{ backgroundColor: "white" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <header className="text-center mb-8">
            {/* Main Title */}
            <h1
              className={`text-3xl md:text-4xl ${theme.font.bold} tracking-tight sm:text-5xl ${theme.effect.fadeIn} ${theme.effect.dropShadow} ${theme.font.inter}`}
            >
              <span className="inline-block mr-1" aria-hidden="true">✨</span>
              <span className={theme.colors.pink[600]}>Win a Chance</span>
              <span className="inline-block ml-1" aria-hidden="true">✨</span>
            </h1>
            {/* Subtitle */}
            <h2
              className={`text-2xl md:text-3xl ${theme.font.semibold} tracking-tight sm:text-4xl ${theme.effect.fadeIn} ${theme.effect.dropShadow} ${theme.font.inter}`}
            >
              <span className={theme.colors.purple[500]}>at Luxury!</span>
            </h2>

            {/* Prize Description */}
            <p
              className={`mt-3 text-lg md:text-xl ${theme.colors.gray[700]} flex items-center justify-center ${theme.effect.fadeIn} delay-200 ${theme.font.inter}`}
            >
              <Gift
                className={`w-5 h-5 md:w-6 md:h-6 mr-2 ${theme.colors.pink[500]} ${theme.effect.pulse} ${theme.font.inter}`}
                aria-hidden="true"
              />
              Enter to win:
              <span className={`${theme.font.semibold} italic ${theme.font.inter}`}>
                {prize}
              </span>
            </p>
            {/* Time Remaining */}
            <div
              className={`mt-6 flex items-center justify-center space-x-4 text-lg ${theme.effect.fadeIn} delay-300 ${theme.font.inter}`}
            >
              <Clock
                className={`w-5 h-5 md:w-6 md:h-6 ${theme.colors.gray[700]} ${theme.font.inter}`}
                aria-hidden="true"
              />
              <span className={`${theme.font.medium} ${theme.font.inter}`}>
                Time Remaining:
              </span>
              <span
                className={`text-xl md:text-2xl font-bold tracking-wider ${theme.font.inter}`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          </header>

          <main className="w-full">
            {/* Entry Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className={`block text-sm ${theme.font.medium} ${theme.colors.gray[700]} sr-only ${theme.font.inter}`}
                >
                  Your Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className={`h-5 w-5 ${theme.colors.gray[400]} ${theme.font.inter}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7 a4 4 0 11-8 0 a4 4 0 018 0z M12 14 a7 7 0 00-7 7h14 a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`block w-full py-2 sm:py-2.5 pl-10 pr-4  ${theme.colors.black[400]} ${theme.colors.black[900]} rounded-xl focus:ring-4 ${theme.colors.pink[300]} sm:text-sm border ${theme.colors.gray[300]} ${theme.font.inter} ${theme.transition} ${theme.shadow.md} ${theme.colors.pink[300]}`}
                    placeholder="Enter your name"
                    required
                    aria-label="Enter your name to enter the raffle"
                  />
                </div>
              </div>
              <div>
                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-2 sm:py-2.5 px-4 text-sm ${theme.font.semibold} ${theme.colors.white} rounded-xl ${theme.colors.purple[600]} ${theme.shadow.md} focus:outline-none focus:ring-4 ${theme.colors.purple.shadow} disabled:${theme.colors.gray[300]} ${theme.transition} ${theme.font.inter} ${theme.colors.pink[300]} ${theme.effect.transform}`}
                  disabled={!timerActive}
                  aria-label="Enter Raffle"
                  aria-disabled={!timerActive}
                >
                  ✨ Enter the Draw! ✨
                </button>
              </div>
            </form>

            {/* Current Entries */}
            <div className="mt-7 sm:mt-9" ref={entriesRef}>
              {entries.length > 0 && (
                <>
                  <h2
                    className={`text-xl sm:text-2xl ${theme.font.semibold} mb-2 sm:mb-4 ${theme.colors.gray[800]
                      } tracking-wide ${theme.font.inter}`}
                  >
                    Current Entries
                  </h2>
                  <ul className="space-y-2 sm:space-y-3">
                    {entries.map((entry, index) => (
                      <li
                        key={index}
                        className={`${theme.colors.gray[700]} rounded-xl py-2 px-4 sm:py-2.5 sm:px-5 ${theme.colors.gray[50]} ${theme.shadow.sm
                          } flex items-center justify-between ${theme.font.inter
                          } hover:${theme.colors.gray[100]} ${theme.transition} border ${theme.colors.gray[300]}`}
                      >
                        {entry}
                        {/* Remove Entry Button */}
                        <button
                          onClick={() => handleRemoveEntry(entry)}
                          className={`${theme.colors.red[500]} hover:${theme.colors.red[700]
                            } focus:outline-none`}
                          aria-label={`Remove ${entry} from raffle`}
                        >
                          <UserMinus className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Winner Announcement */}
            {winner && (
              <motion.div
                ref={winnerRef}
                className={`mt-7 sm:mt-10 py-4 px-4 ${theme.colors.pink[50]
                  } rounded-xl border-2 ${theme.colors.pink[200]} ${theme.shadow.xl} ${theme.font.inter
                  } animate-pulse`}
                aria-live="polite"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h3
                  className={`text-xl sm:text-2xl ${theme.font.semibold} ${theme.colors.gray[800]
                    } mb-2 sm:mb-3 ${theme.font.inter}`}
                >
                  🎉 And the Winner is... 🎉
                </h3>
                <p
                  className={`text-lg sm:text-xl ${theme.colors.pink[700]} ${theme.font.bold} ${theme.font.inter}`}
                >
                  {winner}
                </p>
              </motion.div>
            )}

            {/* Reset Timer Button */}
            <div className="mt-5 sm:mt-7 flex justify-center">
              <button
                onClick={handleResetTimer}
                className={`${theme.colors.gray[200]}  ${theme.colors.purple[300]} ${theme.colors.gray[700]} ${theme.font.semibold} py-2 px-4 rounded-xl ${theme.shadow.md
                  } focus:outline-none ${theme.shadow.purple} ${theme.transition} ${theme.font.inter}`}
                aria-label="Reset Timer"
                aria-description="Resets the raffle timer to its initial value."
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2" aria-hidden="true" />
                Reset Timer
              </button>
            </div>
          </main>
        </motion.div>
      </div>
      {/* Footer */}
      <footer className={`text-center py-3 ${theme.colors.gray[500]} text-sm ${theme.font.inter}`}>
        © {new Date().getFullYear()} Raffle App. All rights reserved.
      </footer>
    </div>
  );
};

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

export default App;