import React, { useState } from 'react';
import { MatchState, GoalEvent, SanctionEvent } from '../types';
import { 
  ListFilter, 
  Trash2
} from 'lucide-react';

interface MatchLogProps {
  matchState: MatchState;
  onDeleteGoal: (goalId: string) => void;
  onDeleteSanction: (sanctionId: string) => void;
}

type FilterType = 'all' | 'goals' | 'sanctions';

export const MatchLog: React.FC<MatchLogProps> = ({
  matchState,
  onDeleteGoal,
  onDeleteSanction,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  // Merge goals and sanctions in reverse chronological order
  type LogItem = 
    | { type: 'goal'; data: GoalEvent; timestamp: number }
    | { type: 'sanction'; data: SanctionEvent; timestamp: number };

  const allItems: LogItem[] = [
    ...matchState.goals.map(g => ({ type: 'goal' as const, data: g, timestamp: g.timestamp })),
    ...matchState.sanctions.map(s => ({ type: 'sanction' as const, data: s, timestamp: s.timestamp }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filteredItems = allItems.filter(item => {
    if (filter === 'goals') return item.type === 'goal';
    if (filter === 'sanctions') return item.type === 'sanction';
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
              {allItems.length} azioni registrate (Gol, cartellini, sospensioni)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
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
            Solo Gol ({matchState.goals.length})
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

                    <div className="truncate flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${typeBadge.bg}`}>
                        {typeBadge.label}
                      </span>
                      <strong className={isHome ? 'text-red-400' : 'text-blue-400'}>
                        {isHome ? matchState.homeTeam.shortName : matchState.awayTeam.shortName}
                      </strong>
                      <span className="text-slate-200">
                        #{s.playerNumber} {s.playerName}
                      </span>
                      {s.note && <span className="text-slate-500 italic">({s.note})</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteSanction(s.id)}
                    className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition flex-shrink-0"
                    title="Elimina questo provvedimento"
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
