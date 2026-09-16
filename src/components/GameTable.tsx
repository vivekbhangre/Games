import { useState, useMemo, useEffect } from 'react';
import { ClientGameState, Card, Suit } from '../types';
import CardView from './CardView';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Pause, Play, RotateCcw, Trophy, Menu, ListOrdered, BookOpen } from 'lucide-react';
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
  const [toast, setToast] = useState<string | null>(null);
  const [lastTrickWinner, setLastTrickWinner] = useState<string | null>(null);

  const me = gameState.players.find(p => p.id === socketId);
  const isSpectator = !me && gameState.spectators?.some(s => s.id === socketId);
  const isHost = gameState.hostId === socketId;
  
  useEffect(() => {
    if (gameState.trickWinner) {
      setLastTrickWinner(gameState.trickWinner);
    }
  }, [gameState.trickWinner]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const isMyTurn = gameState.currentTurn === socketId;

  // Derive opponents
  const opponents = useMemo(() => {
    if (isSpectator) return gameState.players; // For spectators, everyone is an opponent (shown on table)
    const myIndex = gameState.players.findIndex(p => p.id === socketId);
    if (myIndex === -1) return gameState.players;
    // Order opponents starting from the player after me
    const ordered = [];
    for (let i = 1; i < gameState.players.length; i++) {
      ordered.push(gameState.players[(myIndex + i) % gameState.players.length]);
    }
    return ordered;
  }, [gameState.players, socketId]);

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
      setToast(`You must follow ${gameState.leadSuit} ${gameState.leadSuit === '♠' ? 'Spades' : gameState.leadSuit === '♥' ? 'Hearts' : gameState.leadSuit === '♦' ? 'Diamonds' : 'Clubs'}.`);
    }
  };

  if (gameState.status === 'finished') {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-center p-4 transition-colors">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-stone-900 p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl border border-stone-200 dark:border-stone-700"
        >
          <Trophy className="w-20 h-20 text-amber-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-2">Game Over!</h2>
          
          <div className="text-2xl mb-8">
            {gameState.winner === socketId ? (
              <span className="text-green-600 dark:text-green-400 font-bold">You Won! 🎉</span>
            ) : (
              <span className="text-stone-700 dark:text-stone-300">
                {gameState.players.find(p => p.id === gameState.winner)?.name} won!
              </span>
            )}
          </div>
          
          <div className="bg-stone-50 dark:bg-stone-950 rounded-xl p-4 mb-8 border border-stone-200 dark:border-transparent">
            <h3 className="text-sm text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">Final Scores</h3>
            <div className="space-y-2">
              {gameState.players.map(p => (
                <div key={p.id} className="flex justify-between items-center text-lg">
                  <span className="flex items-center gap-2">
                    {p.avatar} {p.name}
                  </span>
                  <span className="font-bold">
                    {gameState.status === 'playing' 
                      ? (gameState.scores[p.id] || 0) + (gameState.roundPoints?.[p.id] || 0) 
                      : (gameState.scores[p.id] || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <button
              onClick={onReset}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition"
            >
              Play Again
            </button>
          )}
          {!isHost && (
            <p className="text-stone-500 text-sm mt-4">Waiting for host to restart...</p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans overflow-hidden transition-colors">
      
      {/* Header / Info Bar */}
      <header className="px-4 py-3 flex justify-between items-center bg-white/50 dark:bg-black/30 backdrop-blur-md border-b border-stone-200 dark:border-white/5 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-white/80 dark:bg-stone-900/80 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-white/10 flex items-center gap-2 shadow-sm">
            <span className="text-xs text-stone-500 dark:text-stone-400 uppercase">Trump</span>
            <span className={cn("text-xl leading-none", (gameState.trumpSuit === '♥' || gameState.trumpSuit === '♦') ? 'text-red-500' : 'text-stone-800 dark:text-stone-200')}>
              {gameState.trumpSuit || '?'}
            </span>
          </div>
          <div className="text-sm font-medium text-stone-600 dark:text-stone-300">
            Round {gameState.roundNumber}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowRules(true)} className="p-2 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition border border-stone-200 dark:border-white/10 shadow-sm text-stone-700 dark:text-stone-300">
            <BookOpen className="w-5 h-5" />
          </button>
          <button onClick={() => setShowScoreboard(true)} className="p-2 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition border border-stone-200 dark:border-white/10 shadow-sm text-stone-700 dark:text-stone-300">
            <ListOrdered className="w-5 h-5" />
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition border border-stone-200 dark:border-white/10 shadow-sm">
            <Menu className="w-5 h-5 text-stone-700 dark:text-stone-300" />
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
            className="absolute top-16 right-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl p-2 z-50 min-w-48"
          >
            <button onClick={() => { onPause(); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg flex items-center gap-3 text-stone-800 dark:text-stone-200">
              {gameState.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {gameState.status === 'paused' ? 'Resume Game' : 'Pause Game'}
            </button>
            {isHost && (
              <button onClick={() => { onReset(); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-stone-700 rounded-lg flex items-center gap-3 text-red-500 dark:text-red-400">
                <RotateCcw className="w-4 h-4" /> Reset Game
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Area */}
      <div className="flex-1 relative flex flex-col pb-[120px] sm:pb-[160px] md:pb-[200px]">
        
        {/* Opponents Area (Top/Sides) */}
        <div className="flex-1 relative p-4 md:p-8 flex items-start justify-center">
          <div className="flex justify-center items-start w-full max-w-4xl gap-4 md:gap-16">
            {opponents.map((opponent, i) => {
              const isActive = gameState.currentTurn === opponent.id;
              const tricks = gameState.tricksWon[opponent.id] || 0;
              
              return (
                <div key={opponent.id} className="flex flex-col items-center">
                  <div className={cn(
                    "relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-3xl sm:text-4xl shadow-xl transition-all duration-300",
                    isActive ? "bg-amber-100 dark:bg-amber-500 shadow-amber-500/50 border border-amber-300 dark:border-transparent scale-110" : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700",
                    !opponent.connected && "opacity-50 grayscale"
                  )}>
                    {opponent.avatar}
                    
                    {isActive && (
                      <span className="absolute -bottom-2 bg-amber-500 dark:bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        THINKING
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-200 max-w-[80px] truncate">{opponent.name}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Tricks: <span className="text-stone-900 dark:text-white">{tricks}</span></div>
                    <div className="text-xs text-stone-500">Score: {gameState.status === 'playing' ? (gameState.scores[opponent.id] || 0) + (gameState.roundPoints?.[opponent.id] || 0) : (gameState.scores[opponent.id] || 0)}</div>
                  </div>
                  
                  {/* Opponent's hidden cards */}
                  <div className="mt-4 flex justify-center -space-x-3 scale-50 opacity-80 pointer-events-none">
                    <AnimatePresence>
                      {Array.from({ length: Math.max(1, gameState.hand.length) }).map((_, idx) => (
                        <motion.div
                          key={`opp-card-${opponent.id}-${idx}`}
                          initial={{ y: 200, opacity: 0, scale: 0 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ delay: idx * 0.05 + 0.2 }}
                        >
                          <CardView card={{id:'x', suit:'♠', rank:'2', value:2}} hidden overlap className="-ml-3" />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Table Center (Current Trick) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-stone-200 dark:border-white/5 bg-black/5 dark:bg-black/10 flex items-center justify-center relative shadow-inner transition-colors">
            <AnimatePresence>
              {gameState.currentTrick.map((played, i) => {
                const angle = (i * 360) / gameState.players.length;
                const isMe = played.playerId === socketId;
                const oppIndex = opponents.findIndex(p => p.id === played.playerId);
                
                let origin = { x: 0, y: -300 };
                if (!isMe) {
                   if (opponents.length === 1) origin = { x: 0, y: -300 };
                   else if (opponents.length === 2) origin = oppIndex === 0 ? { x: -300, y: -200 } : { x: 300, y: -200 };
                   else {
                       if (oppIndex === 0) origin = { x: -300, y: 0 };
                       else if (oppIndex === 1) origin = { x: 0, y: -300 };
                       else origin = { x: 300, y: 0 };
                   }
                }

                let exitDest = { x: 0, y: 0, scale: 0, opacity: 0 };
                if (lastTrickWinner) {
                   if (lastTrickWinner === socketId) {
                      exitDest = { x: 0, y: 500, scale: 0, opacity: 0 };
                   } else {
                      const wOppIndex = opponents.findIndex(p => p.id === lastTrickWinner);
                      if (opponents.length === 1) exitDest = { x: 0, y: -500, scale: 0, opacity: 0 };
                      else if (opponents.length === 2) exitDest = wOppIndex === 0 ? { x: -500, y: -300, scale: 0, opacity: 0 } : { x: 500, y: -300, scale: 0, opacity: 0 };
                      else {
                          if (wOppIndex === 0) exitDest = { x: -500, y: 0, scale: 0, opacity: 0 };
                          else if (wOppIndex === 1) exitDest = { x: 0, y: -500, scale: 0, opacity: 0 };
                          else exitDest = { x: 500, y: 0, scale: 0, opacity: 0 };
                      }
                   }
                }

                return (
                  <motion.div
                    key={played.card.id}
                    layoutId={isMe ? played.card.id : undefined}
                    initial={isMe ? { scale: 1 } : { ...origin, opacity: 0, scale: 0.5 }}
                    animate={{ x: 0, y: 0, scale: 1, rotate: angle, opacity: 1 }}
                    exit={exitDest}
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                    className="absolute shadow-2xl"
                    style={{ transformOrigin: 'center center' }}
                  >
                    <div style={{ transform: `translateY(-30px)` }}>
                      <CardView card={played.card} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {gameState.currentTrick.length === 0 && (
              <div className="text-stone-500/50 dark:text-stone-500/50 font-medium tracking-widest uppercase text-sm">
                Table
              </div>
            )}
          </div>
        </div>

      </div>

      {/* My Player Area (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 sm:pb-8 bg-gradient-to-t from-white/90 via-white/50 to-transparent dark:from-black/80 dark:via-black/40 dark:to-transparent flex flex-col items-center pointer-events-none z-30 transition-colors">
        
        {/* Turn Status Message */}
        <div className="mb-4 sm:mb-6 h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!isSpectator && isMyTurn ? (
              <motion.div 
                key="my-turn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-amber-400 dark:bg-amber-500 text-amber-950 dark:text-stone-900 font-bold px-6 py-2 rounded-full shadow-lg shadow-amber-500/20 tracking-wide text-sm sm:text-base pointer-events-auto"
              >
                YOUR TURN — PLAY A CARD
              </motion.div>
            ) : gameState.status === 'paused' ? (
              <motion.div 
                key="paused"
                className="bg-red-500/90 text-white font-bold px-6 py-2 rounded-full backdrop-blur shadow-lg text-sm sm:text-base pointer-events-auto"
              >
                GAME PAUSED
              </motion.div>
            ) : (
              <motion.div 
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 font-medium px-6 py-2 rounded-full backdrop-blur border border-stone-200 dark:border-white/10 text-sm sm:text-base pointer-events-auto"
              >
                Waiting for {gameState.players.find(p => p.id === gameState.currentTurn)?.name}...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* My Hand */}
        {!isSpectator && (
          <div className="w-full pointer-events-auto overflow-x-auto hide-scrollbar -mx-4 px-4 pt-4 pb-4">
            <div className="flex justify-start sm:justify-center w-max min-w-full pl-6 sm:pl-8 md:pl-12 mx-auto">
              <AnimatePresence>
              {gameState.hand.map((card, i) => {
                const playable = canPlay(card);
                // It's illegal if it's my turn, we are playing, and I can't play it
                const isIllegal = isMyTurn && gameState.status === 'playing' && !playable;
                
                return (
                  <motion.div
                    key={card.id}
                    layoutId={card.id}
                    initial={{ y: -400, scale: 0, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: -100, opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.05 }}
                  >
                    <CardView 
                      card={card} 
                      playable={playable}
                      isIllegal={isIllegal}
                      overlap 
                      onClick={() => handleCardClick(card)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            </div>
          </div>
        )}

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 bg-red-100 dark:bg-stone-950/90 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-900 px-4 py-2 rounded-xl font-medium shadow-2xl backdrop-blur-sm pointer-events-none"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Stats (Hidden for spectator) */}
        {!isSpectator && (
          <>
            <div className="absolute bottom-4 left-4 flex gap-3 pointer-events-auto">
              <div className="bg-white/90 dark:bg-stone-950/90 backdrop-blur border border-stone-200 dark:border-white/10 rounded-xl p-2 flex items-center gap-3 shadow-lg">
                <div className="w-10 h-10 bg-stone-100 dark:bg-stone-900 rounded-lg flex items-center justify-center text-xl">
                  {me?.avatar}
                </div>
                <div className="pr-2">
                    <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">Tricks</div>
                    <div className="text-lg font-bold leading-none text-stone-900 dark:text-white">{gameState.tricksWon[socketId] || 0}</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 pointer-events-auto bg-white/90 dark:bg-stone-950/90 backdrop-blur border border-stone-200 dark:border-white/10 rounded-xl px-4 py-2 shadow-lg">
                <div className="text-xs text-stone-500 dark:text-stone-400 font-medium text-right">Score</div>
                <div className="text-xl font-bold leading-none text-stone-900 dark:text-white text-right">
                  {gameState.status === 'playing' ? (gameState.scores[socketId] || 0) + (gameState.roundPoints?.[socketId] || 0) : (gameState.scores[socketId] || 0)}
                </div>
            </div>
          </>
        )}
        
        {isSpectator && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
            <div className="bg-blue-500/90 backdrop-blur text-white px-6 py-2 rounded-full font-medium shadow-xl">
              SPECTATOR MODE
            </div>
          </div>
        )}

      </div>

      {/* Pause Overlay */}
      {gameState.status === 'paused' && (
        <div className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl text-center max-w-sm w-full border border-stone-200 dark:border-stone-700 shadow-2xl">
            <Pause className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Game Paused</h2>
            <p className="text-stone-500 dark:text-stone-400 mb-8">Waiting for someone to resume...</p>
            <button
              onClick={onPause}
              className="bg-amber-600 hover:bg-amber-500 w-full py-4 rounded-xl font-bold text-white transition flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Resume Game
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
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
        className="bottom-[88px] sm:bottom-[88px]"
      />

    </div>
  );
}
