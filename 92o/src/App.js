import React, { useState, useEffect, useRef } from "react";
import { Clock, Gift, UserMinus, RotateCcw } from "lucide-react";
import "tailwindcss/tailwind.css";

// Raffle App Component
const App = () => {
  // State variables
  const [prize] = useState("A Luxurious Getaway");
  const [timeRemaining, setTimeRemaining] = useState(10 * 1000);
  const [entries, setEntries] = useState([]);
  const [winner, setWinner] = useState(null);
  const [timerActive, setTimerActive] = useState(true);
  const [name, setName] = useState("");
  const [notification, setNotification] = useState({
    message: null,
    type: "success",
    visible: false,
  });
  const notificationTimeout = useRef(null);
  const winnerRef = useRef(null);
  const entriesRef = useRef(null);

  // Theme colors for styling
  const themeColors = {
    background: "bg-pink-50",
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
  };

  // Timer effect
  useEffect(() => {
    let intervalId;

    // Function to pick a winner
    const pickWinner = () => {
      if (entries.length > 0) {
        const randomIndex = Math.floor(Math.random() * entries.length);
        setWinner(entries[randomIndex]);
        setTimeout(() => {
          winnerRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      } else {
        setWinner("Oops! Looks like no one participated.");
        showNotification("No entries found.  Unable to pick a winner.", "info");
      }
    };

    // Start timer if active
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

    // Cleanup interval
    return () => clearInterval(intervalId);
  }, [entries, timerActive]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showNotification("Please enter your name.", "error");
      return;
    }

    if (!entries.includes(name)) {
      setEntries([...entries, name]);
      showNotification(
        `Thank you, ${name} for entering the raffle!`,
        "success"
      );
      setName("");

      // Scroll to entries list after every entry
      setTimeout(() => {
        entriesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); // Add a small delay to ensure the element is rendered
    } else {
      showNotification(`You can only enter your name once!`, "error");
    }
  };

  // Handle removing an entry
  const handleRemoveEntry = (entryToRemove) => {
    setEntries(entries.filter((entry) => entry !== entryToRemove));
    showNotification(`${entryToRemove} removed from the raffle.`, "info");
  };

  // Handle reset timer
  const handleResetTimer = () => {
    setTimeRemaining(10 * 1000);
    setTimerActive(true);
    setWinner(null);
    showNotification("Timer reset!", "info");
  };

  // Format time remaining
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Show notification
  const showNotification = (message, type = "success", duration = 3000) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }

    setNotification({ message, type, visible: true });

    notificationTimeout.current = setTimeout(() => {
      setNotification((prevState) => ({ ...prevState, visible: false }));
      notificationTimeout.current = null;
    }, duration);
  };

  // Close notification
  const closeNotification = () => {
    setNotification((prevState) => ({ ...prevState, visible: false }));
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
      notificationTimeout.current = null;
    }
  };

  // Notification component
  const Notification = () => {
    if (!notification.visible || !notification.message) {
      return null;
    }

    return (
      <div
        className="fixed bottom-4 right-4 z-50 w-full max-w-[200px] sm:max-w-[300px] md:max-w-md"
        role="alert"
        aria-live="polite"
      >
        <div
          className={`shadow-md rounded-md py-2 px-4 flex items-center justify-between border-l-2 ${
            themeColors[
              `border${
                notification.type.charAt(0).toUpperCase() +
                notification.type.slice(1)
              }`
            ]
          } ${themeColors.background} ${themeColors.textPrimary}`}
        >
          <div className="flex items-center">
            {notification.type === "success" && (
              <svg
                className="w-4 h-4 mr-0.5"
                fill="none"
                stroke={themeColors.successText}
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
            )}
            {notification.type === "error" && (
              <svg
                className="w-4 h-4 mr-0.5"
                fill="none"
                stroke={themeColors.errorText}
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
            )}
            {notification.type === "info" && (
              <svg
                className="w-4 h-4 mr-0.5"
                fill="none"
                stroke={themeColors.infoText}
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
            )}
            <span className={`text-sm sm:text-base ${themeColors.textPrimary}`}>
              {notification.message}
            </span>
          </div>

          <button
            className="focus:outline-none"
            onClick={closeNotification}
            aria-label="Close Notification"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke={themeColors.textPrimary}
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

  // Render the app
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 text-[#31081f] font-sans antialiased flex flex-col">
      <Notification />

      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center flex-grow"> {/* Added flex-grow */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#31081f] sm:text-6xl fade-in drop-shadow-md">
            Win a Chance at Luxury!
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 flex items-center justify-center fade-in delay-200">
            <Gift
              className="w-6 h-6 md:w-7 md:h-7 mr-2 text-pink-500"
              aria-hidden="true"
            />
            Enter to win: <span className="font-semibold italic">{prize}</span>
          </p>
          <div className="mt-8 flex items-center justify-center space-x-4 text-lg fade-in delay-300">
            <Clock
              className="w-6 h-6 md:w-7 md:h-7 text-gray-700"
              aria-hidden="true"
            />
            <span className="font-medium">Time Remaining:</span>
            <span className="text-xl md:text-2xl font-bold tracking-wider">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </header>

        <main className="rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md py-8 px-4 sm:py-12 sm:px-6 lg:px-16 w-full max-w-md"> {/* Added max-w-md to constrain width */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 sr-only"
              >
                Your Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                  className="block w-full py-2 sm:py-3 pl-10 pr-4 placeholder-gray-500 text-gray-900 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 sm:text-sm border border-gray-300 font-inter"
                  placeholder="Enter your name"
                  required
                  aria-label="Enter your name to enter the raffle"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className={`w-full py-2 sm:py-3 px-4 text-sm font-semibold text-white rounded-xl bg-[#31081f] hover:bg-[#501035] focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-opacity-50 disabled:bg-gray-400 transition-colors duration-300 shadow-md font-inter`}
                disabled={!timerActive}
                aria-label="Enter Raffle"
                aria-disabled={!timerActive}
              >
                Enter the Draw!
              </button>
            </div>
          </form>

          <div className="mt-8 sm:mt-10" ref={entriesRef}>
            {entries.length > 0 && (
              <>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-5 text-gray-800 tracking-wide font-inter">
                  Current Entries
                </h2>
                <ul className="space-y-2 sm:space-y-3">
                  {entries.map((entry, index) => (
                    <li
                      key={index}
                      className="text-gray-700 rounded-xl py-2 px-4 sm:py-3 sm:px-5 bg-gray-50 shadow-sm flex items-center justify-between font-inter"
                    >
                      {entry}
                      <button
                        onClick={() => handleRemoveEntry(entry)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label={`Remove ${entry} from raffle`}
                      >
                        <UserMinus
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {winner && (
            <div
              ref={winnerRef}
              className="mt-8 sm:mt-12 py-6 px-4 bg-pink-50 rounded-xl border border-pink-200 shadow-lg font-inter"
              aria-live="polite"
            >
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 font-inter">
                And the Winner is...
              </h3>
              <p className="text-lg sm:text-xl text-pink-700 font-bold font-inter">
                {winner}
              </p>
            </div>
          )}

          <div className="mt-6 sm:mt-8 flex justify-center">
            <button
              onClick={handleResetTimer}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200 font-inter"
              aria-label="Reset Timer"
              aria-description="Resets the raffle timer to its initial value."
            >
              <RotateCcw
                className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2"
                aria-hidden="true"
              />
              Reset Timer
            </button>
          </div>
        </main>
      </div>
       <footer className="text-center py-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} Raffle App. All rights reserved.
      </footer>
    </div>
  );
};

export default App;