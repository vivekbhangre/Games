import { motion } from 'motion/react';
import { X, BookOpen, Crown } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export default function RulesModal({ onClose }: RulesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-100 dark:border-stone-700/50 bg-stone-50 dark:bg-stone-900/80 shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            How to Play
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-600 rounded-full transition-colors text-stone-600 dark:text-stone-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-stone-700 dark:text-stone-300">
          
          <section>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">Objective</h3>
            <p>The game is played over <strong>4 rounds</strong>, with the Trump suit rotating each round (♠ Spades, ♥ Hearts, ♦ Diamonds, ♣ Clubs). The goal is to capture <strong>Trump cards</strong> by winning tricks. The player with the most accumulated trump points at the end of the 4 rounds wins the game.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">Scoring & Card Values</h3>
            <p className="mb-2">You only earn points for <strong>Trump cards</strong> that you capture in tricks. Regular suits are worth 0 points. Trump cards award points based on their rank:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm font-medium mb-3">
              <li><strong>Number Cards (2-10):</strong> Face Value (2 to 10 points)</li>
              <li><strong>Jack (J):</strong> 11 points</li>
              <li><strong>Queen (Q):</strong> 12 points</li>
              <li><strong>King (K):</strong> 13 points</li>
              <li><strong>Ace (A):</strong> 14 points</li>
            </ul>
            <p className="mb-2">Cards are also ranked from lowest to highest for winning tricks:</p>
            <div className="flex flex-wrap gap-2 font-mono text-sm">
              <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">2</span>
              <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">3</span>
              <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">...</span>
              <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">10</span>
              <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">J</span>
              <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">Q</span>
              <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">K</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-bold rounded">A</span>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">Playing a Trick</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>The first player plays a card to set the <strong>Lead Suit</strong>.</li>
              <li>Every other player <strong>must follow suit</strong> if they have a card of that suit in their hand.</li>
              <li>If you don't have a card of the lead suit, you can play <strong>any card</strong> (including a Trump card).</li>
            </ul>
          </section>

          <section className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-700/30">
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-500 mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4" /> 
              Winning the Trick
            </h3>
            <p className="mb-2">A trick is won by either:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>The <strong>highest Trump card</strong> played (if any trumps were played).</li>
              <li>If no trumps were played, the <strong>highest card of the Lead Suit</strong>.</li>
            </ol>
            <p className="mt-2 text-sm opacity-80">The winner of the trick gets to lead the next trick.</p>
          </section>

        </div>
      </motion.div>
    </div>
  );
}
