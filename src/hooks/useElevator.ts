import { useState, useEffect, useCallback } from 'react';

export type DoorState = 'closed' | 'opening' | 'open' | 'closing';
export type Direction = 'up' | 'down' | 'idle';

interface ElevatorState {
  currentFloor: number;
  doorState: DoorState;
  direction: Direction;
  queue: number[];
  isMoving: boolean;
}

const FLOOR_HEIGHT = 100; // Virtual height unit per floor
const SPEED_PER_FLOOR = 1000; // ms to travel one floor
const DOOR_TIME = 1000; // ms to open/close
const WAIT_TIME = 2000; // ms to wait at a floor

export const useElevator = (minFloor: number = 1, maxFloor: number = 10) => {
  const [state, setState] = useState<ElevatorState>({
    currentFloor: 1,
    doorState: 'closed',
    direction: 'idle',
    queue: [],
    isMoving: false,
  });

  // Helper to add a floor to the queue
  const requestFloor = useCallback((floor: number) => {
    setState((prev) => {
      if (prev.queue.includes(floor) || floor === prev.currentFloor && prev.doorState === 'open') {
        return prev;
      }
      // Simple queue logic: just add to end for now, can be optimized for "elevator algorithm" later
      // For a kids game, FIFO or simple proximity might be less confusing than real elevator logic
      // But let's try to be slightly smart: sort based on current direction?
      // For now, simple append is easiest to understand for "I pressed 5, it goes to 5".
      return { ...prev, queue: [...prev.queue, floor] };
    });
  }, []);

  const openDoor = useCallback(() => {
    setState(prev => {
      if (prev.isMoving) return prev;
      if (prev.doorState === 'open' || prev.doorState === 'opening') return prev;
      return { ...prev, doorState: 'opening' };
    });
  }, []);

  const closeDoor = useCallback(() => {
    setState(prev => {
      if (prev.isMoving) return prev;
      if (prev.doorState === 'closed' || prev.doorState === 'closing') return prev;
      return { ...prev, doorState: 'closing' };
    });
  }, []);

  // Main Loop
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const processLoop = async () => {
      const { currentFloor, doorState, queue, isMoving, direction } = state;

      // 1. Handle Door Animations
      if (doorState === 'opening') {
        timeoutId = setTimeout(() => {
          setState(prev => ({ ...prev, doorState: 'open' }));
        }, DOOR_TIME);
        return;
      }
      if (doorState === 'closing') {
        timeoutId = setTimeout(() => {
          setState(prev => ({ ...prev, doorState: 'closed' }));
        }, DOOR_TIME);
        return;
      }

      // 2. Handle Arrival at Target
      if (doorState === 'open') {
        // If we are at a requested floor, remove it from queue
        if (queue.includes(currentFloor)) {
           setState(prev => ({ ...prev, queue: prev.queue.filter(f => f !== currentFloor) }));
        }
        
        // Auto close after wait
        timeoutId = setTimeout(() => {
          setState(prev => ({ ...prev, doorState: 'closing' }));
        }, WAIT_TIME);
        return;
      }

      // 3. Handle Movement Decisions
      if (doorState === 'closed' && !isMoving) {
        if (queue.length > 0) {
          const nextFloor = queue[0]; // Simple FIFO for now
          
          if (nextFloor === currentFloor) {
            // We are here, open door
            setState(prev => ({ ...prev, doorState: 'opening', queue: prev.queue.filter(f => f !== currentFloor) }));
          } else {
            // Start moving
            const newDirection = nextFloor > currentFloor ? 'up' : 'down';
            setState(prev => ({ ...prev, isMoving: true, direction: newDirection }));
          }
        } else {
            if (direction !== 'idle') {
                 setState(prev => ({ ...prev, direction: 'idle' }));
            }
        }
        return;
      }

      // 4. Handle Physical Movement
      if (isMoving) {
        // This is a simplified discrete movement. 
        // For smooth animation, we might want to use CSS transitions and just update the "logical" floor when arrived.
        // However, to update the indicator number one by one:
        
        timeoutId = setTimeout(() => {
          setState(prev => {
            const nextFloor = prev.queue[0];
            if (nextFloor === undefined) return { ...prev, isMoving: false, direction: 'idle' };

            let newFloor = prev.currentFloor;
            if (prev.currentFloor < nextFloor) newFloor++;
            else if (prev.currentFloor > nextFloor) newFloor--;

            const arrived = newFloor === nextFloor;
            
            return {
              ...prev,
              currentFloor: newFloor,
              isMoving: !arrived,
              direction: arrived ? 'idle' : prev.direction,
              doorState: arrived ? 'opening' : 'closed', // Auto open on arrival
              // Remove from queue if arrived
              queue: arrived ? prev.queue.filter(f => f !== newFloor) : prev.queue
            };
          });
        }, SPEED_PER_FLOOR);
      }
    };

    processLoop();

    return () => clearTimeout(timeoutId);
  }, [state]);

  return {
    ...state,
    requestFloor,
    openDoor,
    closeDoor,
  };
};
