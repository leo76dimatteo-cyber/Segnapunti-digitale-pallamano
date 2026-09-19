import React from 'react';
import { MatchState, Player } from '../types';
import { Plus, X, Zap } from 'lucide-react';

interface GoalAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchState: MatchState;
  selectedTeam: 'home' | 'away';
  onConfirmGoal: (team: 'home' | 'away', player?: Player) => void;
}

export const GoalAssignModal: React.FC<GoalAssignModalProps> = ({
  isOpen,
  onClose,
  matchState,
  selectedTeam,
  onConfirmGoal,
}) => {
  if (!isOpen) return null;

  const team = selectedTeam === 'home' ? matchState.homeTeam : matchState.awayTeam;
  const isHome = selectedTeam === 'home';

  const handleSelectPlayer = (player: Player) => {
    onConfirmGoal(selectedTeam, player);
    onClose();
  };

  const handleQuickGoalWithoutPlayer = () => {
    onConfirmGoal(selectedTeam, undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl ${isHome ? 'bg-red-600' : 'bg-blue-600'} text-white flex items-center justify-center font-bold`}>
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">
                Assegna Marcatore Gol
              </h3>
              <p className="text-[11px] text-slate-400">
                Squadra: <strong className={isHome ? 'text-red-400' : 'text-blue-400'}>{team.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Goal without specific player */}
        <div className="mt-4">
          <button
            onClick={handleQuickGoalWithoutPlayer}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Gol Rapido (Senza assegnare giocatore)</span>
          </button>
        </div>

        {/* Players Grid */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Oppure tocca il giocatore che ha segnato:
          </label>

          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {team.players.map(player => {
              const goalsCount = matchState.goals.filter(g => g.team === selectedTeam && g.playerId === player.id).length;
              return (
                <button
                  key={player.id}
                  onClick={() => handleSelectPlayer(player)}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-95 ${
                    isHome 
                      ? 'bg-slate-950 hover:bg-red-950/50 border-slate-800 hover:border-red-600/50' 
                      : 'bg-slate-950 hover:bg-blue-950/50 border-slate-800 hover:border-blue-600/50'
                  }`}
                >
                  <span className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-black text-xs text-amber-400 flex-shrink-0">
                    {player.number}
                  </span>
                  <div className="truncate flex-1 min-w-0">
                    <span className="font-semibold text-xs text-slate-200 block truncate">
                      {player.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {goalsCount} gol finora
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cancel Button */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};
