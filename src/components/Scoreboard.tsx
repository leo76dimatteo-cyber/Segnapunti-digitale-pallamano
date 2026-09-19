import React from 'react';
import { MatchState } from '../types';
import { CATEGORIES } from '../utils/categories';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Undo2, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  Award
} from 'lucide-react';

interface ScoreboardProps {
  matchState: MatchState;
  onGoalClick: (team: 'home' | 'away') => void;
  onUndoLastGoal: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  onClosePeriodOrNext: () => void;
  onTriggerTimeout: (team: 'home' | 'away') => void;
  onOpenSanctionModal: (team: 'home' | 'away') => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  matchState,
  onGoalClick,
  onUndoLastGoal,
  onToggleTimer,
  onResetTimer,
  onAdjustTime,
  onClosePeriodOrNext,
  onTriggerTimeout,
  onOpenSanctionModal,
}) => {
  const currentCategory = CATEGORIES[matchState.settings.category] || CATEGORIES.under_14;
  const isU14 = currentCategory.isU14Format;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const hasRecentGoals = matchState.goals.length > 0;
  const lastGoal = hasRecentGoals ? matchState.goals[matchState.goals.length - 1] : null;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 opacity-80" />

      {/* Period and Match Phase Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
              matchState.isTimerRunning ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-0'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              matchState.isTimerRunning ? 'bg-emerald-500' : 'bg-slate-500'
            }`}></span>
          </span>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
            {matchState.isMatchOver ? (
              <span className="text-amber-400 font-extrabold">🏆 GARA CONCLUSA</span>
            ) : matchState.isInterval ? (
              <span className="text-blue-400 font-semibold">☕ INTERVALLO ({formatTimer(matchState.intervalSecondsRemaining)})</span>
            ) : (
              <span>
                {matchState.currentPeriod}° TEMPO <span className="text-slate-500 text-xs">di {matchState.settings.totalPeriods}</span>
              </span>
            )}
          </span>
        </div>

        {/* U14 Specific Badge */}
        {isU14 && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-[11px] font-semibold text-amber-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Punti Tempo:</span>
            <span className="font-mono font-bold">1 pt vittoria | 0.5 pt pareggio</span>
          </div>
        )}

        {/* Timeout indicators */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClosePeriodOrNext}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1 ${
              matchState.isMatchOver
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                : matchState.periodSecondsRemaining === 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <span>
              {matchState.isMatchOver 
                ? 'Riapri Ultimo Tempo' 
                : matchState.isInterval
                ? `Inizia ${matchState.currentPeriod}° Tempo`
                : isU14
                ? `Chiudi ${matchState.currentPeriod}° Tempo`
                : matchState.currentPeriod < matchState.settings.totalPeriods
                ? `Fine ${matchState.currentPeriod}° Tempo`
                : 'Termina Partita'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Scoreboard Layout: Home Team | Timer & Period | Away Team */}
      <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
        {/* HOME TEAM COLUMN */}
        <div className="col-span-5 sm:col-span-4 flex flex-col items-center text-center p-2 sm:p-3 rounded-2xl bg-slate-950/60 border border-red-900/30">
          <div className="flex items-center gap-1.5 mb-1 max-w-full">
            <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
            <span className="font-black text-sm sm:text-base text-red-400 truncate tracking-wide">
              {matchState.homeTeam.name}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">CASA</span>

          {/* Home Score Value */}
          <div className="my-1 sm:my-2">
            <div 
              id="score-home-live"
              className="text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-white select-none drop-shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
            >
              {isU14 ? matchState.homePeriodGoals : matchState.homeTotalGoals}
            </div>
          </div>

          {/* U14: Show Points & Cumulative goals for Home */}
          {isU14 && (
            <div className="mt-1 space-y-1 w-full">
              <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl py-1 px-2 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Punti Ufficiali</span>
                <span className="text-base sm:text-xl font-black font-mono text-amber-400">
                  {matchState.homeTotalPoints} <span className="text-xs font-normal">pt</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Totale reti: <strong className="text-slate-200">{matchState.homeTotalGoals}</strong>
              </div>
            </div>
          )}

          {/* Action buttons for Home: Goal + Sanction + Timeout */}
          <div className="w-full mt-2 space-y-2">
            <button
              id="btn-goal-home"
              onClick={() => onGoalClick('home')}
              className="w-full min-h-[52px] sm:min-h-[64px] bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-lg sm:text-2xl rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition select-none"
              title="Aggiungi Gol Squadra Casa (+1)"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
              <span>GOL CASA</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5 w-full">
              <button
                onClick={() => onOpenSanctionModal('home')}
                className="py-2 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1"
                title="Assegna sanzione o cartellino a Casa"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Cartellino</span>
              </button>
              <button
                onClick={() => onTriggerTimeout('home')}
                className="py-2 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1"
                title="Chiama Time-Out 1 minuto per Casa"
              >
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Time-Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: TIMER, CONTROLS, UNDO */}
        <div className="col-span-2 sm:col-span-4 flex flex-col items-center justify-center text-center px-1">
          {/* Main Digital Match Clock */}
          <div className="flex flex-col items-center">
            <div 
              id="match-clock-display"
              className={`text-3xl sm:text-5xl md:text-6xl font-black font-mono tracking-wider select-none ${
                matchState.periodSecondsRemaining <= 60 && matchState.periodSecondsRemaining > 0
                  ? 'text-amber-400 animate-pulse'
                  : matchState.periodSecondsRemaining === 0
                  ? 'text-red-500'
                  : 'text-slate-100'
              }`}
            >
              {matchState.isInterval 
                ? formatTimer(matchState.intervalSecondsRemaining) 
                : formatTimer(matchState.periodSecondsRemaining)}
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5 tracking-wider">
              {matchState.isInterval ? 'PAUSA INTERVALLO' : 'CRONOMETRO GARA'}
            </span>
          </div>

          {/* Timer Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3">
            <button
              id="btn-timer-toggle"
              onClick={onToggleTimer}
              className={`min-w-[48px] h-12 sm:h-14 px-3 sm:px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
                matchState.isTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
              title={matchState.isTimerRunning ? "Metti in Pausa" : "Avvia Cronometro"}
            >
              {matchState.isTimerRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span className="hidden sm:inline">PAUSA</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span className="hidden sm:inline">AVVIA</span>
                </>
              )}
            </button>

            <button
              id="btn-timer-reset"
              onClick={onResetTimer}
              className="w-10 sm:w-12 h-12 sm:h-14 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl flex items-center justify-center border border-slate-700 transition active:scale-95"
              title="Azzera tempo del periodo"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Time adjustment (+1m / -1m) */}
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => onAdjustTime(-60)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-mono border border-slate-700 transition"
              title="Sottrai 1 minuto"
            >
              -1 min
            </button>
            <button
              onClick={() => onAdjustTime(-10)}
              className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-mono border border-slate-700 transition"
              title="Sottrai 10 secondi"
            >
              -10s
            </button>
            <button
              onClick={() => onAdjustTime(10)}
              className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-mono border border-slate-700 transition"
              title="Aggiungi 10 secondi"
            >
              +10s
            </button>
            <button
              onClick={() => onAdjustTime(60)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-mono border border-slate-700 transition"
              title="Aggiungi 1 minuto"
            >
              +1 min
            </button>
          </div>

          {/* Quick Undo Last Goal Button */}
          {hasRecentGoals && (
            <button
              id="btn-undo-last-goal"
              onClick={onUndoLastGoal}
              className="mt-3 flex items-center gap-1 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-xl border border-slate-700 transition active:scale-95 shadow-sm"
              title="Annulla l'ultimo gol segnato (correzione errori)"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="truncate max-w-[130px]">
                Annulla Gol ({lastGoal?.team === 'home' ? matchState.homeTeam.shortName : matchState.awayTeam.shortName})
              </span>
            </button>
          )}
        </div>

        {/* AWAY TEAM COLUMN */}
        <div className="col-span-5 sm:col-span-4 flex flex-col items-center text-center p-2 sm:p-3 rounded-2xl bg-slate-950/60 border border-blue-900/30">
          <div className="flex items-center gap-1.5 mb-1 max-w-full">
            <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span className="font-black text-sm sm:text-base text-blue-400 truncate tracking-wide">
              {matchState.awayTeam.name}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">OSPITI</span>

          {/* Away Score Value */}
          <div className="my-1 sm:my-2">
            <div 
              id="score-away-live"
              className="text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-white select-none drop-shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
            >
              {isU14 ? matchState.awayPeriodGoals : matchState.awayTotalGoals}
            </div>
          </div>

          {/* U14: Show Points & Cumulative goals for Away */}
          {isU14 && (
            <div className="mt-1 space-y-1 w-full">
              <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl py-1 px-2 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Punti Ufficiali</span>
                <span className="text-base sm:text-xl font-black font-mono text-amber-400">
                  {matchState.awayTotalPoints} <span className="text-xs font-normal">pt</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Totale reti: <strong className="text-slate-200">{matchState.awayTotalGoals}</strong>
              </div>
            </div>
          )}

          {/* Action buttons for Away: Goal + Sanction + Timeout */}
          <div className="w-full mt-2 space-y-2">
            <button
              id="btn-goal-away"
              onClick={() => onGoalClick('away')}
              className="w-full min-h-[52px] sm:min-h-[64px] bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-lg sm:text-2xl rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition select-none"
              title="Aggiungi Gol Squadra Ospiti (+1)"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
              <span>GOL OSPITI</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5 w-full">
              <button
                onClick={() => onOpenSanctionModal('away')}
                className="py-2 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1"
                title="Assegna sanzione o cartellino a Ospiti"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Cartellino</span>
              </button>
              <button
                onClick={() => onTriggerTimeout('away')}
                className="py-2 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1"
                title="Chiama Time-Out 1 minuto per Ospiti"
              >
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Time-Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
