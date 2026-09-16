import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';
import { Send, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatBoxProps {
  chatHistory: ChatMessage[];
  socketId: string;
  onSendMessage: (text: string) => void;
  className?: string;
}

export default function ChatBox({ chatHistory, socketId, onSendMessage, className }: ChatBoxProps) {
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevHistoryLength = useRef(chatHistory.length);

  // Auto-scroll to bottom and manage unread count
  useEffect(() => {
    if (chatHistory.length > prevHistoryLength.current) {
      if (!isOpen) {
        // Only increment unread if the newest message isn't from us
        const lastMsg = chatHistory[chatHistory.length - 1];
        if (lastMsg && lastMsg.senderId !== socketId) {
          setUnread(prev => prev + 1);
        }
      }
    }
    prevHistoryLength.current = chatHistory.length;

    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen, socketId]);

  // Clear unread when opened
  useEffect(() => {
    if (isOpen) {
      setUnread(0);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-auto", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 h-96 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-amber-500 text-white p-3 font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Room Chat
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-amber-600 p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 bg-stone-50 dark:bg-stone-950/50">
              {chatHistory.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
                  No messages yet. Say hi!
                </div>
              ) : (
                chatHistory.map((msg) => {
                  const isMe = msg.senderId === socketId;
                  const isEmojiOnly = /^[\p{Extended_Pictographic}\s]+$/u.test(msg.text) && msg.text.length <= 6;
                  
                  return (
                    <div key={msg.id} className={cn("flex flex-col max-w-[80%]", isMe ? "self-end items-end" : "self-start items-start")}>
                      <span className="text-xs text-stone-500 mb-1 px-1">{isMe ? 'You' : msg.senderName}</span>
                      <div className={cn(
                        "rounded-2xl text-sm",
                        isEmojiOnly 
                          ? "bg-transparent text-4xl" // Large text for emoji-only messages
                          : cn("px-3 py-2", isMe 
                            ? "bg-amber-500 text-white rounded-br-sm" 
                            : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-bl-sm")
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 px-3 py-2 flex justify-between items-center gap-1 overflow-x-auto hide-scrollbar">
              {['👍', '😂', '😮', '😡', '🎉', '💔', '🔥', '💀'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSendMessage(emoji)}
                  className="hover:scale-125 transition-transform text-xl p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-stone-950 border-t border-stone-200 dark:border-stone-700 flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-stone-100 dark:bg-stone-900 border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 rounded-xl px-3 py-2 text-sm text-stone-900 dark:text-white outline-none transition-colors"
              />
              <button 
                type="submit"
                disabled={!text.trim()}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white rounded-xl p-2 transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 active:scale-95 relative"
        >
          <MessageSquare className="w-6 h-6" />
          {unread > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              {unread > 9 ? '9+' : unread}
            </div>
          )}
        </button>
      )}
    </div>
  );
}
