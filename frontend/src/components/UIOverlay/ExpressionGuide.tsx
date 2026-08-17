'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown } from 'lucide-react';

export function ExpressionGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-[#0d0d11]/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-crisp-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-900/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400">
            <BookOpen className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xs font-mono tracking-[0.15em] text-zinc-300 uppercase font-semibold flex items-center gap-2">
              Precedence Matrix & Rules
            </h3>
            <p className="text-[11px] text-zinc-500">BODMAS / PEMDAS evaluation hierarchy</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-zinc-200' : ''
          }`}
          strokeWidth={1.5}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10 p-4 space-y-3 text-xs text-zinc-300 bg-zinc-950/40"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Rank 1</span>
                <strong className="text-amber-400 text-sm">^</strong> (Exponent)
                <div className="text-zinc-500 text-[10px] mt-0.5">Right-to-Left</div>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Rank 2</span>
                <strong className="text-purple-400 text-sm">* /</strong> (Mult/Div)
                <div className="text-zinc-500 text-[10px] mt-0.5">Left-to-Right</div>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Rank 3</span>
                <strong className="text-cyan-400 text-sm">+ -</strong> (Add/Sub)
                <div className="text-zinc-500 text-[10px] mt-0.5">Left-to-Right</div>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Scope Override</span>
                <strong className="text-emerald-400 text-sm">( )</strong> (Parentheses)
                <div className="text-zinc-500 text-[10px] mt-0.5">Immediate Scope</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
