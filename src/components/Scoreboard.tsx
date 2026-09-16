import { ClientGameState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface ScoreboardProps {
  gameState: ClientGameState;
  onClose: () => void;
}

export default function Scoreboard({ gameState, onClose }: ScoreboardProps) {
  // If no rounds played yet and currently no score history, just show a message
  const hasHistory = gameState.scoreHistory && gameState.scoreHistory.length > 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-100 dark:border-stone-700/50 bg-stone-50 dark:bg-stone-900/80">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Scoreboard
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-600 rounded-full transition-colors text-stone-600 dark:text-stone-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-x-auto flex-1">
          <div className="min-w-[400px]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-xs border-b border-stone-200 dark:border-stone-700">Round</th>
                  {gameState.players.map(player => (
                    <th key={player.id} className="text-center py-3 px-4 font-semibold text-stone-900 dark:text-stone-200 border-b border-stone-200 dark:border-stone-700">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xl">{player.avatar}</span>
                        <span className="text-sm truncate max-w-[80px]">{player.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-700/50">
                {gameState.scoreHistory && gameState.scoreHistory.map((roundScores, idx) => (
                  <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-stone-700/30 transition-colors">
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400 font-medium">
                      Round {idx + 1}
                    </td>
                    {gameState.players.map(player => (
                      <td key={player.id} className="text-center py-3 px-4 font-mono text-stone-900 dark:text-stone-200">
                        {roundScores[player.id] !== undefined ? `+${roundScores[player.id]}` : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
                
                {/* Live Round Points */}
                {gameState.status === 'playing' && (
                  <tr className="bg-stone-50/50 dark:bg-stone-800/30 text-stone-500 dark:text-stone-400 italic">
                    <td className="py-3 px-4 font-medium text-sm">
                      Current (Live)
                    </td>
                    {gameState.players.map(player => {
                      const tricks = gameState.tricksWon?.[player.id] || 0;
                      return (
                        <td key={player.id} className="text-center py-3 px-4 font-mono">
                          +{tricks * 10}
                        </td>
                      );
                    })}
                  </tr>
                )}

                <tr className="bg-amber-50 dark:bg-amber-900/10 font-bold border-t-2 border-amber-200 dark:border-amber-700/30">
                  <td className="py-4 px-4 text-amber-900 dark:text-amber-500 uppercase tracking-wider text-sm">
                    Total
                  </td>
                  {gameState.players.map(player => {
                    const currentLivePoints = gameState.status === 'playing' ? (gameState.tricksWon?.[player.id] || 0) * 10 : 0;
                    const totalPoints = (gameState.scores?.[player.id] || 0) + currentLivePoints;
                    
                    return (
                      <td key={player.id} className="text-center py-4 px-4 text-lg text-amber-900 dark:text-amber-400 font-mono">
                        {totalPoints}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
