import React from 'react';
import { MatchState } from '../types';
import { CATEGORIES } from '../utils/categories';
import { sound } from '../utils/sound';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Undo2, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  Award,
  Volume2,
  Shield,
  SlidersHorizontal,
  FileText,
  Target
} from 'lucide-react';

interface ScoreboardProps {
  matchState: MatchState;
  onGoalClick: (team: 'home' | 'away') => void;
  onSubtractGoal: (team: 'home' | 'away') => void;
  onUndoLastGoal: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  onClosePeriodOrNext: () => void;
  onTriggerTimeout: (team: 'home' | 'away') => void;
  onOpenSanctionModal: (team: 'home' | 'away') => void;
  onOpenGoalkeepers?: () => void;
  onOpenManualTimer?: () => void;
  onOpenReport?: () => void;
  onOpenSevenMeterModal?: (team: 'home' | 'away') => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  matchState,
  onGoalClick,
  onSubtractGoal,
  onUndoLastGoal,
  onToggleTimer,
  onResetTimer,
  onAdjustTime,
  onClosePeriodOrNext,
  onTriggerTimeout,
  onOpenSanctionModal,
  onOpenGoalkeepers,
  onOpenManualTimer,
  onOpenReport,
  onOpenSevenMeterModal,
}) => {
  const currentCategory = CATEGORIES[matchState.settings.category] || CATEGORIES.under_14;
  const isU14 = currentCategory.isU14Format;
  const totalSaves = matchState.goalkeeperStats?.reduce((acc, c) => acc + c.saves, 0) || 0;

  const homeLabel = matchState.homeTeam.shortName || 'CASA';
  const awayLabel = matchState.awayTeam.shortName || 'OSPITI';

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const lastGoal = matchState.goals.length > 0 ? matchState.goals[matchState.goals.length - 1] : null;
  const hasRecentGoals = matchState.goals.length > 0;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-3 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background Accent Gradients */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* MATCH STATUS & CONTROLS HEADER */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800 text-xs flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {matchState.isMatchOver 
              ? 'GARA CONCLUSA' 
              : matchState.isInterval 
              ? `INTERVALLO / RECUPERO (${currentCategory.intervalDurationMinutes}m)` 
              : `${matchState.currentPeriod}° TEMPO (di ${currentCategory.totalPeriods})`}
          </span>

          <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
            {currentCategory.name} • {matchState.settings.championship}
          </span>
        </div>

        {/* Period advance / status button / Report PDF */}
        <div className="flex items-center gap-2 flex-wrap">
          {matchState.isMatchOver && onOpenReport && (
            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95"
              title="Apri e visualizza referto ufficiale gara"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Referto PDF</span>
            </button>
          )}

          <button
            onClick={onClosePeriodOrNext}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
              matchState.isMatchOver
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/10'
            }`}
          >
            <span>
              {matchState.isMatchOver
                ? 'Riapri Partita'
                : matchState.isInterval
                ? `Inizia ${matchState.currentPeriod + 1}° Tempo`
                : `Chiudi ${matchState.currentPeriod}° Tempo`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN SCOREBOARD GRID */}
      <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
        {/* HOME TEAM COLUMN */}
        <div className="col-span-12 sm:col-span-4 order-2 sm:order-1 bg-red-950/20 sm:bg-transparent rounded-2xl p-2.5 sm:p-0 border border-red-900/30 sm:border-0 flex flex-col items-center text-center">
          {/* Team Name */}
          <div className="flex items-center gap-2 max-w-full justify-center">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm flex-shrink-0" />
            <span className="font-extrabold text-sm sm:text-lg text-slate-100 truncate">
              {matchState.homeTeam.name}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">CASA</span>

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

          {/* Action buttons for Home: Goal + 7m + Sanction + Timeout */}
          <div className="w-full mt-2 space-y-1.5">
            <div className="flex items-center gap-1.5 w-full">
              {/* Bottone GOL SEMPRE ESPLICITO */}
              <button
                id="btn-goal-home"
                onClick={() => onGoalClick('home')}
                className="flex-1 min-h-[48px] sm:min-h-[58px] bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-sm sm:text-lg rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition select-none"
                title={`Aggiungi Gol a ${matchState.homeTeam.name}`}
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>GOL {homeLabel}</span>
              </button>

              <button
                id="btn-subtract-goal-home"
                onClick={() => onSubtractGoal('home')}
                disabled={(isU14 ? matchState.homePeriodGoals : matchState.homeTotalGoals) <= 0}
                className="min-w-[62px] sm:min-w-[76px] min-h-[48px] sm:min-h-[58px] px-2 bg-red-950/90 hover:bg-red-900 border-2 border-red-700/80 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 text-red-200 hover:text-white font-black text-xs rounded-2xl flex items-center justify-center gap-0.5 transition select-none shadow-md shadow-red-950/40"
                title="Sottrai 1 Gol a Casa (-1 GOL)"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
                <span>-1</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 w-full">
              {/* Tasto 7 Metri Casa */}
              <button
                type="button"
                onClick={() => onOpenSevenMeterModal && onOpenSevenMeterModal('home')}
                className="min-h-[40px] py-1.5 px-1 bg-cyan-950/80 hover:bg-cyan-900 active:scale-95 text-cyan-200 hover:text-white rounded-xl text-xs font-black border border-cyan-700/80 flex items-center justify-center gap-1 shadow-sm"
                title="Registra tiro dai 7 Metri per Casa"
              >
                <Target className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
                <span>7m</span>
              </button>

              <button
                onClick={() => onOpenSanctionModal('home')}
                className="min-h-[40px] py-1.5 px-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1"
                title="Assegna sanzione o cartellino a Casa"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">Cartellino</span>
              </button>

              <button
                onClick={() => onTriggerTimeout('home')}
                className="min-h-[40px] py-1.5 px-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1"
                title="Chiama Time-Out 1 minuto per Casa"
              >
                <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="truncate">Time-Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: TIMER, CONTROLS, UNDO */}
        <div className="col-span-12 sm:col-span-4 order-1 sm:order-2 flex flex-col items-center justify-center text-center p-2.5 sm:p-0 bg-slate-950/60 sm:bg-transparent rounded-2xl border border-slate-800/80 sm:border-0 mb-1 sm:mb-0">
          {/* Main Digital Match Clock */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={onOpenManualTimer}
              className="group flex flex-col items-center cursor-pointer transition active:scale-95 select-none rounded-2xl px-2.5 py-0.5 hover:bg-slate-900/60 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              title="Clicca per aprire la modifica manuale cronometro (±1s, cifre esatte, preset)"
            >
              <div 
                id="match-clock-display"
                className={`text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-wider select-none ${
                  matchState.periodSecondsRemaining <= 60 && matchState.periodSecondsRemaining > 0
                    ? 'text-amber-400 animate-pulse'
                    : matchState.periodSecondsRemaining === 0
                    ? 'text-red-500'
                    : 'text-slate-100 group-hover:text-amber-300 transition-colors'
                }`}
              >
                {matchState.isInterval 
                  ? formatTimer(matchState.intervalSecondsRemaining) 
                  : formatTimer(matchState.periodSecondsRemaining)}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold mt-0.5 tracking-wider group-hover:text-amber-400 transition-colors">
                <span>{matchState.isInterval ? 'PAUSA INTERVALLO' : 'CRONOMETRO GARA'}</span>
                <span className="text-[9px] text-amber-400/90 font-mono font-bold bg-amber-500/15 px-1 py-0.2 rounded border border-amber-500/30">±1s</span>
              </div>
            </button>
          </div>

          {/* Primary Timer Action Buttons */}
          <div className="flex items-center gap-2 mt-2 sm:mt-3">
            <button
              id="btn-timer-toggle"
              onClick={onToggleTimer}
              className={`min-w-[120px] sm:min-w-[130px] h-12 sm:h-14 px-4 sm:px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
                matchState.isTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
              title={matchState.isTimerRunning ? "Metti in Pausa" : "Avvia Cronometro"}
            >
              {matchState.isTimerRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>PAUSA</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>AVVIA</span>
                </>
              )}
            </button>

            <button
              id="btn-timer-reset"
              onClick={onResetTimer}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl flex items-center justify-center border border-slate-700 transition active:scale-95"
              title="Azzera tempo del periodo"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              id="btn-manual-buzzer"
              onClick={() => sound.playBuzzer()}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-2xl flex items-center justify-center transition active:scale-95 shadow-sm"
              title="Suona Sirena da Tavolo / Campo ad alto volume"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Time adjustment controls: compatti con pulsante "Regola" */}
          <div className="flex items-center gap-1 sm:gap-1.5 mt-2 flex-wrap justify-center select-none">
            {/* Su desktop mostriamo anche gli stepper rapidi */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => onAdjustTime(-60)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-lg text-[10px] font-mono border border-slate-700 transition"
                title="Sottrai 1 minuto (-60s)"
              >
                -1m
              </button>
              <button
                onClick={() => onAdjustTime(-1)}
                className="px-2 py-1 bg-red-950/70 hover:bg-red-900 active:scale-95 text-red-200 rounded-lg text-[10px] font-mono font-bold border border-red-700/80 transition"
                title="Sottrai 1 secondo (-1s)"
              >
                -1s
              </button>
              <button
                onClick={() => onAdjustTime(1)}
                className="px-2 py-1 bg-emerald-950/70 hover:bg-emerald-900 active:scale-95 text-emerald-200 rounded-lg text-[10px] font-mono font-bold border border-emerald-600/80 transition"
                title="Aggiungi 1 secondo (+1s)"
              >
                +1s
              </button>
              <button
                onClick={() => onAdjustTime(60)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-lg text-[10px] font-mono border border-slate-700 transition"
                title="Aggiungi 1 minuto (+60s)"
              >
                +1m
              </button>
            </div>

            {onOpenManualTimer && (
              <button
                id="btn-open-manual-timer"
                onClick={onOpenManualTimer}
                className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/40 transition flex items-center gap-1.5 shadow-sm"
                title="Apri pannello completo modifica manuale cronometro"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Regola Tempo</span>
              </button>
            )}
          </div>

          {/* Quick Actions: Undo Last Goal & Goalkeeper Stats */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap justify-center">
            {onOpenGoalkeepers && (
              <button
                id="btn-scoreboard-goalkeepers"
                onClick={onOpenGoalkeepers}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 active:scale-95 text-emerald-300 text-xs font-bold rounded-xl transition shadow-sm"
                title="Funzione Portieri: Gol Parati, Gol Subiti e Statistiche"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portieri</span>
                {totalSaves > 0 && (
                  <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                    {totalSaves} par.
                  </span>
                )}
              </button>
            )}

            {hasRecentGoals && (
              <button
                id="btn-undo-last-goal"
                onClick={onUndoLastGoal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-amber-300 text-xs font-semibold rounded-xl border border-slate-700 transition shadow-sm max-w-full truncate"
                title="Annulla l'ultimo gol segnato"
              >
                <Undo2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  Annulla Gol ({lastGoal?.team === 'home' ? homeLabel : awayLabel})
                </span>
              </button>
            )}
          </div>
        </div>

        {/* AWAY TEAM COLUMN */}
        <div className="col-span-12 sm:col-span-4 order-3 sm:order-3 bg-blue-950/20 sm:bg-transparent rounded-2xl p-2.5 sm:p-0 border border-blue-900/30 sm:border-0 flex flex-col items-center text-center">
          {/* Team Name */}
          <div className="flex items-center gap-2 max-w-full justify-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm flex-shrink-0" />
            <span className="font-extrabold text-sm sm:text-lg text-slate-100 truncate">
              {matchState.awayTeam.name}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">OSPITI</span>

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

          {/* Action buttons for Away: Goal + 7m + Sanction + Timeout */}
          <div className="w-full mt-2 space-y-1.5">
            <div className="flex items-center gap-1.5 w-full">
              {/* Bottone GOL SEMPRE ESPLICITO */}
              <button
                id="btn-goal-away"
                onClick={() => onGoalClick('away')}
                className="flex-1 min-h-[48px] sm:min-h-[58px] bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-sm sm:text-lg rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition select-none"
                title={`Aggiungi Gol a ${matchState.awayTeam.name}`}
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>GOL {awayLabel}</span>
              </button>

              <button
                id="btn-subtract-goal-away"
                onClick={() => onSubtractGoal('away')}
                disabled={(isU14 ? matchState.awayPeriodGoals : matchState.awayTotalGoals) <= 0}
                className="min-w-[62px] sm:min-w-[76px] min-h-[48px] sm:min-h-[58px] px-2 bg-blue-950/90 hover:bg-blue-900 border-2 border-blue-700/80 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 text-blue-200 hover:text-white font-black text-xs rounded-2xl flex items-center justify-center gap-0.5 transition select-none shadow-md shadow-blue-950/40"
                title="Sottrai 1 Gol a Ospiti (-1 GOL)"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
                <span>-1</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 w-full">
              {/* Tasto 7 Metri Ospiti */}
              <button
                type="button"
                onClick={() => onOpenSevenMeterModal && onOpenSevenMeterModal('away')}
                className="min-h-[40px] py-1.5 px-1 bg-cyan-950/80 hover:bg-cyan-900 active:scale-95 text-cyan-200 hover:text-white rounded-xl text-xs font-black border border-cyan-700/80 flex items-center justify-center gap-1 shadow-sm"
                title="Registra tiro dai 7 Metri per Ospiti"
              >
                <Target className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
                <span>7m</span>
              </button>

              <button
                onClick={() => onOpenSanctionModal('away')}
                className="min-h-[40px] py-1.5 px-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1"
                title="Assegna sanzione o cartellino a Ospiti"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">Cartellino</span>
              </button>

              <button
                onClick={() => onTriggerTimeout('away')}
                className="min-h-[40px] py-1.5 px-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1"
                title="Chiama Time-Out 1 minuto per Ospiti"
              >
                <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="truncate">Time-Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
