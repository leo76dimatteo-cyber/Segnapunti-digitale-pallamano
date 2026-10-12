import React, { useState } from 'react';
import { Player, Team, MatchState } from '../types';
import { exportSingleRosterJson } from '../utils/jsonExport';
import { sound } from '../utils/sound';
import { computeGoalkeeperStats } from '../utils/matchSelectors';
import { 
  UserPlus, 
  Trash2, 
  Edit2, 
  ShieldAlert, 
  Check, 
  X, 
  FileJson, 
  Shield, 
  Plus, 
  Minus, 
  Percent, 
  Zap, 
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Target,
  Flame,
  UserCheck
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
  onUpdateGoalkeeperStats?: (
    team: 'home' | 'away',
    playerId: string,
    delta: { saves?: number; penaltySaves?: number; goalsConceded?: number; goalsScored?: number }
  ) => void;
  onSetActiveGoalkeeper?: (team: 'home' | 'away', playerId: string) => void;
  onOpenGoalkeeperModal?: () => void;
  onToggleEmptyNet?: (team: 'home' | 'away') => void;
  onOpenPlayersRegistry?: () => void;
  onOpenSevenMeterModal?: (team: 'home' | 'away') => void;
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
  onUpdateGoalkeeperStats,
  onSetActiveGoalkeeper,
  onOpenGoalkeeperModal,
  onToggleEmptyNet,
  onOpenPlayersRegistry,
  onOpenSevenMeterModal,
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

  // Menu contestuale giocatore aperto (id giocatore)
  const [openPlayerMenuId, setOpenPlayerMenuId] = useState<string | null>(null);

  // Cockpit portieri compresso di default come da specifiche
  const [isCockpitOpen, setIsCockpitOpen] = useState(false);

  // New/Edit Team inline form state
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState(team.name);
  const [teamShortInput, setTeamShortInput] = useState(team.shortName);
  const [confirmClearTeam, setConfirmClearTeam] = useState(false);

  const isHome = teamType === 'home';
  const accentBorder = isHome ? 'border-red-900/40' : 'border-blue-900/40';
  const badgeBg = isHome ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300';
  const isEmptyNet = matchState.emptyNet?.[teamType] || false;

  // Calcolo statistiche portieri derivate
  const { home: homeSummary, away: awaySummary } = computeGoalkeeperStats(matchState);
  const currentSummary = isHome ? homeSummary : awaySummary;
  const teamGkStats = currentSummary.goalkeepers;

  // Portiere attivo effettivo per questa squadra
  const activeGkId = matchState.activeGoalkeepers?.[teamType] || teamGkStats[0]?.playerId || '';
  const activeGkStat = teamGkStats.find(s => s.playerId === activeGkId) || teamGkStats[0];
  const activeGkPlayer = team.players.find(p => p.id === activeGkId);

  const handleOpenAddPlayer = (rolePreset: 'Giocatore' | 'Portiere' = 'Giocatore') => {
    setNewRole(rolePreset);
    setNewNumber('');
    setNewName('');
    setErrorMsg('');
    setIsAddingPlayer(true);
  };

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
    setOpenPlayerMenuId(null);
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

  const handleTogglePlayerGoalkeeperRole = (player: Player) => {
    const isCurrentlyGk = player.role === 'Portiere';
    const newRoleValue = isCurrentlyGk ? 'Giocatore' : 'Portiere';

    onUpdatePlayer(teamType, {
      ...player,
      role: newRoleValue,
    });

    if (matchState.settings.soundEnabled) {
      sound.playBeep(isCurrentlyGk ? 440 : 880, 0.1);
    }

    if (!isCurrentlyGk && onSetActiveGoalkeeper) {
      onSetActiveGoalkeeper(teamType, player.id);
    }
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

  const handleQuickSave = (playerId: string) => {
    if (!playerId) return;
    if (matchState.settings.soundEnabled) sound.playGoalSound();
    if (onUpdateGoalkeeperStats) {
      onUpdateGoalkeeperStats(teamType, playerId, { saves: 1 });
    }
  };

  const handleQuickSubtractSave = (playerId: string) => {
    if (!playerId) return;
    if (matchState.settings.soundEnabled) sound.playWarningBeep();
    if (onUpdateGoalkeeperStats) {
      onUpdateGoalkeeperStats(teamType, playerId, { saves: -1 });
    }
  };

  return (
    <div className={`bg-slate-900/90 border ${accentBorder} rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col h-full`}>
      {/* Team Header & Actions */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800 flex-wrap">
        <div className="flex items-center gap-2 truncate min-w-0">
          <span className={`w-3.5 h-3.5 rounded-full ${isHome ? 'bg-red-500' : 'bg-blue-500'} flex-shrink-0 shadow-sm`} />
          <h4 className="font-extrabold text-sm sm:text-base text-slate-100 truncate">
            {team.name}
          </h4>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${badgeBg} flex-shrink-0`}>
            {team.players.length} gioc.
          </span>
          {isEmptyNet && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex-shrink-0">
              🚨 7v6 PORTA VUOTA
            </span>
          )}
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {/* Tasto 7m squadra */}
          <button
            type="button"
            onClick={() => onOpenSevenMeterModal && onOpenSevenMeterModal(teamType)}
            className="px-2.5 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 rounded-xl text-xs font-black flex items-center gap-1 transition active:scale-95 shadow-sm"
            title={`Registra tiro dai 7 Metri per ${team.name}`}
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>7m</span>
          </button>

          {/* Export Roster JSON */}
          <button
            onClick={() => exportSingleRosterJson(team)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95 border border-slate-700/60"
            title={`Esporta la rosa di ${team.name} in formato JSON`}
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Da Registro Categorie */}
          {onOpenPlayersRegistry && (
            <button
              onClick={onOpenPlayersRegistry}
              className="px-2 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1"
              title="Inserisci giocatori salvati nel registro categorie"
            >
              <span>+ Da Registro</span>
            </button>
          )}

          {/* + Giocatore */}
          <button
            onClick={() => handleOpenAddPlayer('Giocatore')}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 border border-slate-700"
            title="Aggiungi giocatore alla distinta"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Giocatore</span>
          </button>
        </div>
      </div>

      {/* Add Player Form Inline */}
      {isAddingPlayer && (
        <form onSubmit={handleSaveNewPlayer} className="my-2 p-3 bg-slate-950 border border-slate-700 rounded-2xl animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Nuovo Atleta in Distinta:</span>
            <button type="button" onClick={() => setIsAddingPlayer(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <input
              type="number"
              min="1"
              max="99"
              placeholder="N°"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              className="col-span-3 px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-amber-400"
              required
            />
            <input
              type="text"
              placeholder="Cognome e Nome..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="col-span-6 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              required
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'Giocatore' | 'Portiere' | 'Capitano')}
              className="col-span-3 px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-[11px] text-slate-300 font-semibold focus:outline-none"
            >
              <option value="Giocatore">Giocatore</option>
              <option value="Portiere">Portiere</option>
              <option value="Capitano">Capitano</option>
            </select>
          </div>
          {errorMsg && <p className="text-[11px] text-red-400 mt-1 font-bold">{errorMsg}</p>}
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsAddingPlayer(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Inserisci
            </button>
          </div>
        </form>
      )}

      {/* COCKPIT PORTIERI COMPRIMIBILE (Chiuso di default, apribile con un tap) */}
      {team.players.length > 0 && (
        <div className="my-2 rounded-2xl bg-slate-950 border border-emerald-500/40 shadow-sm overflow-hidden">
          {/* Riga Singola Compatta (Header Cockpit) */}
          <div className="p-2 sm:p-2.5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setIsCockpitOpen(!isCockpitOpen)}
                className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold flex-shrink-0"
                title={isCockpitOpen ? "Comprimi cockpit" : "Espandi dettagli portiere"}
              >
                <Shield className="w-3.5 h-3.5" />
              </button>

              <div className="truncate min-w-0 text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-400 mr-1.5">In Porta:</span>
                {activeGkPlayer ? (
                  <strong className="text-white font-mono text-xs truncate">
                    #{activeGkPlayer.number} {activeGkPlayer.name}
                  </strong>
                ) : (
                  <span className="text-slate-400 italic">Nessun portiere</span>
                )}
              </div>
            </div>

            {/* Statistiche compatte su una riga: Parate, Subiti, 7m */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-emerald-400 font-bold" title="Parate">
                {activeGkStat ? activeGkStat.saves : 0} <span className="text-[10px] text-slate-400 font-sans font-normal">par.</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400 font-bold" title="Gol Subiti (Derivati)">
                {activeGkStat ? activeGkStat.goalsConceded : 0} <span className="text-[10px] text-slate-400 font-sans font-normal">sub.</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-300 font-bold" title="Rigori 7m Parati">
                {activeGkStat ? (activeGkStat.penaltySaves || 0) : 0} <span className="text-[10px] text-slate-400 font-sans font-normal">7m</span>
              </span>

              {/* Tasto Espandi / Dettagli */}
              <button
                type="button"
                onClick={() => setIsCockpitOpen(!isCockpitOpen)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                {isCockpitOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Dettagli Espansi del Cockpit */}
          {isCockpitOpen && (
            <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-800/80 space-y-2 bg-slate-950/60 animate-in fade-in">
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                {/* Switcher rapido portiere in porta */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Cambio:</span>
                  {teamGkStats.map(gk => {
                    const isSelected = gk.playerId === activeGkId;
                    return (
                      <button
                        key={gk.playerId}
                        type="button"
                        onClick={() => onSetActiveGoalkeeper && onSetActiveGoalkeeper(teamType, gk.playerId)}
                        className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition active:scale-95 border ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        #{gk.playerNumber} {isSelected ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>

                {/* Porta vuota toggle */}
                {onToggleEmptyNet && (
                  <button
                    type="button"
                    onClick={() => onToggleEmptyNet(teamType)}
                    className={`px-2 py-1 rounded-xl text-[10px] font-extrabold transition active:scale-95 border flex items-center gap-1 ${
                      isEmptyNet
                        ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                        : 'bg-slate-800 text-slate-400 hover:text-amber-300 border-slate-700'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>{isEmptyNet ? 'PORTA VUOTA (7v6)' : '7° Giocatore Movimento'}</span>
                  </button>
                )}
              </div>

              {/* Bottoni azione rapida: +1 Parata e Modale Completo */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickSave(activeGkId)}
                    className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+1 PARATA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSubtractSave(activeGkId)}
                    disabled={!activeGkStat || activeGkStat.saves <= 0}
                    className="h-8 w-8 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl flex items-center justify-center font-bold text-xs border border-slate-700"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>

                {onOpenGoalkeeperModal && (
                  <button
                    type="button"
                    onClick={onOpenGoalkeeperModal}
                    className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Scheda Completa Portieri</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LISTA GIOCATORI CON RIGA SU DUE RIGHE PULITE (Requisito 4) */}
      <div className="mt-2 space-y-2 flex-1 overflow-y-auto max-h-[360px] pr-1">
        {team.players.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl p-4">
            <p className="font-semibold text-slate-400">Nessun giocatore in distinta.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Clicca <strong>+ Giocatore</strong> o <strong>+ Da Registro</strong> per inserire atleti.
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
            const isPortiere = player.role === 'Portiere';
            const isCurrentlyInGoal = player.id === activeGkId;
            const isMenuOpen = openPlayerMenuId === player.id;

            if (isEditingThisPlayer) {
              return (
                <div key={player.id} className="p-2 bg-slate-950 border border-amber-500/50 rounded-2xl flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-14 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-center text-white"
                  />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'Giocatore' | 'Portiere' | 'Capitano')}
                    className="px-1.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-slate-300 font-semibold"
                  >
                    <option value="Giocatore">Giocatore</option>
                    <option value="Portiere">Portiere</option>
                    <option value="Capitano">Capitano</option>
                  </select>
                  <button
                    onClick={() => handleSaveEditPlayer(player.id)}
                    className="p-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingPlayerId(null)}
                    className="p-2 bg-slate-800 text-slate-400 rounded-lg text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={player.id}
                className={`p-2.5 rounded-2xl border transition-all flex flex-col gap-2 ${
                  isDisqualified
                    ? 'bg-red-950/40 border-red-900/60 opacity-60'
                    : hasActiveSuspension
                    ? 'bg-amber-950/40 border-amber-500/50 ring-1 ring-amber-500/30'
                    : isCurrentlyInGoal
                    ? 'bg-slate-950/90 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/70 hover:bg-slate-800/60 border-slate-800'
                }`}
              >
                {/* RIGA 1: N° Maglia, Nome, Badge Compatti (G, 2', R, B, P, C, In Porta) */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {/* Numero maglia */}
                    <span className={`w-7 h-7 rounded-xl border flex items-center justify-center font-mono font-black text-xs flex-shrink-0 ${
                      isPortiere 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50' 
                        : 'bg-slate-800 border-slate-700 text-amber-300'
                    }`}>
                      {player.number}
                    </span>

                    {/* Nome giocatore (font min 12px) */}
                    <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                      {player.name}
                    </span>

                    {/* Badge Ruolo Portiere (P) 1-Click Toggle */}
                    <button
                      type="button"
                      onClick={() => handleTogglePlayerGoalkeeperRole(player)}
                      className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold transition border flex items-center gap-0.5 active:scale-95 ${
                        isPortiere
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-emerald-300 border-slate-700'
                      }`}
                      title={isPortiere ? "Portiere (Clicca per rimuovere)" : "Imposta come Portiere (P)"}
                    >
                      P
                    </button>

                    {player.role === 'Capitano' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                        C
                      </span>
                    )}

                    {/* Badge In Porta */}
                    {isCurrentlyInGoal && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        IN PORTA
                      </span>
                    )}
                  </div>

                  {/* Badges Sanzioni Compatti & Gol Totali */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {yellowCount > 0 && (
                      <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded">
                        G
                      </span>
                    )}
                    {twoMinCount > 0 && (
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                        twoMinCount >= 3 ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-500 text-white'
                      }`}>
                        2' ({twoMinCount})
                      </span>
                    )}
                    {redCount > 0 && (
                      <span className="text-[10px] font-black bg-red-600 text-white px-1.5 py-0.2 rounded">
                        R
                      </span>
                    )}
                    {blueCount > 0 && (
                      <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.2 rounded">
                        B
                      </span>
                    )}

                    {/* Badge Conteggio Gol Giocatore */}
                    <span className="font-mono text-xs font-black bg-slate-800 text-slate-200 px-2 py-0.5 rounded-lg border border-slate-700">
                      {goalsCount} <span className="text-[10px] text-slate-400 font-sans font-normal">gol</span>
                    </span>
                  </div>
                </div>

                {/* RIGA 2: I SOLI DUE PULSANTI PRIMARI (MIN 44x44px) + MENU "⋯" */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                  {/* Primario 1: +1 GOL (Tap target >= 44px) */}
                  <button
                    disabled={isDisqualified}
                    onClick={() => onQuickGoal(teamType, player)}
                    className={`flex-1 min-h-[44px] rounded-2xl flex items-center justify-center gap-1.5 font-black text-xs transition active:scale-95 shadow-md ${
                      isDisqualified
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : isHome
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    }`}
                    title={`Assegna gol a #${player.number} ${player.name}`}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+1 GOL</span>
                  </button>

                  {/* Primario 2: CARTELLINO (Tap target >= 44px) */}
                  <button
                    disabled={isDisqualified}
                    onClick={() => onQuickSanction(teamType, player)}
                    className={`flex-1 min-h-[44px] rounded-2xl flex items-center justify-center gap-1.5 font-bold text-xs border transition active:scale-95 ${
                      isDisqualified
                        ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                    }`}
                    title={`Assegna sanzione a #${player.number}`}
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>CARTELLINO</span>
                  </button>

                  {/* Menu "⋯" (Altro: Modifica, Elimina, Parate Portiere, In Porta) */}
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenPlayerMenuId(isMenuOpen ? null : player.id)}
                      className="w-11 h-11 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-2xl flex items-center justify-center transition active:scale-95"
                      title="Altre opzioni per questo giocatore"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu Contestuale */}
                    {isMenuOpen && (
                      <div className="absolute right-0 bottom-full mb-1 z-30 w-48 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-2xl space-y-1 animate-in fade-in">
                        {/* Se portiere: parate veloci */}
                        {isPortiere && (
                          <div className="pb-1 mb-1 border-b border-slate-800 space-y-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleQuickSave(player.id);
                                setOpenPlayerMenuId(null);
                              }}
                              className="w-full text-left text-xs py-1.5 px-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold flex items-center gap-1.5"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span>+1 Parata</span>
                            </button>
                            {!isCurrentlyInGoal && onSetActiveGoalkeeper && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSetActiveGoalkeeper(teamType, player.id);
                                  setOpenPlayerMenuId(null);
                                }}
                                className="w-full text-left text-xs py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center gap-1.5"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Metti In Porta</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Modifica */}
                        <button
                          type="button"
                          onClick={() => handleStartEditPlayer(player)}
                          className="w-full text-left text-xs py-1.5 px-2 rounded-xl text-slate-300 hover:bg-slate-800 flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Modifica Atleta</span>
                        </button>

                        {/* Elimina */}
                        <button
                          type="button"
                          onClick={() => {
                            onRemovePlayer(teamType, player.id);
                            setOpenPlayerMenuId(null);
                          }}
                          className="w-full text-left text-xs py-1.5 px-2 rounded-xl text-red-400 hover:bg-red-950/60 flex items-center gap-1.5 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Elimina dalla distinta</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
