import React, { useState, useEffect } from 'react';
import { MatchState, Player, SevenMeterOutcome } from '../types';
import { Target, X, Check, Shield, CircleSlash, Crosshair } from 'lucide-react';

interface SevenMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchState: MatchState;
  team: 'home' | 'away'; // squadra tiratrice
  onConfirmSevenMeter: (
    team: 'home' | 'away',
    outcome: SevenMeterOutcome,
    shooter?: Player
  ) => void;
}

export const SevenMeterModal: React.FC<SevenMeterModalProps> = ({
  isOpen,
  onClose,
  matchState,
  team,
  onConfirmSevenMeter,
}) => {
  const shootingTeam = team === 'home' ? matchState.homeTeam : matchState.awayTeam;
  const defendingTeam = team === 'home' ? matchState.awayTeam : matchState.homeTeam;
  const defendingTeamType = team === 'home' ? 'away' : 'home';

  const [selectedShooterId, setSelectedShooterId] = useState<string>('');
  const [outcome, setOutcome] = useState<SevenMeterOutcome>('goal');

  // Goalkeeper avversario in porta al momento del tiro
  const defendingActiveGkId = matchState.activeGoalkeepers?.[defendingTeamType];
  const defendingGkPlayer = defendingTeam.players.find(p => p.id === defendingActiveGkId);
  const isDefendingEmptyNet = matchState.emptyNet?.[defendingTeamType] || false;

  useEffect(() => {
    if (!isOpen) return;
    setOutcome('goal');
    // Pre-seleziona nessun tiratore obbligatorio o il primo della squadra
    setSelectedShooterId('');
  }, [isOpen, team]);

  if (!isOpen) return null;

  const selectedShooter = shootingTeam.players.find(p => p.id === selectedShooterId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSevenMeter(team, outcome, selectedShooter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-100 max-h-[90dvh] overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">
                Tiro dai 7 Metri (Rigore)
              </h3>
              <p className="text-[11px] text-slate-400">
                Squadra al tiro: <strong className={team === 'home' ? 'text-red-400' : 'text-blue-400'}>{shootingTeam.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Opponent Goalkeeper Info */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-400">Portiere avversario in porta:</span>
            {isDefendingEmptyNet ? (
              <span className="font-bold text-amber-400">🚨 Porta Vuota (7v6)</span>
            ) : defendingGkPlayer ? (
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-amber-300">#{defendingGkPlayer.number}</span>
                <span>{defendingGkPlayer.name}</span>
              </span>
            ) : (
              <span className="text-slate-400 italic">Nessun portiere specificato</span>
            )}
          </div>

          {/* Shooter Selection (Facoltativo) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Tiratore (Opzionale):
              </label>
              {selectedShooterId && (
                <button
                  type="button"
                  onClick={() => setSelectedShooterId('')}
                  className="text-[10px] text-slate-400 hover:text-amber-300 underline"
                >
                  Deseleziona
                </button>
              )}
            </div>
            <select
              value={selectedShooterId}
              onChange={(e) => setSelectedShooterId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">Nessun tiratore specificato (Tiro generico di squadra)</option>
              {shootingTeam.players.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.number} - {p.name} {p.role ? `(${p.role})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Selection (4 Opzioni regolamentari FIGH) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Esito del Tiro dai 7 Metri:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* 1. GOL */}
              <button
                type="button"
                onClick={() => setOutcome('goal')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition min-h-[64px] active:scale-95 ${
                  outcome === 'goal'
                    ? 'bg-emerald-500/20 border-emerald-500 text-white ring-1 ring-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-emerald-400">GOL REALIZZATO</span>
                  <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  +1 Gol a referto &amp; tabellone
                </span>
              </button>

              {/* 2. PARATO */}
              <button
                type="button"
                onClick={() => setOutcome('saved')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition min-h-[64px] active:scale-95 ${
                  outcome === 'saved'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-cyan-300">PARATO</span>
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  +1 Parata 7m al portiere avversario
                </span>
              </button>

              {/* 3. FUORI */}
              <button
                type="button"
                onClick={() => setOutcome('missed')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition min-h-[64px] active:scale-95 ${
                  outcome === 'missed'
                    ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-amber-400">FUORI</span>
                  <CircleSlash className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  Tiro errato oltre lo specchio
                </span>
              </button>

              {/* 4. PALO / TRAVERSA */}
              <button
                type="button"
                onClick={() => setOutcome('post')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition min-h-[64px] active:scale-95 ${
                  outcome === 'post'
                    ? 'bg-purple-500/20 border-purple-400 text-white ring-1 ring-purple-400 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-purple-300">PALO / TRAVERSA</span>
                  <Crosshair className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  Legno colpito
                </span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition active:scale-95"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[44px] py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-cyan-500/20 transition active:scale-95"
            >
              Registra 7 Metri
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
