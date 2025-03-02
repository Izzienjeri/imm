/**
 * Raffle Application
 *
 * A comprehensive React-based raffle system that enables real-time prize drawings with
 * interactive animations, sound effects, and user notifications.
 *
 * Features include:
 * - Real-time countdown timer
 * - Participant entry management
 * - Winner selection algorithm
 * - Interactive animations
 * - Sound effects system
 * - Confetti celebration
 * - Responsive design and accessibility support
 */

import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { Clock, Gift, UserMinus, RotateCcw } from 'lucide-react';
import { motion, MotionProps } from 'framer-motion';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import * as React from "react";

/**
 * Helper: Format time from milliseconds to MM:SS
 */
const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const MotionDiv = motion.div as React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & MotionProps & React.RefAttributes<HTMLDivElement>
>;

interface RaffleHeaderProps {
  prize: string;
  timeRemaining: number;
}

/**
 * Raffle Header Component
 */
const RaffleHeader: React.FC<RaffleHeaderProps> = ({ prize, timeRemaining }) => {
  return (
    <header className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight sm:text-5xl">
        <span className="inline-block mr-1">✨</span>
        <span className="bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
          Win a Chance
        </span>
        <span className="inline-block ml-1">✨</span>
      </h1>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight sm:text-5xl">
        <span className="bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
          at Luxury!
        </span>
      </h2>
      <p className="mt-3 text-lg md:text-xl text-gray-600 flex items-center justify-center flex-wrap">
        <Gift className="w-5 h-5 md:w-6 md:h-6 mr-2 text-pink-500 animate-pulse" aria-hidden="true" />
        <span className="block sm:inline">Enter to win:</span> <span className="ml-1 font-semibold italic">{prize}</span>
      </p>
      <div className="mt-6 flex items-center justify-center space-x-4 text-lg">
        <Clock className="w-5 h-5 md:w-6 md:h-6 text-gray-700" aria-hidden="true" />
        <span className="text-lg font-medium">Time Remaining:</span>
        <span className="text-xl md:text-2xl font-bold tracking-wider">{formatTime(timeRemaining)}</span>
      </div>
    </header>
  );
};

interface RaffleEntryFormProps {
  timerActive: boolean;
  name: string;
  setName: (name: string) => void;
  handleSubmit: (e: FormEvent) => void;
}

/**
 * Raffle Entry Form Component
 */
const RaffleEntryForm: React.FC<RaffleEntryFormProps> = ({ timerActive, name, setName, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="sr-only">Your Name</Label>
        <div className="relative">
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            disabled={!timerActive}
            required
            aria-label="Enter your name to join the raffle"
            className="block w-full py-2.5 pl-10 pr-4 text-gray-800 rounded-xl border border-gray-200 focus:ring-4 ring-purple-200 transition-colors"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>
      <Button
        type="submit"
        disabled={!timerActive}
        aria-label="Enter the raffle"
        className="w-full py-2.5 px-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-red-500 to-purple-600 shadow-md hover:scale-105 focus:outline-none focus:ring-4 ring-purple-200 transition-all disabled:opacity-50 disabled:hover:scale-100"
      >
        ✨ Enter the Draw! ✨
      </Button>
    </form>
  );
};

interface RaffleEntriesProps {
  entries: string[];
  entriesRef: React.RefObject<HTMLDivElement>;
  handleRemoveEntry: (entryToRemove: string) => void;
}

/**
 * Raffle Entries Component
 */
const RaffleEntries: React.FC<RaffleEntriesProps> = ({ entries, entriesRef, handleRemoveEntry }) => {
  return (
    entries.length > 0 && (
      <div className="mt-8" ref={entriesRef}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Entries</h2>
        <ul className="space-y-2">
          {entries.map((entry, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl shadow-sm border border-gray-200"
            >
              <span className="text-gray-700">{entry}</span>
              <Button
                variant="ghost"
                onClick={() => handleRemoveEntry(entry)}
                className="text-red-500 hover:text-red-700 transition-colors"
                aria-label={`Remove ${entry} from raffle`}
              >
                <UserMinus className="w-5 h-5" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

interface RaffleWinnerProps {
  winner: string | null;
  winnerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Raffle Winner Component
 */
const RaffleWinner: React.FC<RaffleWinnerProps> = ({ winner, winnerRef }) => {
  return (
    winner && (
      <MotionDiv
        ref={winnerRef}
        className="mt-8 p-6 bg-purple-50 rounded-xl border-2 border-purple-200 shadow-xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">
          🎉 And the Winner is... 🎉
        </h3>
        <p className="text-xl text-purple-700 font-bold">{winner}</p>
      </MotionDiv>
    )
  );
};

interface RaffleResetButtonProps {
  handleResetTimer: () => void;
}

/**
 * Raffle Reset Button Component
 */
const RaffleResetButton: React.FC<RaffleResetButtonProps> = ({ handleResetTimer }) => {
  return (
    <div className="mt-6 flex justify-center">
      <Button
        onClick={handleResetTimer}
        className="flex items-center justify-center text-gray-700 font-semibold py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-4 ring-gray-200 transition-colors"
        aria-label="Reset Timer"
      >
        <RotateCcw className="w-5 h-5 inline-block mr-2" />
        Reset Timer
      </Button>
    </div>
  );
};


/**
 * Main Raffle Application Component
 */
const RaffleApplication: React.FC = () => {
  // State Management
  const [prize] = useState('A Luxurious Getaway');
  const [timeRemaining, setTimeRemaining] = useState(10000);
  const [entries, setEntries] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [timerActive, setTimerActive] = useState(true);
  const [name, setName] = useState('');
  const [confettiActive, setConfettiActive] = useState(false); // New state for confetti

  // Refs for DOM manipulation and state persistence
  const winnerRef = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiAnimationId = useRef<number | null>(null);
  const synthRef = useRef<Tone.Synth | null>(null);
  const audioContextStarted = useRef(false);

  /**
   * Shows a notification message using Sonner's toast.
   */
  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    duration: number = 3000
  ) => {
    if (type === 'success') {
      toast.success(message, { duration });
    } else if (type === 'error') {
      toast.error(message, { duration });
    } else {
      toast(message, { duration });
    }
  };

  /**
   * Selects and announces the winner, triggering confetti and tone.
   */
  const pickWinner = () => {
    if (entries.length > 0) {
      const randomIndex = Math.floor(Math.random() * entries.length);
      const winningEntry = entries[randomIndex];
      setWinner(winningEntry);
      startConfetti();
      debouncedPlayTone();
      setConfettiActive(true); // Activate confetti state

      setTimeout(() => stopConfetti(), 5000); // Stop confetti after 5 seconds

      setTimeout(() => {
        winnerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } else {
      showNotification('No entries found. Unable to pick a winner.', 'info');
      setWinner('No participants found');
    }
  };

  /**
   * Timer Effect: Decreases timeRemaining and picks a winner when time runs out.
   */
  useEffect(() => {
    let intervalId: number | undefined;
    if (timerActive && timeRemaining > 0) {
      intervalId = window.setInterval(() => {
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
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerActive, timeRemaining]);

  /**
   * Handles form submission for raffle entry.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      showNotification('Please enter your name.', 'error');
      return;
    }
    if (entries.includes(trimmedName)) {
      showNotification('You can only enter your name once!', 'error');
      return;
    }
    setEntries((prev) => [...prev, trimmedName]);
    showNotification(`Thank you, ${trimmedName} for entering!`, 'success');
    setName('');
    setTimeout(() => {
      entriesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  /**
   * Removes a participant from the raffle.
   */
  const handleRemoveEntry = (entryToRemove: string) => {
    setEntries((prev) => prev.filter((entry) => entry !== entryToRemove));
    showNotification(`${entryToRemove} removed from the raffle.`, 'info');
  };

  /**
   * Resets the raffle timer and clears the winner.
   */
  const handleResetTimer = () => {
    setTimeRemaining(10000);
    setTimerActive(true);
    setWinner(null);
    stopConfetti();
    setConfettiActive(false); // Deactivate confetti state
    showNotification('Timer reset!', 'info');
  };

  /**
   * Starts the confetti animation on a canvas.
   */
  const startConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array(75)
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
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
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
      confettiAnimationId.current = requestAnimationFrame(animate);
    };
    animate();
  };

  /**
   * Stops the confetti animation and clears the canvas.
   */
  const stopConfetti = () => {
    if (confettiAnimationId.current) {
      cancelAnimationFrame(confettiAnimationId.current);
      confettiAnimationId.current = null;  //Clear the ref
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setConfettiActive(false); // Deactivate confetti state
  };

  /**
   * Plays a celebration tone using Tone.js.
   */
  const playTone = async () => {
    try {
      if (!audioContextStarted.current) {
        await Tone.start();
        audioContextStarted.current = true;
      }
      if (!synthRef.current) {
        synthRef.current = new Tone.Synth().toDestination();
      }
      synthRef.current.triggerAttackRelease('C4', '0.5');
    } catch (error) {
      console.error('Error playing tone:', error);
    }
  };

  /**
   * Utility: Debounce function calls.
   */
  function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: number | undefined;
    const debouncedFunc = (...args: Parameters<T>): void => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        func(...args);
      }, delay);
    };
    return debouncedFunc as T;
  }

  /**
   * Debounced playTone to prevent rapid repeated calls.
   */
  const debouncedPlayTone = useCallback(debounce(playTone, 200), []);

  /**
   * Cleanup: Dispose of Tone.js synth on unmount.
   */
  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.dispose();
      stopConfetti(); // Ensure confetti stops on unmount
    };
  }, []);

  /**
   * Ensures AudioContext starts on first user interaction.
   */
  const handleUserInteraction = useCallback(async () => {
    if (!audioContextStarted.current) {
      try {
        await Tone.start();
        audioContextStarted.current = true;
        console.log('AudioContext started after user interaction.');
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      } catch (error) {
        console.error('Error starting AudioContext:', error);
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [handleUserInteraction]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-red-100 to-purple-200 font-sans antialiased flex flex-col overflow-hidden py-6">
      <canvas ref={canvasRef} className="fixed top-0 left-0 pointer-events-none z-10" />
      <Toaster />

      <div className="flex justify-center items-center flex-grow">
        <MotionDiv
          className="bg-white rounded-xl shadow-2xl p-6 sm:p-12 w-full max-w-2xl mx-4 my-8 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <RaffleHeader prize={prize} timeRemaining={timeRemaining} />

          <main className="w-full">
            <RaffleEntryForm
              timerActive={timerActive}
              name={name}
              setName={setName}
              handleSubmit={handleSubmit}
            />

            <RaffleEntries
              entries={entries}
              entriesRef={entriesRef}
              handleRemoveEntry={handleRemoveEntry}
            />

            <RaffleWinner winner={winner} winnerRef={winnerRef} />

            <RaffleResetButton handleResetTimer={handleResetTimer} />
          </main>
        </MotionDiv>
      </div>
      <footer className="text-center py-3 text-gray-600 text-sm">
        © {new Date().getFullYear()} Raffle App. All rights reserved.
      </footer>
    </div>
  );
};

export default RaffleApplication;