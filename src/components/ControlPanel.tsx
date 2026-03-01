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
  const floors = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="bg-gradient-to-b from-zinc-300 to-zinc-400 px-4 pt-4 pb-6 rounded-t-3xl shadow-2xl border-t-4 border-zinc-200 flex flex-col items-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]"></div>
      
      <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-zinc-400 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),1px_1px_0_rgba(255,255,255,0.5)] flex items-center justify-center">
        <div className="w-full h-[1px] bg-zinc-500 rotate-45"></div>
        <div className="w-full h-[1px] bg-zinc-500 -rotate-45 absolute"></div>
      </div>
      <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-zinc-400 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),1px_1px_0_rgba(255,255,255,0.5)] flex items-center justify-center">
        <div className="w-full h-[1px] bg-zinc-500 rotate-45"></div>
        <div className="w-full h-[1px] bg-zinc-500 -rotate-45 absolute"></div>
      </div>

      <div className="grid grid-cols-5 gap-2.5 mb-3 z-10">
        {[...floors].reverse().map((floor) => {
           const isActive = queue.includes(floor) || currentFloor === floor;
           return (
            <motion.button
              key={floor}
              whileTap={{ scale: 0.93, y: 2 }}
              onClick={() => onFloorClick(floor)}
              className={`
                w-14 h-14 rounded-full text-xl font-bold flex items-center justify-center border-[3px] relative
                transition-all duration-200
                ${isActive 
                  ? 'bg-yellow-100 border-yellow-500 text-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.8),inset_0_2px_4px_rgba(255,255,255,0.5)]' 
                  : 'bg-zinc-100 border-zinc-400 text-zinc-600 shadow-[0_3px_0_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,1)] hover:bg-zinc-50'}
              `}
            >
              {floor}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 animate-pulse pointer-events-none"></div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-4 z-10 bg-zinc-800/10 px-5 py-2.5 rounded-2xl">
        <motion.button
          whileTap={{ scale: 0.93, y: 2 }}
          onClick={onOpenClick}
          className={`
            w-16 h-16 rounded-full border-[3px] text-lg font-bold shadow-[0_3px_0_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,1)] flex items-center justify-center transition-colors
            ${doorState === 'opening' || doorState === 'open' 
              ? 'bg-green-100 border-green-400 text-green-600 shadow-[0_0_12px_rgba(74,222,128,0.6)]' 
              : 'bg-white border-green-500 text-green-600'}
          `}
          aria-label="ひらく"
        >
          ◁▷
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.93, y: 2 }}
          onClick={onCloseClick}
          className={`
            w-16 h-16 rounded-full border-[3px] text-lg font-bold shadow-[0_3px_0_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,1)] flex items-center justify-center transition-colors
            ${doorState === 'closing' || doorState === 'closed' 
              ? 'bg-green-100 border-green-400 text-green-600 shadow-[0_0_12px_rgba(74,222,128,0.6)]' 
              : 'bg-white border-green-500 text-green-600'}
          `}
          aria-label="しめる"
        >
          ▷◁
        </motion.button>
      </div>
    </div>
  );
};
