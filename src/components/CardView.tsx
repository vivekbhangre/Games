import { Card, Suit, Rank } from '../types';
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
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

// Vector Suit SVG Icons with authentic card geometry
export function SuitIcon({ suit, className }: { suit: Suit; className?: string }) {
  switch (suit) {
    case '♠':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-full h-full", className)}>
          {/* Spades */}
          <path d="M12 2C10.2 5.5 5 9.8 5 14.5C5 17.5 7.4 19.8 10.2 19.8C11 19.8 11.6 19.5 12 19.2C12.4 19.5 13 19.8 13.8 19.8C16.6 19.8 19 17.5 19 14.5C19 9.8 13.8 5.5 12 2Z" />
          <path d="M10.5 18.5L9.5 22H14.5L13.5 18.5H10.5Z" />
        </svg>
      );
    case '♥':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-full h-full", className)}>
          {/* Hearts */}
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
        </svg>
      );
    case '♦':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-full h-full", className)}>
          {/* Diamonds */}
          <path d="M12 1.5L20.5 12L12 22.5L3.5 12L12 1.5Z" />
        </svg>
      );
    case '♣':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-full h-full", className)}>
          {/* Clubs */}
          <path d="M12 2C9.8 2 8 3.8 8 6C8 7.2 8.5 8.2 9.3 9C7.4 8.5 5 10 5 12.5C5 14.8 6.9 16.8 9.2 16.8C10.2 16.8 11.1 16.4 11.7 15.7L10.2 22H13.8L12.3 15.7C12.9 16.4 13.8 16.8 14.8 16.8C17.1 16.8 19 14.8 19 12.5C19 10 16.6 8.5 14.7 9C15.5 8.2 16 7.2 16 6C16 3.8 14.2 2 12 2Z" />
        </svg>
      );
  }
}

// Ornate Ace of Spades Medallion
function AceOfSpadesCenter() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-1">
      {/* Decorative filigree laurel & ring */}
      <svg viewBox="0 0 100 120" className="w-full h-full max-h-[75%] text-stone-900" fill="currentColor">
        {/* Outer Laurel Halo */}
        <ellipse cx="50" cy="58" rx="42" ry="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,3" opacity="0.3" />
        
        {/* Giant Ornate Spade */}
        <path d="M50 8C43 22 20 38 20 58C20 70 29 80 40 80C44 80 47 78 50 75C53 78 56 80 60 80C71 80 80 70 80 58C80 38 57 22 50 8Z" />
        <path d="M43 74L38 98H62L57 74H43Z" />
        
        {/* Internal Engraved Filigree */}
        <path d="M50 24C46 34 32 46 32 60C32 66 36 71 42 71C46 71 48 68 50 65C52 68 54 71 58 71C64 71 68 66 68 60C68 46 54 34 50 24Z" fill="#FFFFFF" opacity="0.95" />
        <circle cx="50" cy="52" r="5" fill="currentColor" />
        <path d="M46 64L50 56L54 64Z" fill="currentColor" />

        {/* Banner Ribbons */}
        <text x="50" y="112" textAnchor="middle" fontSize="10" fontWeight="900" letterSpacing="2" fill="currentColor" fontFamily="serif">
          SPADES
        </text>
      </svg>
    </div>
  );
}

// Classic Court Card Artwork (King, Queen, Jack)
function CourtCardCenter({ rank, suit }: { rank: Rank; suit: Suit }) {
  const isRed = suit === '♥' || suit === '♦';

  const title = rank === 'K' ? 'KING' : rank === 'Q' ? 'QUEEN' : 'JACK';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-0.5 sm:p-1">
      <div className="w-full h-full rounded border border-amber-600/30 bg-gradient-to-b from-amber-50 via-white to-amber-50 flex flex-col justify-between overflow-hidden relative shadow-inner">
        {/* Top Half Portrait */}
        <div className="flex-1 flex flex-col items-center justify-center pt-0.5">
          <div className="flex items-center gap-1">
            {/* Crown / Headdress */}
            {rank === 'K' && (
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-current">
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z" />
              </svg>
            )}
            {rank === 'Q' && (
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-current">
                <path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z" />
              </svg>
            )}
            {rank === 'J' && (
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-700 fill-current">
                <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12H12V2Z" opacity="0.6" />
                <path d="M12 4C14 4 16 6 16 8L12 11L8 8C8 6 10 4 12 4Z" />
              </svg>
            )}
          </div>

          <div className="text-[9px] sm:text-[11px] font-black font-serif tracking-wider text-stone-800 leading-none mt-0.5">
            {rank}
          </div>

          <div className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5", isRed ? "text-red-600" : "text-stone-900")}>
            <SuitIcon suit={suit} />
          </div>
        </div>

        {/* Divider Ribbon */}
        <div className="w-full h-1 sm:h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 border-y border-amber-600/40 flex items-center justify-center">
          <span className="text-[6px] tracking-widest uppercase font-mono font-bold text-amber-950 scale-75">
            {title}
          </span>
        </div>

        {/* Bottom Half Inverted Portrait */}
        <div className="flex-1 flex flex-col items-center justify-center pb-0.5 rotate-180">
          <div className="flex items-center gap-1">
            {rank === 'K' && (
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-current">
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z" />
              </svg>
            )}
            {rank === 'Q' && (
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-current">
                <path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z" />
              </svg>
            )}
            {rank === 'J' && (
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-700 fill-current">
                <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12H12V2Z" opacity="0.6" />
                <path d="M12 4C14 4 16 6 16 8L12 11L8 8C8 6 10 4 12 4Z" />
              </svg>
            )}
          </div>
          <div className="text-[9px] sm:text-[11px] font-black font-serif tracking-wider text-stone-800 leading-none mt-0.5">
            {rank}
          </div>
          <div className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5", isRed ? "text-red-600" : "text-stone-900")}>
            <SuitIcon suit={suit} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Authentic Standard Playing Card Pip Layouts for 2 through 10
function NumberCardPips({ rank, suit }: { rank: Rank; suit: Suit }) {
  const isRed = suit === '♥' || suit === '♦';
  const colorClass = isRed ? "text-red-600" : "text-stone-900";

  const count = parseInt(rank, 10);
  if (isNaN(count)) return null;

  // Grid coordinates: col is 1, 2, or 3; row is 1, 2, 3, 4, 5
  // col 1 = left, col 2 = center, col 3 = right
  // row 1 = top, row 2 = upper-mid, row 3 = center, row 4 = lower-mid, row 5 = bottom
  type Pip = { col: number; row: number; inverted?: boolean };

  const pipLayouts: Record<number, Pip[]> = {
    2: [
      { col: 2, row: 1 },
      { col: 2, row: 5, inverted: true }
    ],
    3: [
      { col: 2, row: 1 },
      { col: 2, row: 3 },
      { col: 2, row: 5, inverted: true }
    ],
    4: [
      { col: 1, row: 1 }, { col: 3, row: 1 },
      { col: 1, row: 5, inverted: true }, { col: 3, row: 5, inverted: true }
    ],
    5: [
      { col: 1, row: 1 }, { col: 3, row: 1 },
      { col: 2, row: 3 },
      { col: 1, row: 5, inverted: true }, { col: 3, row: 5, inverted: true }
    ],
    6: [
      { col: 1, row: 1 }, { col: 3, row: 1 },
      { col: 1, row: 3 }, { col: 3, row: 3 },
      { col: 1, row: 5, inverted: true }, { col: 3, row: 5, inverted: true }
    ],
    7: [
      { col: 1, row: 1 }, { col: 3, row: 1 },
      { col: 2, row: 2 },
      { col: 1, row: 3 }, { col: 3, row: 3 },
      { col: 1, row: 5, inverted: true }, { col: 3, row: 5, inverted: true }
    ],
    8: [
      { col: 1, row: 1 }, { col: 3, row: 1 },
      { col: 2, row: 2 },
      { col: 1, row: 3 }, { col: 3, row: 3 },
      { col: 2, row: 4, inverted: true },
      { col: 1, row: 5, inverted: true }, { col: 3, row: 5, inverted: true }
    ],
    9: [
      { col: 1, row: 1 }, { col: 3, row: 1 },
      { col: 1, row: 2 }, { col: 3, row: 2 },
      { col: 2, row: 3 },
      { col: 1, row: 4, inverted: true }, { col: 3, row: 4, inverted: true },
      { col: 1, row: 5, inverted: true }, { col: 3, row: 5, inverted: true }
    ],
    10: [
      { col: 1, row: 1 }, { col: 3, row: 1 },
      { col: 2, row: 2 },
      { col: 1, row: 2 }, { col: 3, row: 2 },
      { col: 1, row: 4, inverted: true }, { col: 3, row: 4, inverted: true },
      { col: 2, row: 4, inverted: true },
      { col: 1, row: 5, inverted: true }, { col: 3, row: 5, inverted: true }
    ]
  };

  const pips = pipLayouts[count] || [];

  return (
    <div className="relative w-full h-full px-2 py-1">
      {pips.map((pip, idx) => {
        // Calculate percentages
        const leftPercent = pip.col === 1 ? 18 : pip.col === 2 ? 50 : 82;
        const topPercent = 
          pip.row === 1 ? 14 :
          pip.row === 2 ? 32 :
          pip.row === 3 ? 50 :
          pip.row === 4 ? 68 : 86;

        return (
          <div
            key={idx}
            className={cn(
              "absolute w-3 h-3 sm:w-3.5 sm:h-3.5 -translate-x-1/2 -translate-y-1/2",
              colorClass,
              pip.inverted && "rotate-180"
            )}
            style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
          >
            <SuitIcon suit={suit} />
          </div>
        );
      })}
    </div>
  );
}

export default function CardView({ 
  card, 
  playable = false, 
  isIllegal = false, 
  onClick, 
  className, 
  overlap, 
  hidden,
  size = 'md' 
}: CardViewProps) {
  const isRed = card.suit === '♥' || card.suit === '♦';

  const sizeClasses = {
    xs: "w-8 h-12 rounded-md text-[10px]",
    sm: "w-12 h-17 sm:w-14 sm:h-20 rounded-lg text-xs",
    md: "w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-xl text-xs sm:text-sm",
    lg: "w-18 h-26 sm:w-22 sm:h-32 md:w-26 md:h-36 rounded-xl text-sm sm:text-base"
  };

  // Card Back: Traditional Bicycle-Style Medallion & Scroll Filigree Pattern
  if (hidden) {
    return (
      <div 
        className={cn(
          "relative border border-stone-300 dark:border-stone-500 shadow-md flex items-center justify-center select-none bg-white p-1 sm:p-1.5 overflow-hidden shrink-0",
          sizeClasses[size],
          overlap && "-ml-5 sm:-ml-7 md:-ml-9",
          className
        )}
      >
        {/* Navy/Crimson Filigree Card Back Pattern */}
        <div className="w-full h-full rounded border border-blue-900 bg-[#16274a] relative overflow-hidden flex items-center justify-center">
          {/* Intricate Filigree Grid Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:6px_6px] opacity-15" />
          
          {/* Inner Double Line Border */}
          <div className="absolute inset-1 border border-white/20 rounded" />
          
          {/* Central Symmetrical Spades Crest */}
          <div className="relative w-5 h-5 sm:w-7 sm:h-7 rounded-full border border-amber-300/50 bg-[#0f1b33] flex items-center justify-center shadow-inner">
            <span className="text-amber-300 text-xs sm:text-sm">♠</span>
          </div>
        </div>
      </div>
    );
  }

  const isAce = card.rank === 'A';
  const isCourt = card.rank === 'K' || card.rank === 'Q' || card.rank === 'J';
  const isAceOfSpades = isAce && card.suit === '♠';

  return (
    <motion.div
      whileHover={playable ? { y: -8, scale: 1.04 } : {}}
      whileTap={playable ? { scale: 0.96 } : {}}
      onClick={() => onClick?.()}
      className={cn(
        "relative shadow-md flex flex-col justify-between bg-white text-stone-900 select-none transition-all shrink-0 touch-manipulation overflow-hidden border border-stone-300/90",
        sizeClasses[size],
        overlap && "-ml-5 sm:-ml-7 md:-ml-9 hover:z-20",
        isIllegal && "opacity-40 brightness-75 cursor-not-allowed",
        playable && "cursor-pointer ring-2 ring-amber-400 shadow-amber-400/30 z-10 hover:z-30 hover:ring-amber-500 hover:shadow-xl",
        !playable && !isIllegal && onClick && "cursor-pointer",
        className
      )}
    >
      {/* Delicate Inner Hairline Frame (Authentic Playing Card Border) */}
      <div className="absolute inset-1 pointer-events-none rounded border border-stone-200/80" />

      {/* Top Left Corner Index */}
      <div className={cn(
        "absolute top-1 left-1 sm:top-1.5 sm:left-1.5 flex flex-col items-center leading-none z-10",
        isRed ? "text-red-600" : "text-stone-950"
      )}>
        <span className="font-serif font-black tracking-tighter text-xs sm:text-sm md:text-base leading-none">
          {card.rank}
        </span>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5">
          <SuitIcon suit={card.suit} />
        </div>
      </div>

      {/* Center Zone: Face Artwork, Pip Grid, or Ace Emblem */}
      <div className="flex-1 w-full h-full flex items-center justify-center z-0">
        {isAceOfSpades ? (
          <AceOfSpadesCenter />
        ) : isAce ? (
          <div className={cn("w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12", isRed ? "text-red-600" : "text-stone-950")}>
            <SuitIcon suit={card.suit} />
          </div>
        ) : isCourt ? (
          <CourtCardCenter rank={card.rank} suit={card.suit} />
        ) : (
          <NumberCardPips rank={card.rank} suit={card.suit} />
        )}
      </div>

      {/* Bottom Right Corner Index (Inverted) */}
      <div className={cn(
        "absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 flex flex-col items-center leading-none rotate-180 z-10",
        isRed ? "text-red-600" : "text-stone-950"
      )}>
        <span className="font-serif font-black tracking-tighter text-xs sm:text-sm md:text-base leading-none">
          {card.rank}
        </span>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5">
          <SuitIcon suit={card.suit} />
        </div>
      </div>
    </motion.div>
  );
}
