/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Settings2,
  Zap
} from 'lucide-react';

// Constants
const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;
const MIN_SPEED = 60;

type Point = { x: number; y: number };

export default function App() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  const lastDirection = useRef<Point>(INITIAL_DIRECTION);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('snake-high-score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-high-score', score.toString());
    }
  }, [score, highScore]);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some(
        segment => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y,
      };

      // Collision Detection: Walls
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setIsGameOver(true);
        return prevSnake;
      }

      // Collision Detection: Self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
      } else {
        newSnake.pop();
      }

      lastDirection.current = direction;
      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // We check lastDirection.current instead of direction to prevent self-collision on rapid key presses
      switch (key) {
        case 'arrowup':
        case 'w':
          if (lastDirection.current.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'arrowdown':
        case 's':
          if (lastDirection.current.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'arrowleft':
        case 'a':
          if (lastDirection.current.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'arrowright':
        case 'd':
          if (lastDirection.current.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, speed]);

  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    lastDirection.current = INITIAL_DIRECTION;
    setFood({ x: 5, y: 5 });
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
  };

  // Helper to get eye position based on direction
  const getEyesStyle = (dir: Point) => {
    if (dir.y === -1) return "flex-row top-1 left-0 right-0 justify-around"; // Up
    if (dir.y === 1) return "flex-row bottom-1 left-0 right-0 justify-around"; // Down
    if (dir.x === -1) return "flex-col left-1 top-0 bottom-0 justify-around"; // Left
    if (dir.x === 1) return "flex-col right-1 top-0 bottom-0 justify-around"; // Right
    return "flex-row top-1 left-0 right-0 justify-around";
  };

  return (
    <div className="min-h-screen bg-arcade-gold font-sans select-none overflow-auto flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-5xl bg-white border-6 border-black rounded-[30px] shadow-[16px_16px_0px_0px_#000] p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12"
      >
        
        {/* Left Panel: Info & Stats */}
        <div className="flex-1 flex flex-col justify-between space-y-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-black">
              SNAKE<br />ARCADE
            </h1>
            <div className="h-2 w-24 bg-arcade-red my-4 border-2 border-black"></div>
            <h2 className="text-xl md:text-2xl font-extrabold uppercase text-black tracking-tight">
              Don't bite your tail!
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-arcade-green border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_#000] transition-transform hover:-translate-y-1">
              <p className="text-[10px] font-black uppercase text-black mb-1 opacity-70">Points</p>
              <p className="text-3xl font-black text-black leading-none">{score.toLocaleString()}</p>
            </div>
            <div className="bg-arcade-blue border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_#000] transition-transform hover:-translate-y-1">
              <p className="text-[10px] font-black uppercase text-black mb-1 opacity-70">Best</p>
              <p className="text-3xl font-black text-black leading-none">{highScore.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-arcade-orange border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0px_0px_#000] relative overflow-hidden group">
            <div className="absolute -bottom-2 -right-2 p-2 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110">
              <Settings2 size={80} className="text-black" />
            </div>
            <p className="text-xs font-black uppercase text-black mb-3">Joystick Guide</p>
            <div className="font-bold flex flex-wrap gap-x-4 gap-y-3 text-black text-sm">
              <span className="flex items-center gap-2">
                <span className="bg-white border-2 border-black w-7 h-7 flex items-center justify-center rounded-md font-black">W</span>
                <span className="bg-white border-2 border-black w-7 h-7 flex items-center justify-center rounded-md font-black"><ChevronUp size={14}/></span>
              </span>
              <span className="flex items-center gap-2">
                <span className="bg-white border-2 border-black w-7 h-7 flex items-center justify-center rounded-md font-black">S</span>
                <span className="bg-white border-2 border-black w-7 h-7 flex items-center justify-center rounded-md font-black"><ChevronDown size={14}/></span>
              </span>
              <span className="flex items-center gap-2">
                <span className="bg-white border-2 border-black w-7 h-7 flex items-center justify-center rounded-md font-black">A</span>
                <span className="bg-white border-2 border-black w-7 h-7 flex items-center justify-center rounded-md font-black"><ChevronLeft size={14}/></span>
              </span>
              <span className="flex items-center gap-2">
                <span className="bg-white border-2 border-black w-7 h-7 flex items-center justify-center rounded-md font-black">D</span>
                <span className="bg-white border-2 border-black w-7 h-7 flex items-center justify-center rounded-md font-black"><ChevronRight size={14}/></span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Game Board */}
        <div className="bg-[#111] border-6 border-black rounded-2xl relative overflow-hidden flex-shrink-0 aspect-square w-full max-w-[480px] shadow-inner">
          <div 
            id="game-board"
            className="w-full h-full relative"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%` }}></div>

            {/* Food */}
            <motion.div
              key={`food-${food.x}-${food.y}`}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="absolute border-2 border-black z-10"
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(food.x / GRID_SIZE) * 100}%`,
                top: `${(food.y / GRID_SIZE) * 100}%`,
                backgroundColor: '#FF5E5E',
                borderRadius: '50%',
              }}
            >
              <div className="absolute top-[20%] left-[20%] w-[20%] h-[20%] bg-white/40 rounded-full"></div>
            </motion.div>

            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={`${index}-${segment.x}-${segment.y}`}
                className="absolute border-[1px] md:border-2 border-black"
                style={{
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                  left: `${(segment.x / GRID_SIZE) * 100}%`,
                  top: `${(segment.y / GRID_SIZE) * 100}%`,
                  backgroundColor: index === 0 ? '#50C878' : '#3E9B5D',
                  borderRadius: index === 0 ? '6px' : index === snake.length - 1 ? '10px' : '2px',
                  zIndex: snake.length - index,
                  boxShadow: index === 0 ? '0 0 10px rgba(80, 200, 120, 0.4)' : 'none',
                }}
              >
                {/* Eyes on Head */}
                {index === 0 && (
                  <div className={`absolute flex ${getEyesStyle(direction)} p-[1px]`}>
                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                    </div>
                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Overlays */}
            <AnimatePresence>
              {(isGameOver || isPaused) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 text-center p-6 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {isGameOver ? (
                      <div>
                        <h2 className="text-6xl font-black italic tracking-tighter text-arcade-red mb-2 drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
                          GAME OVER
                        </h2>
                        <p className="text-white font-black uppercase opacity-60">Score: {score}</p>
                      </div>
                    ) : (
                      <h2 className="text-6xl font-black italic tracking-tighter text-arcade-green mb-2 drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
                        PAUSED
                      </h2>
                    )}
                    
                    <button
                      onClick={isGameOver ? restartGame : () => setIsPaused(false)}
                      className="group relative bg-arcade-red border-4 border-white text-white px-10 py-4 rounded-full font-black text-2xl shadow-[0_0_40px_rgba(255,94,94,0.3)] hover:bg-white hover:text-arcade-red transition-all active:scale-95 flex items-center gap-3 mx-auto"
                    >
                      {isGameOver ? <RotateCcw size={28} /> : <Play size={28} />}
                      {isGameOver ? 'INSERT COIN / START' : 'RESUME'}
                    </button>

                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                      {isGameOver ? 'Click to play again' : 'Press SPACE to return'}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Mobile Controls Overlay (Bottom) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 grid grid-cols-3 gap-3 md:hidden z-10">
        <div />
        <ControlButton icon={<ChevronUp />} onClick={() => lastDirection.current.y !== 1 && setDirection({ x: 0, y: -1 })} />
        <div />
        <ControlButton icon={<ChevronLeft />} onClick={() => lastDirection.current.x !== 1 && setDirection({ x: -1, y: 0 })} />
        <ControlButton icon={<Pause />} onClick={() => setIsPaused(p => !p)} className="bg-arcade-orange/20 text-arcade-orange border-arcade-orange/40" />
        <ControlButton icon={<ChevronRight />} onClick={() => lastDirection.current.x !== -1 && setDirection({ x: 1, y: 0 })} />
        <div />
        <ControlButton icon={<ChevronDown />} onClick={() => lastDirection.current.y !== -1 && setDirection({ x: 0, y: 1 })} />
        <div />
      </div>
    </div>
  );
}

function ControlButton({ 
  icon, 
  onClick, 
  className = "" 
}: { 
  icon: React.ReactNode; 
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 flex items-center justify-center bg-white/5 border border-white/20 rounded-xl active:scale-90 active:bg-white/20 transition-all ${className}`}
    >
      {icon}
    </button>
  );
}
