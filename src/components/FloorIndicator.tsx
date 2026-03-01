import React from 'react';
import { motion } from 'motion/react';

interface FloorIndicatorProps {
  floor: number;
  direction: 'up' | 'down' | 'idle';
}

export const FloorIndicator: React.FC<FloorIndicatorProps> = ({ floor, direction }) => {
  return (
    <div className="bg-black border-4 border-zinc-600 rounded-lg p-4 w-48 mx-auto mb-4 shadow-inner relative overflow-hidden">
      <div className="flex items-center justify-center gap-4">
        {/* Direction Arrow */}
        <div className={`text-red-500 text-4xl font-bold transition-opacity duration-300 ${direction === 'up' ? 'opacity-100' : 'opacity-20'}`}>
          ▲
        </div>
        
        {/* Floor Number */}
        <div className="text-red-500 text-6xl font-mono font-bold tracking-widest min-w-[2ch] text-center">
          {floor}
        </div>

        {/* Direction Arrow */}
        <div className={`text-red-500 text-4xl font-bold transition-opacity duration-300 ${direction === 'down' ? 'opacity-100' : 'opacity-20'}`}>
          ▼
        </div>
      </div>
      
      {/* Glossy reflection effect */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </div>
  );
};
