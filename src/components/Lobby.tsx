import { ClientGameState } from '../types';
import { cn } from '../lib/utils';
import { Users, Crown, CheckCircle2, Circle } from 'lucide-react';

interface LobbyProps {
  gameState: ClientGameState;
  socketId: string;
  onReady: () => void;
  onStart: () => void;
  onSetTrumpSuit: (suit: string) => void;
}

export default function Lobby({ gameState, socketId, onReady, onStart, onSetTrumpSuit }: LobbyProps) {
  const isHost = gameState.hostId === socketId;
  const allReady = gameState.players.every((p) => p.isReady);
  const canStart = isHost && allReady && gameState.players.length >= 2;
  const me = gameState.players.find(p => p.id === socketId);
  const isSpectator = !me && gameState.spectators?.some(s => s.id === socketId);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex flex-col items-center justify-center p-4 font-sans transition-colors">
      <div className="w-full max-w-lg bg-white dark:bg-stone-800 rounded-3xl p-8 shadow-2xl border border-stone-200 dark:border-stone-700 transition-colors">
        
        {isSpectator && (
          <div className="mb-6 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 text-center font-medium">
            👁️ You are spectating this room. Waiting for game to start...
          </div>
        )}

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest text-sm mb-2">Game Room</h2>
          <div className="text-5xl font-mono font-bold tracking-widest text-amber-500 mb-2">
            {gameState.roomId}
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-sm">Share this code with your cousins</p>
        </div>

        <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-4 mb-8 border border-stone-200 dark:border-stone-700/50">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-semibold text-stone-800 dark:text-stone-300 flex items-center gap-2">
              <Crown className="w-4 h-4" /> Trump Suit
            </h3>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {['♠', '♥', '♦', '♣'].map((suit) => (
              <button
                key={suit}
                onClick={() => isHost && onSetTrumpSuit(suit)}
                disabled={!isHost}
                className={cn(
                  "py-3 text-2xl rounded-xl transition-all duration-200 border-2",
                  gameState.trumpSuit === suit 
                    ? "bg-amber-100 dark:bg-amber-500/20 border-amber-500 scale-105" 
                    : "bg-white dark:bg-stone-800 border-transparent hover:bg-stone-200 dark:hover:bg-stone-700",
                  !isHost && "cursor-default opacity-80",
                  (suit === '♥' || suit === '♦') ? "text-red-500" : "text-stone-900 dark:text-stone-100"
                )}
              >
                {suit}
              </button>
            ))}
          </div>
          {!isHost && (
            <p className="text-center text-xs text-stone-500 mt-3">Only the host can change the trump suit</p>
          )}
        </div>

        <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-4 mb-8 border border-stone-200 dark:border-stone-700/50">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-semibold text-stone-800 dark:text-stone-300 flex items-center gap-2">
              <Users className="w-4 h-4" /> Players
            </h3>
            <span className="text-sm font-medium bg-stone-200 dark:bg-stone-800 px-3 py-1 rounded-full text-stone-600 dark:text-stone-400">
              {gameState.players.length} / 8
            </span>
          </div>

          <div className="space-y-3">
            {gameState.players.map((player) => (
              <div 
                key={player.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-colors",
                  player.id === socketId ? "bg-stone-100 dark:bg-stone-800/80 border-stone-300 dark:border-stone-600" : "bg-white dark:bg-stone-800/40 border-stone-200 dark:border-stone-700/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl bg-stone-100 dark:bg-stone-700 w-12 h-12 flex items-center justify-center rounded-xl shadow-inner border border-stone-200 dark:border-transparent">
                    {player.avatar}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-stone-900 dark:text-stone-200 flex items-center gap-2">
                      {player.name} {player.id === socketId && <span className="text-xs text-stone-500 dark:text-stone-500 font-normal">(You)</span>}
                    </span>
                    {player.id === gameState.hostId && (
                      <span className="text-xs text-amber-500 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Host
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {player.isReady ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-stone-300 dark:text-stone-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {gameState.spectators && gameState.spectators.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider px-2">Spectators</h4>
              <div className="space-y-2">
                {gameState.spectators.map((spec) => (
                  <div key={spec.id} className="flex items-center gap-3 p-2 px-3 rounded-lg bg-white/50 dark:bg-stone-800/20 border border-stone-100 dark:border-stone-700/30">
                    <span className="text-xl">{spec.avatar}</span>
                    <span className="text-sm text-stone-700 dark:text-stone-300">
                      {spec.name} {spec.id === socketId && <span className="text-xs text-stone-500">(You)</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {!isSpectator && (
            <button
              onClick={onReady}
              className={cn(
                "w-full py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-lg shadow-lg",
                me?.isReady 
                  ? "bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-300" 
                  : "bg-green-600 hover:bg-green-500 text-white"
              )}
            >
              {me?.isReady ? 'Not Ready' : 'Ready to Play'}
            </button>
          )}

          {isHost && (
            <button
              onClick={onStart}
              disabled={!canStart}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-200 dark:disabled:bg-stone-700 disabled:text-stone-400 dark:disabled:text-stone-500 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition text-lg"
            >
              Start Game
            </button>
          )}
          
          {!isHost && !isSpectator && (
            <div className="text-center text-sm text-stone-500 mt-2">
              Waiting for host to start...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
