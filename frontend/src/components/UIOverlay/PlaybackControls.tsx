'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PlaybackControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onReset: () => void;
  onSeek: (stepIndex: number) => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4];

export function PlaybackControls({
  currentStep,
  totalSteps,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onJumpStart,
  onJumpEnd,
  onReset,
  onSeek,
  onSpeedChange,
}: PlaybackControlsProps) {
  const progressPercent = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onPlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onStepBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onStepForward();
          break;
        case 'KeyR':
          e.preventDefault();
          onReset();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, onStepForward, onStepBackward, onReset]);

  return (
    <div className="w-full bg-[#0d0d11]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-crisp-card space-y-3">
      {/* Micro Header */}
      <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          Timeline Progress
        </span>
        <span>
          Step <strong className="text-zinc-100 font-semibold">{currentStep}</strong> / {Math.max(0, totalSteps - 1)}
        </span>
      </div>

      {/* Scrubber Bar */}
      <div className="relative w-full h-2 bg-zinc-900 rounded-md cursor-pointer border border-white/5 overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 bg-zinc-200 rounded-md transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Button Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Left Step Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all border border-white/10"
            title="Reset (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={onJumpStart}
            disabled={currentStep === 0}
            className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-zinc-100 transition-all border border-white/10"
            title="Jump to Start"
          >
            <SkipBack className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={onStepBackward}
            disabled={currentStep === 0}
            className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-zinc-100 transition-all border border-white/10"
            title="Step Back (←)"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Center Primary Play/Pause Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onPlayPause}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 border transition-all ${
            isPlaying
              ? 'bg-zinc-900 text-amber-400 border-amber-500/40 hover:bg-zinc-800'
              : 'bg-zinc-100 text-zinc-950 hover:bg-white border-white/20 shadow-btn-highlight'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-amber-400" strokeWidth={1.5} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-zinc-950" strokeWidth={1.5} />
              <span>Play</span>
            </>
          )}
        </motion.button>

        {/* Right Step & Speed Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onStepForward}
            disabled={currentStep >= totalSteps - 1}
            className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-zinc-100 transition-all border border-white/10"
            title="Step Forward (→)"
          >
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={onJumpEnd}
            disabled={currentStep >= totalSteps - 1}
            className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-zinc-100 transition-all border border-white/10"
            title="Jump to End"
          >
            <SkipForward className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-0.5 bg-zinc-950 p-1 rounded-lg border border-white/5 ml-2">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                  playbackSpeed === speed
                    ? 'bg-zinc-800 text-zinc-100 font-semibold border border-white/10'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
