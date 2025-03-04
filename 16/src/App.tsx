"use client";

import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  useCallback,
  memo,
} from "react";
import {
  Plus,
  Search,
  X,
  Gamepad2,
  Edit,
  Rocket,
  Save,
  Bomb,
  AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Game {
  id: number;
  title: string;
  releaseDate: string;
  console: string;
  progress: string;
}

interface NewGame {
  title: string;
  releaseDate: string;
  console: string;
  progress: string;
}

interface ValidationErrors {
  title: string;
  releaseDate: string;
}

// Function to generate a random pastel color
const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 85%)`;
};

const defaultGames: Game[] = [
  {
    id: 1,
    title: "The Legend of Zelda: Tears of the Kingdom",
    releaseDate: "2023-05-12",
    console: "Nintendo Switch",
    progress: "Completed",
  },
  {
    id: 2,
    title: "Marvel's Spider-Man 2",
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

interface GameItemProps {
  game: Game;
  updateProgress: (id: number, newProgress: string) => void;
  deleteGame: (id: number) => void;
  startEditing: (id: number) => void;
  getConsoleColor: (consoleName: string) => string;
  handleFocus: (e: React.FocusEvent<HTMLButtonElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLButtonElement>) => void;
}

const GameItem: React.FC<GameItemProps> = memo(
  ({
    game,
    updateProgress,
    deleteGame,
    startEditing,
    getConsoleColor,
    handleFocus,
    handleBlur,
  }) => {
    const handleDelete = useCallback(
      (id: number) => {
        deleteGame(id);
        toast.success("POOF! Game has vanished! 💨", {
          duration: 2500,
          position: "bottom-center",
          icon: <Bomb />,
        });
      },
      [deleteGame]
    );

    return (
      <motion.li
        key={game.id}
        className={cn(
          "p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300 border border-gray-200 relative overflow-hidden",
          getConsoleColor(game.console)
        )}
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
        <div
          className="absolute inset-0 bg-opacity-10 pattern-dots"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='%23FFFFFF'/%3E%3Ccircle cx='10.5' cy='10.5' r='1.5' fill='%23FFFFFF'/%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        ></div>

        <div className="relative z-10 flex justify-between items-start mb-3">
          <h2 className="text-xl font-semibold text-gray-900">{game.title}</h2>
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startEditing(game.id)}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                aria-label={`Edit ${game.title}`}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <Edit className="h-5 w-5" aria-hidden="true" />
              </Button>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-[0.6rem] py-0.5 px-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Edit
              </span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {}}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    aria-label={`Delete ${game.title}`}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-[0.6rem] py-0.5 px-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Remove
                  </span>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white border border-gray-200 rounded-lg shadow-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Woah there, are you SURE?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action is irreversible! Delete {game.title}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Nope, keep it!</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(game.id)}>
                    DELETE!
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <p className="text-gray-700 text-sm mb-2 relative z-10">
          Released: {format(parseISO(game.releaseDate), "MMMM d, yyyy")}
        </p>
        <div className="text-gray-700 text-sm mb-2 relative z-10 flex items-center">
          <Gamepad2 className="h-4 w-4 mr-1 inline" aria-hidden="true" />
          <span>{game.console}</span>
        </div>
        <div className="mt-2 relative z-10">
          <Select
            value={game.progress}
            onValueChange={(value) => {
              updateProgress(game.id, value);
            }}
            aria-label={`Progress of ${game.title}`}
          >
            <SelectTrigger
              id={`progress-${game.id}`}
              className="w-full px-4 py-3 border rounded-xl text-gray-700 leading-tight focus:outline-none  pr-8 bg-white hover:border-purple-300 focus:border-purple-300 focus:ring-offset-2  transition-colors duration-200"
            >
              <SelectValue placeholder="Select progress" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-700">
              <SelectItem value="Not Started" className="hover:bg-gray-100">
                Not Started
              </SelectItem>
              <SelectItem value="In Progress" className="hover:bg-gray-100">
                In Progress
              </SelectItem>
              <SelectItem value="Completed" className="hover:bg-gray-100">
                Completed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.li>
    );
  }
);

GameItem.displayName = "GameItem";

interface GameListProps {
  games: Game[];
  updateProgress: (id: number, newProgress: string) => void;
  deleteGame: (id: number) => void;
  startEditing: (id: number) => void;
  getConsoleColor: (consoleName: string) => string;
  handleFocus: (e: React.FocusEvent<HTMLButtonElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLButtonElement>) => void;
}

// Component to display the list of games
const GameList: React.FC<GameListProps> = ({
  games,
  updateProgress,
  deleteGame,
  startEditing,
  getConsoleColor,
  handleFocus,
  handleBlur,
}) => {
  return (
    <ul className="space-y-4" aria-label="Game List">
      <AnimatePresence>
        {games.map((game) => (
          <GameItem
            key={game.id}
            game={game}
            updateProgress={updateProgress}
            deleteGame={deleteGame}
            startEditing={startEditing}
            getConsoleColor={getConsoleColor}
            handleFocus={handleFocus}
            handleBlur={handleBlur}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
};

interface ModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  newGame: NewGame;
  validationErrors: ValidationErrors;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
  handleFocus: (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

// Component for the modal to add or edit a game
const Modal: React.FC<ModalProps> = ({
  isOpen,
  isEditMode,
  newGame,
  validationErrors,
  handleInputChange,
  onClose,
  onSubmit,
  handleFocus,
  handleBlur,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center backdrop-blur-md"
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        className="relative p-6 w-full max-w-md shadow-2xl rounded-3xl bg-white"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        aria-label={isEditMode ? "Edit Game Details" : "Add New Game"}
      >
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label="Close"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>

        <h2
          className="text-2xl font-semibold text-gray-800 mb-6"
          id="modal-title"
        >
          {isEditMode ? "Tweak the Game!" : "Add a New Challenger!"}
        </h2>

        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Game Title
          </label>
          <Input
            type="text"
            id="title"
            name="title"
            placeholder="Title"
            className={cn(
              "w-full px-4 py-3 rounded-xl focus:outline-none  text-gray-700 placeholder-gray-400 focus:ring-offset-2  transition-colors duration-200",
              validationErrors.title ? "border-red-500" : ""
            )}
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
          <Input
            type="date"
            id="releaseDate"
            name="releaseDate"
            className={cn(
              "w-full px-4 py-3 rounded-xl focus:outline-none  text-gray-700 placeholder-gray-400 focus:ring-offset-2  transition-colors duration-200",
              validationErrors.releaseDate ? "border-red-500" : ""
            )}
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
            onValueChange={(value) =>
              handleInputChange({
                target: {
                  name: "console",
                  value,
                },
              } as any)
            }
            value={newGame.console}
            aria-label="Console"
          >
            <SelectTrigger
              id="console"
              className="w-full px-4 py-3 rounded-xl text-gray-700 leading-tight focus:outline-none   pr-8 bg-white hover:border-purple-300 focus:border-purple-300 focus:ring-offset-2  transition-colors duration-200"
            >
              <SelectValue placeholder="Select console" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-700">
              <SelectItem value="PC" className="hover:bg-gray-100">
                PC
              </SelectItem>
              <SelectItem value="PlayStation 5" className="hover:bg-gray-100">
                PlayStation 5
              </SelectItem>
              <SelectItem value="Xbox Series X" className="hover:bg-gray-100">
                Xbox Series X
              </SelectItem>
              <SelectItem value="Nintendo Switch" className="hover:bg-gray-100">
                Nintendo Switch
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onSubmit}
            className="bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl focus:outline-none   transition-colors duration-200"
          >
            {isEditMode ? "Save Changes" : "Add Game"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Main App Component
function GameTracker() {
  const [games, setGames] = useState<Game[]>(defaultGames);
  const [newGame, setNewGame] = useState<NewGame>({
    title: "",
    releaseDate: "",
    console: "PC",
    progress: "Not Started",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterConsole, setFilterConsole] = useState<string>("All");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingGameId, setEditingGameId] = useState<number | null>(null);
  const [
    consoleColors,
    setConsoleColors,
  ] = useState<{ [key: string]: string }>({});
  const listRef = useRef<HTMLUListElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    title: "",
    releaseDate: "",
  });
  const [rotation, setRotation] = useState(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Callback function for focus events
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>) => {
      e.target.classList.add("ring-2", "ring-purple-300");
    },
    []
  );

  // Callback function for blur events
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>) => {
      e.target.classList.remove("ring-2", "ring-purple-300");
    },
    []
  );

  // useEffect hook to handle side effects like setting document title, generating console colors, and setting up intervals
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

    const intervalId = setInterval(() => {
      setRotation((prevRotation) => (prevRotation + 2) % 360);
    }, 20);

    return () => {
      clearInterval(intervalId);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [games]);

  // Function to validate input fields
  const validateInput = (name: string, value: string): string => {
    let error = "";

    switch (name) {
      case "title":
        if (!value) {
          error = "Title is required.";
        } else if (value.length < 3) {
          error = "Title must be at least 3 characters long.";
        } else {
          const isDuplicate = games.some(
            (game) =>
              game.title.toLowerCase() === value.toLowerCase() &&
              (editingGameId === null || game.id !== editingGameId)
          );
          if (isDuplicate) {
            error = "A game with this title already exists.";
          }
        }
        break;
      case "releaseDate":
        if (!value) {
          error = "Release date is required.";
        } else {
          try {
            parseISO(value);
          } catch (e: any) {
            error = "Invalid date format.";
          }
        }
        break;
      default:
        break;
    }

    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));

    return error;
  };

  // Function to handle input changes in the modal
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewGame((prev) => ({ ...prev, [name]: value }));
    validateInput(name, value);
  };

  // Function to handle changes in the search input with debounce
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 150);
  };

  // Function to scroll to the top of the app
  const scrollToTop = useCallback(() => {
    if (appRef.current) {
      appRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);

  // Function to add a new game to the list
  const addGame = () => {
    const titleError = validateInput("title", newGame.title);
    const releaseDateError = validateInput("releaseDate", newGame.releaseDate);

    if (titleError || releaseDateError) {
      toast.error("Hold up! Form's got some boo-boos. 🩹", {
        duration: 2500,
        position: "bottom-center",
        icon: <AlertCircle />,
      });
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
    toast.success("New Game unlocked! 🎉", {
      duration: 2500,
      position: "bottom-center",
      icon: <Gamepad2 />,
    });
    setIsAdding(false);
    setValidationErrors({ title: "", releaseDate: "" });

    scrollToTop();
  };

  // Function to update the progress of a game
  const updateProgress = useCallback(
    (id: number, newProgress: string) => {
      setGames((prevGames) =>
        prevGames.map((game) =>
          game.id === id ? { ...game, progress: newProgress } : game
        )
      );
      toast.success("Progress updated!", {
        duration: 2500,
        position: "bottom-center",
        icon: <Rocket />,
      });
      scrollToTop();
    },
    [setGames, scrollToTop]
  );

  const deleteGame = useCallback(
    (id: number) => {
      setGames((prevGames) => prevGames.filter((game) => game.id !== id));
      scrollToTop();
    },
    [setGames, scrollToTop]
  );

  const startEditing = useCallback(
    (id: number) => {
      setEditingGameId(id);
      const gameToEdit = games.find((game) => game.id === id);
      if (gameToEdit) {
        setNewGame({ ...gameToEdit });
        setValidationErrors({ title: "", releaseDate: "" });
      }
    },
    [games, setEditingGameId, setNewGame, setValidationErrors]
  );

  // Memoized filtered games based on search term and console filter
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

  // Function to clear the console filter
  const clearFilter = () => {
    setFilterConsole("All");
    setSearchTerm("");
  };

  // Function to toggle the adding state
  const toggleAdding = () => {
    setIsAdding(!isAdding);
    setValidationErrors({ title: "", releaseDate: "" });
  };

  // Function to cancel editing a game
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

  // Function to save changes made to a game
  const saveChanges = () => {
    const titleError = validateInput("title", newGame.title);
    const releaseDateError = validateInput("releaseDate", newGame.releaseDate);

    if (titleError || releaseDateError) {
      toast.error("Uh oh! Something's not quite right. 🧐", {
        duration: 2500,
        position: "bottom-center",
        icon: <AlertCircle />,
      });
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
    toast.success("Game updated successfully!", {
      duration: 2500,
      position: "bottom-center",
      icon: <Save />,
    });
    setValidationErrors({ title: "", releaseDate: "" });
    scrollToTop();
  };

  // Function to get the color associated with a console
  const getConsoleColor = (consoleName: string) => {
    return consoleColors[consoleName] || "bg-gray-200";
  };

  const isEditMode = editingGameId !== null;
  const isModalOpen = isAdding || isEditMode;

  // Function to handle the submit action (add or save)
  const handleSubmit = () => {
    if (isEditMode) {
      saveChanges();
    } else {
      addGame();
    }
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    if (isEditMode) {
      cancelEditing();
    } else {
      toggleAdding();
    }
  };

  // Function to clear the search term
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <motion.div
      ref={appRef}
      className="min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12 font-inter antialiased overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      aria-live="polite"
    >
      <Toaster richColors />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"></div>
      )}

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
              className="text-center mb-8 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4, ease: "backOut" }}
            >
              <motion.div
                style={{
                  display: "inline-block",
                  transform: `rotate(${rotation}deg)`,
                }}
                aria-hidden="true"
              >
                <Gamepad2 className="h-12 w-12 text-purple-600 mb-2" />
              </motion.div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-red-600">
                  Game
                </span>{" "}
                Tracker
              </h1>
              <p className="mt-2 text-lg text-gray-500">
                Level up your organization. Catalog, organize, and track your
                gaming adventures!
              </p>
            </motion.div>

            <div className="grid gap-4 mb-6 md:grid-cols-2">
              <motion.div
                className=""
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search by game title..."
                    className="w-full px-4 py-3 rounded-xl focus:outline-none  text-gray-700 placeholder-gray-400 focus:ring-offset-2  pr-12 transition-shadow duration-200"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    aria-label="Search games"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-2 flex items-center"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4 text-gray-500 hover:text-gray-700" aria-hidden="true" />
                    </Button>
                  )}
                  {!searchTerm && (
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <Search
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                className=""
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Select
                  onValueChange={(value) => setFilterConsole(value)}
                  value={filterConsole}
                  aria-label="Filter by console"
                >
                  <SelectTrigger
                    id="filterConsole"
                    className="w-full px-4 py-3 rounded-xl focus:outline-none   pr-8 bg-white hover:border-purple-300 focus:border-purple-300 focus:ring-offset-2  transition-shadow duration-200"
                  >
                    <SelectValue placeholder="Select console" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-700">
                    <SelectItem value="All" className="hover:bg-gray-100">
                      All Consoles
                    </SelectItem>
                    <SelectItem value="PC" className="hover:bg-gray-100">
                      PC
                    </SelectItem>
                    <SelectItem value="PlayStation 5" className="hover:bg-gray-100">
                      PlayStation 5
                    </SelectItem>
                    <SelectItem value="Xbox Series X" className="hover:bg-gray-100">
                      Xbox Series X
                    </SelectItem>
                    <SelectItem value="Nintendo Switch" className="hover:bg-gray-100">
                      Nintendo Switch
                    </SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Button
                onClick={clearFilter}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl focus:outline-none   w-full transition-colors duration-200"
                aria-label="Clear search and filter"
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                Clear Search and Filter
              </Button>
            </motion.div>

            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {!isAdding && editingGameId === null ? (
                <Button
                  onClick={toggleAdding}
                  className="w-full bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl focus:outline-none   flex items-center justify-center   transition-colors duration-200"
                  aria-label="Add a new game"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <Plus className="h-5 w-5 mr-2" aria-hidden="true" /> Add Game
                </Button>
              ) : null}
            </motion.div>

            <div style={{ overflowY: "auto", maxHeight: "500px" }}>
              <GameList
                games={filteredGames}
                updateProgress={updateProgress}
                deleteGame={deleteGame}
                startEditing={startEditing}
                getConsoleColor={getConsoleColor}
                handleFocus={handleFocus}
                handleBlur={handleBlur}
              />
            </div>

            {filteredGames.length === 0 && (
              <div
                className="text-center text-gray-500 mt-4"
                aria-live="polite"
              >
                No games found matching your criteria. Time to expand your
                collection!
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <Modal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        newGame={newGame}
        validationErrors={validationErrors}
        handleInputChange={handleInputChange}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        handleFocus={handleFocus}
        handleBlur={handleBlur}
      />
    </motion.div>
  );
}

export default GameTracker;