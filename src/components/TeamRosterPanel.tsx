import React, { useState } from 'react';
import { Player, Team, MatchState } from '../types';
import { exportSingleRosterJson } from '../utils/jsonExport';
import { 
  UserPlus, 
  Trash2, 
  Edit2, 
  ShieldAlert, 
  Check, 
  X,
  AlertCircle,
  FileJson
} from 'lucide-react';

interface TeamRosterPanelProps {
  team: Team;
  teamType: 'home' | 'away';
  matchState: MatchState;
  onQuickGoal: (teamType: 'home' | 'away', player: Player) => void;
  onQuickSanction: (teamType: 'home' | 'away', player: Player) => void;
  onAddPlayer: (teamType: 'home' | 'away', player: Omit<Player, 'id'>) => void;
  onRemovePlayer: (teamType: 'home' | 'away', playerId: string) => void;
  onUpdatePlayer: (teamType: 'home' | 'away', player: Player) => void;
  onClearTeam?: (teamType: 'home' | 'away') => void;
  onNewTeam?: (teamType: 'home' | 'away', name: string, shortName: string) => void;
}

export const TeamRosterPanel: React.FC<TeamRosterPanelProps> = ({
  team,
  teamType,
  matchState,
  onQuickGoal,
  onQuickSanction,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayer,
  onClearTeam,
  onNewTeam,
}) => {
  // Add Player form state
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Giocatore' | 'Portiere' | 'Capitano'>('Giocatore');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Player inline state
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState('');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'Giocatore' | 'Portiere' | 'Capitano'>('Giocatore');

  // New/Edit Team inline form state
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState(team.name);
  const [teamShortInput, setTeamShortInput] = useState(team.shortName);
  const [confirmClearTeam, setConfirmClearTeam] = useState(false);

  const isHome = teamType === 'home';
  const accentBorder = isHome ? 'border-red-900/40' : 'border-blue-900/40';
  const badgeBg = isHome ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300';

  const handleSaveNewPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newNumber, 10);
    if (isNaN(num) || num < 1 || num > 99) {
      setErrorMsg('Inserisci un numero di maglia valido (1-99)');
      return;
    }
    if (!newName.trim()) {
      setErrorMsg('Inserisci il nome del giocatore');
      return;
    }
    if (team.players.some(p => p.number === num)) {
      setErrorMsg(`Il numero #${num} è già assegnato in questa squadra`);
      return;
    }

    onAddPlayer(teamType, {
      number: num,
      name: newName.trim(),
      role: newRole,
    });

    setNewNumber('');
    setNewName('');
    setNewRole('Giocatore');
    setErrorMsg('');
    setIsAddingPlayer(false);
  };

  const handleStartEditPlayer = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditNumber(player.number.toString());
    setEditName(player.name);
    setEditRole(player.role || 'Giocatore');
  };

  const handleSaveEditPlayer = (playerId: string) => {
    const num = parseInt(editNumber, 10);
    if (isNaN(num) || num < 1 || num > 99) return;
    if (!editName.trim()) return;

    onUpdatePlayer(teamType, {
      id: playerId,
      number: num,
      name: editName.trim(),
      role: editRole,
    });
    setEditingPlayerId(null);
  };

  const handleSaveNewTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamNameInput.trim()) return;
    const short = (teamShortInput.trim() || teamNameInput.substring(0, 3)).toUpperCase();
    if (onNewTeam) {
      onNewTeam(teamType, teamNameInput.trim(), short);
    }
    setIsEditingTeam(false);
  };

  const handleExecuteClearTeam = () => {
    if (onClearTeam) {
      onClearTeam(teamType);
    }
    setConfirmClearTeam(false);
  };

  return (
    <div className={`bg-slate-900/80 border ${accentBorder} rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col h-full`}>
      {/* Team Header & Actions */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 truncate min-w-0">
          <span className={`w-3 h-3 rounded-full ${isHome ? 'bg-red-500' : 'bg-blue-500'} flex-shrink-0`} />
          <h4 className="font-extrabold text-sm sm:text-base text-slate-100 truncate">
            {team.name}
          </h4>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${badgeBg} flex-shrink-0`}>
            {team.players.length} gioc.
          </span>
        </div>

        {/* Action Buttons: Nuova Squadra, Elimina Squadra, + Giocatore */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Export Roster JSON */}
          <button
            onClick={() => exportSingleRosterJson(team)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95 border border-slate-700/60"
            title={`Esporta la rosa di ${team.name} in formato JSON`}
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline text-[11px]">Salva JSON</span>
          </button>

          {/* New / Edit Team */}
          <button
            onClick={() => {
              setTeamNameInput(team.name);
              setTeamShortInput(team.shortName);
              setIsEditingTeam(!isEditingTeam);
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95"
            title="Nuova squadra o modifica nome"
          >
            <Edit2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline text-[11px]">Nuova/Modifica</span>
          </button>

          {/* Clear / Delete Team Roster */}
          {confirmClearTeam ? (
            <div className="flex items-center gap-1 bg-red-950 p-1 rounded-xl border border-red-800 animate-in fade-in">
              <button
                onClick={handleExecuteClearTeam}
                className="px-2 py-0.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold"
                title="Svuota tutti i giocatori di questa squadra"
              >
                Sì, Elimina Rosa
              </button>
              <button
                onClick={() => setConfirmClearTeam(false)}
                className="p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClearTeam(true)}
              className="p-1.5 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              title="Elimina/Svuota tutti i giocatori da questa squadra"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Elimina</span>
            </button>
          )}

          {/* Add Player Button */}
          <button
            onClick={() => setIsAddingPlayer(!isAddingPlayer)}
            className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95 ${
              isAddingPlayer ? 'bg-slate-800 text-slate-300' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
            }`}
            title="Aggiungi nuovo giocatore alla distinta"
          >
            {isAddingPlayer ? <X className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-bold">{isAddingPlayer ? 'Annulla' : '+ Giocatore'}</span>
          </button>
        </div>
      </div>

      {/* Inline Form: Nuova / Modifica Squadra */}
      {isEditingTeam && (
        <form onSubmit={handleSaveNewTeam} className="my-2 p-3 bg-slate-950 rounded-2xl border border-sky-900/60 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Configura Squadra {isHome ? 'Casa' : 'Ospiti'}:
            </span>
            <button type="button" onClick={() => setIsEditingTeam(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Nome Squadra"
                value={teamNameInput}
                onChange={(e) => setTeamNameInput(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                required
              />
            </div>
            <div>
              <input
                type="text"
                maxLength={5}
                placeholder="Sigla (RUB)"
                value={teamShortInput}
                onChange={(e) => setTeamShortInput(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white text-center focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="submit"
              className="py-1 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition"
            >
              Salva Dati Squadra
            </button>
          </div>
        </form>
      )}

      {/* Inline Quick Add Player Form */}
      {isAddingPlayer && (
        <form onSubmit={handleSaveNewPlayer} className="my-2 p-2.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="99"
              placeholder="N°"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              className="w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-amber-400"
              required
            />
            <input
              type="text"
              placeholder="Cognome Nome atleta"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              required
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'Giocatore' | 'Portiere' | 'Capitano')}
              className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-[11px] text-slate-300 focus:outline-none"
            >
              <option value="Giocatore">Giocatore</option>
              <option value="Portiere">Portiere (P)</option>
              <option value="Capitano">Capitano (C)</option>
            </select>
            <button
              type="submit"
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition active:scale-95"
              title="Aggiungi atleta"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
          {errorMsg && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errorMsg}
            </p>
          )}
        </form>
      )}

      {/* Players List */}
      <div className="mt-2 space-y-1.5 flex-1 overflow-y-auto max-h-[340px] pr-1">
        {team.players.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl p-4">
            <p className="font-semibold text-slate-400">Nessun giocatore in distinta.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Clicca <strong>+ Giocatore</strong> per inserire atleti, oppure carica una rosa dall'Archivio.
            </p>
          </div>
        ) : (
          team.players.map((player) => {
            const goalsCount = matchState.goals.filter(g => g.team === teamType && g.playerId === player.id).length;
            const yellowCount = matchState.sanctions.filter(s => s.team === teamType && s.playerId === player.id && s.type === 'yellow').length;
            const twoMinCount = matchState.sanctions.filter(s => s.team === teamType && s.playerId === player.id && s.type === '2min').length;
            const redCount = matchState.sanctions.filter(s => s.team === teamType && s.playerId === player.id && s.type === 'red').length;
            const blueCount = matchState.sanctions.filter(s => s.team === teamType && s.playerId === player.id && s.type === 'blue').length;

            const isDisqualified = redCount > 0 || blueCount > 0 || twoMinCount >= 3;
            const hasActiveSuspension = matchState.activeSuspensions.some(s => s.playerId === player.id);
            const isEditingThisPlayer = editingPlayerId === player.id;

            if (isEditingThisPlayer) {
              return (
                <div key={player.id} className="p-2 bg-slate-950 border border-amber-500/50 rounded-2xl flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-center text-white"
                  />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'Giocatore' | 'Portiere' | 'Capitano')}
                    className="px-1.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-300"
                  >
                    <option value="Giocatore">Giocatore</option>
                    <option value="Portiere">Portiere</option>
                    <option value="Capitano">Capitano</option>
                  </select>
                  <button
                    onClick={() => handleSaveEditPlayer(player.id)}
                    className="p-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingPlayerId(null)}
                    className="p-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2 rounded-2xl border transition-all ${
                  isDisqualified
                    ? 'bg-red-950/40 border-red-900/60 opacity-60'
                    : hasActiveSuspension
                    ? 'bg-amber-950/40 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800'
                }`}
              >
                {/* Number & Name & Role */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-xs text-amber-300 flex-shrink-0">
                    {player.number}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
                      <span>{player.name}</span>
                      {player.role === 'Portiere' && (
                        <span className="text-[9px] bg-slate-800 text-cyan-300 px-1 py-0.2 rounded font-bold">P</span>
                      )}
                      {player.role === 'Capitano' && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-bold">C</span>
                      )}
                    </div>
                    {/* Sanction badges */}
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      {yellowCount > 0 && (
                        <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-1 py-0.2 rounded">
                          G
                        </span>
                      )}
                      {twoMinCount > 0 && (
                        <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                          twoMinCount >= 3 ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-500 text-white'
                        }`}>
                          2' ({twoMinCount}/3)
                        </span>
                      )}
                      {redCount > 0 && (
                        <span className="text-[9px] font-bold bg-red-600 text-white px-1 py-0.2 rounded">
                          ROSSO (Squalifica)
                        </span>
                      )}
                      {blueCount > 0 && (
                        <span className="text-[9px] font-bold bg-blue-600 text-white px-1 py-0.2 rounded">
                          BLU (Rapporto)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Goals count + Quick Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Goals counter badge */}
                  <span className="font-mono text-xs font-black bg-slate-800 text-slate-200 px-2 py-1 rounded-xl border border-slate-700" title="Gol totali realizzati">
                    {goalsCount} <span className="text-[10px] text-slate-400 font-normal">gol</span>
                  </span>

                  {/* Goal +1 button for this player */}
                  <button
                    disabled={isDisqualified}
                    onClick={() => onQuickGoal(teamType, player)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition active:scale-95 ${
                      isDisqualified
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : isHome
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                    }`}
                    title={`Assegna gol a #${player.number} ${player.name}`}
                  >
                    +1
                  </button>

                  {/* Card / Sanction trigger for this player */}
                  <button
                    onClick={() => onQuickSanction(teamType, player)}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center justify-center text-xs transition active:scale-95"
                    title={`Assegna cartellino o sospensione 2' a #${player.number}`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit player button */}
                  <button
                    onClick={() => handleStartEditPlayer(player)}
                    className="w-7 h-7 rounded-lg text-slate-500 hover:text-amber-400 flex items-center justify-center transition"
                    title="Modifica giocatore"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  {/* Delete player button */}
                  <button
                    onClick={() => onRemovePlayer(teamType, player.id)}
                    className="w-7 h-7 rounded-lg text-slate-500 hover:text-red-400 flex items-center justify-center transition"
                    title="Elimina giocatore dalla distinta"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
