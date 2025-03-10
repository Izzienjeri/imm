"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ChangeEvent,
  FormEvent,
  ReactNode,
  FC,
  ReactElement,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { toast, Toaster } from "sonner";
import {
  Edit,
  Trash2,
  Plus,
  LogOut,
  Info,
  Calendar,
  ClipboardList,
  User,
  Lock,
  Eye,
  BriefcaseMedical,
  Mail,
} from "lucide-react";
import { format } from "date-fns";

/**
 * TreatmentRecordApp is a comprehensive application designed to help users track their treatment records.
 *
 * 1.  **Authentication**:  Users can register with a username, email, and password, and then log in to access their personalized dashboard.
 * 2.  **Treatment Record Management**: Logged-in users can add, edit, view details, and delete their treatment records.
 * 3.  **Data Persistence**: User and treatment data are stored in the browser's local storage, ensuring data persistence between sessions.
 * 4.  **User Interface**: A clean and intuitive user interface built with React and styled with Tailwind CSS, incorporating animations with Framer Motion.
 * 5.  **Notifications**: Uses sonner to provide feedback to the user.
 */
// --- Types & Utils ---
interface UserProfile {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
}

interface TreatmentRecord {
  id: string;
  userId: string;
  treatmentType: string;
  date: string;
  details: Record<string, any>;
  notes?: string;
  timestamp: string;
}

/**
 * Hashes a password using base64 encoding.
 * @param {string} password - The password to hash.
 * @returns {string} The base64 encoded password hash.
 */
const hashPassword = (password: string): string => btoa(password);

/**
 * Verifies a password against a stored password hash.
 * @param {string} password - The password to verify.
 * @param {string} passwordHash - The stored password hash.
 * @returns {boolean} True if the password matches the hash, false otherwise.
 */
const verifyPassword = (password: string, passwordHash: string): boolean =>
  btoa(password) === passwordHash;

// --- Components ---

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A reusable modal component that provides a visually appealing overlay for displaying content.
 * Utilizes Framer Motion for smooth animations.
 */
const CustomModal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
  // If the modal is not open, return null
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* The modal overlay */}
      <motion.div
        className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 backdrop-blur-md bg-gray-900/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        {/* The modal content container */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden w-full max-w-md mx-4 sm:mx-0"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Auth Form
interface AuthFormProps {
  isRegistering: boolean;
  setIsRegistering: (value: boolean) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  onRegister: () => void;
  onLogin: () => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  usernameError: string;
  passwordError: string;
  emailError: string;
  loginError: string; // New login error state
}

/**
 * A form component for handling user registration and login.
 * It includes input fields for username, email, and password, with validation and error handling.
 */
const AuthForm: FC<AuthFormProps> = ({
  isRegistering,
  setIsRegistering,
  username,
  setUsername,
  password,
  setPassword,
  email,
  setEmail,
  onRegister,
  onLogin,
  showPassword,
  togglePasswordVisibility,
  usernameError,
  passwordError,
  emailError,
  loginError, // Login error prop
}) => {
  return (
    <div className="p-6 sm:p-16">
      {/* App Title */}
      <div className="flex items-center justify-center mb-8 sm:mb-12">
        <BriefcaseMedical className="w-10 h-10 text-fuchsia-600 dark:text-pink-600 mr-4" aria-hidden="true" />
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Treatment Tracker
        </h1>
      </div>
      {/* Form Title */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8 text-center">
        {isRegistering ? "Create Account" : "Sign In"}
      </h2>
      {/* Email Input (only shown during registration) */}
      {isRegistering && (
        <>
          <LabeledInput
            label="Email"
            id="email"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            aria-invalid={!!emailError}
            aria-describedby="email-error"
          />
          {/* Display email error message */}
          {emailError && (
            <p className="text-red-500 text-sm mt-1" id="email-error" aria-live="polite">
              {emailError}
            </p>
          )}
        </>
      )}
      {/* Username Input */}
      <>
        <LabeledInput
          label="Username"
          id="username"
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
            >
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          }
          aria-invalid={!!usernameError}
          aria-describedby="username-error"
        />
        {/* Display username error message */}
        {usernameError && (
          <p className="text-red-500 text-sm mt-1" id="username-error" aria-live="polite">
            {usernameError}
          </p>
        )}
      </>
      {/* Password Input */}
      <div className="mb-6 relative">
        <label
          htmlFor="password"
          className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow-sm appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-fuchsia-300 dark:focus:ring-pink-300 pr-10"
            aria-invalid={!!passwordError}
            aria-describedby="password-error"
          />
          {/* Password visibility toggle button */}
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
        {/* Display password error message */}
        {passwordError && (
          <p className="text-red-500 text-sm mt-1" id="password-error" aria-live="polite">
            {passwordError}
          </p>
        )}
      </div>
      {/* Display login error message */}
      {loginError && (
        <p className="text-red-500 text-sm mt-1" aria-live="polite">
          {loginError}
        </p>
      )}

      {/* Submit and Switch Form Buttons */}
      <div className="flex flex-col items-center justify-between mt-8">
        <button
          onClick={isRegistering ? onRegister : onLogin}
          className="bg-gradient-to-r from-fuchsia-600 to-pink-600 dark:from-pink-600 dark:to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 text-white font-bold py-3 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-300 transition-colors duration-300 w-full mb-3"
        >
          {isRegistering ? "Create Account" : "Sign In"}
        </button>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="inline-block align-baseline font-medium text-sm text-fuchsia-500 dark:text-pink-500 hover:text-fuchsia-700 dark:hover:text-pink-700 focus:outline-none"
        >
          {isRegistering
            ? "Already have an account? Sign In"
            : "Need an account? Create one."}
        </button>
      </div>
    </div>
  );
};

// Labeled Input
interface LabeledInputProps {
  label: string;
  id: string;
  type: string;
  placeholder: string;
  value: any;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

/**
 * A reusable input component with a label and optional icon.
 * It's designed for consistent styling and accessibility.
 */
const LabeledInput: FC<LabeledInputProps> = ({
  label,
  id,
  type,
  placeholder,
  value,
  onChange,
  icon,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
}) => {
  const val = value == null ? "" : String(value);

  return (
    <div className="mb-6 relative">
      {/* Label for the input */}
      <label
        htmlFor={id}
        className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2"
      >
        {label}
      </label>
      <div className="relative">
        {/* Input field */}
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={val}
          onChange={onChange}
          className="shadow-sm appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-fuchsia-300 dark:focus:ring-pink-300 pl-10"
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
        />
        {/* Icon within the input field */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard
interface DashboardProps {
  currentUser: UserProfile;
  treatments: TreatmentRecord[];
  setTreatments: (treatments: TreatmentRecord[]) => void;
  onLogout: () => void;
  handleAddTreatment: () => void;
  handleEditTreatment: (treatment: TreatmentRecord) => void;
  handleOpenTreatmentDetails: (treatment: TreatmentRecord) => void;
  openDeleteConfirmationModal: (id: string) => void;
}

/**
 * The main dashboard component that displays user information and treatment records.
 * It allows users to add, edit, view details, and delete treatment records, as well as log out.
 */
const Dashboard: FC<DashboardProps> = ({
  currentUser,
  treatments,
  onLogout,
  handleAddTreatment,
  handleEditTreatment,
  handleOpenTreatmentDetails,
  openDeleteConfirmationModal,
}) => {
  /**
   * Memoized list of treatments filtered by the current user's ID.
   * This prevents unnecessary re-renders when the treatment list or current user changes.
   */
  const userTreatments = useMemo(
    () =>
      currentUser
        ? treatments.filter((treatment) => treatment.userId === currentUser.id)
        : [],
    [treatments, currentUser]
  );

  return (
    <div className="p-4 sm:p-8">
      {/* User Welcome Section */}
      <div className="flex flex-col items-center mb-4 sm:mb-8">
        <div className="flex items-center mb-3 sm:mb-0">
          <User className="w-6 h-6 text-fuchsia-600 dark:text-pink-600 mr-2" aria-hidden="true" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome, {currentUser.username}!
          </h2>
        </div>
        {/* Added spacing here using mt-4 */}
        <div className="flex flex-col mt-4">
          <div className="flex items-center space-x-2">
            {/* Add Treatment Button */}
            <button
              onClick={handleAddTreatment}
              className="bg-gradient-to-r from-fuchsia-600 to-pink-600 dark:from-pink-600 dark:to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 text-white font-bold py-1 px-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-300 flex items-center transition duration-300 text-sm"
            >
              Add Treatment
              <Plus className="ml-1" size={16} aria-hidden="true" />
            </button>
            {/* Log Out Button */}
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 flex items-center transition duration-300 text-sm"
            >
              Log Out
              <LogOut className="ml-1" size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Treatment Records Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Your Treatment Records
        </h3>
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {userTreatments.length} records
        </span>
      </div>

      {/* Display message if no treatment records are available */}
      {userTreatments.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-gray-500 dark:text-gray-400 italic flex items-center justify-center">
          <ClipboardList className="mr-2" size={20} aria-hidden="true" />
          No treatment records yet.
        </div>
      ) : (
        // Display treatment records in a table
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden shadow-md">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <Th>Treatment Type</Th>
                <Th>Date</Th>
                <Th className="text-center">Actions</Th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {/* Map through user treatments and render each record in a table row */}
              {userTreatments.map((treatmentRecord) => (
                <MotionTr key={treatmentRecord.id}>
                  <Td>
                    <button
                      onClick={() =>
                        handleOpenTreatmentDetails(treatmentRecord)
                      }
                      className="hover:text-fuchsia-500 dark:hover:text-pink-500 focus:outline-none flex items-center"
                    >
                      <span className="mr-2">
                        {treatmentRecord.treatmentType}
                      </span>
                    </button>
                  </Td>
                  <Td>{format(new Date(treatmentRecord.date), "PPP")}</Td>
                  <Td className="text-center">
                    <div className="flex justify-center space-x-2">
                      {/* View Details Button */}
                      <ActionButton
                        onClick={() =>
                          handleOpenTreatmentDetails(treatmentRecord)
                        }
                        color="gray"
                        size={20}
                        icon={<Info className="mr-1" />}
                        aria-label="View details"
                      />
                      {/* Edit Treatment Button */}
                      <ActionButton
                        onClick={() => handleEditTreatment(treatmentRecord)}
                        color="blue"
                        size={20}
                        icon={<Edit className="mr-1" />}
                        aria-label="Edit treatment"
                      />
                      {/* Delete Treatment Button */}
                      <ActionButton
                        onClick={() =>
                          openDeleteConfirmationModal(treatmentRecord.id)
                        }
                        color="red"
                        size={20}
                        icon={<Trash2 className="mr-1" />}
                        aria-label="Delete treatment"
                      />
                    </div>
                  </Td>
                </MotionTr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Table Components
interface ThProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable table header component.
 */
const Th: FC<ThProps> = ({ children, className }) => {
  return (
    <th
      className={`px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
};

interface TdProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable table data cell component.
 */
const Td: FC<TdProps> = ({ children, className }) => {
  return (
    <td
      className={`px-3 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${className}`}
    >
      {children}
    </td>
  );
};

interface MotionTrProps {
  children: ReactNode;
}

/**
 * Table row component with Framer Motion animations for smooth transitions.
 */
const MotionTr: FC<MotionTrProps> = ({ children }) => (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15, ease: "easeInOut" }}
  >
    {children}
  </motion.tr>
);

interface ActionButtonProps {
  onClick: () => void;
  color: "blue" | "red" | "gray";
  icon: ReactNode;
  size?: number;
  "aria-label": string;
}

/**
 * Reusable button component for actions in the table.
 */
const ActionButton: FC<ActionButtonProps> = ({
  onClick,
  color,
  icon,
  size = 16,
  "aria-label": ariaLabel,
}) => {
  let colorClasses = "";

  // Determine the color classes based on the color prop
  switch (color) {
    case "blue":
      colorClasses = "text-blue-500 hover:text-blue-700";
      break;
    case "red":
      colorClasses = "text-red-500 hover:text-red-700";
      break;
    default:
      colorClasses =
        "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-500";
  }

  return (
    <button onClick={onClick} className={`${colorClasses} focus:outline-none`} aria-label={ariaLabel}>
      {React.cloneElement(icon as ReactElement, { size, "aria-hidden": "true" })}
    </button>
  );
};

// Treatment Entry Form
interface TreatmentEntryFormProps {
  currentUser: UserProfile | null;
  treatments: TreatmentRecord[];
  setTreatments: (treatments: TreatmentRecord[]) => void;
  onClose: () => void;
  selectedTreatment: TreatmentRecord | null;
}

/**
 * A form component for adding or editing treatment records.
 */
const TreatmentEntryForm: FC<TreatmentEntryFormProps> = ({
  currentUser,
  setTreatments,
  onClose,
  selectedTreatment,
}) => {
  // State variables for form inputs
  const [treatmentType, setTreatmentType] = useState(
    selectedTreatment?.treatmentType || ""
  );
  const [date, setDate] = useState(selectedTreatment?.date || "");
  const [notes, setNotes] = useState(selectedTreatment?.notes || "");
  const [details] = useState<Record<string, any>>(
    selectedTreatment?.details || {}
  );

  /**
   * Handles form submission for adding or editing a treatment record.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate form inputs
    if (!treatmentType || !date) {
      toast.error("Please fill all fields.");
      return;
    }

    if (!currentUser) {
      toast.error("Current user not found. Please log in again.");
      return;
    }

    const timestamp = new Date().toISOString();

    const newTreatment: TreatmentRecord = {
      id: selectedTreatment?.id || uuidv4(),
      userId: currentUser.id,
      treatmentType,
      date,
      details: details || {},
      notes,
      timestamp,
    };

    // Update the treatment list
    setTreatments((currentTreatments: TreatmentRecord[]) => {
      const updatedTreatments = selectedTreatment
        ? currentTreatments.map((treatmentRecord) =>
            treatmentRecord.id === selectedTreatment.id
              ? { ...newTreatment }
              : { ...treatmentRecord }
          )
        : [...currentTreatments, newTreatment];

      return updatedTreatments;
    });

    // Display a success message
    toast.success(
      selectedTreatment
        ? "Treatment record updated!"
        : "Treatment record added!"
    );

    onClose();
  };

  return (
    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-4xl shadow-2xl">
      {/* Form Title */}
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-8">
        {selectedTreatment ? "Edit Treatment" : "Add Treatment"}
      </h3>
      <form onSubmit={handleSubmit}>
        {/* Treatment Type Input */}
        <LabeledInput
          label="Treatment Type"
          id="treatmentType"
          type="text"
          placeholder="Enter treatment type"
          value={treatmentType}
          onChange={(e) => setTreatmentType(e.target.value)}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
            >
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V15a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
          }
        />

        {/* Date Input */}
        <div className="mb-6 relative">
          <label
            htmlFor="date"
            className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2"
          >
            Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="date"
              id="date"
              placeholder="Select date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="shadow-sm appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-fuchsia-300 pl-10"
            />
          </div>
        </div>

        {/* Notes Input */}
        <div className="mb-6 relative">
          <label
            htmlFor="notes"
            className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2"
          >
            Notes
          </label>
          <textarea
            id="notes"
            placeholder="Enter any relevant notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="shadow-sm appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-fuchsia-300 resize-none"
            rows={4}
          ></textarea>
        </div>

        {/* Cancel and Submit Buttons */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-gray-300 mr-3 transition duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-fuchsia-600 to-pink-600 dark:from-pink-600 dark:to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 text-white font-bold py-3 px-6 rounded-xl focus:outline focus:ring-4 focus:ring-fuchsia-300 transition duration-300"
          >
            {selectedTreatment ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Treatment Details
interface TreatmentDetailsProps {
  treatment: TreatmentRecord;
  onClose: () => void;
}

/**
 * Displays the details of a treatment record.
 */
const TreatmentDetails: FC<TreatmentDetailsProps> = ({
  treatment,
  onClose,
}) => {
  return (
    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-4xl shadow-2xl">
      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-8">
        Treatment Details
      </h3>
      {/* Treatment Type */}
      <div className="mb-3 sm:mb-4">
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          Treatment Type:
        </span>
        <span className="text-gray-900 dark:text-gray-100">
          {treatment.treatmentType}
        </span>
      </div>
      {/* Date */}
      <div className="mb-3 sm:mb-4">
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          Date:
        </span>
        <span className="text-gray-900 dark:text-gray-100">
          {format(new Date(treatment.date), "PPP")}
        </span>
      </div>
      {/* Timestamp */}
      <div className="mb-3 sm:mb-4">
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          Timestamp:
        </span>
        <span className="text-gray-900 dark:text-gray-100">
          {format(new Date(treatment.timestamp), "PPP p")}
        </span>
      </div>
      {/* Notes (if available) */}
      {treatment.notes && (
        <div className="mb-3 sm:mb-4">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            Notes:
          </span>
          <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
            {treatment.notes}
          </div>
        </div>
      )}
      {/* Details (if available) */}
      {Object.keys(treatment.details).length > 0 && (
        <>
          <p className="font-semibold mt-4 sm:mt-8 text-gray-700 dark:text-gray-300">
            Details:
          </p>
          <ul className="list-disc pl-6 mt-3">
            {Object.entries(treatment.details).map(([key, value]) => (
              <li key={key} className="text-gray-900 dark:text-gray-100">
                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key}:
                </span>
                {String(value)}
              </li>
            ))}
          </ul>
        </>
      )}
      {/* Close Button */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-gray-300 mr-3 transition duration-300"
          aria-label="Close details"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---
// New interface for the confirmation modal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

/**
 * A modal component for confirming actions, such as deleting a treatment record.
 */
const ConfirmationModal: FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  // If the modal is not open, return null
  if (!isOpen) return null;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Confirmation Message */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{message}</h3>
        {/* Cancel and Delete Buttons */}
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-xl focus:outline-none mr-2"
            onClick={onClose}
            aria-label="Cancel delete"
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none"
            onClick={onConfirm}
            aria-label="Confirm delete"
          >
            Delete
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

/**
 * The main component that orchestrates the entire treatment record application.
 * It manages user authentication, treatment data, and modal states.
 */
const TreatmentRecordApp: FC = () => {
  // State variables
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] =
    useState<TreatmentRecord | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTreatmentDetails, setSelectedTreatmentDetails] =
    useState<TreatmentRecord | null>(null);

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [treatmentIdToDelete, setTreatmentIdToDelete] = useState<string | null>(null);

  // Validation States
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState(""); // new login error state

  /**
   * Loads user and treatment data from local storage.
   */
  const loadData = useCallback(() => {
    try {
      const storedUsers = localStorage.getItem("users");
      setUsers(storedUsers ? JSON.parse(storedUsers) : []);

      const storedTreatments = localStorage.getItem("treatments");
      setTreatments(storedTreatments ? JSON.parse(storedTreatments) : []);

      const storedCurrentUser = localStorage.getItem("currentUser");
      setCurrentUser(storedCurrentUser ? JSON.parse(storedCurrentUser) : null);
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  /**
   * useEffect hook to load data when the component mounts.
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * useEffect hook to save users to local storage when the users state changes.
   */
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users]);

  /**
   * useEffect hook to save treatments to local storage when the treatments state changes.
   */
  useEffect(() => {
    if (treatments.length > 0) {
      localStorage.setItem("treatments", JSON.stringify(treatments));
    }
  }, [treatments]);

  /**
   * useEffect hook to save or remove the current user from local storage when the currentUser state changes.
   */
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  // Validation functions
  /**
   * Validates an email address.
   * @param {string} email - The email address to validate.
   * @returns {string} An error message if the email is invalid, or an empty string if it is valid.
   */
  const validateEmail = (email: string) => {
    if (!email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format.";
    return "";
  };

  /**
   * Validates a username.
   * @param {string} username - The username to validate.
   * @returns {string} An error message if the username is invalid, or an empty string if it is valid.
   */
  const validateUsername = (username: string) => {
    if (!username) return "Username is required.";
    if (username.length < 3) return "Username must be at least 3 characters.";
    return "";
  };

  /**
   * Validates a password.
   * @param {string} password - The password to validate.
   * @returns {string} An error message if the password is invalid, or an empty string if it is valid.
   */
  const validatePassword = (password: string) => {
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  /**
   * Handles user registration.
   */
  const handleRegister = () => {
    const emailError = validateEmail(email);
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    setEmailError(emailError);
    setUsernameError(usernameError);
    setPasswordError(passwordError);

    if (emailError || usernameError || passwordError) {
      return;
    }

    if (users.some((user) => user.username === username)) {
      toast.error("Username already exists.");
      return;
    }

    const newUser: UserProfile = {
      id: uuidv4(),
      username,
      email,
      passwordHash: hashPassword(password),
    };

    setUsers((prevUsers) => [...prevUsers, newUser]);
    setCurrentUser(newUser);
    setIsRegistering(false);
    setUsername("");
    setPassword("");
    setEmail("");
    toast.success("Registration successful!");
  };

  /**
   * Handles user login.
   */
  const handleLogin = () => {
    // Clear previous login error
    setLoginError("");

    const user = users.find((user) => user.username === username);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      setLoginError("Incorrect username or password."); // Set generic error
      return;
    }

    setCurrentUser(user);
    setUsername("");
    setPassword("");
    toast.success("Login successful!");
  };

  /**
   * Handles user logout.
   */
  const handleLogout = () => {
    setCurrentUser(null);
    toast.success("Logged out successfully!");
  };

  /**
   * Opens the treatment entry form in add mode.
   */
  const handleAddTreatment = () => {
    setSelectedTreatment(null);
    setIsModalOpen(true);
  };

  /**
   * Opens the treatment entry form in edit mode.
   * @param {TreatmentRecord} treatment - The treatment record to edit.
   */
  const handleEditTreatment = (treatment: TreatmentRecord) => {
    setSelectedTreatment(treatment);
    setIsModalOpen(true);
  };

  /**
   * Deletes a treatment record.
   * @param {string} id - The ID of the treatment record to delete.
   */
  const handleDeleteTreatment = (id: string) => {
    setTreatments((prevTreatments) =>
      prevTreatments.filter((treatmentRecord) => treatmentRecord.id !== id)
    );
    toast.success("Treatment record deleted!");
  };

  /**
   * Opens the treatment details modal.
   * @param {TreatmentRecord} treatment - The treatment record to display.
   */
  const handleOpenTreatmentDetails = (treatment: TreatmentRecord) => {
    setSelectedTreatmentDetails(treatment);
  };

  /**
   * Toggles the password visibility.
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  /**
   * Memoized treatment object for the modal.
   */
  const treatmentForModal = useMemo(
    () => (selectedTreatment ? { ...selectedTreatment } : null),
    [selectedTreatment]
  );

  /**
   * Opens the delete confirmation modal.
   * @param {string} id - The ID of the treatment record to delete.
   */
  const openDeleteConfirmationModal = (id: string) => {
    setTreatmentIdToDelete(id);
    setIsDeleteConfirmationOpen(true);
  };

  /**
   * Closes the delete confirmation modal.
   */
  const closeDeleteConfirmationModal = () => {
    setIsDeleteConfirmationOpen(false);
    setTreatmentIdToDelete(null);
  };

  /**
   * Confirms the deletion of a treatment record.
   */
  const confirmDeleteTreatment = () => {
    if (treatmentIdToDelete) {
      handleDeleteTreatment(treatmentIdToDelete);
      closeDeleteConfirmationModal();
    }
  };

  return (
    <div className="font-euclid antialiased bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center py-6 sm:py-12 px-4">
      {/* Toaster for displaying notifications */}
      <Toaster richColors />
      {/* Main container with animation */}
      <motion.div
        className="relative bg-white dark:bg-gray-800 shadow-4xl rounded-4xl w-full max-w-md sm:max-w-lg lg:max-w-xl overflow-hidden z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Top bar with gradient */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 dark:from-pink-600 dark:to-fuchsia-600"></div>
        {/* Render Dashboard or AuthForm based on authentication state */}
        {currentUser ? (
          <Dashboard
            currentUser={currentUser}
            treatments={treatments}
            setTreatments={setTreatments}
            onLogout={handleLogout}
            handleAddTreatment={handleAddTreatment}
            handleEditTreatment={handleEditTreatment}
            handleOpenTreatmentDetails={handleOpenTreatmentDetails}
            openDeleteConfirmationModal={openDeleteConfirmationModal}
          />
        ) : (
          <AuthForm
            isRegistering={isRegistering}
            setIsRegistering={setIsRegistering}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            email={email}
            setEmail={setEmail}
            onRegister={handleRegister}
            onLogin={handleLogin}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            usernameError={usernameError}
            passwordError={passwordError}
            emailError={emailError}
            loginError={loginError}
          />
        )}
      </motion.div>

      {/* Treatment Entry Form Modal */}
      <CustomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TreatmentEntryForm
          currentUser={currentUser}
          treatments={treatments}
          setTreatments={setTreatments}
          onClose={() => setIsModalOpen(false)}
          selectedTreatment={treatmentForModal}
        />
      </CustomModal>

      {/* Treatment Details Modal */}
      <CustomModal
        isOpen={!!selectedTreatmentDetails}
        onClose={() => setSelectedTreatmentDetails(null)}
      >
        {selectedTreatmentDetails && (
          <TreatmentDetails
            treatment={selectedTreatmentDetails}
            onClose={() => setSelectedTreatmentDetails(null)}
          />
        )}
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteConfirmationOpen}
        onClose={closeDeleteConfirmationModal}
        onConfirm={confirmDeleteTreatment}
        message="Are you sure you want to delete this treatment record?"
      />
    </div>
  );
};

export default TreatmentRecordApp;
  