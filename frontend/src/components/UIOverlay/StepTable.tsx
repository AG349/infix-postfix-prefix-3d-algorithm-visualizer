'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

export interface Step {
  stepIndex: number;
  symbol: string;
  tokenIndex: number;
  actionType: string;
  actionDescription: string;
  currentStack: string[];
  currentOutput: string;
  explanation: string;
  poppedItems?: string[];
  combinedResult?: string;
  activeTokenIndices?: number[];
}

interface StepTableProps {
  steps: Step[];
  currentStepIndex: number;
  onStepSelect: (index: number) => void;
}

export function StepTable({ steps, currentStepIndex, onStepSelect }: StepTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const activeRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStepIndex]);

  const filteredSteps = steps.filter((step) => {
    const q = searchQuery.toLowerCase();
    return (
      step.symbol.toLowerCase().includes(q) ||
      step.explanation.toLowerCase().includes(q) ||
      step.actionType.toLowerCase().includes(q) ||
      step.currentOutput.toLowerCase().includes(q)
    );
  });

  const getActionBadgeStyle = (actionType: string) => {
    switch (actionType) {
      case 'PUSH_OPERAND':
        return 'bg-zinc-900 text-cyan-400 border-cyan-500/30';
      case 'PUSH_OPERATOR':
        return 'bg-zinc-900 text-purple-400 border-purple-500/30';
      case 'POP_OPERATOR':
        return 'bg-zinc-900 text-rose-400 border-rose-500/30';
      case 'POP_TWO_AND_COMBINE':
        return 'bg-zinc-900 text-amber-400 border-amber-500/30';
      case 'COMPLETE':
        return 'bg-zinc-900 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-zinc-900 text-zinc-400 border-zinc-800';
    }
  };

  return (
    <div className="w-full h-full min-h-[480px] bg-[#0d0d11]/90 backdrop-blur-md border border-white/10 rounded-xl flex flex-col overflow-hidden shadow-crisp-card">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between gap-3 bg-zinc-950/40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase font-medium">
            Execution Steps
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400">
            {steps.length}
          </span>
        </div>
        <div className="relative max-w-[180px] w-full">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Filter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-white/10 rounded-md pl-7 pr-2.5 py-1 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      {/* Grid Table */}
      <div className="flex-1 overflow-y-auto max-h-[400px]">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="sticky top-0 bg-zinc-950/95 text-[10px] font-mono tracking-[0.15em] text-zinc-500 uppercase border-b border-white/10">
            <tr>
              <th className="py-2 px-3 border-r border-white/5 font-medium">Step</th>
              <th className="py-2 px-2 border-r border-white/5 font-medium">Symbol</th>
              <th className="py-2 px-3 border-r border-white/5 font-medium">Action</th>
              <th className="py-2 px-3 border-r border-white/5 font-medium">Stack</th>
              <th className="py-2 px-3 border-r border-white/5 font-medium">Output</th>
              <th className="py-2 px-3 font-medium">Explanation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredSteps.map((step) => {
              const isActive = steps.indexOf(step) === currentStepIndex;

              return (
                <tr
                  key={step.stepIndex}
                  ref={isActive ? activeRowRef : null}
                  onClick={() => onStepSelect(steps.indexOf(step))}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isActive
                      ? 'bg-zinc-800/80 border-l-2 border-l-cyan-400 text-zinc-100'
                      : 'hover:bg-zinc-900/50 text-zinc-400 odd:bg-zinc-950/30'
                  }`}
                >
                  <td className="py-2 px-3 border-r border-white/5 text-zinc-500">{step.stepIndex}</td>
                  <td className="py-2 px-2 border-r border-white/5 font-semibold text-zinc-200">
                    {step.symbol}
                  </td>
                  <td className="py-2 px-3 border-r border-white/5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono border tracking-wider uppercase ${getActionBadgeStyle(
                        step.actionType
                      )}`}
                    >
                      {step.actionType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-r border-white/5 max-w-[110px] truncate text-purple-300">
                    {step.currentStack.length > 0 ? `[ ${step.currentStack.join(', ')} ]` : '-'}
                  </td>
                  <td className="py-2 px-3 border-r border-white/5 max-w-[120px] truncate text-emerald-400 font-medium">
                    {step.currentOutput || '-'}
                  </td>
                  <td className="py-2 px-3 text-zinc-300 font-sans text-xs leading-normal">
                    {step.explanation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
