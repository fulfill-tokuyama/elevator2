import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useElevator } from './hooks/useElevator';
import { useElevatorAudio } from './hooks/useElevatorAudio';
import { ElevatorDoors } from './components/ElevatorDoors';
import { FloorIndicator } from './components/FloorIndicator';
import { ControlPanel } from './components/ControlPanel';
import { ArrowLeft, Star, Settings, Book } from 'lucide-react';

// Types
type GameMode = 'menu' | 'free' | 'job' | 'adventure';

// Simple Passenger Component
const Passenger = ({ targetFloor, mood, color }: { targetFloor: number, mood: 'happy' | 'waiting', color: string }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.8, x: -50 }}
    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-48 flex flex-col items-center justify-end z-10"
  >
    {/* Speech Bubble */}
    <div className="bg-white p-3 rounded-2xl shadow-lg mb-2 relative border-2 border-zinc-200">
      <p className="text-lg font-bold text-zinc-800 whitespace-nowrap">
        {mood === 'happy' ? 'ありがとう！' : `${targetFloor}かい！`}
      </p>
      <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-zinc-200 rotate-45"></div>
    </div>
    
    {/* Character Body (Simple SVG/CSS) */}
    <div className={`w-24 h-32 ${color} rounded-t-full relative shadow-md`}>
       <div className="absolute top-8 left-4 w-4 h-4 bg-black rounded-full"></div>
       <div className="absolute top-8 right-4 w-4 h-4 bg-black rounded-full"></div>
       <div className="absolute top-16 left-1/2 -translate-x-1/2 w-8 h-4 border-b-4 border-black rounded-full"></div>
    </div>
  </motion.div>
);

export default function App() {
  const [mode, setMode] = useState<GameMode>('menu');
  const elevator = useElevator();
  const { playBeep, playChime, speak, vibrate } = useElevatorAudio();
  const prevDoorState = useRef(elevator.doorState);
  const prevFloor = useRef(elevator.currentFloor);
  
  // Job Mode State
  const [passenger, setPassenger] = useState<{targetFloor: number, currentFloor: number, color: string} | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'success'>('none');

  // Background gradient based on floor
  const getBackgroundGradient = (floor: number) => {
    if (floor <= 3) return 'from-green-200 to-blue-200'; // Ground/Low
    if (floor <= 7) return 'from-blue-200 to-blue-400'; // Mid/Sky
    return 'from-blue-400 to-indigo-600'; // High/Space
  };

  const bgGradient = getBackgroundGradient(elevator.currentFloor);

  // Audio/Haptic Effects Logic
  useEffect(() => {
    // Door Opening -> Arrival Chime & Announcement
    if (prevDoorState.current !== 'opening' && elevator.doorState === 'opening') {
      playChime();
      vibrate([50, 50, 50]); // Double buzz
      speak(`${elevator.currentFloor}階です。`);
    }

    // Door Closing -> Announcement
    if (prevDoorState.current !== 'closing' && elevator.doorState === 'closing') {
      speak('ドアが閉まります。');
      vibrate(50);
    }

    prevDoorState.current = elevator.doorState;
  }, [elevator.doorState, elevator.currentFloor, playChime, speak, vibrate]);

  // Floor Announcement while moving (optional, maybe too noisy? Let's stick to arrival for now)
  // But we can add a small "click" or vibration when passing floors if we had fine-grained position.
  // Since we jump floors in the current logic, let's leave it for now.

  // Job Mode Logic
  useEffect(() => {
    if (mode !== 'job') return;

    // Spawn passenger if none exists and elevator is idle
    if (!passenger && elevator.direction === 'idle' && elevator.doorState === 'closed') {
      const timeout = setTimeout(() => {
        // Random floor that is NOT the current floor
        let spawnFloor = Math.floor(Math.random() * 10) + 1;
        while (spawnFloor === elevator.currentFloor) {
          spawnFloor = Math.floor(Math.random() * 10) + 1;
        }
        
        // Random target
        let target = Math.floor(Math.random() * 10) + 1;
        while (target === spawnFloor) {
          target = Math.floor(Math.random() * 10) + 1;
        }
        
        // Random Color
        const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        setPassenger({ targetFloor: target, currentFloor: elevator.currentFloor, color: randomColor });
        setFeedback('none');
        // Announce new passenger? "お客さんが待っています"
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [mode, passenger, elevator.direction, elevator.doorState, elevator.currentFloor]);

  // Check for success
  useEffect(() => {
    if (mode === 'job' && passenger && elevator.currentFloor === passenger.targetFloor && elevator.doorState === 'open') {
      setFeedback('success');
      setScore(s => s + 1);
      speak('ご利用ありがとうございます。');
      // Remove passenger after delay
      const timeout = setTimeout(() => {
        setPassenger(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [mode, passenger, elevator.currentFloor, elevator.doorState, speak]);

  // Wrappers for controls to add sound/haptics
  const handleFloorClick = (f: number) => {
    playBeep();
    vibrate(20);
    elevator.requestFloor(f);
  };

  const handleOpenClick = () => {
    playBeep();
    vibrate(20);
    elevator.openDoor();
  };

  const handleCloseClick = () => {
    playBeep();
    vibrate(20);
    elevator.closeDoor();
  };

  // --- Render Methods ---

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-full bg-amber-50 p-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="bg-blue-500 text-white p-4 rounded-2xl shadow-lg inline-block mb-4">
          <div className="flex gap-2 justify-center mb-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">エレベーター<br/>マスター</h1>
        </div>
        <p className="text-zinc-500 font-bold">ぼくのビルをうごかそう！</p>
      </div>

      <div className="grid gap-4 w-full max-w-sm">
        <button 
          onClick={() => { setMode('free'); speak('フリープレイモード'); }}
          className="bg-white border-4 border-teal-400 p-6 rounded-2xl shadow-md flex items-center gap-4 hover:bg-teal-50 transition-colors group"
        >
          <div className="bg-teal-100 p-3 rounded-full group-hover:scale-110 transition-transform">
            <Settings className="text-teal-600 w-8 h-8" />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-zinc-800">フリープレイ</h3>
            <p className="text-sm text-zinc-500">じゆうにあそぶ</p>
          </div>
        </button>

        <button 
          onClick={() => { setMode('job'); speak('お仕事モード'); }}
          className="bg-white border-4 border-orange-400 p-6 rounded-2xl shadow-md flex items-center gap-4 hover:bg-orange-50 transition-colors group"
        >
          <div className="bg-orange-100 p-3 rounded-full group-hover:scale-110 transition-transform">
            <Star className="text-orange-600 w-8 h-8" />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-zinc-800">おしごとモード</h3>
            <p className="text-sm text-zinc-500">お客さんをはこぶ</p>
          </div>
        </button>

        <button 
          onClick={() => { setMode('adventure'); speak('ぼうけんモード'); }}
          className="bg-white border-4 border-purple-400 p-6 rounded-2xl shadow-md flex items-center gap-4 hover:bg-purple-50 transition-colors group"
        >
          <div className="bg-purple-100 p-3 rounded-full group-hover:scale-110 transition-transform">
            <Book className="text-purple-600 w-8 h-8" />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-zinc-800">ぼうけんモード</h3>
            <p className="text-sm text-zinc-500">ミッションにちょうせん</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="flex flex-col h-full bg-zinc-100 relative overflow-hidden">
      {/* Header / Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => {
            setMode('menu');
            setPassenger(null);
            setScore(0);
          }}
          className="bg-white/80 backdrop-blur p-2 rounded-full shadow-md border-2 border-zinc-200 hover:bg-white"
        >
          <ArrowLeft className="w-6 h-6 text-zinc-600" />
        </button>
      </div>

      {/* Score Display for Job Mode */}
      {mode === 'job' && (
        <div className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md border-2 border-orange-200 flex items-center gap-2">
          <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
          <span className="font-bold text-xl text-orange-600">{score}</span>
        </div>
      )}

      {/* Top: Elevator View (expands to fill available space) */}
      <div className="flex-1 relative bg-zinc-800 flex flex-col items-center min-h-0">
        {/* Floor Indicator */}
        <div className="mt-4 w-full z-30">
          <FloorIndicator floor={elevator.currentFloor} direction={elevator.direction} />
        </div>

        {/* Elevator Shaft/Cabin */}
        <div className="relative w-full max-w-md flex-1 bg-amber-50 border-x-8 border-zinc-700 shadow-inner overflow-hidden mx-auto mb-0 rounded-t-lg transition-colors duration-1000">
          {/* Background Scene (Changes based on floor) */}
          <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient} transition-colors duration-1000 flex items-center justify-center`}>
             <span className="text-9xl font-bold text-white/20">{elevator.currentFloor}F</span>
          </div>

          {/* Passenger */}
          <AnimatePresence>
            {passenger && (
              <Passenger 
                targetFloor={passenger.targetFloor} 
                mood={feedback === 'success' ? 'happy' : 'waiting'}
                color={passenger.color}
              />
            )}
          </AnimatePresence>

          {/* Doors */}
          <ElevatorDoors 
            isOpen={elevator.doorState === 'open'} 
            isOpening={elevator.doorState === 'opening'}
            isClosing={elevator.doorState === 'closing'}
          />
        </div>
      </div>

      {/* Bottom: Controls (compact, auto-sized) */}
      <div className="shrink-0 z-40">
        <ControlPanel 
          currentFloor={elevator.currentFloor}
          doorState={elevator.doorState}
          queue={elevator.queue}
          onFloorClick={handleFloorClick}
          onOpenClick={handleOpenClick}
          onCloseClick={handleCloseClick}
        />
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-zinc-900 flex justify-center overflow-hidden font-sans select-none">
      <div className="w-full max-w-md h-full bg-white shadow-2xl relative">
        {mode === 'menu' ? renderMenu() : renderGame()}
      </div>
    </div>
  );
}
