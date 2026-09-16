import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={cn(
        "p-2 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 rounded-lg shadow-sm hover:bg-stone-100 dark:hover:bg-stone-700 transition-all border border-stone-200 dark:border-white/10 active:scale-95 flex items-center justify-center",
        className
      )}
      aria-label="Toggle Dark Mode"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
