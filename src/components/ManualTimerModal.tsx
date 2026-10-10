import React, { useState, useEffect } from 'react';
import { MatchState } from '../types';
import { 
  X, 
  Clock, 
  Plus, 
  Minus, 
  RotateCcw, 
  Check, 
  Play, 
  Pause, 
  FastForward, 
  Rewind, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

interface ManualTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchState: MatchState;
  onAdjustTime: (deltaSeconds: number) => void;
  onSetExactTime: (seconds: number) => void;
  onToggleTimer: () => void;
}

export const ManualTimerModal: React.FC<ManualTimerModalProps> = ({
  isOpen,
  onClose,
  matchState,
  onAdjustTime,
  onSetExactTime,
  onToggleTimer,
}) => {
  const isInterval = matchState.isInterval;
  const maxPeriodSeconds = isInterval 
    ? matchState.settings.intervalDurationMinutes * 60 
    : matchState.settings.periodDurationMinutes * 60;

  const currentSecondsRemaining = isInterval 
    ? matchState.intervalSecondsRemaining 
    : matchState.periodSecondsRemaining;

  // Local draft seconds for precise staging before applying (or instant application)
  const [draftSeconds, setDraftSeconds] = useState<number>(currentSecondsRemaining);
  const [viewMode, setViewMode] = useState<'remaining' | 'elapsed'>('remaining');
  const [inputMinutes, setInputMinutes] = useState<string>('00');
  const [inputSeconds, setInputSeconds] = useState<string>('00');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Sync draft whenever modal opens or currentSecondsRemaining changes if modal is open
  useEffect(() => {
    if (isOpen) {
      setDraftSeconds(currentSecondsRemaining);
      const mins = Math.floor(currentSecondsRemaining / 60);
      const secs = currentSecondsRemaining % 60;
      setInputMinutes(mins.toString().padStart(2, '0'));
      setInputSeconds(secs.toString().padStart(2, '0'));
    }
  }, [isOpen, currentSecondsRemaining]);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 1800);
  };

  const updateDraft = (newSeconds: number) => {
    const clamped = Math.max(0, Math.min(maxPeriodSeconds, Math.round(newSeconds)));
    setDraftSeconds(clamped);
    const mins = Math.floor(clamped / 60);
    const secs = clamped % 60;
    setInputMinutes(mins.toString().padStart(2, '0'));
    setInputSeconds(secs.toString().padStart(2, '0'));
  };

  const handleStepDelta = (delta: number) => {
    const next = draftSeconds + delta;
    updateDraft(next);
    const sign = delta > 0 ? `+${delta}s` : `${delta}s`;
    showFeedback(`${sign}`);
  };

  const handleApplyDraft = () => {
    onSetExactTime(draftSeconds);
    showFeedback('Tempo aggiornato!');
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleApplyDirectInput = (minsStr: string, secsStr: string) => {
    const mins = Math.max(0, parseInt(minsStr, 10) || 0);
    const secs = Math.max(0, Math.min(59, parseInt(secsStr, 10) || 0));
    
    let targetRemaining = 0;
    if (viewMode === 'remaining') {
      targetRemaining = mins * 60 + secs;
    } else {
      // Elapsed mode: remaining = max - elapsed
      const targetElapsed = mins * 60 + secs;
      targetRemaining = Math.max(0, maxPeriodSeconds - targetElapsed);
    }

    updateDraft(targetRemaining);
  };

  // Helper formatting
  const formatTime = (secs: number) => {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.max(0, secs) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const elapsedSeconds = Math.max(0, maxPeriodSeconds - draftSeconds);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Modifica Manuale Cronometro
              </h2>
              <p className="text-[11px] text-slate-400">
                {isInterval ? 'Pausa Intervallo' : `Periodo ${matchState.currentPeriod}`} • Incremento/decremento preciso al secondo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
          {/* Main Digital Clock Display with mode switch */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-center relative overflow-hidden">
            {/* Mode toggle: Rimanente vs Trascorso */}
            <div className="flex items-center justify-center gap-1 mb-2">
              <button
                type="button"
                onClick={() => setViewMode('remaining')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  viewMode === 'remaining'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                Tempo Rimanente (Countdown)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('elapsed')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  viewMode === 'elapsed'
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                Tempo di Gioco (Trascorso)
              </button>
            </div>

            {/* Time number */}
            <div className="py-1">
              <span className="text-5xl sm:text-6xl font-mono font-black tracking-wider text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.35)] select-none">
                {viewMode === 'remaining' ? formatTime(draftSeconds) : formatTime(elapsedSeconds)}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono mt-1 flex items-center justify-center gap-3">
              <span>Rimanente: <strong className="text-slate-200">{formatTime(draftSeconds)}</strong></span>
              <span>•</span>
              <span>Giocato: <strong className="text-slate-200">{formatTime(elapsedSeconds)}</strong></span>
            </div>

            {feedbackMsg && (
              <div className="absolute top-2 right-3 text-[11px] font-bold text-amber-300 bg-amber-950/90 border border-amber-600/50 px-2 py-0.5 rounded-full animate-in fade-in">
                {feedbackMsg}
              </div>
            )}
          </div>

          {/* SECTION: Incremento / Decremento 1 Secondo (Focus primario) */}
          <div className="bg-slate-950/50 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Regolazione Fine (±1 Secondo)
              </span>
              <span className="text-[10px] text-slate-400">Tocca per modificare istantaneamente</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleStepDelta(-1)}
                className="min-h-[50px] py-2 px-3 bg-red-950/70 hover:bg-red-900 border-2 border-red-700/80 active:scale-95 text-red-200 hover:text-white font-black text-base rounded-xl flex items-center justify-center gap-2 transition shadow-md select-none"
                title="Sottrai 1 secondo"
              >
                <Minus className="w-5 h-5 stroke-[3] text-red-400" />
                <span>-1 SECONDO</span>
              </button>

              <button
                type="button"
                onClick={() => handleStepDelta(1)}
                className="min-h-[50px] py-2 px-3 bg-emerald-950/70 hover:bg-emerald-900 border-2 border-emerald-600/80 active:scale-95 text-emerald-200 hover:text-white font-black text-base rounded-xl flex items-center justify-center gap-2 transition shadow-md select-none"
                title="Aggiungi 1 secondo"
              >
                <Plus className="w-5 h-5 stroke-[3] text-emerald-400" />
                <span>+1 SECONDO</span>
              </button>
            </div>
          </div>

          {/* SECTION: Altri incrementi e decrementi rapidi (±5s, ±10s, ±30s, ±1m) */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 sm:p-3.5 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Salti di tempo rapidi
            </div>

            {/* Decrement row */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleStepDelta(-60)}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 rounded-xl text-xs font-mono font-bold border border-slate-700 transition text-center"
                title="Sottrai 1 minuto (-60s)"
              >
                -1m
              </button>
              <button
                type="button"
                onClick={() => handleStepDelta(-30)}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 rounded-xl text-xs font-mono font-bold border border-slate-700 transition text-center"
                title="Sottrai 30 secondi"
              >
                -30s
              </button>
              <button
                type="button"
                onClick={() => handleStepDelta(-10)}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 rounded-xl text-xs font-mono font-bold border border-slate-700 transition text-center"
                title="Sottrai 10 secondi"
              >
                -10s
              </button>
              <button
                type="button"
                onClick={() => handleStepDelta(-5)}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 rounded-xl text-xs font-mono font-bold border border-slate-700 transition text-center"
                title="Sottrai 5 secondi"
              >
                -5s
              </button>
            </div>

            {/* Increment row */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleStepDelta(5)}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 rounded-xl text-xs font-mono font-bold border border-slate-700 transition text-center"
                title="Aggiungi 5 secondi"
              >
                +5s
              </button>
              <button
                type="button"
                onClick={() => handleStepDelta(10)}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 rounded-xl text-xs font-mono font-bold border border-slate-700 transition text-center"
                title="Aggiungi 10 secondi"
              >
                +10s
              </button>
              <button
                type="button"
                onClick={() => handleStepDelta(30)}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 rounded-xl text-xs font-mono font-bold border border-slate-700 transition text-center"
                title="Aggiungi 30 secondi"
              >
                +30s
              </button>
              <button
                type="button"
                onClick={() => handleStepDelta(60)}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 rounded-xl text-xs font-mono font-bold border border-slate-700 transition text-center"
                title="Aggiungi 1 minuto (+60s)"
              >
                +1m
              </button>
            </div>
          </div>

          {/* SECTION: Impostazione manuale diretta Minuti : Secondi */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                Imposta Cifre Esatte (MM : SS)
              </span>
              <span className="text-[10px] text-slate-400">
                {viewMode === 'remaining' ? 'Rimanenti' : 'Trascorsi'}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col items-center">
                <label className="text-[10px] text-slate-400 font-bold mb-1">MINUTI</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(inputMinutes, 10) || 0;
                      const next = Math.max(0, cur - 1);
                      setInputMinutes(next.toString().padStart(2, '0'));
                      handleApplyDirectInput(next.toString(), inputSeconds);
                    }}
                    className="w-8 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-l-xl flex items-center justify-center border border-r-0 border-slate-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={inputMinutes}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInputMinutes(val);
                      handleApplyDirectInput(val, inputSeconds);
                    }}
                    className="w-16 h-10 bg-slate-900 border-y border-slate-700 text-center font-mono font-black text-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(inputMinutes, 10) || 0;
                      const next = cur + 1;
                      setInputMinutes(next.toString().padStart(2, '0'));
                      handleApplyDirectInput(next.toString(), inputSeconds);
                    }}
                    className="w-8 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-r-xl flex items-center justify-center border border-l-0 border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <span className="text-2xl font-mono font-black text-slate-500 mt-4">:</span>

              <div className="flex flex-col items-center">
                <label className="text-[10px] text-slate-400 font-bold mb-1">SECONDI</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(inputSeconds, 10) || 0;
                      const next = Math.max(0, cur - 1);
                      setInputSeconds(next.toString().padStart(2, '0'));
                      handleApplyDirectInput(inputMinutes, next.toString());
                    }}
                    className="w-8 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-l-xl flex items-center justify-center border border-r-0 border-slate-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={inputSeconds}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInputSeconds(val);
                      handleApplyDirectInput(inputMinutes, val);
                    }}
                    className="w-16 h-10 bg-slate-900 border-y border-slate-700 text-center font-mono font-black text-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(inputSeconds, 10) || 0;
                      const next = Math.min(59, cur + 1);
                      setInputSeconds(next.toString().padStart(2, '0'));
                      handleApplyDirectInput(inputMinutes, next.toString());
                    }}
                    className="w-8 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-r-xl flex items-center justify-center border border-l-0 border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: Scorciatoie momenti partita (Presets) */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Preset Partita
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  updateDraft(maxPeriodSeconds);
                  showFeedback('Inizio Periodo');
                }}
                className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700 text-center truncate"
              >
                Inizio
              </button>
              <button
                type="button"
                onClick={() => {
                  updateDraft(Math.floor(maxPeriodSeconds / 2));
                  showFeedback('Metà Tempo');
                }}
                className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700 text-center truncate"
              >
                Metà
              </button>
              <button
                type="button"
                onClick={() => {
                  updateDraft(120);
                  showFeedback('Ultimi 2 min');
                }}
                className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700 text-center truncate"
              >
                2 min
              </button>
              <button
                type="button"
                onClick={() => {
                  updateDraft(60);
                  showFeedback('Ultimo minuto');
                }}
                className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700 text-center truncate"
              >
                1 min
              </button>
              <button
                type="button"
                onClick={() => {
                  updateDraft(30);
                  showFeedback('Ultimi 30 sec');
                }}
                className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700 text-center truncate"
              >
                30s
              </button>
              <button
                type="button"
                onClick={() => {
                  updateDraft(0);
                  showFeedback('Fine Tempo (00:00)');
                }}
                className="py-1.5 px-2 bg-red-950/50 hover:bg-red-900/60 text-red-300 text-[11px] font-bold rounded-lg border border-red-800/60 text-center truncate"
              >
                00:00
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTimer}
              className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition ${
                matchState.isTimerRunning
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
              }`}
              title={matchState.isTimerRunning ? 'Metti in Pausa' : 'Avvia Cronometro'}
            >
              {matchState.isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pausa</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Avvia</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftSeconds(currentSecondsRemaining);
                const m = Math.floor(currentSecondsRemaining / 60);
                const s = currentSecondsRemaining % 60;
                setInputMinutes(m.toString().padStart(2, '0'));
                setInputSeconds(s.toString().padStart(2, '0'));
                showFeedback('Ripristinato');
              }}
              className="px-2.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition"
              title="Reimposta al valore attuale"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleApplyDraft}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Conferma Tempo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
