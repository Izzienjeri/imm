import React, { useState, useEffect, useRef } from "react";
import { Home, Briefcase, SprayCan, XCircle, CheckCircle, Star, Menu, Edit, Trash2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "tailwindcss/tailwind.css";

// Define theme variables for consistent styling.
const theme = {
  colors: {
    primary: "bg-blue-600 hover:bg-blue-700", 
    primaryText: "text-blue-600",
    primaryHover: "hover:bg-blue-700",
    secondary: "bg-gray-50", 
    textPrimary: "text-gray-800", 
    textSecondary: "text-gray-600", 
    accent: "text-blue-400", 
    success: "bg-green-500", 
    error: "bg-red-500", 
    warning: "bg-yellow-500", 
    info: "bg-blue-500", 
    white: "text-white", 
    gray800: "text-gray-800", 
    gray600: "text-gray-600",
    gray400: "text-gray-400",
    gray300: "bg-gray-300",
    gray200: "hover:bg-gray-200",
    gray100: "bg-gray-100",
    red500: "text-red-500",
    red600: "hover:bg-red-600",
    green500: "bg-green-500",
    yellow500: "text-yellow-500",
    blue500: "text-blue-500",
    blue700: "text-blue-700",
    light: "bg-gray-100", 
    shadowColor: "bg-gray-600", // for the backdrop
  },
  font: {
    family: "font-inter font-sans", 
    base: "text-base", 
  },
  shadow: "shadow-md", 
  borderRadius: "rounded-xl", 
  transition: "transition duration-300 ease-in-out", 
};

// Define available cleaning services.
const services = [
  { id: "home", name: "Residential Bliss Cleaning", icon: <Home size={28} />, description: "Transform your home..." },
  { id: "office", name: "Commercial Sparkle Cleaning", icon: <Briefcase size={28} />, description: "Elevate your workspace..." },
  { id: "deep", name: "Intensive Renewal Cleaning", icon: <SprayCan size={28} />, description: "Experience the ultimate..." },
];

// Initial reviews (can be pre-populated or from an API).
const prePopulatedReviews = [
  { id: 1, name: "Isaac", text: "Absolutely transformed my home!", rating: 5 },
  { id: 2, name: "Kojo", text: "Professional and efficient office cleaning service.", rating: 4 },
  { id: 3, name: "Big Ben", text: "Incredible deep cleaning results!", rating: 5 },
];

// Renders star icons based on a rating.
const StarRating = ({ rating, setRating }) => (
  <div role="radiogroup" aria-label="Rating">
    {[...Array(5)].map((_, i) => {
      const starValue = i + 1;
      return (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={starValue === rating}
          aria-label={`${starValue} stars`}
          onClick={() => setRating(starValue)}
          className={`inline ${starValue <= rating ? theme.colors.yellow500 : theme.colors.gray400}`}
        >
          <Star size={20} fill={starValue <= rating ? "currentColor" : "none"} />
        </button>
      );
    })}
  </div>
);

// Displays a temporary notification message.
const Toast = ({ id, message, type, onClose }) => {
  const toastTypes = {
    success: { bgColor: theme.colors.success, icon: <CheckCircle size={20} /> },
    error: { bgColor: theme.colors.error, icon: <XCircle size={20} /> },
    warning: { bgColor: theme.colors.warning, textColor: theme.colors.gray800, icon: <Info size={20} /> },
    info: { bgColor: theme.colors.info, icon: <Info size={20} /> },
  };
  const { bgColor, textColor = theme.colors.white, icon } = toastTypes[type] || { bgColor: theme.colors.info, icon: <Info size={20} /> };

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`p-4 rounded-md flex items-center justify-between space-x-2 ${textColor} ${bgColor} ${theme.shadow} ${theme.transition} mb-2`}
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-sm">{message}</span>
      </div>
      <button onClick={onClose} className="focus:outline-none" aria-label="Close notification">
        <XCircle size={20} className={`${theme.colors.white} opacity-70 hover:opacity-100`} />
      </button>
    </motion.div>
  );
};

// Manages the display and removal of Toast components.
const ToastContainer = ({ toasts, setToasts }) => {
  const handleClose = (id) => setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} onClose={() => handleClose(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// A reusable modal component.
const Modal = ({ isOpen, onClose, children, title, onSubmit }) => {
  const modalRef = useRef(null); //Ref for modal
  const closeButtonRef = useRef(null); // Ref for close button
  const firstInputRef = useRef(null); // Ref for the first input element

  useEffect(() => {
    const focusableElementsString =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let focusableElements;
    let first;
    let last;

    const trapFocus = (e) => {
      if (e.key === "Tab") {
        // Only trap Tab key
        if (!modalRef.current) return;

        focusableElements = modalRef.current.querySelectorAll(focusableElementsString);
        first = focusableElements[0];
        last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      // Save the initially focused element before the modal opens
      const initiallyFocusedElement = document.activeElement;

      // Focus on the first input when the modal opens
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      } else if (closeButtonRef.current) {
        // If there's no input, focus on the close button as a fallback
        closeButtonRef.current.focus();
      }

      const handleKeyDown = (e) => {
        trapFocus(e);
      }; // Trap focus within the modal

      document.addEventListener("keydown", handleKeyDown); // Keydown listener
      document.addEventListener("focusin", handleFocusIn);

      function handleFocusIn(e) {
        if (!modalRef.current.contains(e.target)) {
          firstInputRef.current ? firstInputRef.current.focus() : closeButtonRef.current.focus(); //focus on close button as fallback
        }
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("focusin", handleFocusIn);
        // Restore focus to the initially focused element when the modal closes
        if (initiallyFocusedElement) {
          initiallyFocusedElement.focus();
        }
      }; // Cleanup listener
    }
  }, [isOpen]); // Run effect on open

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    if (onSubmit) {
      onSubmit(); // Call the provided onSubmit function
    }
  };

  return (
    <div className={`fixed inset-0 ${theme.colors.shadowColor} bg-opacity-70 flex justify-center items-center z-50`} aria-modal="true" role="dialog">
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-11/12 md:w-96 relative"
      >
        <button
          className={`absolute top-4 right-4 ${theme.colors.gray600} hover:${theme.colors.gray800} focus:outline-none focus:ring-2 focus:${theme.colors.primaryText} rounded-md`}
          onClick={onClose}
          aria-label="Close Modal"
          ref={closeButtonRef}
        >
          <XCircle size={28} />
        </button>
        {title && <h2 className={`text-2xl font-semibold mb-6 ${theme.colors.textPrimary} text-center`}>{title}</h2>}
        <form onSubmit={handleSubmit}>
          {/* Corrected placement of React.Children.map */}
          {React.Children.map(children, (child, index) => {
            if (
              index === 0 &&
              (child && child.type === "input" || child && child.type === "textarea" || child && child.type === "select")
            ) {
              return React.cloneElement(child, { ref: firstInputRef }); // Apply ref to first input
            }
            return child;
          })}
          {/* End Corrected Placement */}
        </form>
      </motion.div>
    </div>
  );
};

// A modal for confirming actions (e.g., deleting a review).
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) =>
  isOpen ? (
    <div className={`fixed inset-0 ${theme.colors.shadowColor} bg-opacity-70 flex justify-center items-center z-50`} aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-md shadow-md">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end">
          <button className={`${theme.colors.gray300} ${theme.colors.gray200} rounded-md mr-2 focus:outline-none px-4 py-2`} onClick={onClose} aria-label="Cancel deletion">
            Cancel
          </button>
          <button className={`${theme.colors.red500} ${theme.colors.white} rounded-md ${theme.colors.red600} focus:outline-none px-4 py-2`} onClick={onConfirm} aria-label="Confirm deletion">
            Confirm
          </button>
        </div>
      </div>
    </div>
  ) : null;

// Displays a single service.
const ServiceCard = ({ service }) => (
  <motion.div
    whileHover={{ scale: 1.05, translateY: -3 }}
    className={`p-6 bg-white ${theme.shadow} ${theme.borderRadius} text-center hover:shadow-lg ${theme.transition} cursor-pointer`}
  >
    <div className={`${theme.colors.accent} mx-auto mb-4`}>{service.icon}</div>
    <h3 className={`text-xl font-semibold mt-2 ${theme.colors.textPrimary} mb-1`}>{service.name}</h3>
    <p className={`${theme.colors.textSecondary}`}>{service.description}</p>
  </motion.div>
);

// Displays a single review with edit/delete options if the user added it.
const ReviewCard = ({ review, onDelete, onEdit, isAddedByUser }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className={`bg-white ${theme.shadow} ${theme.borderRadius} p-5 ${theme.transition}`}
  >
    <div className="flex justify-between items-center mb-3">
      <StarRating rating={review.rating} setRating={() => {}} />
      {isAddedByUser && (
        <div>
          <button onClick={onEdit} className={`${theme.colors.blue500} ${theme.colors.blue700} mr-2 focus:outline-none`} aria-label={`Edit review by ${review.name}`}>
            <Edit size={20} />
          </button>
          <button onClick={onDelete} className={`${theme.colors.red500} ${theme.colors.red700} focus:outline-none`} aria-label={`Delete review by ${review.name}`}>
            <Trash2 size={20} />
          </button>
        </div>
      )}
    </div>
    <p className={`${theme.colors.textSecondary} italic mb-3`}>"{review.text}"</p>
    <p className={`${theme.colors.textSecondary} font-semibold`}>- {review.name}</p>
  </motion.div>
);

// Navigation link component
const NavLink = ({ href, onClick, children, ariaLabel }) => (
  <li>
    <button onClick={onClick} className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1" aria-label={ariaLabel}>
      {children}
    </button>
  </li>
);

// Custom hook to persist state to local storage.
const useLocalStorage = (key, initialValue) => {
  // State variable to hold the stored value.
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get the item from local storage by key.
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error, return initial value.
      console.error(error);
      return initialValue;
    }
  });

  // useEffect hook to update local storage when the state changes.
  useEffect(() => {
    try {
      // Save state to local storage.
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      // If error, log it.
      console.error(error);
    }
  }, [key, storedValue]);

  // Return the state and the update function.
  return [storedValue, setStoredValue];
};

// Main application component.
const App = () => {
  // State variables using the custom useLocalStorage hook for persistence
  const [userAddedReviews, setUserAddedReviews] = useLocalStorage("userReviews", []);
  const [reviews, setReviews] = useState([...prePopulatedReviews, ...userAddedReviews]);
  const [review, setReview] = useState({ name: "", text: "", rating: 0 });
  const [quote, setQuote] = useState({ name: "", service: "" });
  const [appointment, setAppointment] = useState({ name: "", service: "" });

  // State variables to control modal visibility
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isLeaveReviewModalOpen, setIsLeaveReviewModalOpen] = useState(false);
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);

  // State for managing review editing
  const [reviewToEdit, setReviewToEdit] = useState(null);
  // State for managing toast notifications
  const [toasts, setToasts] = useState([]);
  // State for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State for confirmation modal visibility and review deletion
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState(null);

  // useRef hook to reference the reviews section for scrolling
  const reviewsSectionRef = useRef(null);
  // State for form validation errors
  const [errors, setErrors] = useState({
    quoteName: "",
    quoteService: "",
    appointmentName: "",
    appointmentService: "",
    appointmentDate: "",
    reviewName: "",
    reviewText: "",
    reviewRating: "",
  });

  // Update reviews whenever userAddedReviews changes.
  useEffect(() => {
    setReviews([...prePopulatedReviews, ...userAddedReviews]);
  }, [userAddedReviews]);

  // Validates form data before submission.
  const validateForm = (formType, formData) => {
    const newErrors = {};

    switch (formType) {
      case "quote":
        if (!formData.name) newErrors.quoteName = "Please enter your name.";
        if (!formData.service) newErrors.quoteService = "Please select a service.";
        break;
      case "appointment":
        if (!formData.name) newErrors.appointmentName = "Please enter your name.";
        if (!formData.service) newErrors.appointmentService = "Please select a service.";
        if (!formData.date) {
          newErrors.appointmentDate = "Please select a date.";
        } else {
          const selectedDate = new Date(formData.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // set time to 00:00:00
          if (selectedDate < today) {
            newErrors.appointmentDate = "Please select a future date.";
          }
        }
        break;
      case "review":
        if (!formData.name) newErrors.reviewName = "Please enter your name.";
        if (!formData.text) newErrors.reviewText = "Please enter your review.";
        if (!formData.rating) newErrors.reviewRating = "Please provide a rating.";
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handles submitting a new review.
  const handleReviewSubmit = () => {
    if (!validateForm("review", review)) return;

    const newReview = { ...review, id: Date.now() };
    setUserAddedReviews([...userAddedReviews, newReview]);
    setReview({ name: "", text: "", rating: 0 });
    showNotification("Thank you for your review!", "success");
    setIsLeaveReviewModalOpen(false);
  };

  // Handles submitting a quote request.
  const handleQuoteSubmit = () => {
    if (!validateForm("quote", quote)) return;

    showNotification(
      `Your quote request for ${quote.service} has been submitted! We'll be in touch soon.`,
      "success"
    );
    setQuote({ name: "", service: "" });
    setIsQuoteModalOpen(false);
  };

  // Handles submitting an appointment request.
  const handleAppointmentSubmit = () => {
    if (!validateForm("appointment", appointment)) return;

    showNotification(
      `Your appointment for ${appointment.service} on ${appointment.date} is booked!`,
      "success"
    );
    setAppointment({ name: "", service: "" });
    setIsAppointmentModalOpen(false);
  };

  // Displays a toast notification.
  const showNotification = (message, type) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 3000);
  };

  // Scrolls to the reviews section.
  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  // Handles deleting a review.
  const handleDeleteReview = (id) => {
    setReviewToDeleteId(id);
    setIsConfirmationModalOpen(true);
  };

  // Confirms the deletion of a review.
  const confirmDeleteReview = () => {
    setUserAddedReviews(userAddedReviews.filter((review) => review.id !== reviewToDeleteId));
    setIsConfirmationModalOpen(false);
    setReviewToDeleteId(null);
    showNotification("Review deleted successfully!", "success");
  };

  // Handles editing a review.
  const handleEditReview = (review) => {
    setReviewToEdit(review);
    setReview(review);
    setIsEditReviewModalOpen(true);
  };

  // Handles updating an existing review.
  const handleUpdateReview = () => {
    if (!validateForm("review", review)) return;

    setUserAddedReviews(userAddedReviews.map((r) => (r.id === review.id ? review : r)));

    setReview({ name: "", text: "", rating: 5 });
    showNotification("Review updated successfully!", "success");
    setIsEditReviewModalOpen(false);
    setReviewToEdit(null);
  };

  // Checks if a review was added by the user.
  const isReviewAddedByUser = (reviewId) => userAddedReviews.some((review) => review.id === reviewId);

  // Background image style for the hero section.
  const heroSectionStyle = {
    backgroundImage:
      "url('https://plus.unsplash.com/premium_photo-1673435846128-56687ba5959d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8A%3D%3D')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backgroundBlendMode: "multiply",
  };
  const [liveMessage, setLiveMessage] = useState("");

  useEffect(() => {
    if (toasts.length > 0) {
      setLiveMessage(toasts[toasts.length - 1].message);
    }
  }, [toasts]);

  useEffect(() => {
    if (isQuoteModalOpen) {
      setLiveMessage("Request a quote modal is open.");
    }
    if (isAppointmentModalOpen) {
      setLiveMessage("Book appointment modal is open");
    }
    if (isLeaveReviewModalOpen) {
      setLiveMessage("Leave Review modal is open");
    }
    if (isEditReviewModalOpen) {
      setLiveMessage("Edit review modal is open");
    }
    if (isConfirmationModalOpen) {
      setLiveMessage("Confirmation modal is open");
    }
  }, [isQuoteModalOpen, isAppointmentModalOpen, isLeaveReviewModalOpen, isEditReviewModalOpen, isConfirmationModalOpen]);
  // Render the app
  return (
    <div className={`min-h-screen ${theme.colors.light} ${theme.colors.textPrimary} ${theme.font.family} ${theme.font.base}`}>
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>
      {/* Toast notification container */}
      <ToastContainer toasts={toasts} setToasts={setToasts} />
      {/* Confirmation modal for deleting reviews */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={confirmDeleteReview}
        message="Are you sure you want to delete this review?"
      />

      {/* Header Section */}
      <header role="banner" className={`bg-white ${theme.colors.textPrimary} p-5 flex justify-between items-center ${theme.shadow} sticky top-0 z-40`}>
        <a href="/" className="text-2xl font-bold flex items-center">
          <svg
            className={`${theme.colors.primaryText} w-8 h-8 mr-2`}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4.5 15.75l7.5-7.5 7.5 7.5" /> <path d="M4.5 18.75l7.5-7.5 7.5 7.5" />
          </svg>
          CleanConnect
        </a>

        {/* Mobile menu button */}
        <button
          className={`${theme.colors.gray200} md:hidden focus:outline-none p-3 rounded`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
        >
          <Menu size={28} />
        </button>

        {/* Desktop navigation */}
        <nav role="navigation" className="hidden md:block">
          <ul className="flex space-x-6">
            <NavLink href="#reviews" onClick={scrollToReviews} ariaLabel="View customer reviews">
              Customer Reviews
            </NavLink>
            <NavLink href="#" onClick={() => setIsQuoteModalOpen(true)} ariaLabel="Request a quote">
              Request Quote
            </NavLink>
            <NavLink href="#" onClick={() => setIsAppointmentModalOpen(true)} ariaLabel="Book an appointment">
              Book Appointment
            </NavLink>
          </ul>
        </nav>
      </header>

      {/* Mobile Menu */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isMobileMenuOpen ? "0%" : "-100%" }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`md:hidden bg-white ${theme.colors.textPrimary} p-6 rounded-r-2xl ${theme.shadow} fixed top-0 left-0 w-80 h-screen z-50 flex flex-col justify-start items-start space-y-4`}
      >
        <div className="flex justify-between items-center w-full mb-4">
          <span className="text-lg font-semibold">Menu</span>
          <button
            className={`${theme.colors.gray200} focus:outline-none p-3 rounded`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close mobile menu"
          >
            <XCircle size={28} />
          </button>
        </div>
        <nav className="w-full">
          <ul className="flex flex-col space-y-3">
            <li>
              <button
                onClick={scrollToReviews}
                className={`${theme.colors.gray200} block w-full text-left text-lg font-semibold p-2 rounded-md transition duration-300`}
                aria-label="View customer reviews"
              >
                Customer Reviews
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsQuoteModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`${theme.colors.gray200} block w-full text-left text-lg font-semibold p-2 rounded-md transition duration-300`}
                aria-label="Request a quote"
              >
                Request Quote
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsAppointmentModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`${theme.colors.gray200} block w-full text-left text-lg font-semibold p-2 rounded-md transition duration-300`}
                aria-label="Book an appointment"
              >
                Book Appointment
              </button>
            </li>
          </ul>
        </nav>
      </motion.div>

      {/* Hero Section */}
      <section role="region" aria-label="Hero Section" style={heroSectionStyle} className="text-center py-20 px-6 md:py-28 text-white">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4"> Experience the Joy of a Spotless Space </h2>
        <p className="text-xl md:text-2xl mt-5 leading-relaxed">
          We deliver unparalleled cleaning services that transform your home or office into a haven of cleanliness and comfort.
        </p>
        <motion.button
          whileHover={{ scale: 1.06 }}
          onClick={() => setIsQuoteModalOpen(true)}
          className={`mt-8 ${theme.colors.primary} ${theme.colors.white} py-4 px-8 rounded-full ${theme.transition} text-lg font-semibold`}
          aria-label="Get a free quote"
        >
          Get a Free Quote
        </motion.button>
      </section>

      {/* Services Section */}
      <section role="region" aria-label="Our Services" className="py-16 px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800"> Our Specialized Services </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section ref={reviewsSectionRef} role="region" aria-label="Customer Reviews" className={`py-16 px-6 md:px-8 ${theme.colors.secondary}`}>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
          Rave Reviews from Our Satisfied Clients
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={() => handleDeleteReview(review.id)}
              onEdit={() => handleEditReview(review)}
              isAddedByUser={isReviewAddedByUser(review.id)}
            />
          ))}
        </div>
      </section>

      {/* Leave a Review Section */}
      <section className="py-16 px-6 md:px-8 text-center">
        <motion.button
          whileHover={{ scale: 1.06 }}
          onClick={() => setIsLeaveReviewModalOpen(true)}
          className={` ${theme.colors.primary} ${theme.colors.white} py-4 px-8 rounded-full ${theme.transition} text-lg font-semibold`}
          aria-label="Share your experience and leave a review"
        >
          Share Your Experience
        </motion.button>
      </section>

      {/* Modals */}
      {/* Leave a review modal */}
      <Modal
        isOpen={isLeaveReviewModalOpen}
        onClose={() => setIsLeaveReviewModalOpen(false)}
        title="Share Your Experience"
        onSubmit={handleReviewSubmit}
      >
        <label htmlFor="reviewName" className="block text-gray-700 text-sm font-bold mb-2">
          Your Name:
        </label>
        <input
          type="text"
          id="reviewName"
          placeholder="Your Name"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
          value={review.name}
          onChange={(e) => setReview({ ...review, name: e.target.value })}
          aria-describedby={errors.reviewName ? "reviewName-error" : null}
          aria-invalid={!!errors.reviewName}
        />
        {errors.reviewName && (
          <p id="reviewName-error" className="text-red-500 text-sm">
            {errors.reviewName}
          </p>
        )}

        <label htmlFor="reviewText" className="block text-gray-700 text-sm font-bold mb-2">
          Your Review:
        </label>
        <textarea
          id="reviewText"
          placeholder="Write a review"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
          value={review.text}
          onChange={(e) => setReview({ ...review, text: e.target.value })}
          rows="4"
          aria-describedby={errors.reviewText ? "reviewText-error" : null}
          aria-invalid={!!errors.reviewText}
        />
        {errors.reviewText && (
          <p id="reviewText-error" className="text-red-500 text-sm">
            {errors.reviewText}
          </p>
        )}

        <div className="mb-5">
          <label htmlFor="rating" className="block text-gray-700 text-sm font-bold mb-2">
            Rating:
          </label>
          <StarRating rating={review.rating} setRating={(rating) => setReview({ ...review, rating })} />

          {errors.reviewRating && (
            <p id="reviewRating-error" className="text-red-500 text-sm">
              {errors.reviewRating}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.04 }}
          className={` ${theme.colors.primary} ${theme.colors.white} py-3 px-6 rounded-full ${theme.transition} w-full text-lg font-semibold`}
        >
          Submit Review
        
        </motion.button>
        </Modal>

{/* Edit review modal */}
<Modal
  isOpen={isEditReviewModalOpen}
  onClose={() => setIsEditReviewModalOpen(false)}
  title="Edit Your Review"
  onSubmit={handleUpdateReview}
>
  <label htmlFor="editReviewName" className="block text-gray-700 text-sm font-bold mb-2">
    Your Name:
  </label>
  <input
    type="text"
    id="editReviewName"
    placeholder="Your Name"
    className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
    value={review.name}
    onChange={(e) => setReview({ ...review, name: e.target.value })}
    aria-describedby={errors.reviewName ? "editReviewName-error" : null}
    aria-invalid={!!errors.reviewName}
  />
  {errors.reviewName && (
    <p id="editReviewName-error" className="text-red-500 text-sm">
      {errors.reviewName}
    </p>
  )}

  <label htmlFor="editReviewText" className="block text-gray-700 text-sm font-bold mb-2">
    Your Review:
  </label>
  <textarea
    id="editReviewText"
    placeholder="Write a review"
    className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
    value={review.text}
    onChange={(e) => setReview({ ...review, text: e.target.value })}
    rows="4"
    aria-describedby={errors.reviewText ? "editReviewText-error" : null}
    aria-invalid={!!errors.reviewText}
  />
  {errors.reviewText && (
    <p id="editReviewText-error" className="text-red-500 text-sm">
      {errors.reviewText}
    </p>
  )}

  <div className="mb-5">
    <label htmlFor="editRating" className="block text-gray-700 text-sm font-bold mb-2">
      Rating:
    </label>
    <StarRating rating={review.rating} setRating={(rating) => setReview({ ...review, rating })} />
    {errors.reviewRating && (
      <p id="editRating-error" className="text-red-500 text-sm">
        {errors.reviewRating}
      </p>
    )}
  </div>

  <motion.button
    type="submit"
    whileHover={{ scale: 1.04 }}
    className={` ${theme.colors.primary} ${theme.colors.white} py-3 px-6 rounded-full ${theme.transition} w-full text-lg font-semibold`}
  >
    Update Review
  </motion.button>
</Modal>

{/* Request a quote modal */}
<Modal
  isOpen={isQuoteModalOpen}
  onClose={() => setIsQuoteModalOpen(false)}
  title="Request a Personalized Quote"
  onSubmit={handleQuoteSubmit}
>
  <label htmlFor="quoteName" className="block text-gray-700 text-sm font-bold mb-2">
    Your Name:
  </label>
  <input
    type="text"
    id="quoteName"
    placeholder="Your Name"
    className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
    value={quote.name}
    onChange={(e) => setQuote({ ...quote, name: e.target.value })}
    aria-describedby={errors.quoteName ? "quoteName-error" : null}
    aria-invalid={!!errors.quoteName}
  />
  {errors.quoteName && (
    <p id="quoteName-error" className="text-red-500 text-sm">
      {errors.quoteName}
    </p>
  )}
  <label htmlFor="quoteService" className="block text-gray-700 text-sm font-bold mb-2">
    Select a service:
  </label>
  <select
    id="quoteService"
    className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus-blue-600"
    value={quote.service}
    onChange={(e) => setQuote({ ...quote, service: e.target.value })}
    aria-describedby={errors.quoteService ? "quoteService-error" : null}
    aria-invalid={!!errors.quoteService}
  >
    <option value="" disabled>
      Select a service
    </option>
    {services.map((s) => (
      <option key={s.id} value={s.name}>
        {s.name}
      </option>
    ))}
  </select>
  {errors.quoteService && (
    <p id="quoteService-error" className="text-red-500 text-sm">
      {errors.quoteService}
    </p>
  )}

  <motion.button
    type="submit"
    whileHover={{ scale: 1.04 }}
    className={` ${theme.colors.primary} ${theme.colors.white} py-3 px-6 rounded-full ${theme.transition} w-full text-lg font-semibold`}
  >
    Get Your Quote
  </motion.button>
</Modal>

{/* Schedule an appointment modal */}
<Modal
  isOpen={isAppointmentModalOpen}
  onClose={() => setIsAppointmentModalOpen(false)}
  title="Schedule Your Cleaning  Appointment"
  onSubmit={handleAppointmentSubmit}
>
  <label htmlFor="appointmentName" className="block text-gray-700 text-sm font-bold mb-2">
    Your Name:
  </label>
  <input
    type="text"
    id="appointmentName"
    placeholder="Your Name"
    className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
    value={appointment.name}
    onChange={(e) => setAppointment({ ...appointment, name: e.target.value })}
    aria-describedby={errors.appointmentName ? "appointmentName-error" : null}
    aria-invalid={!!errors.appointmentName}
  />
  {errors.appointmentName && (
    <p id="appointmentName-error" className="text-red-500 text-sm">
      {errors.appointmentName}
    </p>
  )}

  <label htmlFor="appointmentService" className="block text-gray-700 text-sm font-bold mb-2">
    Select a service:
  </label>
  <select
    id="appointmentService"
    className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-0"
    value={appointment.service}
    onChange={(e) => setAppointment({ ...appointment, service: e.target.value })}
    aria-describedby={errors.appointmentService ? "appointmentService-error" : null}
    aria-invalid={!!errors.appointmentService}
  >
    <option value="" disabled>
      Select a service
    </option>
    {services.map((s) => (
      <option key={s.id} value={s.name}>
        {s.name}
      </option>
    ))}
  </select>
  {errors.appointmentService && (
    <p id="appointmentService-error" className="text-red-500 text-sm">
      {errors.appointmentService}
    </p>
  )}

  <label htmlFor="appointmentDate" className="block text-gray-700 text-sm font-bold mb-2">
    Select a date:
  </label>
  <input
    type="date"
    id="appointmentDate"
    className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
    value={appointment.date}
    onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
    aria-describedby={errors.appointmentDate ? "appointmentDate-error" : null}
    aria-invalid={!!errors.appointmentDate}
  />
  {errors.appointmentDate && (
    <p id="appointmentDate-error" className="text-red-500 text-sm">
      {errors.appointmentDate}
    </p>
  )}

  <motion.button
    type="submit"
    whileHover={{ scale: 1.04 }}
    className={` ${theme.colors.primary} ${theme.colors.white} py-3 px-6 rounded-full ${theme.transition} w-full text-lg font-semibold`}
  >
    Book Now
  </motion.button>
</Modal>
</div>
);
};

export default App;