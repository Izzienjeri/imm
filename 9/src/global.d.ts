import 'framer-motion';

declare module 'framer-motion' {
  interface MotionProps {
    className?: string;
    type?: string;
    onClick?: function;
    disabled?: boolean;
    role?: string
  }
}