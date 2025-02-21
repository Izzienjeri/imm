import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  Plus,
  Trash2,
  Edit,
  Edit2,
  Film,
  Clapperboard,
  Eye,
  EyeOff,
  XCircle,
} from "lucide-react";
import "tailwindcss/tailwind.css";

const initialMovies = [
  {
    id: 1,
    title: "Pulp Fiction",
    reviews: [
      {
        id: "r1",
        text: "Stylish and unforgettable!",
        rating: 5,
        author: "Critic1",
        spoiler: false,
      },
      {
        id: "r2",
        text: "A true masterpiece.",
        rating: 4,
        author: "MovieFan",
        spoiler: true,
      },
    ],
  },
  {
    id: 2,
    title: "The Shawshank Redemption",
    reviews: [
      {
        id: "r3",
        text: "An inspiring story of hope.",
        rating: 5,
        author: "Reader123",
        spoiler: false,
      },
      {
        id: "r4",
        text: "One of the best movies ever made.",
        rating: 5,
        author: "CinemaLover",
        spoiler: false,
      },
      {
        id: "r5",
        text: "Deeply moving and well-acted.",
        rating: 4,
        author: "InsightfulViewer",
        spoiler: true,
      },
    ],
  },
  {
    id: 3,
    title: "The Dark Knight",
    reviews: [
      {
        id: "r6",
        text: "Ledger's performance is legendary!",
        rating: 5,
        author: "ComicGeek",
        spoiler: false,
      },
      {
        id: "r7",
        text: "A dark and thrilling superhero film.",
        rating: 4,
        author: "ActionFan",
        spoiler: true,
      },
    ],
  },
  {
    id: 4,
    title: "Inception",
    reviews: [
      {
        id: "r8",
        text: "Mind-bending and visually stunning.",
        rating: 4,
        author: "SciFiEnthusiast",
        spoiler: false,
      },
      {
        id: "r9",
        text: "Keeps you guessing until the end.",
        rating: 5,
        author: "MysteryLover",
        spoiler: false,
      },
      {
        id: "r10",
        text: "A cinematic puzzle.",
        rating: 4,
        author: "ChrisNolanFan",
        spoiler: false,
      },
    ],
  },
];

const ratingColors = {
  1: "text-red-500",
  2: "text-orange-500",
  3: "text-yellow-500",
  4: "text-green-500",
  5: "text-emerald-500",
};

const modalVariants = {
  hidden: { opacity: 0, y: -150, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] },
  },
  exit: {
    opacity: 0,
    y: 150,
    scale: 0.9,
    transition: { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(10px)",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const movieCardVariants = {
  hidden: { opacity: 0, y: 50, rotate: -2 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] },
  },
  exit: {
    opacity: 0,
    y: 50,
    rotate: 2,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const starVariants = {
  hover: { scale: 1.15, transition: { duration: 0.1 } },
  tap: { scale: 0.9 },
};

const RatingStars = ({
  rating,
  setRating,
  onRatingSelected,
  disabled = false,
}) => {
  const [focusedStar, setFocusedStar] = useState(null);

  const handleKeyDown = (index, event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setRating(index + 1);
      onRatingSelected();
    }
  };

  return [...Array(5)].map((_, index) => {
    const starNumber = index + 1;
    const isFocused = focusedStar === index;
    return (
      <motion.button
        key={index}
        variants={starVariants}
        whileHover="hover"
        whileTap="tap"
        className={`focus:outline-none ${
          isFocused ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => setRating(starNumber)}
        aria-label={`Rate ${starNumber} stars`}
        disabled={disabled}
        onKeyDown={(event) => handleKeyDown(index, event)}
        onFocus={() => setFocusedStar(index)}
        onBlur={() => setFocusedStar(null)}
      >
        <Star
          className={`h-5 w-5 ${
            starNumber <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-400"
          } ${isFocused ? "text-blue-500" : ""}`}
          aria-hidden="true"
        />
      </motion.button>
    );
  });
};

function App() {
  const [movies, setMovies] = useState(initialMovies);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(3);
  const [userAddedMovies, setUserAddedMovies] = useState([]);
  const [addMovieModalOpen, setAddMovieModalOpen] = useState(false);
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newMovieRating, setNewMovieRating] = useState(3);
  const [newMovieReview, setNewMovieReview] = useState("");
  const [titleError, setTitleError] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const searchInputRef = useRef(null);
  const [spoilersVisible, setSpoilersVisible] = useState(false);
  const [newMovieSpoiler, setNewMovieSpoiler] = useState(false);
  const [checkboxFocused, setCheckboxFocused] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [movieToDeleteId, setMovieToDeleteId] = useState(null);

  const modalRef = useRef(null);
  const reviewTextRef = useRef(null);

  const idGenerator = useRef(0);
  const generateId = useCallback(() => {
    idGenerator.current += 1;
    return `uniqueId-${idGenerator.current}`;
  }, []);

  useEffect(() => {
    document.body.classList.add("font-inter", "bg-gray-50", "text-gray-800");

    return () => {
      document.body.classList.remove(
        "font-inter",
        "bg-gray-50",
        "text-gray-800"
      );
    };
  }, []);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const trapFocus = useCallback((element) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details[open], [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];

    element.addEventListener("keydown", (e) => {
      const isTabPressed = e.key === "Tab" || e.keyCode === 9;

      if (!isTabPressed) {
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    });

    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
  }, []);

  useEffect(() => {
    const modalIsOpen = modalOpen || addMovieModalOpen || confirmationOpen;
    if (modalIsOpen && modalRef.current) {
      trapFocus(modalRef.current);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalOpen, addMovieModalOpen, trapFocus, confirmationOpen]);

  const getAverageRating = useCallback((movie) => {
    if (!movie.reviews || movie.reviews.length === 0) return 0;
    const totalRating = movie.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    return totalRating / movie.reviews.length;
  }, []);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEditOrDelete = useCallback(
    (movieId) => {
      return userAddedMovies.includes(movieId);
    },
    [userAddedMovies]
  );

  const openReviewModal = useCallback((movie, review = null) => {
    setSelectedMovie(movie);
    setReviewText(review ? review.text : "");
    setReviewRating(review ? review.rating : 3);
    setEditingReview(review || null);
    setModalOpen(true);
  }, []);

  const closeReviewModal = useCallback(() => {
    setModalOpen(false);
    setSelectedMovie(null);
    setEditingReview(null);
  }, []);

  const openAddMovieModal = useCallback(() => {
    setAddMovieModalOpen(true);
    setNewMovieTitle("");
    setNewMovieReview("");
    setNewMovieRating(3);
    setTitleError("");
    setRatingError("");
    setReviewError("");
    setNewMovieSpoiler(false);
  }, []);

  const closeAddMovieModal = useCallback(() => {
    setAddMovieModalOpen(false);
    setNewMovieTitle("");
    setNewMovieReview("");
    setNewMovieRating(3);
    setTitleError("");
    setReviewError("");
    setNewMovieSpoiler(false);
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleReviewSubmit = useCallback(() => {
    setMovies((prevMovies) =>
      prevMovies.map((movie) => {
        if (movie.id === selectedMovie.id) {
          const newReview = {
            id: editingReview ? editingReview.id : generateId(),
            text: reviewText,
            rating: reviewRating,
            author: "You",
            spoiler: editingReview ? editingReview.spoiler : false, // Keep existing spoiler status if editing
          };

          const updatedReviews = editingReview
            ? movie.reviews.map((r) =>
                r.id === editingReview.id ? newReview : r
              ) // Update existing review
            : [...movie.reviews, newReview]; // Add new review

          return { ...movie, reviews: updatedReviews };
        }
        return movie;
      })
    );
    closeReviewModal();
  }, [
    reviewText,
    reviewRating,
    selectedMovie,
    editingReview,
    closeReviewModal,
    generateId,
  ]);

  const handleDeleteReview = useCallback(
    (reviewId) => {
      setMovies((prevMovies) =>
        prevMovies.map((movie) => {
          if (movie.id === selectedMovie.id) {
            const updatedReviews = movie.reviews.filter(
              (r) => r.id !== reviewId
            );
            return { ...movie, reviews: updatedReviews };
          }
          return movie;
        })
      );
      closeReviewModal();
    },
    [selectedMovie, closeReviewModal]
  );

  const handleTitleChange = (e) => {
    setNewMovieTitle(e.target.value);
    setTitleError("");
  };

  const handleReviewChange = (e) => {
    setNewMovieReview(e.target.value);
    setReviewError("");
  };

  const handleRatingSelected = useCallback(() => {
    if (reviewTextRef.current) {
      reviewTextRef.current.focus();
    }
  }, []);

  const handleAddMovie = useCallback(() => {
    let isValid = true;

    if (!newMovieTitle) {
      setTitleError("Title is required.");
      isValid = false;
    } else {
      setTitleError("");
    }

    if (!newMovieRating) {
      setRatingError("Rating is required.");
      isValid = false;
    } else {
      setRatingError("");
    }

    if (!newMovieReview) {
      setReviewError("Review is required.");
      isValid = false;
    } else {
      setReviewError("");
    }

    if (!isValid) {
      return;
    }

    const isDuplicate = movies.some(
      (movie) => movie.title.toLowerCase() === newMovieTitle.toLowerCase()
    );

    if (isDuplicate) {
      setTitleError("Movie title already exists.");
      return;
    }

    const newReview = {
      id: generateId(), // Generate an ID for the review
      text: newMovieReview,
      rating: newMovieRating,
      author: "You",
      spoiler: newMovieSpoiler,
    };

    const newMovie = {
      id: generateId(), // Generate an ID for the movie
      title: newMovieTitle,
      reviews: [newReview],
      addedByYou: true,
    };

    setMovies((prevMovies) => [...prevMovies, newMovie]);
    setUserAddedMovies((prevUserAddedMovies) => [
      ...prevUserAddedMovies,
      newMovie.id,
    ]);
    closeAddMovieModal();
  }, [
    newMovieTitle,
    newMovieReview,
    newMovieRating,
    newMovieSpoiler,
    movies,
    generateId,
    closeAddMovieModal,
  ]);

  const openConfirmationModal = (movieId) => {
    setMovieToDeleteId(movieId);
    setConfirmationOpen(true);
  };

  const closeConfirmationModal = () => {
    setConfirmationOpen(false);
    setMovieToDeleteId(null);
  };

  const handleDeleteMovie = () => {
    if (movieToDeleteId) {
      setMovies((prevMovies) =>
        prevMovies.filter((movie) => movie.id !== movieToDeleteId)
      );
      setUserAddedMovies((prevUserAddedMovies) =>
        prevUserAddedMovies.filter((id) => id !== movieToDeleteId)
      );
      closeConfirmationModal();
    }
  };

  const handleCheckboxKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setNewMovieSpoiler(!newMovieSpoiler);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <motion.header
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <Film
            className="h-12 w-12 mx-auto text-teal-500 mb-3"
            aria-hidden="true"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 tracking-tight">
            <span className="text-teal-600">Movie </span>Reviewer
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            A personal sanctuary for movie reviews and cherished memories.
          </p>
        </motion.header>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <motion.div
            className="flex items-center rounded-full bg-white shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-teal-400 w-full md:w-auto md:mr-4 mb-4 md:mb-0"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.43, 0.13, 0.23, 0.96],
              delay: 0.1,
            }}
          >
            <div className="pl-4">
              <Search className="h-5 w-5 text-gray-500" aria-hidden="true" />
            </div>
            <input
              ref={searchInputRef}
              type="search"
              className="block w-full rounded-full border-0 py-2.5 pl-3 pr-4 bg-transparent text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
              placeholder="Search movies by title..."
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search movies"
              aria-describedby="search-hint"
            />
            <span id="search-hint" className="sr-only">
              Use enter to activate search
            </span>
          </motion.div>
          <motion.button
            className="rounded-full bg-gradient-to-r from-teal-500 to-green-500 px-5 py-2.5 text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 font-semibold flex items-center justify-center"
            onClick={openAddMovieModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Add movie"
            aria-describedby="add-movie-hint"
          >
            <Plus className="h-4 w-4 mr-2 align-middle" aria-hidden="true" />
            Add Movie
          </motion.button>
          <span id="add-movie-hint" className="sr-only">
            Opens add movie modal
          </span>
        </div>

        <div className="flex items-center justify-end mb-4">
          <label
            htmlFor="spoilerToggle"
            className="mr-2 text-gray-600 text-sm md:text-base"
          >
            Show Spoilers:
          </label>
          <button
            onClick={() => setSpoilersVisible(!spoilersVisible)}
            className="focus:outline-none"
            aria-label="Toggle spoilers visibility"
            aria-describedby="toggle-spoilers-hint"
          >
            {spoilersVisible ? (
              <Eye className="h-5 w-5 text-teal-400" aria-hidden="true" />
            ) : (
              <EyeOff className="h-5 w-5 text-gray-500" aria-hidden="true" />
            )}
          </button>
          <span id="toggle-spoilers-hint" className="sr-only">
            Toggle visibility of spoilers in reviews.
          </span>
        </div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.15,
            duration: 0.6,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
        >
          {filteredMovies.map((movie) => {
            const avgRating = getAverageRating(movie);
            return (
              <motion.div
                key={movie.id}
                className="rounded-2xl bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                layout
                variants={movieCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                tabIndex="0"
                aria-label={`Movie Card for ${
                  movie.title
                }, average rating ${avgRating.toFixed(1)}`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 hover:text-teal-500 transition-colors duration-300">
                      {movie.title}
                    </h2>
                    <div className="flex items-center">
                      <RatingStars
                        rating={Math.round(avgRating)}
                        setRating={() => {}}
                        disabled={true}
                      />
                      {movie.reviews && movie.reviews.length > 0 && (
                        <span
                          className={`ml-2 text-gray-500 font-medium text-sm ${
                            ratingColors[Math.round(avgRating)]
                          }`}
                        >
                          {avgRating.toFixed(1)}/5
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    {movie.reviews && movie.reviews.length > 0 ? (
                      movie.reviews.map(
                        (review) =>
                          (spoilersVisible || !review.spoiler) && (
                            <motion.div
                              key={review.id}
                              className="mb-2 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                              whileHover={{ scale: 1.02 }}
                              tabIndex="0"
                              aria-label={`Review by ${review.author}, Rating: ${review.rating}, ${review.text}`}
                            >
                              <div className="flex items-center mb-1">
                                <RatingStars
                                  rating={review.rating}
                                  setRating={() => {}}
                                  disabled={true}
                                />
                                {review.spoiler && (
                                  <span className="ml-2 text-red-500 text-xs">
                                    (Spoiler)
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {review.text}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">
                                  - {review.author}
                                </p>
                                {review.author === "You" && (
                                  <motion.button
                                    className="text-gray-500 hover:text-teal-500 transition-colors duration-200 focus:outline-none"
                                    onClick={() =>
                                      openReviewModal(movie, review)
                                    }
                                    aria-label={`Edit your review for ${movie.title}`}
                                    whileHover={{ scale: 1.1 }}
                                    aria-describedby={`edit-review-hint-${review.id}`}
                                  >
                                    <Edit2
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    />
                                    <span
                                      id={`edit-review-hint-${review.id}`}
                                      className="sr-only"
                                    >
                                      Edit your review
                                    </span>
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          )
                      )
                    ) : (
                      <p className="text-gray-500 text-sm">No reviews yet.</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <motion.button
                      className="rounded-full bg-gradient-to-r from-teal-500 to-green-500 px-4 py-2 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors duration-200 text-sm"
                      onClick={() => openReviewModal(movie)}
                      aria-label={`Add review to ${movie.title}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-describedby={`add-review-hint-${movie.id}`}
                    >
                      Add Review
                    </motion.button>
                    <span
                      id={`add-review-hint-${movie.id}`}
                      className="sr-only"
                    >
                      Add a new review to the movie
                    </span>

                    {canEditOrDelete(movie.id) && (
                      <div className="flex gap-2">
                        <motion.button
                          className="text-gray-500 hover:text-teal-500 transition-colors duration-200 focus:outline-none"
                          aria-label={`Edit ${movie.title}`}
                          whileHover={{ scale: 1.1 }}
                          aria-describedby={`edit-movie-hint-${movie.id}`}
                        >
                          <Edit className="h-5 w-5" aria-hidden="true" />
                          <span
                            id={`edit-movie-hint-${movie.id}`}
                            className="sr-only"
                          >
                            Edit the movie title
                          </span>
                        </motion.button>
                        <motion.button
                          className="text-gray-500 hover:text-red-500 transition-colors duration-200 focus:outline-none"
                          onClick={() => openConfirmationModal(movie.id)}
                          aria-label={`Delete ${movie.title}`}
                          whileHover={{ scale: 1.1 }}
                          aria-describedby={`delete-movie-hint-${movie.id}`}
                        >
                          <Trash2 className="h-5 w-5" aria-hidden="true" />
                          <span
                            id={`delete-movie-hint-${movie.id}`}
                            className="sr-only"
                          >
                            Delete the movie
                          </span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <AnimatePresence>
          {modalOpen && selectedMovie && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Review Movie"
            >
              <motion.div
                className="relative rounded-3xl bg-white shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                ref={modalRef}
              >
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center">
                      <Clapperboard
                        className="h-6 w-6 md:h-7 md:w-7 mr-2 text-teal-500"
                        aria-hidden="true"
                      />
                      {editingReview ? "Edit Review" : "Add Review"} for{" "}
                      {selectedMovie.title}
                    </h2>
                    {editingReview && (
                      <motion.button
                        className="text-gray-500 hover:text-red-500 transition-colors duration-200 text-sm focus:outline-none active:ring-2 active:ring-red-500"
                        onClick={() => handleDeleteReview(editingReview.id)}
                        whileHover={{ scale: 1.1 }}
                        aria-label="Close"
                      ></motion.button>
                    )}
                  </div>
                  <div className="mb-5 md:mb-6">
                    <label
                      htmlFor="reviewText"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Your Review:
                    </label>
                    <textarea
                      id="reviewText"
                      name="reviewText"
                      rows="4"
                      className="shadow appearance-none border rounded-2xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 border-gray-200"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      aria-describedby="review-text-hint"
                      ref={reviewTextRef}
                    />
                    <span id="review-text-hint" className="sr-only">
                      Enter your movie review
                    </span>
                  </div>

                  <div className="mb-5 md:mb-6">
                    <label
                      htmlFor="reviewRating"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Rating:
                    </label>
                    <div className="flex items-center">
                      <RatingStars
                        rating={reviewRating}
                        setRating={setReviewRating}
                        onRatingSelected={handleRatingSelected}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 md:gap-4">
                    <motion.button
                      type="button"
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 px-5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 border
                                            border-gray-300 text-sm active:ring-2 active:ring-gray-400"
                      onClick={closeReviewModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Cancel review"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-green-500 hover:to-teal-500 text-white font-bold py-2.5 px-5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm active:ring-2 active:ring-green-400"
                      onClick={handleReviewSubmit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Submit review"
                    >
                      Submit Review
                    </motion.button>
                  </div>
                </div>
                <motion.button
                  type="button"
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none active:ring-2 active:ring-gray-400"
                  onClick={closeReviewModal}
                  aria-label="Close"
                  whileHover={{ scale: 1.1 }}
                >
                  <XCircle className="h-6 w-6" aria-hidden="true" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {addMovieModalOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Add New Movie"
            >
              <motion.div
                className="relative rounded-3xl bg-white shadow-2xl w-full max-w-md overflow-hidden border border-gray-200"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                ref={modalRef}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center mb-5">
                    <Film
                      className="h-7 w-7 md:h-8 md:w-8 mr-2 text-teal-500"
                      aria-hidden="true"
                    />
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                      Add New Movie
                    </h2>
                  </div>
                  <div className="mb-4 md:mb-5">
                    <label
                      htmlFor="newMovieTitle"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Movie Title:
                    </label>
                    <input
                      type="text"
                      id="newMovieTitle"
                      name="newMovieTitle"
                      className="shadow appearance-none border rounded-2xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 border-gray-200"
                      value={newMovieTitle}
                      onChange={handleTitleChange}
                      onBlur={() => {
                        if (!newMovieTitle) {
                          setTitleError("Title is required.");
                        } else {
                          setTitleError("");
                        }
                      }}
                      aria-describedby="new-movie-title-hint"
                      aria-invalid={!!titleError}
                    />
                    {titleError && (
                      <p
                        className="text-red-500 text-xs italic mt-1"
                        role="alert"
                      >
                        {titleError}
                      </p>
                    )}
                    <span id="new-movie-title-hint" className="sr-only">
                      Enter the title of the movie
                    </span>
                  </div>
                  <div className="mb-4 md:mb-5">
                    <label
                      htmlFor="newMovieRating"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Rating:
                    </label>
                    <div className="flex items-center">
                      <RatingStars
                        rating={newMovieRating}
                        setRating={setNewMovieRating}
                        onRatingSelected={() => {}}
                      />
                    </div>
                    {ratingError && (
                      <p
                        className="text-red-500 text-xs italic mt-1"
                        role="alert"
                      >
                        {ratingError}
                      </p>
                    )}
                  </div>

                  <div className="mb-4 md:mb-5">
                    <label
                      htmlFor="newMovieReview"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Review:
                    </label>
                    <textarea
                      id="newMovieReview"
                      name="newMovieReview"
                      rows="4"
                      className="shadow appearance-none border rounded-2xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 border-gray-200"
                      value={newMovieReview}
                      onChange={handleReviewChange}
                      onBlur={() => {
                        if (!newMovieReview) {
                          setReviewError("Review is required.");
                        } else {
                          setReviewError("");
                        }
                      }}
                      aria-describedby="new-movie-review-hint"
                      aria-invalid={!!reviewError}
                    />
                    {reviewError && (
                      <p
                        className="text-red-500 text-xs italic mt-1"
                        role="alert"
                      >
                        {reviewError}
                      </p>
                    )}
                    <span id="new-movie-review-hint" className="sr-only">
                      Enter your movie review
                    </span>
                  </div>
                  <div className="mb-4 md:mb-5">
                    <label
                      htmlFor="newMovieSpoiler"
                      className="flex items-center text-gray-700 text-sm font-bold"
                    >
                      <input
                        id="newMovieSpoiler"
                        type="checkbox"
                        className={`mr-2 leading-tight text-teal-500 focus:ring-teal-500 rounded ${
                          checkboxFocused ? "ring-2 ring-blue-500" : ""
                        } active:ring-2 active:ring-teal-500`}
                        checked={newMovieSpoiler}
                        onChange={(e) => setNewMovieSpoiler(e.target.checked)}
                        onKeyDown={handleCheckboxKeyDown}
                        onFocus={() => setCheckboxFocused(true)}
                        onBlur={() => setCheckboxFocused(false)}
                      />
                      Contains Spoiler
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 md:gap-4">
                    <motion.button
                      type="button"
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 px-5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 border border-gray-300 text-sm active:ring-2 active:ring-gray-400"
                      onClick={closeAddMovieModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Cancel adding movie"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-green-500 hover:to-teal-500 text-white font-bold py-2.5 px-5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm active:ring-2 active:ring-green-400"
                      onClick={handleAddMovie}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Add movie"
                    >
                      Add Movie
                    </motion.button>
                  </div>
                </div>
                <motion.button
                  type="button"
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none active:ring-2 active:ring-gray-400"
                  onClick={closeAddMovieModal}
                  aria-label="Close"
                  whileHover={{ scale: 1.1 }}
                >
                  <XCircle className="h-6 w-6" aria-hidden="true" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {confirmationOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Confirm Deletion"
            >
              <motion.div
                className="relative rounded-3xl bg-white shadow-2xl w-full max-w-md overflow-hidden border border-gray-200"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                ref={modalRef}
              >
                <div className="p-6 md:p-8">
                  <h2 className="text-2xl font-extrabold text-gray-800 mb-4">
                    Confirm Deletion
                  </h2>
                  <p className="text-gray-700 mb-5">
                    Are you sure you want to delete this movie?
                  </p>

                  <div className="flex justify-end gap-3 md:gap-4">
                    <motion.button
                      type="button"
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 px-5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 border border-gray-300 text-sm active:ring-2 active:ring-gray-400"
                      onClick={closeConfirmationModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Cancel deletion"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-300 text-sm active:ring-2 active:ring-red-400"
                      onClick={handleDeleteMovie}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Delete movie"
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
                <motion.button
                  type="button"
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none active:ring-2 active:ring-gray-400"
                  onClick={closeConfirmationModal}
                  aria-label="Close"
                  whileHover={{ scale: 1.1 }}
                >
                  <XCircle className="h-6 w-6" aria-hidden="true" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default App;
