import React, { useState, useEffect, useRef } from "react";
import { Home, Briefcase, SprayCan, XCircle, CheckCircle, Star, Menu, Edit, Trash2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


// Define available cleaning services.
const services = [
  { id: "home", name: "Residential Bliss Cleaning", icon: <Home size={28} />, description: "Transform your home..." },
  { id: "office", name: "Commercial Sparkle Cleaning", icon: <Briefcase size={28} />, description: "Elevate your workspace..." },
  { id: "deep", name: "Intensive Renewal Cleaning", icon: <SprayCan size={28} />, description: "Experience the ultimate..." },
];

// Initial reviews
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
          className={`inline ${starValue <= rating ? "text-yellow-500" : "text-gray-400"}`}
        >
          <Star size={20} fill={starValue <= rating ? "currentColor" : "none"} />
        </button>
      );
    })}
  </div>
);

// Toast component with updated styling
const Toast = ({ id, message, type, onClose }) => {
  const toastTypes = {
    success: { bgColor: "bg-success", icon: <CheckCircle size={20} /> },
    error: { bgColor: "bg-error", icon: <XCircle size={20} /> },
    warning: { bgColor: "bg-warning", textColor: "text-gray-800", icon: <Info size={20} /> },
    info: { bgColor: "bg-info", icon: <Info size={20} /> },
  };
  const { bgColor, textColor = "text-white", icon } = toastTypes[type] || { bgColor: "bg-info", icon: <Info size={20} /> };

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`p-4 rounded-custom flex items-center justify-between space-x-2 ${textColor} ${bgColor} shadow-custom transition-custom mb-2`}
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-sm">{message}</span>
      </div>
      <button onClick={onClose} className="focus:outline-none" aria-label="Close notification">
        <XCircle size={20} className="text-white opacity-70 hover:opacity-100" />
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
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    const focusableElementsString =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let focusableElements;
    let first;
    let last;

    const trapFocus = (e) => {
      if (e.key === "Tab") {
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
      const initiallyFocusedElement = document.activeElement;

      if (firstInputRef.current) {
        firstInputRef.current.focus();
      } else if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }

      const handleKeyDown = (e) => {
        trapFocus(e);
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("focusin", handleFocusIn);

      function handleFocusIn(e) {
        if (!modalRef.current.contains(e.target)) {
          firstInputRef.current ? firstInputRef.current.focus() : closeButtonRef.current.focus();
        }
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("focusin", handleFocusIn);
        if (initiallyFocusedElement) {
          initiallyFocusedElement.focus();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-70 flex justify-center items-center z-50" aria-modal="true" role="dialog">
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-11/12 md:w-96 relative"
      >
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
          onClick={onClose}
          aria-label="Close Modal"
          ref={closeButtonRef}
        >
          <XCircle size={28} />
        </button>
        {title && <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">{title}</h2>}
        <form onSubmit={handleSubmit}>
          {React.Children.map(children, (child, index) => {
            if (
              index === 0 &&
              (child && child.type === "input" || child && child.type === "textarea" || child && child.type === "select")
            ) {
              return React.cloneElement(child, { ref: firstInputRef });
            }
            return child;
          })}
        </form>
      </motion.div>
    </div>
  );
};

// A modal for confirming actions (e.g., deleting a review).
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) =>
  isOpen ? (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-70 flex justify-center items-center z-50" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-md shadow-md">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end">
          <button
            className="bg-gray-300 hover:bg-gray-200 rounded-md mr-2 focus:outline-none px-4 py-2"
            onClick={onClose}
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button
            className="text-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none px-4 py-2"
            onClick={onConfirm}
            aria-label="Confirm deletion"
          >
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
    className="p-6 bg-white shadow-custom rounded-custom text-center hover:shadow-lg transition-custom cursor-pointer"
  >
    <div className="text-accent mx-auto mb-4">{service.icon}</div>
    <h3 className="text-xl font-semibold mt-2 text-gray-800 mb-1">{service.name}</h3>
    <p className="text-gray-600">{service.description}</p>
  </motion.div>
);

// Displays a single review with edit/delete options if the user added it.
const ReviewCard = ({ review, onDelete, onEdit, isAddedByUser }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-white shadow-custom rounded-custom p-5 transition-custom"
  >
    <div className="flex justify-between items-center mb-3">
      <StarRating rating={review.rating} setRating={() => {}} />
      {isAddedByUser && (
        <div>
          <button
            onClick={onEdit}
            className="text-blue-500 hover:text-blue-700 mr-2 focus:outline-none"
            aria-label={`Edit review by ${review.name}`}
          >
            <Edit size={20} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 focus:outline-none"
            aria-label={`Delete review by ${review.name}`}
          >
            <Trash2 size={20} />
          </button>
        </div>
      )}
    </div>
    <p className="text-gray-600 italic mb-3">"{review.text}"</p>
    <p className="text-gray-600 font-semibold">- {review.name}</p>
  </motion.div>
);

// Navigation link component
const NavLink = ({ href, onClick, children, ariaLabel }) => (
  <li>
    <button
      onClick={onClick}
      className="focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-2 py-1"
      aria-label={ariaLabel}
    >
      {children}
    </button>
  </li>
);

// Custom hook to persist state to local storage.
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

// Main application component.
const App = () => {
  const [userAddedReviews, setUserAddedReviews] = useLocalStorage("userReviews", []);
  const [reviews, setReviews] = useState([...prePopulatedReviews, ...userAddedReviews]);
  const [review, setReview] = useState({ name: "", text: "", rating: 0 });
  const [quote, setQuote] = useState({ name: "", service: "" });
  const [appointment, setAppointment] = useState({ name: "", service: "" });

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isLeaveReviewModalOpen, setIsLeaveReviewModalOpen] = useState(false);
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);

  const [reviewToEdit, setReviewToEdit] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState(null);

  const reviewsSectionRef = useRef(null);
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

  useEffect(() => {
    setReviews([...prePopulatedReviews, ...userAddedReviews]);
  }, [userAddedReviews]);

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
          today.setHours(0, 0, 0, 0);
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

  const handleReviewSubmit = () => {
    if (!validateForm("review", review)) return;

    const newReview = { ...review, id: Date.now() };
    setUserAddedReviews([...userAddedReviews, newReview]);
    setReview({ name: "", text: "", rating: 0 });
    showNotification("Thank you for your review!", "success");
    setIsLeaveReviewModalOpen(false);
  };

  const handleQuoteSubmit = () => {
    if (!validateForm("quote", quote)) return;

    showNotification(
      `Your quote request for ${quote.service} has been submitted! We'll be in touch soon.`,
      "success"
    );
    setQuote({ name: "", service: "" });
    setIsQuoteModalOpen(false);
  };

  const handleAppointmentSubmit = () => {
    if (!validateForm("appointment", appointment)) return;

    showNotification(
      `Your appointment for ${appointment.service} on ${appointment.date} is booked!`,
      "success"
    );
    setAppointment({ name: "", service: "" });
    setIsAppointmentModalOpen(false);
  };

  const showNotification = (message, type) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const handleDeleteReview = (id) => {
    setReviewToDeleteId(id);
    setIsConfirmationModalOpen(true);
  };

  const confirmDeleteReview = () => {
    setUserAddedReviews(userAddedReviews.filter((review) => review.id !== reviewToDeleteId));
    setIsConfirmationModalOpen(false);
    setReviewToDeleteId(null);
    showNotification("Review deleted successfully!", "success");
  };

  const handleEditReview = (review) => {
    setReviewToEdit(review);
    setReview(review);
    setIsEditReviewModalOpen(true);
  };

  const handleUpdateReview = () => {
    if (!validateForm("review", review)) return;

    setUserAddedReviews(userAddedReviews.map((r) => (r.id === review.id ? review : r)));
    setReview({ name: "", text: "", rating: 5 });
    showNotification("Review updated successfully!", "success");
    setIsEditReviewModalOpen(false);
    setReviewToEdit(null);
  };

  const isReviewAddedByUser = (reviewId) => userAddedReviews.some((review) => review.id === reviewId);

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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans text-base">
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>
      
      <ToastContainer toasts={toasts} setToasts={setToasts} />
      
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={confirmDeleteReview}
        message="Are you sure you want to delete this review?"
      />

      <header role="banner" className="bg-white text-gray-800 p-5 flex justify-between items-center shadow-custom sticky top-0 z-40">
        <a href="/" className="text-2xl font-bold flex items-center">
          <svg
            className="text-primary w-8 h-8 mr-2"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            <path d="M4.5 18.75l7.5-7.5 7.5 7.5" />
          </svg>
          CleanConnect
        </a>

        <button
          className="hover:bg-gray-200 md:hidden focus:outline-none p-3 rounded"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
        >
          <Menu size={28} />
        </button>

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

      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isMobileMenuOpen ? "0%" : "-100%" }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="md:hidden bg-white text-gray-800 p-6 rounded-r-2xl shadow-custom fixed top-0 left-0 w-80 h-screen z-50 flex flex-col justify-start items-start space-y-4"
      >
        <div className="flex justify-between items-center w-full mb-4">
          <span className="text-lg font-semibold">Menu</span>
          <button
            className="hover:bg-gray-200 focus:outline-none p-3 rounded"
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
                className="hover:bg-gray-200 block w-full text-left text-lg font-semibold p-2 rounded-md transition-custom"
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
                className="hover:bg-gray-200 block w-full text-left text-lg font-semibold p-2 rounded-md transition-custom"
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
                className="hover:bg-gray-200 block w-full text-left text-lg font-semibold p-2 rounded-md transition-custom"
                aria-label="Book an appointment"
              >
                Book Appointment
              </button>
            </li>
          </ul>
        </nav>
      </motion.div>

      <section role="region" aria-label="Hero Section" style={heroSectionStyle} className="text-center py-20 px-6 md:py-28 text-white">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          Experience the Joy of a Spotless Space
        </h2>
        <p className="text-xl md:text-2xl mt-5 leading-relaxed">
          We deliver unparalleled cleaning services that transform your home or office into a haven of cleanliness and comfort.
        </p>
        <motion.button
          whileHover={{ scale: 1.06 }}
          onClick={() => setIsQuoteModalOpen(true)}
          className="mt-8 bg-primary hover:bg-primary-hover text-white py-4 px-8 rounded-full transition-custom text-lg font-semibold"
          aria-label="Get a free quote"
        >
          Get a Free Quote
        </motion.button>
      </section>

      <section role="region" aria-label="Our Services" className="py-16 px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
          Our Specialized Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section
        ref={reviewsSectionRef}
        role="region"
        aria-label="Customer Reviews"
        className="py-16 px-6 md:px-8 bg-secondary"
      >
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

      <section className="py-16 px-6 md:px-8 text-center">
        <motion.button
          whileHover={{ scale: 1.06 }}
          onClick={() => setIsLeaveReviewModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white py-4 px-8 rounded-full transition-custom text-lg font-semibold"
          aria-label="Share your experience and leave a review"
        >
          Share Your Experience
        </motion.button>
      </section>

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
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-primary"
          value={review.name}
          onChange={(e) => setReview({ ...review, name: e.target.value })}
          aria-describedby={errors.reviewName ? "reviewName-error" : null}
          aria-invalid={!!errors.reviewName}
        />
        {errors.reviewName && (
          <p id="reviewName-error" className="text-error text-sm">
            {errors.reviewName}
          </p>
        )}

        <label htmlFor="reviewText" className="block text-gray-700 text-sm font-bold mb-2">
          Your Review:
        </label>
        <textarea
          id="reviewText"
          placeholder="Write a review"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-primary"
          value={review.text}
          onChange={(e) => setReview({ ...review, text: e.target.value })}
          rows="4"
          aria-describedby={errors.reviewText ? "reviewText-error" : null}
          aria-invalid={!!errors.reviewText}
        />
        {errors.reviewText && (
          <p id="reviewText-error" className="text-error text-sm">
            {errors.reviewText}
          </p>
        )}

        <div className="mb-5">
          <label htmlFor="rating" className="block text-gray-700 text-sm font-bold mb-2">
            Rating:
          </label>
          <StarRating rating={review.rating} setRating={(rating) => setReview({ ...review, rating })} />
          {errors.reviewRating && (
            <p id="reviewRating-error" className="text-error text-sm">
              {errors.reviewRating}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.04 }}
          className="bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded-full transition-custom w-full text-lg font-semibold"
        >
          Submit Review
        </motion.button>
      </Modal>

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
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-primary"
          value={review.name}
          onChange={(e) => setReview({ ...review, name: e.target.value })}
          aria-describedby={errors.reviewName ? "editReviewName-error" : null}
          aria-invalid={!!errors.reviewName}
        />
        {errors.reviewName && (
          <p id="editReviewName-error" className="text-error text-sm">
            {errors.reviewName}
          </p>
        )}

        <label htmlFor="editReviewText" className="block text-gray-700 text-sm font-bold mb-2">
          Your Review:
        </label>
        <textarea
          id="editReviewText"
          placeholder="Write a review"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-primary"
          value={review.text}
          onChange={(e) => setReview({ ...review, text: e.target.value })}
          rows="4"
          aria-describedby={errors.reviewText ? "editReviewText-error" : null}
          aria-invalid={!!errors.reviewText}
        />
        {errors.reviewText && (
          <p id="editReviewText-error" className="text-error text-sm">
            {errors.reviewText}
          </p>
        )}

        <div className="mb-5">
          <label htmlFor="editRating" className="block text-gray-700 text-sm font-bold mb-2">
            Rating:
          </label>
          <StarRating rating={review.rating} setRating={(rating) => setReview({ ...review, rating })} />
          {errors.reviewRating && (
            <p id="editRating-error" className="text-error text-sm">
              {errors.reviewRating}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.04 }}
          className="bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded-full transition-custom w-full text-lg font-semibold"
        >
          Update Review
        </motion.button>
      </Modal>

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
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-primary"
          value={quote.name}
          onChange={(e) => setQuote({ ...quote, name: e.target.value })}
          aria-describedby={errors.quoteName ? "quoteName-error" : null}
          aria-invalid={!!errors.quoteName}
        />
        {errors.quoteName && (
          <p id="quoteName-error" className="text-error text-sm">
            {errors.quoteName}
          </p>
        )}

        <label htmlFor="quoteService" className="block text-gray-700 text-sm font-bold mb-2">
          Select a service:
        </label>
        <select
          id="quoteService"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-primary"
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
          <p id="quoteService-error" className="text-error text-sm">
            {errors.quoteService}
          </p>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.04 }}
          className="bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded-full transition-custom w-full text-lg font-semibold"
        >
          Get Your Quote
        </motion.button>
      </Modal>

      <Modal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        title="Schedule Your Cleaning Appointment"
        onSubmit={handleAppointmentSubmit}
      >
        <label htmlFor="appointmentName" className="block text-gray-700 text-sm font-bold mb-2">
          Your Name:
        </label>
        <input
          type="text"
          id="appointmentName"
          placeholder="Your Name"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-primary"
          value={appointment.name}
          onChange={(e) => setAppointment({ ...appointment, name: e.target.value })}
          aria-describedby={errors.appointmentName ? "appointmentName-error" : null}
          aria-invalid={!!errors.appointmentName}
        />
        {errors.appointmentName && (
          <p id="appointmentName-error" className="text-error text-sm">
            {errors.appointmentName}
          </p>
        )}

        <label htmlFor="appointmentService" className="block text-gray-700 text-sm font-bold mb-2">
          Select a service:
        </label>
        <select
          id="appointmentService"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-primary"
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
          <p id="appointmentService-error" className="text-error text-sm">
            {errors.appointmentService}
          </p>
        )}

        <label htmlFor="appointmentDate" className="block text-gray-700 text-sm font-bold mb-2">
          Select a date:
        </label>
        <input
          type="date"
          id="appointmentDate"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-primary"
          value={appointment.date}
          onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
          aria-describedby={errors.appointmentDate ? "appointmentDate-error" : null}
          aria-invalid={!!errors.appointmentDate}
        />
        {errors.appointmentDate && (
          <p id="appointmentDate-error" className="text-error text-sm">
            {errors.appointmentDate}
          </p>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.04 }}
          className="bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded-full transition-custom w-full text-lg font-semibold"
        >
          Book Now
        </motion.button>
      </Modal>
    </div>
  );
};

export default App;