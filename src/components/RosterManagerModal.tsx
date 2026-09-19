import React, { useState, useRef } from 'react';
import { MatchState, Player, Team } from '../types';
import { loadSavedRosters, saveRoster, deleteSavedRoster, clearAllSavedRosters, importSavedRosters, SavedRoster } from '../utils/storage';
import { exportSingleRosterJson, exportTeamsArchiveJson, parseImportedJson } from '../utils/jsonExport';
import { 
  Users, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  Upload,
  FileJson,
  Sparkles
} from 'lucide-react';

interface RosterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchState: MatchState;
  onLoadRosterIntoTeam: (teamType: 'home' | 'away', roster: SavedRoster) => void;
  onClearTeamRoster?: (teamType: 'home' | 'away') => void;
}

export const RosterManagerModal: React.FC<RosterManagerModalProps> = ({
  isOpen,
  onClose,
  matchState,
  onLoadRosterIntoTeam,
  onClearTeamRoster,
}) => {
  const [savedRosters, setSavedRosters] = useState<SavedRoster[]>(() => loadSavedRosters());
  const [successMsg, setSuccessMsg] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newColor, setNewColor] = useState('#2563eb');
  const [newPlayers, setNewPlayers] = useState<Player[]>([]);
  const [playerNumInput, setPlayerNumInput] = useState('');
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [playerRoleInput, setPlayerRoleInput] = useState<'Giocatore' | 'Portiere' | 'Capitano'>('Giocatore');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const refreshRosters = () => {
    setSavedRosters(loadSavedRosters());
  };

  const handleExportAllTeams = () => {
    if (savedRosters.length === 0) {
      setSuccessMsg('Nessuna squadra in archivio da esportare.');
      setTimeout(() => setSuccessMsg(''), 3000);
      return;
    }
    exportTeamsArchiveJson(savedRosters);
    setSuccessMsg(`Archivio con ${savedRosters.length} squadre esportato in JSON.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const parsed = parseImportedJson(content);
      if (parsed.type === 'ROSTER') {
        saveRoster(parsed.roster);
        refreshRosters();
        setSuccessMsg(`Rosa "${parsed.roster.teamName}" importata con successo!`);
      } else if (parsed.type === 'TEAMS_ARCHIVE') {
        importSavedRosters(parsed.teams, false);
        refreshRosters();
        setSuccessMsg(`${parsed.teams.length} squadre importate con successo nell'archivio!`);
      } else if (parsed.type === 'FULL_BACKUP') {
        importSavedRosters(parsed.teams, false);
        refreshRosters();
        setSuccessMsg(`Archivio (${parsed.teams.length} squadre) ripristinato dal backup!`);
      } else {
        setSuccessMsg('File JSON non valido per le rose o non riconosciuto.');
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveCurrentTeam = (teamType: 'home' | 'away') => {
    const team = teamType === 'home' ? matchState.homeTeam : matchState.awayTeam;
    const newRoster: SavedRoster = {
      id: 'roster_' + Date.now(),
      teamName: team.name,
      shortName: team.shortName,
      color: team.color,
      players: [...team.players],
      savedAt: Date.now(),
    };
    saveRoster(newRoster);
    refreshRosters();
    setSuccessMsg(`Rosa "${team.name}" salvata con successo nell'archivio!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleLoad = (teamType: 'home' | 'away', roster: SavedRoster) => {
    onLoadRosterIntoTeam(teamType, roster);
    setSuccessMsg(`Rosa "${roster.teamName}" applicata a Squadra ${teamType === 'home' ? 'Casa' : 'Ospiti'}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteSavedRoster = (id: string, name: string) => {
    deleteSavedRoster(id);
    refreshRosters();
    setDeleteConfirmId(null);
    setSuccessMsg(`Squadra "${name}" eliminata dall'archivio.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClearAllArchive = () => {
    clearAllSavedRosters();
    refreshRosters();
    setConfirmClearAll(false);
    setSuccessMsg("Tutte le squadre sono state rimosse dall'archivio.");
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddPlayerToNewTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(playerNumInput, 10);
    if (isNaN(num) || num < 1 || num > 99) {
      setFormError('Numero di maglia non valido (1-99)');
      return;
    }
    if (!playerNameInput.trim()) {
      setFormError('Inserisci nome e cognome del giocatore');
      return;
    }
    if (newPlayers.some(p => p.number === num)) {
      setFormError(`Il numero #${num} è già presente in lista`);
      return;
    }

    const createdPlayer: Player = {
      id: 'np_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      number: num,
      name: playerNameInput.trim(),
      role: playerRoleInput,
    };

    setNewPlayers(prev => [...prev, createdPlayer].sort((a, b) => a.number - b.number));
    setPlayerNumInput('');
    setPlayerNameInput('');
    setPlayerRoleInput('Giocatore');
    setFormError('');
  };

  const handleRemovePlayerFromNewTeam = (playerId: string) => {
    setNewPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const handleSaveAndCreateTeam = () => {
    if (!newTeamName.trim()) {
      setFormError('Inserisci il nome della squadra');
      return;
    }

    const short = (newShortName.trim() || newTeamName.substring(0, 3)).toUpperCase();

    const createdRoster: SavedRoster = {
      id: 'roster_' + Date.now(),
      teamName: newTeamName.trim(),
      shortName: short,
      color: newColor,
      players: newPlayers,
      savedAt: Date.now(),
    };

    saveRoster(createdRoster);
    refreshRosters();
    setIsCreatingNew(false);
    setNewTeamName('');
    setNewShortName('');
    setNewPlayers([]);
    setFormError('');
    setSuccessMsg(`Nuova squadra "${createdRoster.teamName}" creata e salvata nell'archivio!`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Archivio Squadre &amp; Rose Giocatori
              </h3>
              <p className="text-xs text-slate-400">
                Crea, modifica, elimina e carica formazioni per le tue partite FIGH
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success / Info Toast */}
        {successMsg && (
          <div className="mt-3 p-2.5 bg-emerald-950/90 border border-emerald-600 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md ${
                isCreatingNew
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isCreatingNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isCreatingNew ? 'Chiudi Creazione' : '+ Nuova Squadra'}</span>
            </button>

            {savedRosters.length > 0 && (
              <button
                onClick={handleExportAllTeams}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                title="Esporta tutte le squadre salvate in un unico file JSON"
              >
                <FileJson className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Esporta Squadre JSON</span>
              </button>
            )}

            {/* Import JSON file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportJsonFile}
              className="hidden"
              id="roster-import-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              title="Importa rose o squadre da file JSON"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Importa JSON</span>
            </button>

            {savedRosters.length > 0 && (
              confirmClearAll ? (
                <div className="flex items-center gap-1.5 p-1 bg-red-950 border border-red-800 rounded-xl text-xs">
                  <button
                    onClick={handleClearAllArchive}
                    className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg text-[10px]"
                  >
                    Sì, Svuota Tutto
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-800 transition"
                  title="Svuota tutte le squadre memorizzate nell'archivio"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  <span>Svuota Archivio</span>
                </button>
              )
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            {savedRosters.length} {savedRosters.length === 1 ? 'squadra in memoria' : 'squadre in memoria'}
          </div>
        </div>

        {/* MODAL SECTION: CREATE NEW TEAM */}
        {isCreatingNew && (
          <div className="mt-3 p-4 bg-slate-950 border border-indigo-900/50 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Crea Nuova Squadra &amp; Rosa Giocatori
              </h4>
            </div>

            {formError && (
              <div className="p-2 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Nome Squadra:</label>
                <input
                  type="text"
                  placeholder="Es. Pallamano Romagna"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Sigla (max 4 car.):</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="ROM"
                  value={newShortName}
                  onChange={(e) => setNewShortName(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white text-center focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Players in this new team */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">
                Aggiungi Giocatori alla distinta ({newPlayers.length} inseriti):
              </span>

              {/* Add player row */}
              <form onSubmit={handleAddPlayerToNewTeam} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <input
                  type="number"
                  min="1"
                  max="99"
                  placeholder="N°"
                  value={playerNumInput}
                  onChange={(e) => setPlayerNumInput(e.target.value)}
                  className="w-14 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Cognome e Nome atleta"
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 min-w-[140px]"
                />
                <select
                  value={playerRoleInput}
                  onChange={(e) => setPlayerRoleInput(e.target.value as 'Giocatore' | 'Portiere' | 'Capitano')}
                  className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="Giocatore">Giocatore</option>
                  <option value="Portiere">Portiere (P)</option>
                  <option value="Capitano">Capitano (C)</option>
                </select>
                <button
                  type="submit"
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Giocatore</span>
                </button>
              </form>

              {/* Player list tags */}
              {newPlayers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  {newPlayers.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs"
                    >
                      <span className="font-mono font-black text-amber-400">#{p.number}</span>
                      <span className="text-slate-200">{p.name}</span>
                      {p.role !== 'Giocatore' && (
                        <span className="text-[9px] px-1 bg-slate-700 text-slate-300 rounded font-bold">
                          {p.role === 'Portiere' ? 'P' : 'C'}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePlayerFromNewTeam(p.id)}
                        className="text-slate-400 hover:text-red-400 ml-1"
                        title="Elimina giocatore"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save New Team Button */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveAndCreateTeam}
                className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salva Squadra in Archivio</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Save Current Match Teams */}
        <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Salva formazioni della partita corrente in memoria:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleSaveCurrentTeam('home')}
              className="py-2 px-3 bg-red-950/60 hover:bg-red-900/70 border border-red-800/60 text-red-200 rounded-xl text-xs font-semibold flex items-center justify-between transition active:scale-95"
            >
              <span className="truncate">Salva {matchState.homeTeam.name} ({matchState.homeTeam.players.length} gioc.)</span>
              <Save className="w-3.5 h-3.5 text-red-400 flex-shrink-0 ml-1" />
            </button>
            <button
              onClick={() => handleSaveCurrentTeam('away')}
              className="py-2 px-3 bg-blue-950/60 hover:bg-blue-900/70 border border-blue-800/60 text-blue-200 rounded-xl text-xs font-semibold flex items-center justify-between transition active:scale-95"
            >
              <span className="truncate">Salva {matchState.awayTeam.name} ({matchState.awayTeam.players.length} gioc.)</span>
              <Save className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 ml-1" />
            </button>
          </div>
        </div>

        {/* Saved Rosters List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Rose Memorizzate nel Browser:
          </h4>
          {savedRosters.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
              Nessuna squadra salvata in archivio. Clicca "+ Nuova Squadra" in alto per crearne una!
            </div>
          ) : (
            savedRosters.map(roster => (
              <div
                key={roster.id}
                className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-100 truncate">{roster.teamName}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 font-bold flex-shrink-0">
                      {roster.shortName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {roster.players.length} atleti
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {roster.players.length > 0 
                      ? roster.players.map(p => `#${p.number} ${p.name}`).join(' • ')
                      : 'Nessun atleta in rosa'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleLoad('home', roster)}
                    className="py-1.5 px-2.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-bold rounded-xl transition active:scale-95"
                    title="Carica come Squadra Casa nella partita corrente"
                  >
                    Carica Casa
                  </button>
                  <button
                    onClick={() => handleLoad('away', roster)}
                    className="py-1.5 px-2.5 bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800 text-xs font-bold rounded-xl transition active:scale-95"
                    title="Carica come Squadra Ospiti nella partita corrente"
                  >
                    Carica Ospiti
                  </button>

                  {/* Export single roster as JSON */}
                  <button
                    onClick={() => {
                      exportSingleRosterJson(roster);
                      setSuccessMsg(`Rosa "${roster.teamName}" salvata in JSON.`);
                      setTimeout(() => setSuccessMsg(''), 3000);
                    }}
                    className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-xl transition border border-transparent hover:border-slate-800"
                    title={`Esporta la rosa di "${roster.teamName}" in file JSON`}
                  >
                    <FileJson className="w-4 h-4" />
                  </button>

                  {/* Delete Team Button */}
                  {deleteConfirmId === roster.id ? (
                    <div className="flex items-center gap-1 bg-red-950 p-1 rounded-xl border border-red-800">
                      <button
                        onClick={() => handleDeleteSavedRoster(roster.id, roster.teamName)}
                        className="p-1 text-red-300 hover:text-white bg-red-800 rounded-lg text-[10px] font-bold px-1.5"
                        title="Conferma eliminazione definitiva"
                      >
                        Sì, elimina
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Annulla"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(roster.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/50 rounded-xl transition border border-transparent hover:border-red-900/50"
                      title={`Elimina squadra "${roster.teamName}" dall'archivio`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
