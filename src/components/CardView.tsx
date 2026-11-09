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

// Vector Suit SVG Icons with authentic playing card geometry
export function SuitIcon({ suit, className }: { suit: Suit; className?: string }) {
  switch (suit) {
    case '♠':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-full h-full", className)}>
          {/* Authentic Spades */}
          <path d="M12 2C10.2 5.5 5 9.8 5 14.5C5 17.5 7.4 19.8 10.2 19.8C11 19.8 11.6 19.5 12 19.2C12.4 19.5 13 19.8 13.8 19.8C16.6 19.8 19 17.5 19 14.5C19 9.8 13.8 5.5 12 2Z" />
          <path d="M10.5 18.5L9.5 22H14.5L13.5 18.5H10.5Z" />
        </svg>
      );
    case '♥':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-full h-full", className)}>
          {/* Authentic Hearts */}
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
        </svg>
      );
    case '♦':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-full h-full", className)}>
          {/* Authentic Diamonds */}
          <path d="M12 1.5L20.5 12L12 22.5L3.5 12L12 1.5Z" />
        </svg>
      );
    case '♣':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-full h-full", className)}>
          {/* Authentic Clubs */}
          <path d="M12 2C9.8 2 8 3.8 8 6C8 7.2 8.5 8.2 9.3 9C7.4 8.5 5 10 5 12.5C5 14.8 6.9 16.8 9.2 16.8C10.2 16.8 11.1 16.4 11.7 15.7L10.2 22H13.8L12.3 15.7C12.9 16.4 13.8 16.8 14.8 16.8C17.1 16.8 19 14.8 19 12.5C19 10 16.6 8.5 14.7 9C15.5 8.2 16 7.2 16 6C16 3.8 14.2 2 12 2Z" />
        </svg>
      );
  }
}

// Iconic Ornate Ace of Spades Center (Contained strictly in the center)
function AceOfSpadesCenter() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-2 pointer-events-none">
      <svg viewBox="0 0 100 120" className="w-8 h-10 sm:w-11 sm:h-13 md:w-13 md:h-16 text-stone-950" fill="currentColor">
        {/* Subtle decorative outer ring */}
        <ellipse cx="50" cy="55" rx="38" ry="42" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" opacity="0.25" />
        
        {/* Large Central Spade */}
        <path d="M50 12C43 25 22 40 22 58C22 69 30 77 40 77C44 77 47 75 50 72C53 75 56 77 60 77C70 77 78 69 78 58C78 40 57 25 50 12Z" />
        <path d="M43 72L39 92H61L57 72H43Z" />
        
        {/* Inner Engraved Cutout */}
        <path d="M50 26C46 36 34 47 34 59C34 65 38 69 43 69C46 69 48 66 50 63C52 66 54 69 57 69C62 69 66 65 66 59C66 47 54 36 50 26Z" fill="#FFFFFF" opacity="0.95" />
        <circle cx="50" cy="52" r="4.5" fill="currentColor" />

        {/* Traditional SPADES brand kicker */}
        <text x="50" y="106" textAnchor="middle" fontSize="9" fontWeight="900" letterSpacing="2.5" fill="currentColor" fontFamily="serif">
          SPADES
        </text>
      </svg>
    </div>
  );
}

// Authentic Court Card Artwork (King, Queen, Jack)
// Inset inside a dedicated inner box so it never collides with corner rank/suit
function CourtCardCenter({ rank, suit }: { rank: Rank; suit: Suit }) {
  const isRed = suit === '♥' || suit === '♦';
  const suitColor = isRed ? "text-[#c41e3a]" : "text-stone-950";

  return (
    <div className="absolute inset-x-2.5 inset-y-2 sm:inset-x-3 sm:inset-y-2.5 rounded border border-amber-900/20 bg-stone-50/90 dark:bg-stone-50/90 flex flex-col justify-between overflow-hidden shadow-xs pointer-events-none">
      
      {/* Top Portrait */}
      <div className="flex-1 flex flex-col items-center justify-center pt-0.5">
        <div className="flex items-center justify-center">
          {rank === 'K' && (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 fill-current">
              <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z" />
            </svg>
          )}
          {rank === 'Q' && (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 fill-current">
              <path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z" />
            </svg>
          )}
          {rank === 'J' && (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-700 fill-current">
              <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12H12V2Z" opacity="0.7" />
              <path d="M12 4C14 4 16 6 16 8L12 11L8 8C8 6 10 4 12 4Z" />
            </svg>
          )}
        </div>
        <div className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5", suitColor)}>
          <SuitIcon suit={suit} />
        </div>
      </div>

      {/* Symmetrical Waist Divider Ribbon */}
      <div className="w-full h-1 bg-gradient-to-r from-amber-400/40 via-amber-500/80 to-amber-400/40 border-y border-amber-600/30 flex items-center justify-center">
        <span className="text-[6px] tracking-widest font-serif font-black text-amber-950 uppercase leading-none">
          {rank}
        </span>
      </div>

      {/* Bottom Inverted Portrait */}
      <div className="flex-1 flex flex-col items-center justify-center pb-0.5 rotate-180">
        <div className="flex items-center justify-center">
          {rank === 'K' && (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 fill-current">
              <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z" />
            </svg>
          )}
          {rank === 'Q' && (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 fill-current">
              <path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z" />
            </svg>
          )}
          {rank === 'J' && (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-700 fill-current">
              <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12H12V2Z" opacity="0.7" />
              <path d="M12 4C14 4 16 6 16 8L12 11L8 8C8 6 10 4 12 4Z" />
            </svg>
          )}
        </div>
        <div className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5", suitColor)}>
          <SuitIcon suit={suit} />
        </div>
      </div>

    </div>
  );
}

// Authentic Standard Playing Card Pip Layouts for 2 through 10
// Confined strictly within an inset center box so pips NEVER touch or overlap corner indices!
function NumberCardPips({ rank, suit }: { rank: Rank; suit: Suit }) {
  const isRed = suit === '♥' || suit === '♦';
  const colorClass = isRed ? "text-[#c41e3a]" : "text-stone-950";

  const count = parseInt(rank, 10);
  if (isNaN(count)) return null;

  // Standard Playing Card Grid (percentages within the inset inner canvas):
  // Column 1 (Left): 22%
  // Column 2 (Center): 50%
  // Column 3 (Right): 78%
  // Row 1 (Top): 16%
  // Row 2 (Upper-Mid): 33%
  // Row 3 (Center): 50%
  // Row 4 (Lower-Mid): 67%
  // Row 5 (Bottom): 84%
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
    <div className="absolute inset-x-2.5 inset-y-2.5 sm:inset-x-3 sm:inset-y-3 pointer-events-none">
      {pips.map((pip, idx) => {
        const leftPercent = pip.col === 1 ? 22 : pip.col === 2 ? 50 : 78;
        const topPercent = 
          pip.row === 1 ? 16 :
          pip.row === 2 ? 33 :
          pip.row === 3 ? 50 :
          pip.row === 4 ? 67 : 84;

        return (
          <div
            key={idx}
            className={cn(
              "absolute w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 -translate-x-1/2 -translate-y-1/2 transition-opacity",
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
        <div className="w-full h-full rounded border border-blue-900 bg-[#16274a] relative overflow-hidden flex items-center justify-center shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:6px_6px] opacity-15" />
          <div className="absolute inset-1 border border-white/20 rounded" />
          <div className="relative w-5 h-5 sm:w-7 sm:h-7 rounded-full border border-amber-300/50 bg-[#0f1b33] flex items-center justify-center shadow-inner">
            <span className="text-amber-300 text-xs sm:text-sm font-bold">♠</span>
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
      whileHover={playable ? { y: -10, scale: 1.05 } : {}}
      whileTap={playable ? { scale: 0.95 } : {}}
      onClick={() => onClick?.()}
      className={cn(
        "relative shadow-sm flex flex-col justify-between bg-white text-stone-900 select-none transition-all duration-150 shrink-0 touch-manipulation overflow-hidden border border-stone-300/95 dark:border-stone-400",
        sizeClasses[size],
        overlap && "-ml-5 sm:-ml-7 md:-ml-9 hover:z-30",
        isIllegal && "opacity-40 grayscale-[25%] cursor-not-allowed",
        // Clean authentic playable state: elevated, soft amber accent, without thick ugly multi-rings
        playable && "cursor-pointer hover:shadow-xl hover:border-amber-400 -translate-y-1 sm:-translate-y-2 z-10 hover:z-40",
        !playable && !isIllegal && onClick && "cursor-pointer",
        className
      )}
    >
      {/* Sleek Golden Active Indicator Bar at the Top Edge for Playable Cards */}
      {playable && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 z-20 pointer-events-none" />
      )}

      {/* Traditional Playing Card Hairline Border */}
      <div className="absolute inset-0.5 pointer-events-none rounded border border-stone-200/70" />

      {/* TOP LEFT CORNER INDEX (Clean, Isolated, Bold, High Contrast) */}
      <div className={cn(
        "absolute top-1 left-1.5 sm:top-1.5 sm:left-2 flex flex-col items-center leading-none z-20 pointer-events-none",
        isRed ? "text-[#c41e3a]" : "text-stone-950"
      )}>
        <span className="font-serif font-black tracking-tighter text-xs sm:text-sm md:text-base leading-none">
          {card.rank}
        </span>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 mt-0.5">
          <SuitIcon suit={card.suit} />
        </div>
      </div>

      {/* CENTER ZONE: Ace Artwork, Inset Court Frame, or Grid Pips */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center z-10">
        {isAceOfSpades ? (
          <AceOfSpadesCenter />
        ) : isAce ? (
          <div className={cn("w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10", isRed ? "text-[#c41e3a]" : "text-stone-950")}>
            <SuitIcon suit={card.suit} />
          </div>
        ) : isCourt ? (
          <CourtCardCenter rank={card.rank} suit={card.suit} />
        ) : (
          <NumberCardPips rank={card.rank} suit={card.suit} />
        )}
      </div>

      {/* BOTTOM RIGHT CORNER INDEX (Inverted) */}
      <div className={cn(
        "absolute bottom-1 right-1.5 sm:bottom-1.5 sm:right-2 flex flex-col items-center leading-none rotate-180 z-20 pointer-events-none",
        isRed ? "text-[#c41e3a]" : "text-stone-950"
      )}>
        <span className="font-serif font-black tracking-tighter text-xs sm:text-sm md:text-base leading-none">
          {card.rank}
        </span>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 mt-0.5">
          <SuitIcon suit={card.suit} />
        </div>
      </div>
    </motion.div>
  );
}
