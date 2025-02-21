import React, { useState, useEffect } from "react";
import {
  Home,
  Briefcase,
  SprayCan,
  XCircle,
  CheckCircle,
  Star,
} from "lucide-react";

// --- Theme Configuration ---
const theme = {
  colors: {
    primary: "from-blue-500 to-purple-500", // Gradient Primary
    primaryLight: "bg-gradient-to-br from-blue-100 to-purple-100", // Gradient Light
    primaryDark: "from-blue-700 to-purple-700", // Gradient Dark
    secondary: "gray-800",
    textPrimary: "gray-900",
    textSecondary: "gray-600",
    white: "white",
    success: "green-500",
    error: "red-500",
    modalOverlay: "black/50",
    accent: "yellow-500" // Accent Color
  },
  fontFamily: "font-inter font-sans",
  shadow: "shadow-md hover:shadow-lg transition duration-300" // Added shadow and transition
};

// --- Data Definitions ---
const serviceOptions = [
  {
    id: "home",
    name: "Home Cleaning",
    icon: <Home />,
    description: "Transforming houses into havens, one room at a time.",
  },
  {
    id: "office",
    name: "Office Cleaning",
    icon: <Briefcase />,
    description: "Elevating workplaces to foster productivity and well-being.",
  },
  {
    id: "deep",
    name: "Deep Cleaning",
    icon: <SprayCan />,
    description: "Unleashing the power of cleanliness for a revitalized space.",
  },
];

const initialReviews = [
  { name: "Isaac", text: "Fantastic service! My home has never been this clean." },
  { name: "Kojo", text: "The office cleaning was thorough and professional." },
  { name: "Big Ben", text: "Amazing deep cleaning. Highly recommended!" },
];

// --- Helper Functions ---
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error getting data from localStorage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error setting data to localStorage:", error);
    }
  }, [storedValue, key]);

  return [storedValue, setStoredValue];
};

const useNotification = (duration = 3000) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  return [notification, showNotification];
};

// --- Components ---

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 md:w-96 relative">
        <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-800" onClick={onClose}>
          <XCircle size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

const ServiceCard = ({ service }) => (
  <div className={`p-6 bg-white rounded-lg text-center ${theme.shadow}`}>
    <div className={`text-${theme.colors.primary} mx-auto`}>{service.icon}</div>
    <h3 className="text-lg md:text-xl font-semibold mt-2">{service.name}</h3>
    <p className={`text-${theme.colors.textSecondary} mt-2`}>{service.description}</p>
  </div>
);

const Notification = ({ message, type }) => (
  <div
    className={`fixed top-6 right-6 p-3 rounded-lg flex items-center space-x-2 text-white bg-${
      type === "success" ? theme.colors.success : theme.colors.error
    } z-50`}
  >
    <CheckCircle />
    <span>{message}</span>
  </div>
);

// --- Main App Component ---
const App = () => {
  const [reviews, setReviews] = useLocalStorage("reviews", initialReviews);
  const [review, setReview] = useState({ name: "", text: "" });
  const [quote, setQuote] = useState({ name: "", service: "" });
  const [appointment, setAppointment] = useState({ name: "", service: "", date: "" });

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const [notification, showNotification] = useNotification();

  // --- Handlers ---
  const handleReviewSubmit = () => {
    if (!review.name || !review.text) {
      showNotification("Please fill in all fields!", "error");
      return;
    }
    setReviews((prevReviews) => [...prevReviews, review]);
    setReview({ name: "", text: "" });
    showNotification("Review submitted successfully!", "success");
  };

  const handleQuoteSubmit = () => {
    if (!quote.name || !quote.service) {
      showNotification("Please enter your name and select a service!", "error");
      return;
    }
    showNotification(`Quote request for ${quote.service} submitted!`, "success");
    setQuote({ name: "", service: "" });
    setIsQuoteModalOpen(false);
  };

  const handleAppointmentSubmit = () => {
    if (!appointment.name || !appointment.service || !appointment.date) {
      showNotification("Please fill in all fields!", "error");
      return;
    }
    showNotification(`Appointment booked for ${appointment.service} on ${appointment.date}!`, "success");
    setAppointment({ name: "", service: "", date: "" });
    setIsAppointmentModalOpen(false);
  };

  // --- Render ---
  return (
    <div className={`min-h-screen ${theme.colors.primaryLight} text-${theme.colors.textPrimary} ${theme.fontFamily}`}>
      {/* Notification */}
      {notification && <Notification message={notification.message} type={notification.type} />}

      {/* Header */}
      <header className={`bg-gradient-to-r ${theme.colors.primary} text-${theme.colors.white} p-4 flex flex-col md:flex-row justify-between items-center shadow-lg`}>
        <h1 className="text-2xl font-bold text-center md:text-left">CleanConnect</h1>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className={`hover:text-gray-200 px-4 py-2 bg-${theme.colors.white} text-${theme.colors.primary} rounded-md ${theme.shadow}`}
          >
            Customer Reviews
          </button>
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className={`hover:text-gray-200 px-4 py-2 bg-${theme.colors.white} text-${theme.colors.primary} rounded-md ${theme.shadow}`}
          >
            Request Quote
          </button>
          <button
            onClick={() => setIsAppointmentModalOpen(true)}
            className={`hover:text-gray-200 px-4 py-2 bg-${theme.colors.white} text-${theme.colors.primary} rounded-md ${theme.shadow}`}
          >
            Book Appointment
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`text-center py-12 px-4 md:py-16 ${theme.colors.primaryLight}`}>
        <h2 className="text-3xl md:text-4xl font-bold">Experience the Art of Clean</h2>
        <p className="text-md md:text-lg mt-2">Transform your space with our expert cleaning services.</p>
      </section>

      {/* Book Appointment Modal */}
      <Modal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)}>
        <h2 className="text-lg md:text-xl font-bold mb-4">Book an Appointment</h2>
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-2 border rounded mb-2"
          value={appointment.name}
          onChange={(e) => setAppointment({ ...appointment, name: e.target.value })}
        />
        <select
          className="w-full p-2 border rounded mb-2"
          value={appointment.service}
          onChange={(e) => setAppointment({ ...appointment, service: e.target.value })}
        >
          <option value="" disabled>
            Select a service
          </option>
          {serviceOptions.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="w-full p-2 border rounded mb-2"
          value={appointment.date}
          onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
        />
        <button
          onClick={handleAppointmentSubmit}
          className={`bg-gradient-to-r text-${theme.colors.white} px-4 py-2 rounded ${theme.shadow} w-full ${theme.colors.primary}`}
        >
          Book Now
        </button>
      </Modal>

      {/* Services Section */}
      <section className="py-10 px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serviceOptions.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* Customer Review Form */}
      <section className="py-10 px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Share Your Experience</h2>
        <div className="max-w-lg mx-auto bg-white p-6 rounded-md shadow-md">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-2 border rounded mb-2"
            value={review.name}
            onChange={(e) => setReview({ ...review, name: e.target.value })}
          />
          <textarea
            placeholder="Write a review"
            className="w-full p-2 border rounded mb-2"
            value={review.text}
            onChange={(e) => setReview({ ...review, text: e.target.value })}
          />
          <button
            onClick={handleReviewSubmit}
            className={`bg-gradient-to-r text-${theme.colors.white} px-4 py-2 rounded ${theme.shadow} w-full ${theme.colors.primary}`}
          >
            Submit Review
          </button>
        </div>
      </section>

      {/* Customer Reviews Modal */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)}>
        <h2 className="text-lg md:text-xl font-bold mb-4">Customer Reviews</h2>
        <div className="max-h-60 overflow-y-auto">
          {reviews.map((rev, index) => (
            <div key={index} className="bg-gray-100 p-3 rounded-md my-2 flex items-center space-x-2">
              <Star className={`text-${theme.colors.accent} flex-shrink-0`} size={20} />
              <p>
                <strong>{rev.name}:</strong> {rev.text}
              </p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Request Quote Modal */}
      <Modal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)}>
        <h2 className="text-lg md:text-xl font-bold mb-4">Request a Quote</h2>
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-2 border rounded mb-2"
          value={quote.name}
          onChange={(e) => setQuote({ ...quote, name: e.target.value })}
        />
        <select
          className="w-full p-2 border rounded mb-2"
          value={quote.service}
          onChange={(e) => setQuote({ ...quote, service: e.target.value })}
        >
          <option value="" disabled>
            Select a service
          </option>
          {serviceOptions.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleQuoteSubmit}
          className={`bg-gradient-to-r text-${theme.colors.white} px-4 py-2 rounded ${theme.shadow} w-full ${theme.colors.primary}`}
        >
          Submit Quote
        </button>
      </Modal>

      {/* Footer */}
      <footer className={`bg-${theme.colors.secondary} text-${theme.colors.white} text-center p-4`}>
        <p>© 2024 CleanConnect.  Sparkling Clean, Guaranteed.</p>
      </footer>
    </div>
  );
};

export default App;