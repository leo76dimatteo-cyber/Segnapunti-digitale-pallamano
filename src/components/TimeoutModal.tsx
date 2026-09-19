import React from 'react';
import { MatchState } from '../types';
import { Clock, Play, Pause, X } from 'lucide-react';

interface TimeoutModalProps {
  matchState: MatchState;
  onCloseTimeout: () => void;
  onToggleTimeoutTimer: () => void;
}

export const TimeoutModal: React.FC<TimeoutModalProps> = ({
  matchState,
  onCloseTimeout,
  onToggleTimeoutTimer,
}) => {
  const { activeTimeout } = matchState;
  if (!activeTimeout) return null;

  const team = activeTimeout.team === 'home' ? matchState.homeTeam : matchState.awayTeam;
  const isHome = activeTimeout.team === 'home';

  const secs = activeTimeout.secondsRemaining;
  const isExpired = secs <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl text-center text-slate-100">
        <div className="flex justify-end">
          <button
            onClick={onCloseTimeout}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
          TIME-OUT DI SQUADRA (1 MINUTO)
        </span>

        <h3 className={`text-xl font-black mt-1 ${isHome ? 'text-red-400' : 'text-blue-400'}`}>
          {team.name}
        </h3>

        {/* Big Countdown */}
        <div className="my-5">
          <div className={`text-6xl font-black font-mono tracking-tight ${
            isExpired ? 'text-red-500 animate-bounce' : 'text-white'
          }`}>
            00:{secs < 10 ? '0' : ''}{secs}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {isExpired ? 'TEMPO SCADUTO - FISCHIO ARBITRALE' : 'Secondi rimanenti al termine del Time-Out'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTimeoutTimer}
            className={`flex-1 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 ${
              activeTimeout.isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {activeTimeout.isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSA</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>RIPRENDI</span>
              </>
            )}
          </button>

          <button
            onClick={onCloseTimeout}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition"
          >
            Fine Time-Out
          </button>
        </div>
      </div>
    </div>
  );
};
