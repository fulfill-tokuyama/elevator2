import React from 'react';
import { motion } from 'motion/react';

interface ElevatorDoorsProps {
  isOpen: boolean;
  isOpening: boolean;
  isClosing: boolean;
}

export const ElevatorDoors: React.FC<ElevatorDoorsProps> = ({ isOpen, isOpening, isClosing }) => {
  // Calculate width percentage based on state
  // Open = 0% width (or pushed to sides)
  // Closed = 50% width each
  
  const variants = {
    closed: { width: '50%' },
    open: { width: '5%' }, // Leave a tiny bit visible
  };

  const state = isOpen ? 'open' : (isOpening ? 'open' : 'closed');

  return (
    <div className="absolute inset-0 flex overflow-hidden pointer-events-none z-20">
      {/* Left Door */}
      <motion.div
        initial="closed"
        animate={state}
        variants={variants}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="h-full bg-zinc-300 border-r-2 border-zinc-400 relative shadow-lg"
      >
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-32 bg-zinc-400 rounded-full opacity-50" />
      </motion.div>

      {/* Right Door */}
      <motion.div
        initial="closed"
        animate={state}
        variants={variants}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="h-full bg-zinc-300 border-l-2 border-zinc-400 relative shadow-lg"
      >
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-32 bg-zinc-400 rounded-full opacity-50" />
      </motion.div>
    </div>
  );
};
