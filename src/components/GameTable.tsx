import { useState, useMemo, useEffect } from 'react';
import { ClientGameState, Card } from '../types';
import CardView from './CardView';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, RotateCcw, Trophy, Menu, ListOrdered, BookOpen, MessageSquare } from 'lucide-react';
import Scoreboard from './Scoreboard';
import RulesModal from './RulesModal';
import ChatBox from './ChatBox';
import ThemeToggle from './ThemeToggle';

interface GameTableProps {
  gameState: ClientGameState;
  socketId: string;
  onPlayCard: (cardId: string) => void;
  onPause: () => void;
  onReset: () => void;
  onSendMessage: (text: string) => void;
}

export default function GameTable({ gameState, socketId, onPlayCard, onPause, onReset, onSendMessage }: GameTableProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastTrickWinner, setLastTrickWinner] = useState<string | null>(null);
  const [trickPointsFlash, setTrickPointsFlash] = useState<number | null>(null);

  const me = gameState.players.find(p => p.id === socketId);
  const isSpectator = !me && gameState.spectators?.some(s => s.id === socketId);
  const isHost = gameState.hostId === socketId;
  
  useEffect(() => {
    if (gameState.trickWinner) {
      setLastTrickWinner(gameState.trickWinner);
      // Calculate trick points won
      const pts = gameState.currentTrick.reduce((acc, played) => acc + played.card.value, 0);
      setTrickPointsFlash(pts);
    } else {
      setTrickPointsFlash(null);
    }
  }, [gameState.trickWinner, gameState.currentTrick]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const isMyTurn = gameState.currentTurn === socketId;

  // Derive opponents
  const opponents = useMemo(() => {
    if (isSpectator) return gameState.players;
    const myIndex = gameState.players.findIndex(p => p.id === socketId);
    if (myIndex === -1) return gameState.players;
    const ordered = [];
    for (let i = 1; i < gameState.players.length; i++) {
      ordered.push(gameState.players[(myIndex + i) % gameState.players.length]);
    }
    return ordered;
  }, [gameState.players, socketId, isSpectator]);

  const canPlay = (card: Card) => {
    if (!isMyTurn || gameState.status !== 'playing') return false;
    if (!gameState.leadSuit) return true;
    
    const hasLeadSuit = gameState.hand.some(c => c.suit === gameState.leadSuit);
    if (hasLeadSuit && card.suit !== gameState.leadSuit) return false;
    
    return true;
  };
  
  const handleCardClick = (card: Card) => {
    if (!isMyTurn) {
      setToast("It's not your turn!");
      return;
    }
    if (gameState.status !== 'playing') return;
    
    if (canPlay(card)) {
      onPlayCard(card.id);
    } else {
      const suitName = gameState.leadSuit === '♠' ? 'Spades' : gameState.leadSuit === '♥' ? 'Hearts' : gameState.leadSuit === '♦' ? 'Diamonds' : 'Clubs';
      setToast(`You must follow ${gameState.leadSuit} ${suitName}.`);
    }
  };

  const getHandOverlapClass = (handLength: number, index: number) => {
    if (index === 0) return "ml-0";
    if (handLength > 9) return "-ml-5 sm:-ml-7 md:-ml-9";
    if (handLength > 5) return "-ml-3 sm:-ml-5 md:-ml-7";
    return "-ml-1 sm:-ml-3 md:-ml-4";
  };

  if (gameState.status === 'finished') {
    return (
      <div className="min-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-center p-4 transition-colors">
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl border border-stone-200 dark:border-stone-700"
        >
          <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">Game Over!</h2>
          
          <div className="text-xl sm:text-2xl mb-6">
            {gameState.winner === socketId ? (
              <span className="text-green-600 dark:text-green-400 font-bold">You Won! 🎉</span>
            ) : (
              <span className="text-stone-700 dark:text-stone-300 font-semibold">
                {gameState.players.find(p => p.id === gameState.winner)?.name} won!
              </span>
            )}
          </div>
          
          <div className="bg-stone-50 dark:bg-stone-950 rounded-2xl p-4 mb-6 border border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">Final Scores</h3>
            <div className="space-y-2">
              {gameState.players.map(p => (
                <div key={p.id} className="flex justify-between items-center text-base">
                  <span className="flex items-center gap-2">
                    <span>{p.avatar}</span>
                    <span className="font-medium truncate max-w-[120px]">{p.name} {p.id === socketId && "(You)"}</span>
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {gameState.scores[p.id] || 0} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <button
              onClick={onReset}
              className="w-full bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-600/20 text-base"
            >
              Play Again
            </button>
          ) : (
            <p className="text-stone-500 dark:text-stone-400 text-sm">Waiting for host to restart...</p>
          )}
        </motion.div>
      </div>
    );
  }

  const currentTurnPlayer = gameState.players.find(p => p.id === gameState.currentTurn);
  const myTotalScore = (gameState.scores[socketId] || 0) + (gameState.roundPoints?.[socketId] || 0);

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between overflow-hidden font-sans select-none transition-colors">
      
      {/* 1. Header Bar HUD */}
      <header className="px-3 py-2 sm:px-4 sm:py-2.5 flex justify-between items-center bg-white/70 dark:bg-stone-900/70 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 shadow-sm">
            <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-semibold">Trump</span>
            <span className={cn("text-base sm:text-lg leading-none font-bold", (gameState.trumpSuit === '♥' || gameState.trumpSuit === '♦') ? 'text-red-600 dark:text-red-400' : 'text-stone-900 dark:text-stone-100')}>
              {gameState.trumpSuit || '?'}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
            Round {gameState.roundNumber}/4
          </div>
          {gameState.discardedCardsCount && gameState.discardedCardsCount > 0 ? (
            <div 
              className="hidden sm:flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 border border-amber-300/70 dark:border-amber-700/50 px-2 py-0.5 rounded-lg text-[10px] font-mono text-amber-800 dark:text-amber-300"
              title="2-Player Rule: 1/3 of deck discarded face down"
            >
              <span>🂠 Discarded: {gameState.discardedCardsCount}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button 
            onClick={() => setShowRules(true)} 
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm text-stone-700 dark:text-stone-300 transition"
            aria-label="Rules"
            title="How to Play"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={() => setShowScoreboard(true)} 
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm text-stone-700 dark:text-stone-300 transition"
            aria-label="Scoreboard"
            title="Scoreboard"
          >
            <ListOrdered className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={() => setShowChat(!showChat)} 
            className="relative p-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm text-stone-700 dark:text-stone-300 transition"
            aria-label="Chat"
            title="Room Chat"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm text-stone-700 dark:text-stone-300 transition"
            aria-label="Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl p-1.5 z-50 min-w-44"
          >
            <button 
              onClick={() => { onPause(); setShowMenu(false); }} 
              className="w-full text-left px-3 py-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-stone-800 dark:text-stone-200 transition"
            >
              {gameState.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {gameState.status === 'paused' ? 'Resume Game' : 'Pause Game'}
            </button>
            {isHost && (
              <button 
                onClick={() => { onReset(); setShowMenu(false); }} 
                className="w-full text-left px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-red-600 dark:text-red-400 transition"
              >
                <RotateCcw className="w-4 h-4" /> Reset Game
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Opponents Row (Always visible, fits on mobile without overflow) */}
      <div className="w-full px-2 py-1.5 sm:py-2.5 flex items-center justify-center gap-2 sm:gap-4 md:gap-8 overflow-x-auto hide-scrollbar shrink-0 z-10">
        {opponents.map((opponent) => {
          const isActive = gameState.currentTurn === opponent.id;
          const tricks = gameState.tricksWon[opponent.id] || 0;
          const score = (gameState.scores[opponent.id] || 0) + (gameState.roundPoints?.[opponent.id] || 0);
          const opponentCardCount = gameState.cardCounts?.[opponent.id] ?? gameState.hand.length;

          return (
            <div key={opponent.id} className="flex flex-col items-center shrink-0 min-w-[70px] sm:min-w-[85px]">
              {/* Avatar Box */}
              <div className={cn(
                "relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-2xl text-2xl sm:text-3xl shadow-sm transition-all duration-300",
                isActive 
                  ? "bg-amber-100 dark:bg-amber-950/80 ring-2 ring-amber-400 shadow-md shadow-amber-400/30 scale-105" 
                  : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800",
                !opponent.connected && "opacity-40 grayscale"
              )}>
                <span>{opponent.avatar}</span>
                
                {isActive && (
                  <span className="absolute -bottom-1.5 bg-amber-500 text-stone-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-sm tracking-tight animate-pulse">
                    THINKING
                  </span>
                )}
                {!opponent.connected && (
                  <span className="absolute -bottom-1.5 bg-stone-500 text-white text-[8px] font-bold px-1 rounded-full whitespace-nowrap">
                    AWAY
                  </span>
                )}
              </div>
              
              {/* Opponent Info */}
              <div className="mt-1 text-center w-full">
                <div className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[72px] sm:max-w-[88px] mx-auto">
                  {opponent.name}
                </div>
                
                {/* Card Count Chip */}
                <div className="inline-flex items-center gap-1 mt-0.5 bg-stone-200/70 dark:bg-stone-800/80 px-1.5 py-0.2 rounded text-[10px] font-mono text-stone-700 dark:text-stone-300">
                  <span className="text-[11px] leading-none">🂠</span>
                  <span className="font-semibold">{opponentCardCount}</span>
                </div>

                <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5 font-medium">
                  T:{tricks} · <span className="font-semibold text-stone-700 dark:text-stone-300">{score}pt</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Center Table Area (Felt Circle & Played Trick Cards) */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-2 z-0">
        
        {/* Felt Circular Surface */}
        <div className="w-44 h-44 sm:w-56 sm:h-56 md:w-68 md:h-68 rounded-full border border-stone-200/90 dark:border-white/10 bg-emerald-950/5 dark:bg-emerald-950/25 shadow-inner flex items-center justify-center relative transition-colors">
          
          {/* Subtle Felt Ring */}
          <div className="absolute inset-2 sm:inset-3 rounded-full border border-stone-300/40 dark:border-white/5 pointer-events-none" />

          {/* Played Cards in Current Trick */}
          <AnimatePresence>
            {gameState.currentTrick.map((played, i) => {
              const totalCards = Math.max(gameState.players.length, 2);
              const angle = (i * 360) / totalCards;
              const isMe = played.playerId === socketId;
              const player = gameState.players.find(p => p.id === played.playerId);

              let exitDest = { x: 0, y: 0, scale: 0, opacity: 0 };
              if (lastTrickWinner) {
                if (lastTrickWinner === socketId) {
                  exitDest = { x: 0, y: 250, scale: 0.2, opacity: 0 };
                } else {
                  exitDest = { x: 0, y: -250, scale: 0.2, opacity: 0 };
                }
              }

              return (
                <motion.div
                  key={played.card.id}
                  layoutId={isMe ? played.card.id : undefined}
                  initial={{ scale: 0.5, opacity: 0, y: isMe ? 60 : -60 }}
                  animate={{ x: 0, y: 0, scale: 1, rotate: angle, opacity: 1 }}
                  exit={exitDest}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  className="absolute shadow-xl"
                  style={{ transformOrigin: 'center center' }}
                >
                  <div style={{ transform: 'translateY(-18px)' }} className="relative">
                    <CardView card={played.card} size="sm" />
                    {/* Tiny avatar badge showing who played it */}
                    {player && (
                      <div className="absolute -top-1.5 -right-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-[10px] w-4 h-4 flex items-center justify-center shadow-md border border-white/20">
                        {player.avatar}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Center Table Indicator */}
          {gameState.currentTrick.length === 0 && (
            <div className="text-center pointer-events-none">
              <span className="text-[11px] sm:text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">
                {gameState.leadSuit ? `Lead: ${gameState.leadSuit}` : 'Table'}
              </span>
              <span className="text-[10px] text-stone-400/80 dark:text-stone-600 block mt-0.5">
                {isMyTurn ? 'Your lead' : `${currentTurnPlayer?.name || 'Player'}'s turn`}
              </span>
              {gameState.discardedCardsCount && gameState.discardedCardsCount > 0 ? (
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium block mt-1">
                  (2-Player: {gameState.discardedCardsCount} cards discarded)
                </span>
              ) : null}
            </div>
          )}

          {/* Trick Winner Flash */}
          <AnimatePresence>
            {lastTrickWinner && trickPointsFlash !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-x-2 bg-stone-900/90 dark:bg-black/90 text-white rounded-xl py-1.5 px-2 text-center text-xs font-bold shadow-xl border border-amber-400/40 z-20 pointer-events-none backdrop-blur-sm"
              >
                <span>
                  {lastTrickWinner === socketId ? 'You' : gameState.players.find(p => p.id === lastTrickWinner)?.name} took trick (+{trickPointsFlash}pts)
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* 4. Bottom Player Section (Turn Message, Cards in Hand, and Profile Dock) */}
      <div className="w-full shrink-0 flex flex-col items-center z-20 pb-safe bg-gradient-to-t from-stone-100 via-stone-100/90 to-transparent dark:from-stone-950 dark:via-stone-950/90 dark:to-transparent pt-1">
        
        {/* Turn Status Message */}
        <div className="h-7 sm:h-8 flex items-center justify-center px-4">
          <AnimatePresence mode="wait">
            {!isSpectator && isMyTurn ? (
              <motion.div 
                key="my-turn"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-amber-400 dark:bg-amber-500 text-stone-950 font-bold px-4 py-1 rounded-full shadow-md text-xs sm:text-sm tracking-wide animate-pulse"
              >
                YOUR TURN — TAP A CARD
              </motion.div>
            ) : gameState.status === 'paused' ? (
              <motion.div 
                key="paused"
                className="bg-red-600 text-white font-bold px-4 py-1 rounded-full text-xs sm:text-sm shadow-md"
              >
                GAME PAUSED
              </motion.div>
            ) : (
              <motion.div 
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-300 font-medium px-3.5 py-0.5 rounded-full border border-stone-200 dark:border-stone-800 text-xs shadow-sm"
              >
                Waiting for {currentTurnPlayer?.name || 'player'}...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Illegal Move Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-1 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg z-30"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Hand (Smooth Horizontal Touch Scroll, Properly Scaled) */}
        {!isSpectator && (
          <div className="w-full overflow-x-auto hide-scrollbar px-3 py-1 sm:py-2 touch-pan-x">
            <div className="flex justify-start sm:justify-center w-max min-w-full mx-auto px-4">
              <AnimatePresence>
                {gameState.hand.map((card, i) => {
                  const playable = canPlay(card);
                  const isIllegal = isMyTurn && gameState.status === 'playing' && !playable;
                  const overlapClass = getHandOverlapClass(gameState.hand.length, i);
                  
                  return (
                    <motion.div
                      key={card.id}
                      layoutId={card.id}
                      initial={{ y: 60, scale: 0.7, opacity: 0 }}
                      animate={{ y: 0, scale: 1, opacity: 1 }}
                      exit={{ y: -80, opacity: 0, scale: 0.5 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26, delay: i * 0.03 }}
                      className={cn("transition-transform duration-150", overlapClass)}
                    >
                      <CardView 
                        card={card} 
                        playable={playable}
                        isIllegal={isIllegal}
                        size="md"
                        onClick={() => handleCardClick(card)}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* My Player Profile Dock (Always in DOM flow, never covered by cards!) */}
        {!isSpectator && (
          <div className="w-full px-3 py-1.5 sm:px-6 sm:py-2 flex items-center justify-between border-t border-stone-200/90 dark:border-stone-800/90 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md text-xs sm:text-sm shadow-sm">
            {/* Player Identity */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl sm:text-2xl p-1 bg-stone-100 dark:bg-stone-800 rounded-lg shrink-0 border border-stone-200 dark:border-stone-700">
                {me?.avatar}
              </span>
              <div className="truncate">
                <div className="font-bold text-stone-900 dark:text-stone-100 truncate flex items-center gap-1">
                  <span>{me?.name}</span>
                  <span className="text-[10px] text-amber-500 font-semibold">(You)</span>
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                  {gameState.hand.length} cards remaining
                </div>
              </div>
            </div>

            {/* Live Stats */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block leading-tight">Tricks</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                  {gameState.tricksWon[socketId] || 0}
                </span>
              </div>
              
              <div className="text-right pl-3 border-l border-stone-200 dark:border-stone-700">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block leading-tight">Total Score</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm sm:text-base">
                  {myTotalScore} pts
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Spectator Bottom Notice */}
        {isSpectator && (
          <div className="w-full py-2.5 bg-blue-600 text-white text-center text-xs font-semibold shadow-md">
            👁️ SPECTATOR MODE — Watching Live Match
          </div>
        )}

      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {gameState.status === 'paused' && (
          <div className="fixed inset-0 bg-stone-900/50 dark:bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl text-center max-w-sm w-full border border-stone-200 dark:border-stone-700 shadow-2xl">
              <Pause className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mb-1">Game Paused</h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-6">Waiting for someone to resume...</p>
              <button
                onClick={onPause}
                className="bg-amber-600 hover:bg-amber-500 active:scale-95 w-full py-3 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-600/20"
              >
                <Play className="w-4 h-4" />
                Resume Game
              </button>
            </div>
          </div>
        )}

        {showScoreboard && (
          <Scoreboard gameState={gameState} onClose={() => setShowScoreboard(false)} />
        )}

        {showRules && (
          <RulesModal onClose={() => setShowRules(false)} />
        )}
      </AnimatePresence>

      <ChatBox 
        chatHistory={gameState.chatHistory || []} 
        socketId={socketId} 
        onSendMessage={onSendMessage} 
        isOpen={showChat}
        onOpen={() => setShowChat(true)}
        onClose={() => setShowChat(false)}
        className="bottom-16 sm:bottom-20 right-3"
      />

    </div>
  );
}

