import React from 'react';
import { motion } from 'motion/react';
import { DoorState } from '../hooks/useElevator';

interface ControlPanelProps {
  currentFloor: number;
  doorState: DoorState;
  onFloorClick: (floor: number) => void;
  onOpenClick: () => void;
  onCloseClick: () => void;
  queue: number[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  currentFloor, 
  doorState,
  onFloorClick, 
  onOpenClick, 
  onCloseClick,
  queue 
}) => {
  const floors = Array.from({ length: 10 }, (_, i) => i + 1); // 1-10

  return (
    <div className="bg-gradient-to-b from-zinc-300 to-zinc-400 p-6 rounded-t-3xl shadow-2xl border-t-4 border-zinc-200 h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Metallic texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]"></div>
      
      {/* Screw heads for realism */}
      <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-zinc-400 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),1px_1px_0_rgba(255,255,255,0.5)] flex items-center justify-center">
        <div className="w-full h-[1px] bg-zinc-500 rotate-45"></div>
        <div className="w-full h-[1px] bg-zinc-500 -rotate-45 absolute"></div>
      </div>
      <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-zinc-400 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),1px_1px_0_rgba(255,255,255,0.5)] flex items-center justify-center">
        <div className="w-full h-[1px] bg-zinc-500 rotate-45"></div>
        <div className="w-full h-[1px] bg-zinc-500 -rotate-45 absolute"></div>
      </div>

      <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-8 z-10">
        {/* Floor Buttons */}
        {[...floors].reverse().map((floor) => {
           const isActive = queue.includes(floor) || currentFloor === floor;
           return (
            <motion.button
              key={floor}
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={() => onFloorClick(floor)}
              className={`
                w-20 h-20 rounded-full text-3xl font-bold flex items-center justify-center border-4 relative
                transition-all duration-200
                ${isActive 
                  ? 'bg-yellow-100 border-yellow-500 text-yellow-600 shadow-[0_0_20px_rgba(250,204,21,0.8),inset_0_2px_5px_rgba(255,255,255,0.5)]' 
                  : 'bg-zinc-100 border-zinc-400 text-zinc-600 shadow-[0_4px_0_rgba(0,0,0,0.2),inset_0_2px_5px_rgba(255,255,255,1)] hover:bg-zinc-50'}
              `}
            >
              {floor}
              {/* LED Light (only visible when active) */}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 animate-pulse pointer-events-none"></div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Door Controls */}
      <div className="flex gap-8 mt-4 z-10 bg-zinc-800/10 p-4 rounded-2xl">
        <motion.button
          whileTap={{ scale: 0.95, y: 2 }}
          onClick={onOpenClick}
          className={`
            w-20 h-20 rounded-full border-4 text-2xl font-bold shadow-[0_4px_0_rgba(0,0,0,0.2),inset_0_2px_5px_rgba(255,255,255,1)] flex items-center justify-center transition-colors
            ${doorState === 'opening' || doorState === 'open' 
              ? 'bg-green-100 border-green-400 text-green-600 shadow-[0_0_15px_rgba(74,222,128,0.6)]' 
              : 'bg-white border-green-500 text-green-600'}
          `}
          aria-label="Open Doors"
        >
          ◁▷
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95, y: 2 }}
          onClick={onCloseClick}
          className={`
            w-20 h-20 rounded-full border-4 text-2xl font-bold shadow-[0_4px_0_rgba(0,0,0,0.2),inset_0_2px_5px_rgba(255,255,255,1)] flex items-center justify-center transition-colors
            ${doorState === 'closing' || doorState === 'closed' 
              ? 'bg-green-100 border-green-400 text-green-600 shadow-[0_0_15px_rgba(74,222,128,0.6)]' 
              : 'bg-white border-green-500 text-green-600'}
          `}
          aria-label="Close Doors"
        >
          ▷◁
        </motion.button>
      </div>
    </div>
  );
};
