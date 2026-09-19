import React, { useState } from 'react';
import { MatchState, Player, SanctionType } from '../types';
import { ShieldAlert, X, AlertTriangle, Clock } from 'lucide-react';

interface DisciplinaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchState: MatchState;
  selectedTeam: 'home' | 'away';
  initialPlayer?: Player | null;
  onApplySanction: (
    team: 'home' | 'away',
    playerId: string,
    playerNumber: number,
    playerName: string,
    type: SanctionType,
    note?: string
  ) => void;
}

export const DisciplinaryModal: React.FC<DisciplinaryModalProps> = ({
  isOpen,
  onClose,
  matchState,
  selectedTeam,
  initialPlayer,
  onApplySanction,
}) => {
  const team = selectedTeam === 'home' ? matchState.homeTeam : matchState.awayTeam;
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    initialPlayer ? initialPlayer.id : team.players[0]?.id || ''
  );
  const [sanctionType, setSanctionType] = useState<SanctionType>('2min');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const targetPlayer = team.players.find(p => p.id === selectedPlayerId);

  // Check previous suspensions for this player
  const existing2Min = matchState.sanctions.filter(
    s => s.team === selectedTeam && s.playerId === selectedPlayerId && s.type === '2min'
  ).length;

  const willTriggerRedCard = sanctionType === '2min' && existing2Min >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPlayer) return;

    onApplySanction(
      selectedTeam,
      targetPlayer.id,
      targetPlayer.number,
      targetPlayer.name,
      sanctionType,
      note.trim() || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">
                Provvedimento Disciplinare
              </h3>
              <p className="text-[11px] text-slate-400">
                Squadra: <strong className={selectedTeam === 'home' ? 'text-red-400' : 'text-blue-400'}>{team.name}</strong>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Player Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Seleziona Giocatore dalla distinta:
            </label>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
              required
            >
              {team.players.map(p => {
                const count2 = matchState.sanctions.filter(s => s.team === selectedTeam && s.playerId === p.id && s.type === '2min').length;
                return (
                  <option key={p.id} value={p.id}>
                    #{p.number} - {p.name} {p.role ? `(${p.role})` : ''} {count2 > 0 ? `[${count2} x 2']` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sanction Types Radio/Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Tipo di Provvedimento FIGH:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* 2 Minuti */}
              <button
                type="button"
                onClick={() => setSanctionType('2min')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                  sanctionType === '2min'
                    ? 'bg-orange-500/20 border-orange-500 text-white ring-1 ring-orange-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-orange-400">2 Minuti</span>
                  <Clock className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  Esclusione temporanea 120s
                </span>
              </button>

              {/* Giallo */}
              <button
                type="button"
                onClick={() => setSanctionType('yellow')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                  sanctionType === 'yellow'
                    ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-amber-400">Cartellino Giallo</span>
                  <span className="w-3.5 h-4.5 bg-amber-400 rounded-sm inline-block shadow-sm"></span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  Ammonizione verbale/formale
                </span>
              </button>

              {/* Rosso */}
              <button
                type="button"
                onClick={() => setSanctionType('red')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                  sanctionType === 'red'
                    ? 'bg-red-500/20 border-red-500 text-white ring-1 ring-red-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-red-500">Cartellino Rosso</span>
                  <span className="w-3.5 h-4.5 bg-red-600 rounded-sm inline-block shadow-sm"></span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  Squalifica definitiva gara
                </span>
              </button>

              {/* Blu */}
              <button
                type="button"
                onClick={() => setSanctionType('blue')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                  sanctionType === 'blue'
                    ? 'bg-blue-500/20 border-blue-500 text-white ring-1 ring-blue-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-blue-400">Cartellino Blu</span>
                  <span className="w-3.5 h-4.5 bg-blue-600 rounded-sm inline-block shadow-sm"></span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  Rosso + Rapporto Scritto FIGH
                </span>
              </button>
            </div>
          </div>

          {/* Automatic 3rd 2-min warning banner */}
          {willTriggerRedCard && (
            <div className="p-3 bg-red-950/80 border border-red-700 rounded-2xl flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-200">
                <strong>Attenzione: 3ª Esclusione da 2 Minuti!</strong>
                <p className="mt-0.5 text-[11px] text-red-300">
                  Ai sensi del regolamento FIGH, alla 3ª esclusione temporanea scatta automaticamente la SQUALIFICA (Cartellino Rosso) per il giocatore.
                </p>
              </div>
            </div>
          )}

          {/* Optional Note */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Note aggiuntive (es. fallo antisportivo, proteste):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Facoltativo..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              Conferma Sanzione
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
