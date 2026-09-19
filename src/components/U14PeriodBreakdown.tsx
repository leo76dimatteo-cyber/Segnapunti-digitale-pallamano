import React from 'react';
import { MatchState } from '../types';
import { Award, Info, RotateCcw, CheckCircle2, CircleDashed } from 'lucide-react';

interface U14PeriodBreakdownProps {
  matchState: MatchState;
  onReopenPeriod: (periodNumber: number) => void;
}

export const U14PeriodBreakdown: React.FC<U14PeriodBreakdownProps> = ({
  matchState,
  onReopenPeriod,
}) => {
  const periods = [1, 2, 3];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-5 shadow-xl my-3">
      {/* Header with Title and MHC Rule Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-2">
              Tabella Tempi &amp; Punti Under 14
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                Format MHC FIGH 2026/27
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              3 tempi da 15' indipendenti. Reti azzerate a ogni tempo. Vittoria tempo = 1 pt, Pareggio = 0.5 pt.
            </p>
          </div>
        </div>

        {/* Live Total Points Summary */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase">Punti Totali:</span>
          <span className="text-base sm:text-lg font-black font-mono text-amber-400">
            {matchState.homeTotalPoints} <span className="text-slate-600">-</span> {matchState.awayTotalPoints}
          </span>
        </div>
      </div>

      {/* Grid of the 3 Periods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        {periods.map(periodNum => {
          const result = matchState.periodResults.find(r => r.period === periodNum);
          const isCurrent = matchState.currentPeriod === periodNum && !matchState.isMatchOver;
          const isClosed = result?.isClosed;

          let homeG = 0;
          let awayG = 0;
          let homeP = 0;
          let awayP = 0;

          if (result) {
            homeG = result.homeGoals;
            awayG = result.awayGoals;
            homeP = result.homePoints;
            awayP = result.awayPoints;
          } else if (isCurrent) {
            homeG = matchState.homePeriodGoals;
            awayG = matchState.awayPeriodGoals;
          }

          return (
            <div
              key={periodNum}
              className={`rounded-2xl p-3.5 border transition-all ${
                isCurrent
                  ? 'bg-slate-950/80 border-amber-500/50 ring-1 ring-amber-500/30 shadow-lg'
                  : isClosed
                  ? 'bg-slate-950/50 border-slate-800'
                  : 'bg-slate-950/30 border-slate-800 opacity-60'
              }`}
            >
              {/* Period Header */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  {isClosed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  ) : (
                    <CircleDashed className="w-4 h-4 text-slate-600" />
                  )}
                  <span className="font-bold text-xs sm:text-sm text-slate-200">
                    {periodNum}° Tempo (15')
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isClosed
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : isCurrent
                    ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {isClosed ? 'Concluso' : isCurrent ? 'IN CORSO' : 'Da disputare'}
                </span>
              </div>

              {/* Goals in this period */}
              <div className="flex items-center justify-between bg-slate-900/90 rounded-xl p-2.5 my-2 border border-slate-800">
                <div className="text-center flex-1">
                  <span className="text-[10px] text-red-400 font-bold block truncate">
                    {matchState.homeTeam.shortName || 'CASA'}
                  </span>
                  <span className="text-2xl font-black font-mono text-white">{homeG}</span>
                </div>
                <div className="text-slate-600 font-mono font-bold text-sm px-2">RETI</div>
                <div className="text-center flex-1">
                  <span className="text-[10px] text-blue-400 font-bold block truncate">
                    {matchState.awayTeam.shortName || 'OSPITI'}
                  </span>
                  <span className="text-2xl font-black font-mono text-white">{awayG}</span>
                </div>
              </div>

              {/* Points assigned for this period */}
              <div className="flex items-center justify-between text-xs px-1 py-1">
                <span className="text-slate-400 text-[11px]">Punti assegnati:</span>
                <span className="font-mono font-black text-sm text-amber-300">
                  {isClosed ? `${homeP} pt - ${awayP} pt` : isCurrent ? 'Calcolo a fine tempo' : '0 pt - 0 pt'}
                </span>
              </div>

              {/* Reopen Closed Period Button (Gestione errori) */}
              {isClosed && (
                <button
                  onClick={() => onReopenPeriod(periodNum)}
                  className="mt-2 w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-amber-300 rounded-xl text-[11px] font-semibold border border-slate-700/80 flex items-center justify-center gap-1.5 transition"
                  title="Riapri questo tempo per correggere gol e ricalcolare i punti"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>Riapri tempo per correzioni</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Regolamento FIGH Explanatory Note Callout */}
      <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-200/90 leading-relaxed">
          <strong>Regolamento Under 14 MHC:</strong> Il tabellone reti si azzera a 0-0 all'inizio di ciascuno dei 3 tempi. Anche in caso di ampio scarto di reti nel 1° tempo (che vale comunque max 1 punto), la squadra in svantaggio riparte da 0-0 nel tempo successivo. Il risultato ufficiale della gara è dato unicamente dalla somma dei punti dei 3 tempi.
        </p>
      </div>
    </div>
  );
};
