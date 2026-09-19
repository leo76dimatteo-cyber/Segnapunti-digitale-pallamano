import React from 'react';
import { MatchState } from '../types';
import { Clock, X } from 'lucide-react';

interface SuspensionsBarProps {
  matchState: MatchState;
  onCancelSuspension: (suspensionId: string) => void;
}

export const SuspensionsBar: React.FC<SuspensionsBarProps> = ({
  matchState,
  onCancelSuspension,
}) => {
  const { activeSuspensions } = matchState;

  if (activeSuspensions.length === 0) {
    return null;
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const homeSuspensions = activeSuspensions.filter(s => s.team === 'home');
  const awaySuspensions = activeSuspensions.filter(s => s.team === 'away');

  return (
    <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 shadow-md my-2">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>ESCLUSIONI 2 MINUTI ATTIVE SUL CAMPO</span>
        </div>
        <span className="text-[11px] text-amber-300/80 font-medium">
          {activeSuspensions.length} in corso
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Home Suspensions */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            {matchState.homeTeam.shortName || 'CASA'}: {homeSuspensions.length > 0 ? `${homeSuspensions.length} giocatori fuori` : 'Nessuna'}
          </div>
          {homeSuspensions.map(s => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-red-950/70 border border-red-800/60 rounded-xl px-3 py-1.5 text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono font-black text-amber-300">#{s.playerNumber}</span>
                <span className="font-semibold text-slate-200 truncate">{s.playerName}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`font-mono font-extrabold px-2 py-0.5 rounded-lg text-xs ${
                  s.remainingSeconds <= 10 ? 'bg-amber-500 text-slate-950 animate-bounce' : 'bg-red-900/90 text-red-200'
                }`}>
                  {formatSeconds(s.remainingSeconds)}
                </span>
                <button
                  onClick={() => onCancelSuspension(s.id)}
                  className="text-slate-400 hover:text-red-300 p-0.5 rounded transition"
                  title="Revoca / Chiudi anticipatamente sospensione"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Away Suspensions */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            {matchState.awayTeam.shortName || 'OSPITI'}: {awaySuspensions.length > 0 ? `${awaySuspensions.length} giocatori fuori` : 'Nessuna'}
          </div>
          {awaySuspensions.map(s => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-blue-950/70 border border-blue-800/60 rounded-xl px-3 py-1.5 text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono font-black text-amber-300">#{s.playerNumber}</span>
                <span className="font-semibold text-slate-200 truncate">{s.playerName}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`font-mono font-extrabold px-2 py-0.5 rounded-lg text-xs ${
                  s.remainingSeconds <= 10 ? 'bg-amber-500 text-slate-950 animate-bounce' : 'bg-blue-900/90 text-blue-200'
                }`}>
                  {formatSeconds(s.remainingSeconds)}
                </span>
                <button
                  onClick={() => onCancelSuspension(s.id)}
                  className="text-slate-400 hover:text-blue-300 p-0.5 rounded transition"
                  title="Revoca / Chiudi anticipatamente sospensione"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
