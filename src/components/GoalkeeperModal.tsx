import React, { useState } from 'react';
import { MatchState, Player, GoalkeeperStat } from '../types';
import { sound } from '../utils/sound';
import { 
  Shield, 
  Plus, 
  Minus, 
  X, 
  Award, 
  Activity, 
  Percent, 
  Target, 
  Copy, 
  Check, 
  UserCheck,
  TrendingUp,
  UserPlus
} from 'lucide-react';

interface GoalkeeperModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchState: MatchState;
  onUpdateGoalkeeperStats: (
    team: 'home' | 'away',
    playerId: string,
    delta: { saves?: number; penaltySaves?: number; goalsConceded?: number; goalsScored?: number }
  ) => void;
  onSetActiveGoalkeeper: (team: 'home' | 'away', playerId: string) => void;
  onGoalClick?: (team: 'home' | 'away', player?: Player) => void;
}

export const GoalkeeperModal: React.FC<GoalkeeperModalProps> = ({
  isOpen,
  onClose,
  matchState,
  onUpdateGoalkeeperStats,
  onSetActiveGoalkeeper,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [activeTab, setActiveTab] = useState<'tracker' | 'comparison'>('tracker');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentTeam = selectedTeam === 'home' ? matchState.homeTeam : matchState.awayTeam;
  const isHome = selectedTeam === 'home';

  // Find all players with role 'Portiere', or players that already have goalkeeper stats
  const teamGkStats = matchState.goalkeeperStats?.filter(s => s.team === selectedTeam) || [];
  
  // All candidate goalkeepers: players with role 'Portiere' + players already tracked in stats
  const gkPlayers = currentTeam.players.filter(
    p => p.role === 'Portiere' || teamGkStats.some(s => s.playerId === p.id)
  );

  // Active goalkeeper for selected team
  const activeGkId = matchState.activeGoalkeepers?.[selectedTeam] || gkPlayers[0]?.id || currentTeam.players[0]?.id || '';
  const activePlayer = currentTeam.players.find(p => p.id === activeGkId);
  const activeStat = teamGkStats.find(s => s.playerId === activeGkId) || {
    playerId: activeGkId,
    playerNumber: activePlayer?.number || 0,
    playerName: activePlayer?.name || 'Portiere',
    team: selectedTeam,
    saves: 0,
    penaltySaves: 0,
    goalsConceded: 0,
    goalsScored: 0,
  };

  const totalShots = activeStat.saves + activeStat.goalsConceded;
  const savePercentage = totalShots > 0 ? (activeStat.saves / totalShots) * 100 : 0;

  // Performance tier
  const getRatingTier = (pct: number, shots: number) => {
    if (shots === 0) return { label: 'In attesa di tiri', color: 'text-slate-400 bg-slate-800' };
    if (pct >= 40) return { label: 'Top Mondiale (≥40%)', color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30' };
    if (pct >= 33) return { label: 'Ottima Efficienza (≥33%)', color: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/30' };
    if (pct >= 25) return { label: 'Buona Media (25-32%)', color: 'text-amber-300 bg-amber-500/20 border-amber-500/30' };
    return { label: 'Sotto Media (<25%)', color: 'text-rose-300 bg-rose-500/20 border-rose-500/30' };
  };

  const rating = getRatingTier(savePercentage, totalShots);

  const handleAdjust = (field: 'saves' | 'penaltySaves' | 'goalsConceded' | 'goalsScored', amount: number) => {
    if (!activeGkId) return;
    if (matchState.settings.soundEnabled) {
      if (amount > 0) {
        if (field === 'saves' || field === 'penaltySaves') sound.playGoalSound();
        else if (field === 'goalsScored') sound.playGoalSound();
        else sound.playWarningBeep();
      } else {
        sound.playWarningBeep();
      }
    }
    if (field === 'penaltySaves' && amount > 0) {
      // A saved penalty is also an overall save
      onUpdateGoalkeeperStats(selectedTeam, activeGkId, { saves: 1, penaltySaves: 1 });
    } else {
      onUpdateGoalkeeperStats(selectedTeam, activeGkId, { [field]: amount });
    }
  };

  const handleCopySummary = () => {
    let text = `🤾 STATISTICHE PORTIERI - ${matchState.homeTeam.name} vs ${matchState.awayTeam.name}\n\n`;
    
    const formatTeamStats = (tType: 'home' | 'away') => {
      const team = tType === 'home' ? matchState.homeTeam : matchState.awayTeam;
      const stats = matchState.goalkeeperStats?.filter(s => s.team === tType) || [];
      let res = `🛡️ ${team.name.toUpperCase()}:\n`;
      if (stats.length === 0) {
        res += `  Nessuna parata registrata\n`;
      } else {
        stats.forEach(s => {
          const tot = s.saves + s.goalsConceded;
          const pct = tot > 0 ? ((s.saves / tot) * 100).toFixed(1) : '0.0';
          res += `  • #${s.playerNumber} ${s.playerName}: ${s.saves} Parate | ${s.goalsConceded} Gol Subiti | ${pct}% Efficienza | ${s.goalsScored} Gol Fatti\n`;
        });
      }
      return res;
    };

    text += formatTeamStats('home') + '\n' + formatTeamStats('away');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-md shadow-emerald-500/10">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-lg text-white flex items-center gap-2">
                Statistiche Portieri <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase">FIGH</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Monitoraggio parate, tiri fronteggiati, gol subiti ed efficienza %
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopySummary}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              title="Copia riepilogo statistiche portieri"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span className="hidden sm:inline">{copied ? 'Copiato!' : 'Copia'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View mode & Team selection tabs */}
        <div className="mt-3 space-y-2">
          {/* Main Mode Toggle: Registro / Confronto */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'tracker' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pannello Live Portiere</span>
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'comparison' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Confronto Portieri Gara</span>
            </button>
          </div>

          {/* Team Switcher in Live Mode */}
          {activeTab === 'tracker' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedTeam('home')}
                className={`p-2 rounded-2xl border transition flex items-center justify-between text-left ${
                  selectedTeam === 'home'
                    ? 'bg-red-950/60 border-red-600/80 ring-1 ring-red-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="truncate">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">Casa</span>
                  <span className="font-extrabold text-xs sm:text-sm truncate block">{matchState.homeTeam.name}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-1">
                  <span className="text-[10px] text-slate-400 font-mono block">Parate</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    {matchState.goalkeeperStats?.filter(s => s.team === 'home').reduce((acc, c) => acc + c.saves, 0) || 0}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setSelectedTeam('away')}
                className={`p-2 rounded-2xl border transition flex items-center justify-between text-left ${
                  selectedTeam === 'away'
                    ? 'bg-blue-950/60 border-blue-600/80 ring-1 ring-blue-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="truncate">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">Ospiti</span>
                  <span className="font-extrabold text-xs sm:text-sm truncate block">{matchState.awayTeam.name}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-1">
                  <span className="text-[10px] text-slate-400 font-mono block">Parate</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    {matchState.goalkeeperStats?.filter(s => s.team === 'away').reduce((acc, c) => acc + c.saves, 0) || 0}
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'tracker' ? (
            <>
              {/* Goalkeeper Selector for Active Team */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Seleziona Portiere In Porta:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {gkPlayers.length} portieri disponibili
                  </span>
                </div>

                {currentTeam.players.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2 text-center">
                    Nessun giocatore in distinta per questa squadra. Aggiungi atleti dal pannello squadra.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {currentTeam.players.map(p => {
                      const isSelected = p.id === activeGkId;
                      const isPortiereRole = p.role === 'Portiere';
                      const pStat = teamGkStats.find(s => s.playerId === p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => onSetActiveGoalkeeper(selectedTeam, p.id)}
                          className={`p-2 rounded-xl border text-left transition active:scale-95 flex items-center gap-2 ${
                            isSelected
                              ? isHome
                                ? 'bg-red-950/70 border-red-500 ring-1 ring-red-500/40 text-white'
                                : 'bg-blue-950/70 border-blue-500 ring-1 ring-blue-500/40 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs flex-shrink-0 ${
                            isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-amber-300'
                          }`}>
                            {p.number}
                          </span>
                          <div className="truncate flex-1 min-w-0">
                            <span className="text-xs font-bold truncate block">{p.name}</span>
                            <span className="text-[9px] text-slate-400 flex items-center gap-1">
                              {isPortiereRole ? <strong className="text-cyan-400">P</strong> : 'G'}
                              {pStat ? ` • ${pStat.saves} par.` : ''}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active Goalkeeper Live Cockpit */}
              {activePlayer && (
                <div className={`rounded-3xl p-4 border bg-gradient-to-b ${
                  isHome 
                    ? 'from-red-950/30 via-slate-950 to-slate-950 border-red-900/40' 
                    : 'from-blue-950/30 via-slate-950 to-slate-950 border-blue-900/40'
                }`}>
                  {/* Player Headline & Efficiency badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-sm text-amber-400">
                        #{activePlayer.number}
                      </span>
                      <div>
                        <h4 className="font-black text-base text-white">
                          {activePlayer.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Portiere Attivo {isHome ? matchState.homeTeam.name : matchState.awayTeam.name}
                        </span>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${rating.color}`}>
                      <Percent className="w-3.5 h-3.5" />
                      <span>{savePercentage.toFixed(1)}%</span>
                      <span className="text-[10px] opacity-80 hidden sm:inline">• {rating.label}</span>
                    </div>
                  </div>

                  {/* 3 Main Metrics Counters (Gol Parati, Gol Subiti, Gol Fatti) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                    {/* GOL PARATI */}
                    <div className="bg-slate-900/90 border border-emerald-600/40 rounded-2xl p-3 flex flex-col items-center justify-between text-center shadow-lg shadow-emerald-950/20">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> Gol Parati
                      </span>
                      <div className="my-1.5 text-4xl sm:text-5xl font-mono font-black text-emerald-300 drop-shadow">
                        {activeStat.saves}
                      </div>
                      <div className="flex items-center gap-1.5 w-full mt-1">
                        <button
                          onClick={() => handleAdjust('saves', -1)}
                          disabled={activeStat.saves <= 0}
                          className="w-10 h-10 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl flex items-center justify-center font-bold text-base transition active:scale-95 border border-slate-700"
                          title="Sottrai 1 parata (-1)"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => handleAdjust('saves', 1)}
                          className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-1 font-black text-sm transition active:scale-95 shadow-md shadow-emerald-600/30"
                          title="Aggiungi Gol Parato (+1)"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>+1 PARATA</span>
                        </button>
                      </div>

                      {/* Quick 7m penalty save */}
                      <button
                        onClick={() => handleAdjust('penaltySaves', 1)}
                        className="w-full mt-2 py-1.5 px-2 bg-gradient-to-r from-teal-700/80 to-cyan-700/80 hover:from-teal-600 hover:to-cyan-600 text-cyan-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 border border-cyan-500/40"
                        title="Registra Rigore dai 7 Metri Parato"
                      >
                        <Target className="w-3.5 h-3.5 text-cyan-300" />
                        <span>+1 Rigore 7m Parato</span>
                        {(activeStat.penaltySaves || 0) > 0 && (
                          <span className="font-mono text-[10px] bg-slate-900/80 px-1.5 py-0.2 rounded-md text-cyan-300 border border-cyan-400/40">
                            {activeStat.penaltySaves}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* GOL SUBITI */}
                    <div className="bg-slate-900/90 border border-rose-600/40 rounded-2xl p-3 flex flex-col items-center justify-between text-center shadow-lg shadow-rose-950/20">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" /> Gol Subiti
                      </span>
                      <div className="my-1.5 text-4xl sm:text-5xl font-mono font-black text-rose-300 drop-shadow">
                        {activeStat.goalsConceded}
                      </div>
                      <div className="flex items-center gap-1.5 w-full mt-1">
                        <button
                          onClick={() => handleAdjust('goalsConceded', -1)}
                          disabled={activeStat.goalsConceded <= 0}
                          className="w-10 h-10 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl flex items-center justify-center font-bold text-base transition active:scale-95 border border-slate-700"
                          title="Sottrai 1 gol subito (-1)"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => handleAdjust('goalsConceded', 1)}
                          className="flex-1 h-10 bg-rose-700 hover:bg-rose-600 text-white rounded-xl flex items-center justify-center gap-1 font-black text-xs sm:text-sm transition active:scale-95 shadow-md shadow-rose-700/30"
                          title="Aggiungi Gol Subito (+1)"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>+1 SUBITO</span>
                        </button>
                      </div>
                    </div>

                    {/* GOL FATTI (PORTIERE) */}
                    <div className="bg-slate-900/90 border border-amber-600/40 rounded-2xl p-3 flex flex-col items-center justify-between text-center shadow-lg shadow-amber-950/20">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Gol Fatti (Porta Vuota)
                      </span>
                      <div className="my-1.5 text-4xl sm:text-5xl font-mono font-black text-amber-300 drop-shadow">
                        {activeStat.goalsScored}
                      </div>
                      <div className="flex items-center gap-1.5 w-full mt-1">
                        <button
                          onClick={() => handleAdjust('goalsScored', -1)}
                          disabled={activeStat.goalsScored <= 0}
                          className="w-10 h-10 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl flex items-center justify-center font-bold text-base transition active:scale-95 border border-slate-700"
                          title="Sottrai 1 gol fatto dal portiere (-1)"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => handleAdjust('goalsScored', 1)}
                          className="flex-1 h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center gap-1 font-black text-xs sm:text-sm transition active:scale-95 shadow-md shadow-amber-500/30"
                          title="Aggiungi Gol Segnato dal Portiere (+1)"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>+1 GOL FATTO</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary progress bar */}
                  <div className="mt-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Tiri totali fronteggiati: <strong className="text-slate-200 font-mono">{totalShots}</strong></span>
                      <span className="font-mono font-bold text-emerald-400">{activeStat.saves} parati su {totalShots}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, savePercentage))}%` }}
                      />
                      <div 
                        className="bg-rose-500/80 h-full transition-all duration-300"
                        style={{ width: `${totalShots > 0 ? (activeStat.goalsConceded / totalShots) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Parate ({savePercentage.toFixed(1)}%)</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Subiti ({totalShots > 0 ? ((activeStat.goalsConceded / totalShots) * 100).toFixed(1) : 0}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* COMPARISON VIEW (Tutti i portieri della partita) */
            <div className="space-y-4">
              <div className="border border-slate-800 rounded-2xl p-3 bg-slate-950/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Riepilogo Prestazioni Portieri Gara
                </h4>
                
                {matchState.goalkeeperStats && matchState.goalkeeperStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                          <th className="py-2 px-2">Squadra</th>
                          <th className="py-2 px-2">N° Atleta</th>
                          <th className="py-2 px-2 text-center text-emerald-400 font-bold">Parate</th>
                          <th className="py-2 px-2 text-center text-rose-400 font-bold">Subiti</th>
                          <th className="py-2 px-2 text-center font-mono">Tiri Tot.</th>
                          <th className="py-2 px-2 text-center text-amber-300 font-bold">% Parate</th>
                          <th className="py-2 px-2 text-center font-mono">Gol Fatti</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {matchState.goalkeeperStats.map(stat => {
                          const shots = stat.saves + stat.goalsConceded;
                          const pct = shots > 0 ? ((stat.saves / shots) * 100).toFixed(1) : '0.0';
                          const isH = stat.team === 'home';
                          return (
                            <tr key={`${stat.team}_${stat.playerId}`} className="hover:bg-slate-800/50 transition">
                              <td className="py-2 px-2 font-bold">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isH ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}>
                                  {isH ? matchState.homeTeam.shortName || 'CASA' : matchState.awayTeam.shortName || 'OSPITI'}
                                </span>
                              </td>
                              <td className="py-2 px-2 font-medium">
                                <span className="font-mono font-bold text-amber-300 mr-1.5">#{stat.playerNumber}</span>
                                {stat.playerName}
                              </td>
                              <td className="py-2 px-2 text-center font-mono font-black text-emerald-400 text-sm">{stat.saves}</td>
                              <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">{stat.goalsConceded}</td>
                              <td className="py-2 px-2 text-center font-mono text-slate-300">{shots}</td>
                              <td className="py-2 px-2 text-center font-mono font-black text-amber-300 text-sm">{pct}%</td>
                              <td className="py-2 px-2 text-center font-mono font-bold text-slate-200">{stat.goalsScored}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    Nessun dato registrato per i portieri finora. Utilizza i pulsanti nel pannello live per annotare le parate.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Tutte le statistiche vengono salvate in automatico nel referto di gara.</span>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
