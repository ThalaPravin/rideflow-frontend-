'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { Send, X, MessageSquare, CheckCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DriverChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriverChatModal: React.FC<DriverChatModalProps> = ({ isOpen, onClose }) => {
  const { activeDriver, chatMessages, isDriverTyping, sendChatMessage } = useTripStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isDriverTyping]);

  if (!isOpen) return null;

  const quickChips = [
    "I'm waiting at the curb",
    "Wearing a dark jacket",
    "Please take the express route",
    "Be right there!",
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickChip = (chip: string) => {
    sendChatMessage(chip);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md h-[560px] bg-[#141720] border border-[#272D3D] rounded-3xl shadow-2xl flex flex-col justify-between text-white overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 px-5 bg-[#1B1F2A] border-b border-[#272D3D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#252A38] border border-slate-700 flex items-center justify-center font-bold text-white text-xs font-mono shadow-inner">
                {activeDriver?.initials}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#2EE59D] border-2 border-[#1B1F2A]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{activeDriver?.name}</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {activeDriver?.vehicleModel} • {activeDriver?.vehicleNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-sans text-xs">
          {chatMessages.map((msg) => {
            const isRider = msg.sender === 'rider';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isRider ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    isRider
                      ? 'bg-[#2EE59D] text-black font-medium rounded-br-none shadow-[0_4px_15px_rgba(46,229,157,0.25)]'
                      : 'bg-[#1F2432] text-white rounded-bl-none border border-[#2B3245]'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-mono px-1">
                  <span>{msg.timestamp}</span>
                  {isRider && <CheckCheck className="w-3 h-3 text-[#2EE59D]" />}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isDriverTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl rounded-bl-none bg-[#1F2432] border border-[#2B3245] w-16">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips & Input Footer */}
        <div className="p-3.5 bg-[#1B1F2A] border-t border-[#272D3D] flex flex-col gap-2.5">
          {/* Quick Response Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickChip(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#242A38] hover:bg-[#2EE59D]/20 text-slate-300 hover:text-[#2EE59D] border border-slate-700/60 text-[11px] font-medium transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Message ${activeDriver?.name || 'Driver'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#141720] border border-[#2B3245] focus:border-[#2EE59D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-[#2EE59D] hover:bg-[#34F5A8] disabled:opacity-40 text-black transition shadow-[0_0_15px_rgba(46,229,157,0.3)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
