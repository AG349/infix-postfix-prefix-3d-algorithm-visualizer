'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Play, AlertCircle, RefreshCw } from 'lucide-react';
import { Scene3D } from '../Canvas3D/Scene3D';
import { StepTable, Step } from './StepTable';
import { PlaybackControls } from './PlaybackControls';
import { ExpressionGuide } from './ExpressionGuide';

type ExpressionType = 'INFIX' | 'POSTFIX' | 'PREFIX';
type ConversionRoute =
  | 'INFIX_TO_POSTFIX'
  | 'INFIX_TO_PREFIX'
  | 'POSTFIX_TO_INFIX'
  | 'POSTFIX_TO_PREFIX'
  | 'PREFIX_TO_INFIX'
  | 'PREFIX_TO_POSTFIX';

const PRESETS = [
  { label: 'Infix → Postfix: A + B * C', expr: 'A + B * C', type: 'INFIX', route: 'INFIX_TO_POSTFIX' },
  { label: 'Infix → Prefix: (A + B) * (C - D)', expr: '(A + B) * (C - D)', type: 'INFIX', route: 'INFIX_TO_PREFIX' },
  { label: 'Infix → Postfix (Exponents): A + B ^ C * D', expr: 'A + B ^ C * D', type: 'INFIX', route: 'INFIX_TO_POSTFIX' },
  { label: 'Postfix → Infix: A B + C *', expr: 'A B + C *', type: 'POSTFIX', route: 'POSTFIX_TO_INFIX' },
  { label: 'Prefix → Postfix: * + A B - C D', expr: '* + A B - C D', type: 'PREFIX', route: 'PREFIX_TO_POSTFIX' },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function DashboardUI() {
  const [expression, setExpression] = useState('A + B * C');
  const [inputType, setInputType] = useState<ExpressionType>('INFIX');
  const [route, setRoute] = useState<ConversionRoute>('INFIX_TO_POSTFIX');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSteps = useCallback(async (exprStr: string, routeStr: ConversionRoute) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: exprStr, route: routeStr }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.errorMessage || data.validation?.errorMessage || 'Failed to process expression.');
        setSteps([]);
        setIsLoading(false);
        return;
      }

      setSteps(data.steps || []);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    } catch (err: any) {
      console.error('Failed to connect to backend API:', err);
      setErrorMessage('Backend API unreachable. Ensure Express server is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSteps(expression, route);
  }, []);

  const handleInputTypeChange = (type: ExpressionType) => {
    setInputType(type);
    if (type === 'INFIX') setRoute('INFIX_TO_POSTFIX');
    else if (type === 'POSTFIX') setRoute('POSTFIX_TO_INFIX');
    else setRoute('PREFIX_TO_INFIX');
  };

  const handlePresetSelect = (presetIndex: number) => {
    const preset = PRESETS[presetIndex];
    if (!preset) return;
    setExpression(preset.expr);
    setInputType(preset.type as ExpressionType);
    setRoute(preset.route as ConversionRoute);
    fetchSteps(preset.expr, preset.route as ConversionRoute);
  };

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    const intervalMs = 1200 / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
          return prev;
        }
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, steps, playbackSpeed]);

  const currentStep = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto font-sans antialiased flex flex-col justify-between">
      <div className="space-y-5">
        {/* Top Header with Custom Branded Icon */}
        <header className="flex flex-wrap items-center justify-between gap-4 bg-[#0d0d11]/90 p-4 rounded-xl border border-white/10 shadow-crisp-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden p-1">
              <img src="/icon.png" alt="Expression 3D Engine Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-mono font-semibold tracking-wider text-zinc-100 uppercase">
                Expression 3D Engine
              </h1>
            </div>
          </div>

          {/* Presets Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase font-medium">Presets</span>
            <select
              onChange={(e) => e.target.value !== '' && handlePresetSelect(parseInt(e.target.value, 10))}
              className="bg-zinc-900/80 border border-white/10 text-xs text-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-zinc-500 font-mono cursor-pointer"
            >
              <option value="">Select preset expression...</option>
              {PRESETS.map((p, idx) => (
                <option key={idx} value={idx}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Input & Mode Selection Card */}
        <div className="bg-[#0d0d11]/90 p-5 rounded-xl border border-white/10 shadow-crisp-card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Mathematical Expression Input */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 font-medium uppercase block">
                Expression String:
              </label>
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g. A + B * C"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            {/* Recessed Segmented Tab Control */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 font-medium uppercase block">
                Input Format:
              </label>
              <div className="grid grid-cols-3 gap-1 bg-zinc-900/80 p-1 rounded-lg border border-white/5 font-mono text-xs text-center">
                {(['INFIX', 'POSTFIX', 'PREFIX'] as ExpressionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleInputTypeChange(t)}
                    className={`py-1 rounded-md text-[11px] font-mono transition-all ${
                      inputType === t
                        ? 'bg-zinc-800 text-zinc-100 font-medium shadow-sm border border-white/10'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Conversion Route Dropdown */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 font-medium uppercase block">
                Target Conversion:
              </label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value as ConversionRoute)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 cursor-pointer"
              >
                {inputType === 'INFIX' && (
                  <>
                    <option value="INFIX_TO_POSTFIX">Convert to Postfix</option>
                    <option value="INFIX_TO_PREFIX">Convert to Prefix</option>
                  </>
                )}
                {inputType === 'POSTFIX' && (
                  <>
                    <option value="POSTFIX_TO_INFIX">Convert to Infix</option>
                    <option value="POSTFIX_TO_PREFIX">Convert to Prefix</option>
                  </>
                )}
                {inputType === 'PREFIX' && (
                  <>
                    <option value="PREFIX_TO_INFIX">Convert to Infix</option>
                    <option value="PREFIX_TO_POSTFIX">Convert to Postfix</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Action Button & Error Toast */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            {errorMessage ? (
              <div className="flex items-center gap-2 text-xs text-rose-400 font-mono bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-500/30">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                <span>{errorMessage}</span>
              </div>
            ) : (
              <div />
            )}

            {/* Primary Solid Action Button */}
            <button
              onClick={() => fetchSteps(expression, route)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-semibold text-xs tracking-wider border border-white/20 shadow-btn-highlight transition-all disabled:opacity-50 ml-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-zinc-950" strokeWidth={1.5} />
                  <span>Visualize 3D Stack</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Precedence Matrix Guide */}
        <ExpressionGuide />

        {/* 3D Scene + Execution Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 flex flex-col space-y-4">
            <Scene3D
              stackState={currentStep?.currentStack || []}
              poppedItems={currentStep?.poppedItems || []}
            />
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <StepTable
              steps={steps}
              currentStepIndex={currentStepIndex}
              onStepSelect={(idx) => {
                setCurrentStepIndex(idx);
                setIsPlaying(false);
              }}
            />
          </div>
        </div>

        {/* Playback Controls Footer */}
        <PlaybackControls
          currentStep={currentStepIndex}
          totalSteps={steps.length}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onStepForward={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
          onStepBackward={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
          onJumpStart={() => setCurrentStepIndex(0)}
          onJumpEnd={() => setCurrentStepIndex(Math.max(0, steps.length - 1))}
          onReset={() => {
            setCurrentStepIndex(0);
            setIsPlaying(false);
          }}
          onSeek={(stepIdx) => {
            setCurrentStepIndex(stepIdx);
            setIsPlaying(false);
          }}
          onSpeedChange={setPlaybackSpeed}
        />
      </div>

      {/* Sleek Copyright Footer */}
      <footer className="border-t border-white/5 pt-6 pb-2 text-center">
        <p className="text-xs text-zinc-500 font-mono tracking-wider">
          &copy; 2026 Arnab Ghorai. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
