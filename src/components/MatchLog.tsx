import React, { useState } from 'react';
import { MatchState, GoalEvent, SanctionEvent, SevenMeterEvent } from '../types';
import { 
  ListFilter, 
  Trash2,
  Target
} from 'lucide-react';

interface MatchLogProps {
  matchState: MatchState;
  onDeleteGoal: (goalId: string) => void;
  onDeleteSanction: (sanctionId: string) => void;
  onDeleteSevenMeter?: (sevenMeterId: string) => void;
}

type FilterType = 'all' | 'goals' | 'sanctions' | '7m';

export const MatchLog: React.FC<MatchLogProps> = ({
  matchState,
  onDeleteGoal,
  onDeleteSanction,
  onDeleteSevenMeter,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  // Merge goals, sanctions, and 7-meter events in reverse chronological order
  type LogItem = 
    | { type: 'goal'; data: GoalEvent; timestamp: number }
    | { type: 'sanction'; data: SanctionEvent; timestamp: number }
    | { type: '7m'; data: SevenMeterEvent; timestamp: number };

  const sevenEvents = matchState.sevenMeterEvents || [];

  const allItems: LogItem[] = [
    ...matchState.goals.map(g => ({ type: 'goal' as const, data: g, timestamp: g.timestamp })),
    ...matchState.sanctions.map(s => ({ type: 'sanction' as const, data: s, timestamp: s.timestamp })),
    ...sevenEvents.map(sm => ({ type: '7m' as const, data: sm, timestamp: sm.timestamp })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filteredItems = allItems.filter(item => {
    if (filter === 'goals') return item.type === 'goal';
    if (filter === 'sanctions') return item.type === 'sanction';
    if (filter === '7m') return item.type === '7m';
    return true;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-3 sm:p-5 shadow-xl my-3">
      {/* Header & Filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
            <ListFilter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-100">
              Registro Cronologico Eventi
            </h3>
            <p className="text-[11px] text-slate-400">
              {allItems.length} azioni registrate (Gol, sanzioni, tiri dai 7m)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tutti ({allItems.length})
          </button>
          <button
            onClick={() => setFilter('goals')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              filter === 'goals' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gol ({matchState.goals.length})
          </button>
          <button
            onClick={() => setFilter('7m')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              filter === '7m' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3 h-3" />
            <span>7m ({sevenEvents.length})</span>
          </button>
          <button
            onClick={() => setFilter('sanctions')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              filter === 'sanctions' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sanzioni ({matchState.sanctions.length})
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            Nessun evento registrato finora.
          </div>
        ) : (
          filteredItems.map(item => {
            if (item.type === 'goal') {
              const g = item.data;
              const isHome = g.team === 'home';
              return (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {/* Period & Minute tag */}
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 flex-shrink-0">
                      {g.period}°T • {g.minute}'{g.second < 10 ? '0' : ''}{g.second}"
                    </span>

                    {/* Team Color dot & Goal info */}
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isHome ? 'bg-red-500' : 'bg-blue-500'}`} />

                    <div className="truncate">
                      <span className="font-bold text-white">GOL </span>
                      {g.isSevenMeter && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold mr-1">
                          7m
                        </span>
                      )}
                      <strong className={isHome ? 'text-red-400' : 'text-blue-400'}>
                        {isHome ? matchState.homeTeam.name : matchState.awayTeam.name}
                      </strong>
                      {g.playerNumber ? (
                        <span className="text-slate-300 ml-1.5 font-medium">
                          (#{g.playerNumber} {g.playerName})
                        </span>
                      ) : (
                        <span className="text-slate-500 ml-1.5">(Gol Rapido)</span>
                      )}
                    </div>
                  </div>

                  {/* Progressive Score & Delete */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-mono font-bold text-slate-400 text-xs">
                      {g.homePeriodScore} - {g.awayPeriodScore}
                    </span>
                    <button
                      onClick={() => onDeleteGoal(g.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition"
                      title="Elimina questo gol"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            } else if (item.type === '7m') {
              const sm = item.data;
              const isHome = sm.team === 'home';
              const teamName = isHome ? matchState.homeTeam.name : matchState.awayTeam.name;

              const outcomeBadge = 
                sm.outcome === 'goal' ? { bg: 'bg-emerald-950 border-emerald-700 text-emerald-300', label: 'GOL' } :
                sm.outcome === 'saved' ? { bg: 'bg-cyan-950 border-cyan-700 text-cyan-300', label: 'PARATO' } :
                sm.outcome === 'missed' ? { bg: 'bg-amber-950 border-amber-700 text-amber-300', label: 'FUORI' } :
                { bg: 'bg-purple-950 border-purple-700 text-purple-300', label: 'PALO / TRAVERSA' };

              return (
                <div
                  key={sm.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/70 border border-cyan-900/40 text-xs hover:border-cyan-700 transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 flex-shrink-0 border border-cyan-800">
                      {sm.period}°T • {sm.minute}'{sm.second < 10 ? '0' : ''}{sm.second}"
                    </span>

                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isHome ? 'bg-red-500' : 'bg-blue-500'}`} />

                    <div className="truncate">
                      <span className="font-bold text-cyan-400 mr-1.5">TIRO 7m</span>
                      <strong className={isHome ? 'text-red-400' : 'text-blue-400'}>
                        {teamName}
                      </strong>
                      {sm.shooterNumber && (
                        <span className="text-slate-300 ml-1.5 font-medium">
                          (Tiratore: #{sm.shooterNumber} {sm.shooterName})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${outcomeBadge.bg}`}>
                      {outcomeBadge.label}
                    </span>
                    {onDeleteSevenMeter && (
                      <button
                        onClick={() => onDeleteSevenMeter(sm.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition"
                        title="Annulla ed elimina questo tiro dai 7 Metri"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            } else {
              const s = item.data;
              const isHome = s.team === 'home';
              const typeBadge = 
                s.type === 'yellow' ? { bg: 'bg-amber-400 text-slate-950', label: 'Giallo (Ammonizione)' } :
                s.type === '2min' ? { bg: 'bg-orange-500 text-white', label: '2 Minuti' } :
                s.type === 'red' ? { bg: 'bg-red-600 text-white', label: 'Rosso (Squalifica)' } :
                { bg: 'bg-blue-600 text-white', label: 'Blu (Rapporto)' };

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 flex-shrink-0">
                      {s.period}°T • {s.minute}'{s.second < 10 ? '0' : ''}{s.second}"
                    </span>

                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isHome ? 'bg-red-500' : 'bg-blue-500'}`} />

                    <div className="truncate">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded mr-1.5 ${typeBadge.bg}`}>
                        {typeBadge.label}
                      </span>
                      <strong className={isHome ? 'text-red-400' : 'text-blue-400'}>
                        {isHome ? matchState.homeTeam.name : matchState.awayTeam.name}
                      </strong>
                      <span className="text-slate-200 ml-1.5 font-bold">
                        #{s.playerNumber} {s.playerName}
                      </span>
                      {s.note && (
                        <span className="text-slate-400 italic ml-1">
                          - "{s.note}"
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteSanction(s.id)}
                    className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition flex-shrink-0"
                    title="Elimina questa sanzione"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
};
