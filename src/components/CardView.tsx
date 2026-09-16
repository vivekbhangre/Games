import { Card } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface CardViewProps {
  card: Card;
  playable?: boolean;
  isIllegal?: boolean;
  onClick?: () => void;
  className?: string;
  overlap?: boolean;
  hidden?: boolean;
}

export default function CardView({ card, playable = false, isIllegal = false, onClick, className, overlap, hidden }: CardViewProps) {
  const isRed = card.suit === '♥' || card.suit === '♦';

  if (hidden) {
    return (
      <div 
        className={cn(
          "relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-xl border-2 border-stone-200 dark:border-stone-400 shadow-md flex items-center justify-center select-none bg-indigo-800 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-700 via-indigo-900 to-black overflow-hidden",
          overlap && "-ml-8 sm:-ml-10 md:-ml-12",
          className
        )}
      >
        <div className="absolute inset-2 border border-white/20 rounded-md bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)]"></div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={playable ? { y: -10, scale: 1.05 } : {}}
      whileTap={playable ? { scale: 0.95 } : {}}
      onClick={() => onClick?.()}
      className={cn(
        "relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-xl border-2 border-stone-200 dark:border-stone-600 shadow-lg flex flex-col justify-between p-1.5 sm:p-2 bg-white dark:bg-stone-800 select-none transition-opacity",
        isRed ? "text-red-600 dark:text-red-400" : "text-stone-900 dark:text-white",
        overlap && "-ml-6 sm:-ml-8 md:-ml-12 hover:z-10",
        isIllegal && "opacity-40 brightness-75 cursor-not-allowed",
        playable && "cursor-pointer shadow-xl hover:shadow-2xl z-0 hover:z-20",
        !playable && !isIllegal && onClick && "cursor-pointer",
        className
      )}
    >
      {/* Top Left */}
      <div className="flex flex-col items-center leading-none w-4 sm:w-5">
        <span className="text-base sm:text-lg md:text-2xl font-bold tracking-tighter">{card.rank}</span>
        <span className="text-sm sm:text-base md:text-lg">{card.suit}</span>
      </div>

      {/* Center Large Suit (optional for style) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
        <span className="text-5xl sm:text-6xl md:text-7xl">{card.suit}</span>
      </div>

      {/* Bottom Right */}
      <div className="flex flex-col items-center leading-none w-4 sm:w-5 absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 rotate-180">
        <span className="text-base sm:text-lg md:text-2xl font-bold tracking-tighter">{card.rank}</span>
        <span className="text-sm sm:text-base md:text-lg">{card.suit}</span>
      </div>
    </motion.div>
  );
}
