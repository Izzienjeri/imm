/**
 * CleanConnect - Professional Cleaning Services Platform
 *
 * A comprehensive React application for managing cleaning services, customer reviews,
 * and service bookings. The system provides:
 *
 * Core Features:
 * 1. Service Management
 *    - Display of professional cleaning services
 *    - Service details and descriptions
 *    - Interactive service cards with animations
 *
 * 2. Review System
 *    - Customer review submission and management
 *    - Star rating implementation
 *    - CRUD operations for user-submitted reviews
 *    - Local storage persistence
 *
 * 3. Booking System
 *    - Quote requests
 *    - Appointment scheduling
 *    - Service selection
 *
 * 4. UI/UX Features
 *    - Responsive design with mobile-first approach
 *    - Accessible components with ARIA support
 *    - Interactive animations and transitions
 *    - Toast notifications for user feedback
 *    - Form validation with error handling
 *
 */
import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Briefcase,
  SprayCan,
  XCircle,
  Star,
  Menu,
  Edit,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const MotionButton = motion.create(Button);

/**
 * Service Interface
 */
interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

/**
 * Available Services Configuration
 */
const services: Service[] = [
  {
    id: "home",
    name: "Residential Bliss Cleaning",
    icon: <Home size={28} />,
    description:
      "Transform your home into a pristine sanctuary with our comprehensive residential cleaning services.",
  },
  {
    id: "office",
    name: "Commercial Sparkle Cleaning",
    icon: <Briefcase size={28} />,
    description:
      "Elevate your workspace with professional commercial cleaning that ensures a productive environment.",
  },
  {
    id: "deep",
    name: "Intensive Renewal Cleaning",
    icon: <SprayCan size={28} />,
    description:
      "Experience the ultimate deep clean with our thorough intensive cleaning service.",
  },
];

/**
 * Review System Types
 */
interface Review {
  id: number;
  name: string;
  text: string;
  rating: number;
}

/**
 * Initial Review Data
 */
const prePopulatedReviews: Review[] = [
  { id: 1, name: "Isaac", text: "Absolutely transformed my home!", rating: 5 },
  {
    id: 2,
    name: "Kojo",
    text: "Professional and efficient office cleaning service.",
    rating: 4,
  },
  {
    id: 3,
    name: "Big Ben",
    text: "Incredible deep cleaning results!",
    rating: 5,
  },
];

/**
 * Star Rating Component Props
 */
interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

/**
 * Star Rating Component
 */
const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => (
  <div role="radiogroup" aria-label="Rating">
    {[...Array(5)].map((_, i) => {
      const starValue = i + 1;
      return (
        <MotionButton
          key={i}
          type="button"
          variant="ghost"
          whileHover={{ scale: 1.05 }}
          onClick={() => setRating(starValue)}
          className={`inline ${
            starValue <= rating ? "text-yellow-500" : "text-gray-400"
          }`}
          aria-checked={starValue === rating}
          aria-label={`${starValue} stars`}
        >
          <Star
            size={20}
            fill={starValue <= rating ? "currentColor" : "none"}
          />
        </MotionButton>
      );
    })}
  </div>
);

/**
 * Modal System Types
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  onSubmit?: () => void;
}

/**
 * Modal Component
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  onSubmit,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const isFocusingRef = useRef(false);

  useEffect(() => {
    function handleFocusIn(e: FocusEvent) {
      if (isFocusingRef.current) return;
      if (
        modalRef.current &&
        e.target instanceof Node &&
        !modalRef.current.contains(e.target)
      ) {
        isFocusingRef.current = true;
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        } else if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
        setTimeout(() => {
          isFocusingRef.current = false;
        }, 0);
      }
    }

    function trapFocus(e: KeyboardEvent) {
      if (e.key === "Tab" && modalRef.current) {
        const focusableElementsString =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusableElements =
          modalRef.current.querySelectorAll<HTMLElement>(
            focusableElementsString
          );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

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
    }

    if (isOpen) {
      const initiallyFocusedElement = document.activeElement;
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      } else if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        trapFocus(e);
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("focusin", handleFocusIn);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("focusin", handleFocusIn);
        if (
          initiallyFocusedElement instanceof HTMLElement ||
          initiallyFocusedElement instanceof SVGElement
        ) {
          initiallyFocusedElement.focus();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-70 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-11/12 md:w-96 relative"
      >
        <Button
          ref={closeButtonRef}
          variant="ghost"
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
          onClick={onClose}
          aria-label="Close Modal"
        >
          <XCircle size={28} />
        </Button>
        {title && (
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
            {title}
          </h2>
        )}
        <form onSubmit={handleSubmit}>
          {React.Children.map(children, (child, index) => {
            if (
              index === 0 &&
              React.isValidElement(child) &&
              (child.type === "input" ||
                child.type === "textarea" ||
                child.type === "select")
            ) {
              return React.cloneElement(
                child as React.ReactElement<{
                  ref?: React.Ref<HTMLInputElement>;
                }>,
                { ref: firstInputRef }
              );
            }
            return child;
          })}
        </form>
      </motion.div>
    </div>
  );
};

/**
 * Confirmation Modal Props
 */
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

/**
 * Confirmation Modal Component
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) =>
  isOpen ? (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-70 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white p-6 rounded-md shadow-md">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-200 rounded-md mr-2 focus:outline-none px-4 py-2"
            aria-label="Cancel deletion"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="text-red-500 rounded-md hover:bg-red-600 hover:text-white focus:outline-none px-4 py-2 transition-colors"
            aria-label="Confirm deletion"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  ) : null;

/**
 * Service Card Props
 */
interface ServiceCardProps {
  service: Service;
}

/**
 * Service Card Component
 */
const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center mb-6">
      <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
        {service.icon}
      </div>
      <h3 className="text-xl font-semibold ml-4 text-gray-900">
        {service.name}
      </h3>
    </div>
    <p className="text-gray-600 leading-relaxed">{service.description}</p>
  </motion.div>
);

/**
 * Review Card Props
 */
interface ReviewCardProps {
  review: Review;
  onDelete: () => void;
  onEdit: () => void;
  isAddedByUser: boolean;
}

/**
 * Review Card Component
 */
const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onDelete,
  onEdit,
  isAddedByUser,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white shadow-custom rounded-custom p-5 transition-custom"
    >
      <div className="flex justify-between items-center mb-3">
        <StarRating rating={review.rating} setRating={() => {}} />
        {isAddedByUser && (
          <div>
            <Button
              onClick={onEdit}
              variant="ghost"
              className="text-blue-500 hover:text-blue-700 mr-2 focus:outline-none"
              aria-label={`Edit review by ${review.name}`}
            >
              <Edit size={20} />
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              className="text-red-500 hover:text-red-600 focus:outline-none"
              aria-label={`Delete review by ${review.name}`}
            >
              <Trash2 size={20} />
            </Button>
          </div>
        )}
      </div>
      <p
        className={`text-gray-600 italic mb-3 ${
          isExpanded
            ? "whitespace-normal"
            : "overflow-hidden overflow-ellipsis max-h-24 break-words"
        }`}
      >
        "{review.text}"
      </p>
      <p className="text-gray-600 font-semibold">- {review.name}</p>
      {review.text.length > 100 && (
        <Button
          onClick={toggleExpanded}
          variant="ghost"
          className="text-blue-500 hover:text-blue-700 mt-2 focus:outline-none"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </Button>
      )}
    </motion.div>
  );
};

/**
 * Navigation Link Props
 */
interface NavLinkProps {
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
}

/**
 * Navigation Link Component
 */
const NavLink: React.FC<NavLinkProps> = ({ onClick, children, ariaLabel }) => (
  <li>
    <Button
      onClick={onClick}
      variant="ghost"
      className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  </li>
);

/**
 * Local Storage Hook
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
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
}

/**
 * Form Types
 */
interface Quote {
  name: string;
  service: string;
}

interface Appointment extends Quote {
  date?: string;
}

interface Errors {
  quoteName?: string;
  quoteService?: string;
  appointmentName?: string;
  appointmentService?: string;
  appointmentDate?: string;
  reviewName?: string;
  reviewText?: string;
  reviewRating?: string;
}

/**
 * Main Application Component
 */
const CleanConnectApp: React.FC = () => {
  // State Management
  const [userAddedReviews, setUserAddedReviews] = useLocalStorage<Review[]>(
    "userReviews",
    []
  );
  const [reviews, setReviews] = useState<Review[]>([
    ...prePopulatedReviews,
    ...userAddedReviews,
  ]);
  const [review, setReview] = useState<Review>({
    id: 0,
    name: "",
    text: "",
    rating: 0,
  });

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isLeaveReviewModalOpen, setIsLeaveReviewModalOpen] = useState(false);
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<number | null>(null);

  const reviewsSectionRef = useRef<HTMLElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [liveMessage, setLiveMessage] = useState("");

  useEffect(() => {
    setReviews([...prePopulatedReviews, ...userAddedReviews]);
  }, [userAddedReviews]);

  /**
   * Form Validation
   */
  const validateForm = (
    formType: "quote" | "appointment" | "review",
    formData: Quote | Appointment | Review
  ): boolean => {
    const newErrors: Errors = {};

    switch (formType) {
      case "quote":
        if (!formData.name) newErrors.quoteName = "Please enter your name.";
        if (!("service" in formData) || !formData.service)
          newErrors.quoteService = "Please select a service.";
        break;
      case "appointment":
        if (!formData.name)
          newErrors.appointmentName = "Please enter your name.";
        if (!("service" in formData) || !formData.service)
          newErrors.appointmentService = "Please select a service.";
        if ("date" in formData) {
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
        }
        break;
      case "review":
        if (!formData.name) newErrors.reviewName = "Please enter your name.";
        if ("text" in formData && !formData.text)
          newErrors.reviewText = "Please enter your review.";
        if ("rating" in formData && !formData.rating)
          newErrors.reviewRating = "Please provide a rating.";
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Review Management
   */
  const handleReviewSubmit = (review: Review) => {
    if (!validateForm("review", review)) return;

    const newReview: Review = { ...review, id: Date.now() };
    setUserAddedReviews([...userAddedReviews, newReview]);
    toast.success("Thank you for your review!");
    setIsLeaveReviewModalOpen(false);
  };

  /**
   * Quote Management
   */
  const handleQuoteSubmit = (quote: Quote) => {
    if (!validateForm("quote", quote)) return;

    toast.success(
      `Your quote request for ${quote.service} has been submitted! We'll be in touch soon.`
    );
    setIsQuoteModalOpen(false);
  };

  /**
   * Appointment Management
   */
  const handleAppointmentSubmit = (appointment: Appointment) => {
    if (!validateForm("appointment", appointment)) return;

    toast.success(
      `Your appointment for ${appointment.service} on ${appointment.date} is booked!`
    );
    setIsAppointmentModalOpen(false);
  };

  /**
   * Navigation Utilities
   */
  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  /**
   * Review Deletion
   */
  const handleDeleteReview = (id: number) => {
    setReviewToDeleteId(id);
    setIsConfirmationModalOpen(true);
  };

  const confirmDeleteReview = () => {
    if (reviewToDeleteId === null) return;

    setUserAddedReviews(
      userAddedReviews.filter((review) => review.id !== reviewToDeleteId)
    );
    setIsConfirmationModalOpen(false);
    setReviewToDeleteId(null);
    toast.success("Review deleted successfully!");
  };

  /**
   * Review Editing
   */
  const handleEditReview = (review: Review) => {
    setReview(review);
    setIsEditReviewModalOpen(true);
  };

  const handleUpdateReview = (updatedReview: Review) => {
    if (!validateForm("review", updatedReview)) return;

    setUserAddedReviews(
      userAddedReviews.map((r) =>
        r.id === updatedReview.id ? updatedReview : r
      )
    );
    setReview({ id: 0, name: "", text: "", rating: 5 });
    toast.success("Review updated successfully!");
    setIsEditReviewModalOpen(false);
  };

  /**
   * Review Ownership Check
   */
  const isReviewAddedByUser = (reviewId: number): boolean =>
    userAddedReviews.some((review) => review.id === reviewId);

  /**
   * Hero Section Styling
   */
  const heroSectionStyle = {
    backgroundImage:
      "url('https://plus.unsplash.com/premium_photo-1673435846128-56687ba5959d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8A%3D%3D')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backgroundBlendMode: "multiply" as const,
  };

  /**
   * Accessibility Announcements
   */
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
  }, [
    isQuoteModalOpen,
    isAppointmentModalOpen,
    isLeaveReviewModalOpen,
    isEditReviewModalOpen,
    isConfirmationModalOpen,
  ]);

  /**
   * Leave Review Modal
   */
  interface LeaveReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (review: Review) => void;
    errors: Errors;
  }

  const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    errors,
  }) => {
    const [review, setReview] = useState<Review>({
      id: 0,
      name: "",
      text: "",
      rating: 0,
    });

    const handleSubmit = () => {
      onSubmit(review);
      setReview({ id: 0, name: "", text: "", rating: 0 });
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Share Your Experience"
        onSubmit={handleSubmit}
      >
        <Label
          htmlFor="reviewName"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Your Name:
        </Label>
        <Input
          type="text"
          id="reviewName"
          placeholder="Your Name"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
          value={review.name}
          onChange={(e) => setReview({ ...review, name: e.target.value })}
          aria-describedby={errors.reviewName ? "reviewName-error" : undefined}
          aria-invalid={!!errors.reviewName}
        />
        {errors.reviewName && (
          <p id="reviewName-error" className="text-red-500 text-sm">
            {errors.reviewName}
          </p>
        )}

        <Label
          htmlFor="reviewText"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Your Review:
        </Label>
        <Textarea
          id="reviewText"
          placeholder="Write a review"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
          value={review.text}
          onChange={(e) => setReview({ ...review, text: e.target.value })}
          rows={4}
          aria-describedby={errors.reviewText ? "reviewText-error" : undefined}
          aria-invalid={!!errors.reviewText}
        />
        {errors.reviewText && (
          <p id="reviewText-error" className="text-red-500 text-sm">
            {errors.reviewText}
          </p>
        )}

        <div className="mb-5">
          <Label
            htmlFor="rating"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Rating:
          </Label>
          <StarRating
            rating={review.rating}
            setRating={(rating) => setReview({ ...review, rating })}
          />
          {errors.reviewRating && (
            <p id="reviewRating-error" className="text-red-500 text-sm">
              {errors.reviewRating}
            </p>
          )}
        </div>

        <MotionButton
          type="submit"
          whileHover={{ scale: 1.04 }}
          className="bg-primary text-white py-3 px-6 rounded-full transition-custom w-full text-lg font-semibold"
        >
          Submit Review
        </MotionButton>
      </Modal>
    );
  };

  /**
   * Edit Review Modal
   */
  interface EditReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (review: Review) => void;
    initialReview: Review;
    errors: Errors;
  }

  const EditReviewModal: React.FC<EditReviewModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialReview,
    errors,
  }) => {
    const [review, setReview] = useState<Review>(initialReview);

    const handleSubmit = () => {
      onSubmit(review);
      setReview({ id: 0, name: "", text: "", rating: 0 });
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Your Review"
        onSubmit={handleSubmit}
      >
        <Label
          htmlFor="editReviewName"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Your Name:
        </Label>
        <Input
          type="text"
          id="editReviewName"
          placeholder="Your Name"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
          value={review.name}
          onChange={(e) => setReview({ ...review, name: e.target.value })}
          aria-describedby={
            errors.reviewName ? "editReviewName-error" : undefined
          }
          aria-invalid={!!errors.reviewName}
        />
        {errors.reviewName && (
          <p id="editReviewName-error" className="text-red-500 text-sm">
            {errors.reviewName}
          </p>
        )}

        <Label
          htmlFor="editReviewText"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Your Review:
        </Label>
        <Textarea
          id="editReviewText"
          placeholder="Write a review"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
          value={review.text}
          onChange={(e) => setReview({ ...review, text: e.target.value })}
          rows={4}
          aria-describedby={
            errors.reviewText ? "editReviewText-error" : undefined
          }
          aria-invalid={!!errors.reviewText}
        />
        {errors.reviewText && (
          <p id="editReviewText-error" className="text-red-500 text-sm">
            {errors.reviewText}
          </p>
        )}

        <div className="mb-5">
          <Label
            htmlFor="editRating"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Rating:
          </Label>
          <StarRating
            rating={review.rating}
            setRating={(rating) => setReview({ ...review, rating })}
          />
          {errors.reviewRating && (
            <p id="editRating-error" className="text-red-500 text-sm">
              {errors.reviewRating}
            </p>
          )}
        </div>

        <MotionButton
          type="submit"
          whileHover={{ scale: 1.04 }}
          className="bg-primary text-white py-3 px-6 rounded-full transition-custom w-full text-lg font-semibold"
        >
          Update Review
        </MotionButton>
      </Modal>
    );
  };

  /**
   * Quote Modal
   */
  interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (quote: Quote) => void;
    errors: Errors;
  }

  const QuoteModal: React.FC<QuoteModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    errors,
  }) => {
    const [quote, setQuote] = useState<Quote>({ name: "", service: "" });

    const handleSubmit = () => {
      onSubmit(quote);
      setQuote({ name: "", service: "" });
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Request a Personalized Quote"
        onSubmit={handleSubmit}
      >
        <Label
          htmlFor="quoteName"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Your Name:
        </Label>
        <Input
          type="text"
          id="quoteName"
          placeholder="Your Name"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
          value={quote.name}
          onChange={(e) => setQuote({ ...quote, name: e.target.value })}
          aria-describedby={errors.quoteName ? "quoteName-error" : undefined}
          aria-invalid={!!errors.quoteName}
        />
        {errors.quoteName && (
          <p id="quoteName-error" className="text-red-500 text-sm">
            {errors.quoteName}
          </p>
        )}

        <Label
          htmlFor="quoteService"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Select a service:
        </Label>
        <Select
          value={quote.service}
          onValueChange={(value) => setQuote({ ...quote, service: value })}
        >
          <SelectTrigger className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-md rounded-md">
            {services.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.quoteService && (
          <p id="quoteService-error" className="text-red-500 text-sm">
            {errors.quoteService}
          </p>
        )}

        <MotionButton
          type="submit"
          whileHover={{ scale: 1.04 }}
          className="bg-primary text-white mt-4 py-3 px-6 rounded-full transition-custom w-full text-lg font-semibold"
        >
          Get Your Quote
        </MotionButton>
      </Modal>
    );
  };

  /**
   * Appointment Modal
   */
  interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (appointment: Appointment) => void;
    errors: Errors;
  }
  
  const AppointmentModal: React.FC<AppointmentModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    errors,
  }) => {
    const [appointment, setAppointment] = useState<Appointment>({
      name: '',
      service: '',
      date: '',
    });
  
    const handleSubmit = () => {
      onSubmit(appointment);
      setAppointment({ name: '', service: '', date: '' });
    };
  
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Schedule Your Cleaning Appointment"
        onSubmit={handleSubmit}
      >
        <Label
          htmlFor="appointmentName"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Your Name:
        </Label>
        <Input
          type="text"
          id="appointmentName"
          placeholder="Your Name"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
          value={appointment.name}
          onChange={(e) => setAppointment({ ...appointment, name: e.target.value })}
          aria-describedby={errors.appointmentName ? "appointmentName-error" : undefined}
          aria-invalid={!!errors.appointmentName}
        />
        {errors.appointmentName && (
          <p id="appointmentName-error" className="text-red-500 text-sm">
            {errors.appointmentName}
          </p>
        )}
  
        <Label
          htmlFor="appointmentService"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Select a service:
        </Label>
        <Select
          value={appointment.service}
          onValueChange={(value) => setAppointment({ ...appointment, service: value })}
        >
          <SelectTrigger className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-md rounded-md">
            {services.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.appointmentService && (
          <p id="appointmentService-error" className="text-red-500 text-sm">
            {errors.appointmentService}
          </p>
        )}
  
        <Label
          htmlFor="appointmentDate"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Select a date:
        </Label>
        <Input
          type="date"
          id="appointmentDate"
          className="w-full p-3 border rounded-xl mb-1 focus:ring-2 focus:ring-blue-600"
          value={appointment.date}
          onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
          aria-describedby={errors.appointmentDate ? "appointmentDate-error" : undefined}
          aria-invalid={!!errors.appointmentDate}
        />
        {errors.appointmentDate && (
          <p id="appointmentDate-error" className="text-red-500 text-sm">
            {errors.appointmentDate}
          </p>
        )}
  
        <MotionButton
          type="submit"
          whileHover={{ scale: 1.04 }}
          className="bg-primary text-white mt-4 py-3 px-6 rounded-full transition-custom w-full text-lg font-semibold"
        >
          Book Now
        </MotionButton>
      </Modal>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans text-base">
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      <Toaster />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={confirmDeleteReview}
        message="Are you sure you want to delete this review?"
      />

      <header
        role="banner"
        className="bg-white text-gray-800 p-5 flex justify-between items-center shadow-md sticky top-0 z-40"
      >
        <a href="/" className="text-2xl font-bold flex items-center">
          <svg
            className="text-blue-600 w-8 h-8 mr-2"
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

        <Button
          variant="ghost"
          className="hover:bg-gray-200 md:hidden p-3 rounded"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={
            isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
          }
        >
          <Menu size={28} />
        </Button>

        <nav role="navigation" className="hidden md:block">
          <ul className="flex space-x-6">
            <NavLink
              onClick={scrollToReviews}
              ariaLabel="View customer reviews"
            >
              Customer Reviews
            </NavLink>
            <NavLink
              onClick={() => setIsQuoteModalOpen(true)}
              ariaLabel="Request a quote"
            >
              Request Quote
            </NavLink>
            <NavLink
              onClick={() => setIsAppointmentModalOpen(true)}
              ariaLabel="Book an appointment"
            >
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
        className="md:hidden bg-white text-gray-800 p-6 rounded-r-2xl shadow-md fixed top-0 left-0 w-80 h-screen z-50 flex flex-col justify-start items-start space-y-4"
      >
        <div className="flex justify-between items-center w-full mb-4">
          <span className="text-lg font-semibold">Menu</span>
          <Button
            variant="ghost"
            className="hover:bg-gray-200 p-3 rounded"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close mobile menu"
          >
            <XCircle size={28} />
          </Button>
        </div>
        <nav className="w-full">
          <ul className="flex flex-col space-y-3">
            <li>
              <Button
                onClick={scrollToReviews}
                variant="ghost"
                className="hover:bg-gray-200 block w-full text-left text-lg font-semibold p-2 rounded-md transition duration-300"
                aria-label="View customer reviews"
              >
                Customer Reviews
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setIsQuoteModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                variant="ghost"
                className="hover:bg-gray-200 block w-full text-left text-lg font-semibold p-2 rounded-md transition duration-300"
                aria-label="Request a quote"
              >
                Request Quote
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setIsAppointmentModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                variant="ghost"
                className="hover:bg-gray-200 block w-full text-left text-lg font-semibold p-2 rounded-md transition duration-300"
                aria-label="Book an appointment"
              >
                Book Appointment
              </Button>
            </li>
          </ul>
        </nav>
      </motion.div>

      <section
        role="region"
        aria-label="Hero Section"
        style={heroSectionStyle}
        className="text-center py-20 px-6 md:py-28 text-white"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          Experience the Joy of a Spotless Space
        </h2>
        <p className="text-xl md:text-2xl mt-5 leading-relaxed">
          We deliver unparalleled cleaning services that transform your home or
          office into a haven of cleanliness and comfort.
        </p>
        <MotionButton
          whileHover={{ scale: 1.06 }}
          onClick={() => setIsQuoteModalOpen(true)}
          className="mt-8 bg-primary hover:bg-primary text-white py-4 px-8 rounded-full transition-custom text-lg font-semibold"
          aria-label="Get a free quote"
        >
          Get a Free Quote
        </MotionButton>
      </section>

      <section
        role="region"
        aria-label="Our Services"
        className="py-16 px-6 md:px-8"
      >
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
        <MotionButton
          whileHover={{ scale: 1.06 }}
          onClick={() => setIsLeaveReviewModalOpen(true)}
          className="bg-primary text-white py-4 px-8 rounded-full transition-custom text-lg font-semibold"
          aria-label="Share your experience and leave a review"
        >
          Share Your Experience
        </MotionButton>
      </section>

      <LeaveReviewModal
        isOpen={isLeaveReviewModalOpen}
        onClose={() => setIsLeaveReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        errors={errors}
      />

      <EditReviewModal
        isOpen={isEditReviewModalOpen}
        onClose={() => setIsEditReviewModalOpen(false)}
        onSubmit={handleUpdateReview}
        initialReview={review}
        errors={errors}
      />

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSubmit={handleQuoteSubmit}
        errors={errors}
      />

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSubmit={handleAppointmentSubmit}
        errors={errors}
      />
    </div>
  );
};

export default CleanConnectApp;
