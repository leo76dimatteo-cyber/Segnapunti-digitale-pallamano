import React, { useState } from 'react';
import { Player, Team, MatchState } from '../types';
import { exportSingleRosterJson } from '../utils/jsonExport';
import { sound } from '../utils/sound';
import { 
  UserPlus, 
  Trash2, 
  Edit2, 
  ShieldAlert, 
  Check, 
  X,
  AlertCircle,
  FileJson,
  Shield,
  Plus,
  Minus,
  Percent,
  UserCheck,
  Target,
  Zap,
  Activity,
  Flame
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
  const isEmptyNet = matchState.emptyNet?.[teamType] || false;

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

  // 1-Click Toggle for Goalkeeper Role on any player to speed up match preparation!
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

    // If making them a goalkeeper and no active goalkeeper is set, set them active
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

  const handleExecuteClearTeam = () => {
    if (onClearTeam) {
      onClearTeam(teamType);
    }
    setConfirmClearTeam(false);
  };

  // Goalkeeper Statistics & Active Goalkeeper for this team
  const teamGkStats = matchState.goalkeeperStats?.filter(s => s.team === teamType) || [];
  const gkCandidates = team.players.filter(p => p.role === 'Portiere' || teamGkStats.some(s => s.playerId === p.id));
  
  // Active Goalkeeper for this team (from state, or first with role 'Portiere', or first player in team)
  const activeGkId = matchState.activeGoalkeepers?.[teamType] || gkCandidates[0]?.id || team.players[0]?.id || '';
  const activeGkPlayer = team.players.find(p => p.id === activeGkId);
  const activeGkStat = teamGkStats.find(s => s.playerId === activeGkId) || {
    playerId: activeGkId,
    playerNumber: activeGkPlayer?.number || 0,
    playerName: activeGkPlayer?.name || 'Portiere',
    team: teamType,
    saves: 0,
    penaltySaves: 0,
    goalsConceded: 0,
    goalsScored: 0,
  };

  const totalShots = activeGkStat.saves + activeGkStat.goalsConceded;
  const activeSavePct = totalShots > 0 ? ((activeGkStat.saves / totalShots) * 100).toFixed(1) : '0.0';

  // Fast Goalkeeper Action Handlers
  const handleQuickSave = (playerId: string, isPenalty7m: boolean = false) => {
    if (!playerId) return;
    if (matchState.settings.soundEnabled) {
      sound.playGoalSound();
    }
    if (onUpdateGoalkeeperStats) {
      onUpdateGoalkeeperStats(teamType, playerId, {
        saves: 1,
        ...(isPenalty7m ? { penaltySaves: 1 } : {})
      });
    }
  };

  const handleQuickSubtractSave = (playerId: string, isPenalty7m: boolean = false) => {
    if (!playerId) return;
    if (matchState.settings.soundEnabled) {
      sound.playWarningBeep();
    }
    if (onUpdateGoalkeeperStats) {
      onUpdateGoalkeeperStats(teamType, playerId, {
        saves: -1,
        ...(isPenalty7m ? { penaltySaves: -1 } : {})
      });
    }
  };

  const handleQuickConceded = (playerId: string) => {
    if (!playerId) return;
    if (matchState.settings.soundEnabled) {
      sound.playWarningBeep();
    }
    if (onUpdateGoalkeeperStats) {
      onUpdateGoalkeeperStats(teamType, playerId, { goalsConceded: 1 });
    }
  };

  const handleQuickSubtractConceded = (playerId: string) => {
    if (!playerId) return;
    if (matchState.settings.soundEnabled) {
      sound.playWarningBeep();
    }
    if (onUpdateGoalkeeperStats) {
      onUpdateGoalkeeperStats(teamType, playerId, { goalsConceded: -1 });
    }
  };

  const handleQuickGoalkeeperGoalScored = (player: Player) => {
    if (matchState.settings.soundEnabled) {
      sound.playGoalSound();
    }
    // Record goal on scoreboard & match log
    onQuickGoal(teamType, player);
    // Track in goalkeeper stats
    if (onUpdateGoalkeeperStats) {
      onUpdateGoalkeeperStats(teamType, player.id, { goalsScored: 1 });
    }
  };

  // Efficiency Tier Badge
  const getEfficiencyBadge = (pct: number, shots: number) => {
    if (shots === 0) return { label: '0.0%', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    if (pct >= 40) return { label: `${pct.toFixed(1)}% ELITE`, color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40' };
    if (pct >= 33) return { label: `${pct.toFixed(1)}% OTTIMA`, color: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40' };
    if (pct >= 25) return { label: `${pct.toFixed(1)}% MEDIA`, color: 'text-amber-300 bg-amber-500/20 border-amber-500/40' };
    return { label: `${pct.toFixed(1)}%`, color: 'text-rose-300 bg-rose-500/20 border-rose-500/40' };
  };

  const effBadge = getEfficiencyBadge(parseFloat(activeSavePct), totalShots);

  return (
    <div className={`bg-slate-900/85 border ${accentBorder} rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col h-full`}>
      {/* Team Header & Actions */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 truncate min-w-0">
          <span className={`w-3.5 h-3.5 rounded-full ${isHome ? 'bg-red-500' : 'bg-blue-500'} flex-shrink-0 shadow-sm`} />
          <h4 className="font-extrabold text-sm sm:text-base text-slate-100 truncate">
            {team.name}
          </h4>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${badgeBg} flex-shrink-0`}>
            {team.players.length} gioc.
          </span>
          {isEmptyNet && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex-shrink-0">
              🚨 7v6 PORTA VUOTA
            </span>
          )}
        </div>

        {/* Action Buttons: Nuova Squadra, Elimina Squadra, + Portiere, + Giocatore */}
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {/* Export Roster JSON */}
          <button
            onClick={() => exportSingleRosterJson(team)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95 border border-slate-700/60"
            title={`Esporta la rosa di ${team.name} in formato JSON`}
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline text-[11px]">JSON</span>
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
            <span className="hidden sm:inline text-[11px]">Modifica</span>
          </button>

          {/* Clear / Delete Team Roster */}
          {confirmClearTeam ? (
            <div className="flex items-center gap-1 bg-red-950 p-1 rounded-xl border border-red-800 animate-in fade-in">
              <button
                onClick={handleExecuteClearTeam}
                className="px-2 py-0.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold"
                title="Svuota tutti i giocatori di questa squadra"
              >
                Sì, Elimina
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
            </button>
          )}

          {/* FAST + PORTIERE BUTTON (Dedicated 1-Click Goalkeeper Addition) */}
          <button
            onClick={() => handleOpenAddPlayer('Portiere')}
            className="p-1.5 px-2 bg-emerald-700/80 hover:bg-emerald-600 active:scale-95 text-emerald-100 border border-emerald-500/50 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-sm"
            title="Aggiungi rapidamente un nuovo Portiere (P) alla distinta"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px] font-black">+ Portiere</span>
          </button>

          {/* Add Regular Player Button */}
          <button
            onClick={() => handleOpenAddPlayer('Giocatore')}
            className={`p-1.5 px-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95 ${
              isAddingPlayer ? 'bg-slate-800 text-slate-300' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
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
        <form onSubmit={handleSaveNewPlayer} className="my-2 p-2.5 bg-slate-950 rounded-2xl border border-emerald-500/40 space-y-2 animate-in fade-in shadow-lg">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
            <span>{newRole === 'Portiere' ? '🛡️ Inserimento Rapido PORTIERE' : '👤 Nuovo Atleta in Distinta'}</span>
            <button type="button" onClick={() => setIsAddingPlayer(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <input
              type="number"
              min="1"
              max="99"
              placeholder="N°"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              className="w-14 sm:w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-emerald-400"
              required
              autoFocus
            />
            <input
              type="text"
              placeholder="Cognome Nome atleta"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              required
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'Giocatore' | 'Portiere' | 'Capitano')}
              className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-[11px] text-slate-300 focus:outline-none font-semibold"
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

      {/* FAST GOALKEEPER COCKPIT BAR (VELOCIZZAZIONE INSERIMENTO FIGH) */}
      {team.players.length > 0 && (
        <div className="my-2 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-950 border border-emerald-500/50 shadow-md">
          {/* Top Row: Active GK, Quick Switcher Chips, & Empty Net Toggle */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">
                    In Porta:
                  </span>
                  {activeGkPlayer ? (
                    <span className="font-extrabold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                      <strong className="text-amber-300 font-mono bg-slate-800/80 px-1.5 py-0.5 rounded-lg border border-slate-700">
                        #{activeGkPlayer.number}
                      </strong>
                      <span className="truncate">{activeGkPlayer.name}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Nessun portiere selezionato</span>
                  )}
                </div>

                {/* Live Performance Metrics */}
                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono flex-wrap">
                  <span className="text-emerald-400 font-bold">
                    {activeGkStat.saves} <span className="text-[10px] text-slate-400 font-sans font-normal">parate</span>
                  </span>
                  {(activeGkStat.penaltySaves || 0) > 0 && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-cyan-300 font-bold" title="Rigori 7m parati">
                        {activeGkStat.penaltySaves} <span className="text-[10px] text-slate-400 font-sans font-normal">7m</span>
                      </span>
                    </>
                  )}
                  <span className="text-slate-600">•</span>
                  <span className="text-rose-400 font-medium">
                    {activeGkStat.goalsConceded} <span className="text-[10px] text-slate-400 font-sans font-normal">subiti</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold border ${effBadge.color}`}>
                    {effBadge.label} eff.
                  </span>
                  {activeGkStat.goalsScored > 0 && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-300 font-bold">
                        {activeGkStat.goalsScored} <span className="text-[10px] text-slate-400 font-sans font-normal">gol</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Goalkeeper Switcher & Empty Net Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* 1-Tap Goalkeeper Switcher Chips */}
              {gkCandidates.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold uppercase hidden xl:inline">
                    Cambio:
                  </span>
                  {gkCandidates.map(gk => {
                    const isSelected = gk.id === activeGkId;
                    return (
                      <button
                        key={gk.id}
                        type="button"
                        onClick={() => onSetActiveGoalkeeper && onSetActiveGoalkeeper(teamType, gk.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition active:scale-95 border ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-800/90 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
                        }`}
                        title={isSelected ? `Attivo in porta: #${gk.number} ${gk.name}` : `Metti in porta #${gk.number} ${gk.name}`}
                      >
                        #{gk.number} {isSelected ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty Net / 7° Giocatore di Movimento Toggle Button */}
              {onToggleEmptyNet && (
                <button
                  type="button"
                  onClick={() => onToggleEmptyNet(teamType)}
                  className={`px-2 py-1 rounded-xl text-[10px] font-extrabold transition active:scale-95 border flex items-center gap-1 ${
                    isEmptyNet
                      ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-amber-300 border-slate-700'
                  }`}
                  title="Attiva/disattiva tattica 7 contro 6 con Porta Vuota (portiere in panchina)"
                >
                  <Zap className="w-3 h-3" />
                  <span>{isEmptyNet ? 'PORTA VUOTA (7v6)' : '7° Movimento'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: ULTRA-FAST ACTION BUTTONS (Parata, 7m Rigore, Subito, Dettagli) */}
          <div className="flex items-center justify-between gap-1.5 mt-2 flex-wrap">
            {/* Primary Actions: +1 PARATA and -1 */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickSave(activeGkId, false)}
                className="h-9 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition select-none"
                title={`Registra parata (+1) per #${activeGkPlayer?.number || ''} ${activeGkPlayer?.name || 'portiere'}`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <Shield className="w-3.5 h-3.5 text-emerald-200" />
                <span>+1 PARATA</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSubtractSave(activeGkId, false)}
                disabled={activeGkStat.saves <= 0}
                className="w-8 h-9 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 border border-slate-700 active:scale-95 rounded-xl text-xs font-bold flex items-center justify-center transition"
                title="Correggi / Sottrai 1 parata (-1)"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            {/* Special FIGH Action: +1 RIGORE 7M PARATO */}
            <button
              type="button"
              onClick={() => handleQuickSave(activeGkId, true)}
              className="h-9 px-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 active:scale-95 text-white rounded-xl text-[11px] font-black shadow-sm flex items-center gap-1 transition"
              title="Registra parata su Tiro dai 7 Metri (Rigore) - incrementa parate totali e rigori parati"
            >
              <Target className="w-3.5 h-3.5 text-cyan-200" />
              <span>+1 RIGORE 7m</span>
            </button>

            {/* Conceded Actions: +1 SUBITO and -1 SUBITO */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickConceded(activeGkId)}
                className="h-9 px-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 active:scale-95 rounded-xl text-[11px] font-bold flex items-center gap-1 transition"
                title="Registra gol subito (+1) per il portiere"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>Subito</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSubtractConceded(activeGkId)}
                disabled={activeGkStat.goalsConceded <= 0}
                className="w-7 h-9 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 border border-slate-700 active:scale-95 rounded-xl text-xs font-bold flex items-center justify-center transition"
                title="Sottrai 1 gol subito (-1)"
              >
                <Minus className="w-3 h-3 stroke-[3]" />
              </button>
            </div>

            {/* Extra Action: Gol Segnato da Portiere (Porta Vuota) & Full Modal */}
            <div className="flex items-center gap-1">
              {activeGkPlayer && (
                <button
                  type="button"
                  onClick={() => handleQuickGoalkeeperGoalScored(activeGkPlayer)}
                  className="h-9 px-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 active:scale-95 rounded-xl text-[10px] font-bold flex items-center gap-1 transition"
                  title="Il portiere ha segnato un gol a porta vuota!"
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Gol Portiere</span>
                  <span className="sm:hidden">+Gol P.</span>
                </button>
              )}

              {onOpenGoalkeeperModal && (
                <button
                  type="button"
                  onClick={onOpenGoalkeeperModal}
                  className="h-9 w-9 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 active:scale-95 rounded-xl flex items-center justify-center transition"
                  title="Apri scheda completa statistiche ed efficienza portieri"
                >
                  <Percent className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Players List with 1-Click Goalkeeper Designation & Direct Actions */}
      <div className="mt-2 space-y-1.5 flex-1 overflow-y-auto max-h-[340px] pr-1">
        {team.players.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl p-4">
            <p className="font-semibold text-slate-400">Nessun giocatore in distinta.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Clicca <strong>+ Giocatore</strong> o <strong>+ Portiere</strong> per inserire atleti.
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
            const pGkStat = teamGkStats.find(s => s.playerId === player.id);
            const isCurrentlyInGoal = player.id === activeGkId;

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
                    className="px-1.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-300 font-semibold"
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
                    : isCurrentlyInGoal
                    ? 'bg-slate-950/90 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : isPortiere
                    ? 'bg-slate-950/80 border-emerald-900/40 hover:bg-slate-800/80'
                    : 'bg-slate-950/60 hover:bg-slate-800/70 border-slate-800'
                }`}
              >
                {/* Number & Name & Role + 1-Click Portiere Button */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`w-7 h-7 rounded-xl border flex items-center justify-center font-mono font-black text-xs flex-shrink-0 ${
                    isPortiere 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50' 
                      : 'bg-slate-800 border-slate-700 text-amber-300'
                  }`}>
                    {player.number}
                  </span>

                  <div className="truncate min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5 flex-wrap">
                      <span className="truncate">{player.name}</span>
                      
                      {/* 1-Click Portiere Role Badge & Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleTogglePlayerGoalkeeperRole(player)}
                        className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold transition border flex items-center gap-0.5 active:scale-95 ${
                          isPortiere
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-emerald-300 border-slate-700 hover:border-emerald-600'
                        }`}
                        title={isPortiere ? "Portiere (Clicca per rimuovere ruolo)" : "Clicca per impostare come Portiere (P)"}
                      >
                        <Shield className="w-2.5 h-2.5" />
                        <span>P</span>
                      </button>

                      {player.role === 'Capitano' && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-bold">C</span>
                      )}

                      {/* Active in Goal Status or Fast 'Metti in porta' button */}
                      {isCurrentlyInGoal ? (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-md font-extrabold flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          IN PORTA
                        </span>
                      ) : isPortiere && onSetActiveGoalkeeper ? (
                        <button
                          type="button"
                          onClick={() => onSetActiveGoalkeeper(teamType, player.id)}
                          className="text-[9px] bg-slate-800 hover:bg-emerald-950 text-cyan-300 hover:text-emerald-200 border border-slate-700 hover:border-emerald-600 px-1.5 py-0.2 rounded font-semibold transition"
                          title="Imposta subito come portiere attivo in porta"
                        >
                          Metti in porta
                        </button>
                      ) : null}
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

                {/* Goals count + Goalkeeper Save + Quick Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* If player is Goalkeeper: +1 Parata & +1 7m Rigore buttons right on player row */}
                  {(isPortiere || (pGkStat && pGkStat.saves > 0)) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickSave(player.id, false)}
                        className="h-8 px-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 active:scale-95 text-white font-black text-[11px] flex items-center gap-1 transition shadow-sm"
                        title={`Registra parata per #${player.number} ${player.name}`}
                      >
                        <Shield className="w-3 h-3 text-emerald-200" />
                        <span>+1 Par.</span>
                        <span className="font-mono text-[10px] bg-emerald-950/70 px-1 rounded text-emerald-200">
                          {pGkStat?.saves || 0}
                        </span>
                      </button>

                      {/* 1-Tap 7m Penalty Save button on player row */}
                      <button
                        onClick={() => handleQuickSave(player.id, true)}
                        className="h-8 w-7 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 font-bold text-[10px] flex items-center justify-center transition active:scale-95"
                        title={`Registra rigore 7m parato per #${player.number} ${player.name}`}
                      >
                        7m
                      </button>
                    </div>
                  )}

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
