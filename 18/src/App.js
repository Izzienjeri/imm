import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  CheckCircle,
  Search,
  X,
  AlertCircle,
  Gamepad2,
  Edit,
  ChevronDown,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import "tailwindcss/tailwind.css";

const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 60%, 80%)`;
};

const defaultGames = [
  {
    id: 1,
    title: "The Legend of Zelda",
    releaseDate: "2023-05-12",
    console: "Nintendo Switch",
    progress: "Completed",
  },
  {
    id: 2,
    title: "Marvels Spider-Man 2",
    releaseDate: "2023-10-20",
    console: "PlayStation 5",
    progress: "In Progress",
  },
  {
    id: 3,
    title: "Cyberpunk 2077",
    releaseDate: "2020-12-10",
    console: "PC",
    progress: "Not Started",
  },
];

const Select = ({ id, name, value, onChange, options, label }) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="appearance-none w-full px-4 py-3 border rounded-xl text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-200 pr-8 bg-white hover:border-purple-300 focus:border-purple-300 focus:ring-offset-2 focus:ring-offset-white"
          aria-label={label}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-gray-700 hover:bg-purple-100"
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <ChevronDown className="fill-current h-4 w-4" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

function App() {
  const [games, setGames] = useState(defaultGames);
  const [newGame, setNewGame] = useState({
    title: "",
    releaseDate: "",
    console: "PC",
    progress: "Not Started",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterConsole, setFilterConsole] = useState("All");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingGameId, setEditingGameId] = useState(null);
  const [consoleColors, setConsoleColors] = useState({});
  const listRef = useRef(null);
  const appRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    releaseDate: "",
  });
  const [activeElement, setActiveElement] = useState(null);

  const showMessage = useCallback((text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  }, []);

  useEffect(() => {
    document.title = "Game Progress Tracker";

    const uniqueConsoles = [...new Set(games.map((game) => game.console))];
    setConsoleColors((prevColors) => {
      const updatedColors = { ...prevColors };
      uniqueConsoles.forEach((console) => {
        if (!updatedColors[console]) {
          updatedColors[console] = getRandomPastelColor();
        }
      });
      return updatedColors;
    });

    if (listRef.current) {
      listRef.current.scrollTo(0, 0);
    }
  }, [games]);


  const validateTitle = useCallback((title) => {
    if (!title) {
      return "Title is required.";
    }
    if (title.length < 3) {
      return "Title must be at least 3 characters long.";
    }

    const isDuplicate = games.some(
      (game) =>
        game.title.toLowerCase() === title.toLowerCase() &&
        (editingGameId === null || game.id !== editingGameId)
    );

    if (isDuplicate) {
      return "A game with this title already exists.";
    }

    return ""; // No error
  }, [games, editingGameId]);


  const validateReleaseDate = useCallback((dateString) => {
    if (!dateString) {
      return "Release date is required.";
    }
    try {
      parseISO(dateString); // Attempt to parse to validate format
    } catch (e) {
      return "Invalid date format.";
    }
    return "";
  }, []);


  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setNewGame((prev) => ({ ...prev, [name]: value }));

      // Real-time validation
      let error = "";
      if (name === "title") {
        error = validateTitle(value);
      } else if (name === "releaseDate") {
        error = validateReleaseDate(value);
      }

      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    },
    [validateTitle, validateReleaseDate]
  );


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const scrollToTop = () => {
    if (appRef.current) {
      appRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const addGame = useCallback(() => {
    if (validationErrors.title || validationErrors.releaseDate) {
      showMessage("Please correct the errors in the form.", "error");
      return;
    }

    const newId =
      games.length > 0 ? Math.max(...games.map((game) => game.id)) + 1 : 1;
    const newGameWithId = { ...newGame, id: newId };

    setGames((prevGames) => [...prevGames, newGameWithId]);
    setNewGame({
      title: "",
      releaseDate: "",
      console: "PC",
      progress: "Not Started",
    });
    showMessage("Game added successfully!", "success");
    setIsAdding(false);
    setValidationErrors({ title: "", releaseDate: "" });

    scrollToTop();
  }, [games, newGame, validationErrors, showMessage, scrollToTop]);

  const updateProgress = useCallback(
    (id, newProgress) => {
      setGames((prevGames) =>
        prevGames.map((game) =>
          game.id === id ? { ...game, progress: newProgress } : game
        )
      );
      showMessage("Progress updated!", "success");
      scrollToTop();
    },
    [showMessage, scrollToTop]
  );

  const deleteGame = useCallback(
    (id) => {
      setGames((prevGames) => prevGames.filter((game) => game.id !== id));
      showMessage("Game deleted successfully!", "success");
      scrollToTop();
    },
    [showMessage, scrollToTop]
  );

  const filteredGames = React.useMemo(() => {
    return games.filter((game) => {
      const searchMatch = game.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const consoleMatch =
        filterConsole === "All" || game.console === filterConsole;
      return searchMatch && consoleMatch;
    });
  }, [games, searchTerm, filterConsole]);

  const clearFilter = useCallback(() => {
    setFilterConsole("All");
  }, []);

  const toggleAdding = useCallback(() => {
    setIsAdding(!isAdding);
    setValidationErrors({ title: "", releaseDate: "" });
    setNewGame({ title: "", releaseDate: "", console: "PC", progress: "Not Started" }); // Reset newGame when toggling add
  }, [isAdding]);

  const startEditing = (id) => {
    setEditingGameId(id);
    const gameToEdit = games.find((game) => game.id === id);
    if (gameToEdit) {
      setNewGame({ ...gameToEdit });
      //Validate initial values when editing
      setValidationErrors({
        title: validateTitle(gameToEdit.title),
        releaseDate: validateReleaseDate(gameToEdit.releaseDate),
      });

    }
  };

  const cancelEditing = () => {
    setEditingGameId(null);
    setNewGame({
      title: "",
      releaseDate: "",
      console: "PC",
      progress: "Not Started",
    });
    setValidationErrors({ title: "", releaseDate: "" });
  };

  const saveChanges = useCallback(() => {
    if (validationErrors.title || validationErrors.releaseDate) {
      showMessage("Please correct the errors in the form.", "error");
      return;
    }

    setGames((prevGames) =>
      prevGames.map((game) =>
        game.id === editingGameId ? { ...newGame, id: editingGameId } : game
      )
    );

    setEditingGameId(null);
    setNewGame({
      title: "",
      releaseDate: "",
      console: "PC",
      progress: "Not Started",
    });
    showMessage("Game updated successfully!", "success");
    setValidationErrors({ title: "", releaseDate: "" });
    scrollToTop();
  }, [games, newGame, editingGameId, validationErrors, showMessage, scrollToTop]);

  const getConsoleColor = (consoleName) => {
    return consoleColors[consoleName] || "bg-gray-200";
  };

  const handleFocus = (e) => {
    setActiveElement(e.target);
  };

  const handleBlur = () => {
    setActiveElement(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (isAdding) {
        addGame();
      } else if (editingGameId !== null) {
        saveChanges();
      }
    }
    if (e.key === "Escape") {
      if (isAdding) {
        toggleAdding();
      } else if (editingGameId !== null) {
        cancelEditing();
      }
    }
  };

  const renderModal = () => {
    if (editingGameId === null && !isAdding) return null;

    const isEditMode = editingGameId !== null;

    return (
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
        aria-modal="true"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="relative p-6 border w-full max-w-md shadow-lg rounded-3xl bg-white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          aria-label={isEditMode ? "Edit Game Details" : "Add New Game"}
          onKeyDown={handleKeyDown}
          tabIndex="0"
        >
          <div className="absolute top-4 right-4">
            <button
              onClick={isEditMode ? cancelEditing : toggleAdding}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <h2
            className="text-2xl font-semibold text-gray-800 mb-6"
            id="modal-title"
          >
            {isEditMode ? "Edit Game Details" : "Add New Game"}
          </h2>

          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Game Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Title"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700 placeholder-gray-400 focus:ring-offset-2 focus:ring-offset-white ${
                validationErrors.title ? "border-red-500" : ""
              }`}
              value={newGame.title}
              onChange={handleInputChange}
              aria-label="Game title"
              aria-describedby="title-error"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {validationErrors.title && (
              <p
                className="text-red-500 text-sm mt-1"
                id="title-error"
                aria-live="assertive"
              >
                {validationErrors.title}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="releaseDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Release Date
            </label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700 placeholder-gray-400 focus:ring-offset-2 focus:ring-offset-white ${
                validationErrors.releaseDate ? "border-red-500" : ""
              }`}
              value={newGame.releaseDate}
              onChange={handleInputChange}
              aria-label="Release date"
              aria-describedby="releaseDate-error"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {validationErrors.releaseDate && (
              <p
                className="text-red-500 text-sm mt-1"
                id="releaseDate-error"
                aria-live="assertive"
              >
                {validationErrors.releaseDate}
              </p>
            )}
          </div>

          <div className="mb-6">
            <Select
              id="console"
              name="console"
              value={newGame.console}
              onChange={handleInputChange}
              label="Console"
              options={[
                { value: "PC", label: "PC" },
                { value: "PlayStation 5", label: "PlayStation 5" },
                { value: "Xbox Series X", label: "Xbox Series X" },
                { value: "Nintendo Switch", label: "Nintendo Switch" },
              ]}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={isEditMode ? saveChanges : addGame}
              className="bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl focus:outline-none focus:shadow-outline focus:ring-offset-2 focus:ring-offset-white"
            >
              {isEditMode ? "Save Changes" : "Add Game"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div
      ref={appRef}
      className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-6 flex flex-col justify-center sm:py-12 font-inter antialiased overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      aria-live="polite"
      tabIndex="-1"
    >
      <div className="relative py-3 sm:max-w-3xl sm:mx-auto px-4 sm:px-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 shadow-2xl transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 rounded-3xl"></div>
        <motion.div
          className="relative px-4 py-10 bg-white shadow-xl sm:rounded-3xl sm:p-20"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4, ease: "backOut" }}
            >
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-red-600">
                  Game
                </span>{" "}
                Tracker
              </h1>
              <p className="mt-2 text-lg text-gray-500">
                Catalog, organize, and track your gaming adventures!
              </p>
            </motion.div>

            <AnimatePresence>
              {message.text && (
                <motion.div
                  className={`rounded-md p-4 mb-4 flex items-center ${
                    message.type === "success"
                      ? "bg-green-100 border-green-400 text-green-700"
                      : "bg-red-100 border-red-400 text-red-700"
                  } border`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  role="alert"
                  aria-live="assertive"
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-5 w-5 mr-2" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2" aria-hidden="true" />
                  )}
                  <p className="text-sm">{message.text}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by game title..."
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700 placeholder-gray-400 focus:ring-offset-2 focus:ring-offset-white pr-12"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Search games"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <Search
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mb-4 flex flex-col items-start sm:flex-row sm:items-center space-x-2 sm:space-x-4 space-y-2 sm:space-y-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="w-full">
                <Select
                  id="filterConsole"
                  name="filterConsole"
                  value={filterConsole}
                  onChange={(e) => setFilterConsole(e.target.value)}
                  options={[
                    { value: "All", label: "All Consoles" },
                    { value: "PC", label: "PC" },
                    { value: "PlayStation 5", label: "PlayStation 5" },
                    { value: "Xbox Series X", label: "Xbox Series X" },
                    { value: "Nintendo Switch", label: "Nintendo Switch" },
                  ]}
                />
              </div>
              <button
                onClick={clearFilter}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline  w-full sm:w-auto"
                aria-label="Clear console filter"
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                Clear
              </button>
            </motion.div>

            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {!isAdding && editingGameId === null ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAdding}
                  className="w-full bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline flex items-center justify-center focus:ring-offset-2 focus:ring-offset-white"
                  aria-label="Add a new game"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <Plus className="h-5 w-5 mr-2" aria-hidden="true" /> Add Game
                </motion.button>
              ) : null}
            </motion.div>

            <ul
              ref={listRef}
              className="space-y-4"
              style={{ overflowY: "auto", maxHeight: "500px" }}
              aria-label="Game List"
            >
              <AnimatePresence>
                {filteredGames.map((game) => (
                  <motion.li
                    key={game.id}
                    className={`p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-gray-200 relative overflow-hidden ${getConsoleColor(
                      game.console
                    )}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      x: -50,
                      transition: { duration: 0.2 },
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    layout
                  >
                    <div className="relative z-10 flex justify-between items-start mb-3">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {game.title}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => startEditing(game.id)}
                          className="text-blue-600 hover:text-blue-800 focus:outline-none"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Edit ${game.title}`}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                        >
                          <Edit className="h-5 w-5" aria-hidden="true" />
                        </motion.button>
                        <motion.button
                          onClick={() => deleteGame(game.id)}
                          className="text-red-600 hover:text-red-800 focus:outline-none"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Delete ${game.title}`}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                        >
                          <X className="h-5 w-5" aria-hidden="true" />
                        </motion.button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2 relative z-10">
                      Released:{" "}
                      {format(parseISO(game.releaseDate), "MMMM d, yyyy")}
                    </p>
                    <div className="text-gray-700 text-sm mb-2 relative z-10 flex items-center">
                      <Gamepad2
                        className="h-4 w-4 mr-1 inline"
                        aria-hidden="true"
                      />
                      <span>{game.console}</span>
                    </div>
                    <div className="mt-2 relative z-10">
                      <Select
                        id={`progress-${game.id}`}
                        name={`progress-${game.id}`}
                        value={game.progress}
                        onChange={(e) =>
                          updateProgress(game.id, e.target.value)
                        }
                        label="Progress:"
                        options={[
                          { value: "Not Started", label: "Not Started" },
                          { value: "In Progress", label: "In Progress" },
                          { value: "Completed", label: "Completed" },
                        ]}
                      />
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {filteredGames.length === 0 && (
              <div
                className="text-center text-gray-500 mt-4"
                aria-live="polite"
              >
                No games found matching your criteria.
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <AnimatePresence>{renderModal()}</AnimatePresence>
    </motion.div>
  );
}

export default App;