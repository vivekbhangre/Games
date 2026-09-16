import { useState } from 'react';
import { Avatar } from '../types';
import { cn } from '../lib/utils';
import { Users, Play } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const AVATARS: Avatar[] = ['🐼', '🐱', '🦊', '🐻', '🐰', '🐶', '🐵', '🤖'];

interface LandingProps {
  onCreate: (name: string, avatar: Avatar) => void;
  onJoin: (roomId: string, name: string, avatar: Avatar, isSpectator?: boolean) => void;
  error: string | null;
}

export default function Landing({ onCreate, onJoin, error }: LandingProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<Avatar>('🐼');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [isSpectator, setIsSpectator] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col items-center justify-center p-4 font-sans transition-colors relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-2xl border border-stone-200 dark:border-stone-700 transition-colors">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Four Trumps Logo" className="w-20 h-20 mx-auto mb-4 drop-shadow-md" />
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Four<span className="text-amber-500">Trumps</span></h1>
          <p className="text-stone-500 dark:text-stone-400">Play cards with friends & family</p>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-3 rounded-lg mb-6 text-sm text-center border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {mode === 'select' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
            >
              <Play className="w-5 h-5" />
              Create Game Room
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-600 text-stone-900 dark:text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Join Existing Room
            </button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                placeholder="Enter your name"
                maxLength={12}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">Choose Avatar</label>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={cn(
                      "text-3xl p-2 rounded-xl transition-all duration-200",
                      avatar === a ? "bg-amber-100 dark:bg-amber-500/20 border-2 border-amber-500 scale-105" : "bg-stone-50 dark:bg-stone-950 border-2 border-transparent hover:bg-stone-200 dark:hover:bg-stone-700"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'join' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">Room Code</label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-center text-xl tracking-widest font-mono"
                    placeholder="ABC123"
                    maxLength={6}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/30 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={isSpectator} 
                    onChange={(e) => setIsSpectator(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Join as Spectator (View Only)</span>
                </label>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setMode('select')}
                className="flex-1 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-600 text-stone-900 dark:text-white font-semibold py-3 rounded-xl transition"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!name.trim()) return;
                  if (mode === 'create') onCreate(name, avatar);
                  else if (roomId.trim()) onJoin(roomId, name, avatar, isSpectator);
                }}
                disabled={!name.trim() || (mode === 'join' && !roomId.trim())}
                className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
              >
                {mode === 'create' ? 'Create' : 'Join'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
