import React, { useState } from 'react';
import { MatchState, Player } from '../types';
import { sound } from '../utils/sound';
import { computeGoalkeeperStats, reconcileMatchState } from '../utils/matchSelectors';
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
  RefreshCw,
  AlertTriangle,
  ArrowRightLeft
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
  onReassignConcededGoal?: (team: 'home' | 'away', fromGkId: string | null, toGkId: string | null) => void;
  onReconcileMatch?: () => void;
  onOpenSevenMeterModal?: (team: 'home' | 'away') => void;
}

export const GoalkeeperModal: React.FC<GoalkeeperModalProps> = ({
  isOpen,
  onClose,
  matchState,
  onUpdateGoalkeeperStats,
  onSetActiveGoalkeeper,
  onReassignConcededGoal,
  onReconcileMatch,
  onOpenSevenMeterModal,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [activeTab, setActiveTab] = useState<'tracker' | 'comparison'>('tracker');
  const [copied, setCopied] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);

  if (!isOpen) return null;

  // Calcolo puramente derivato tramite selettore centrale
  const { home: homeSummary, away: awaySummary } = computeGoalkeeperStats(matchState);
  const currentSummary = selectedTeam === 'home' ? homeSummary : awaySummary;
  const currentTeam = selectedTeam === 'home' ? matchState.homeTeam : matchState.awayTeam;
  const isHome = selectedTeam === 'home';

  // Portieri candidati
  const gkCandidates = currentSummary.goalkeepers;
  const activeGkId = matchState.activeGoalkeepers?.[selectedTeam] || gkCandidates[0]?.playerId || '';
  const activeGkStat = gkCandidates.find(g => g.playerId === activeGkId) || gkCandidates[0];
  const activePlayer = currentTeam.players.find(p => p.id === activeGkId);

  const totalShots = activeGkStat ? activeGkStat.totalShots : 0;
  const savePercentage = activeGkStat ? parseFloat(activeGkStat.efficiencyPct) : 0;

  // Performance rating tier
  const getRatingTier = (pct: number, shots: number) => {
    if (shots === 0) return { label: 'In attesa di tiri', color: 'text-slate-400 bg-slate-800' };
    if (pct >= 40) return { label: 'Top Mondiale (≥40%)', color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30' };
    if (pct >= 33) return { label: 'Ottima Efficienza (≥33%)', color: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/30' };
    if (pct >= 25) return { label: 'Buona Media (25-32%)', color: 'text-amber-300 bg-amber-500/20 border-amber-500/30' };
    return { label: 'Sotto Media (<25%)', color: 'text-rose-300 bg-rose-500/20 border-rose-500/30' };
  };

  const rating = getRatingTier(savePercentage, totalShots);

  const handleAdjustSaves = (amount: number) => {
    if (!activeGkId) return;
    if (matchState.settings.soundEnabled) {
      if (amount > 0) sound.playGoalSound();
      else sound.playWarningBeep();
    }
    onUpdateGoalkeeperStats(selectedTeam, activeGkId, { saves: amount });
  };

  const handleCopySummary = () => {
    let text = `🤾 STATISTICHE PORTIERI - ${matchState.homeTeam.name} vs ${matchState.awayTeam.name}\n\n`;

    const formatTeamText = (summary: typeof homeSummary) => {
      let res = `🛡️ ${summary.teamName.toUpperCase()} (Tot. Subiti: ${summary.totalTeamConceded} / Avversario: ${summary.opponentTotalGoals}):\n`;
      if (summary.goalkeepers.length === 0) {
        res += `  Nessun portiere registrato\n`;
      } else {
        summary.goalkeepers.forEach(s => {
          res += `  • #${s.playerNumber} ${s.playerName}: ${s.saves} Parate | ${s.penaltySaves || 0} Rigori 7m | ${s.goalsConceded} Gol Subiti | ${s.efficiencyPct}% Eff. | ${s.goalsScored} Gol Fatti\n`;
        });
      }
      if (summary.emptyNetGoalsConceded > 0) {
        res += `  • 🚨 Porta Vuota: ${summary.emptyNetGoalsConceded} gol subiti a porta sguarnita\n`;
      }
      return res;
    };

    text += formatTeamText(homeSummary) + '\n' + formatTeamText(awaySummary);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 max-h-[92dvh] flex flex-col pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
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
                Gol subiti derivati al 100% dal punteggio • Parate ordinarie &amp; 7 Metri
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

        {/* Invariant Health Check Alert */}
        {!currentSummary.isConsistent && (
          <div className="mt-3 p-3 bg-amber-950/80 border border-amber-600 rounded-2xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <strong>Gol subiti non coerenti con il risultato!</strong>
                <p className="text-[11px] text-amber-300">
                  Subiti registrati: {currentSummary.totalTeamConceded} vs Reti avversario: {currentSummary.opponentTotalGoals}.
                </p>
              </div>
            </div>
            {onReconcileMatch && (
              <button
                onClick={onReconcileMatch}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition active:scale-95 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ricalcola</span>
              </button>
            )}
          </div>
        )}

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
                  <span className="text-[10px] text-slate-400 font-mono block">Subiti / Parate</span>
                  <span className="font-mono font-black text-xs">
                    <span className="text-rose-400">{homeSummary.totalTeamConceded}</span> / <span className="text-emerald-400">{homeSummary.totalTeamSaves}</span>
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
                  <span className="text-[10px] text-slate-400 font-mono block">Subiti / Parate</span>
                  <span className="font-mono font-black text-xs">
                    <span className="text-rose-400">{awaySummary.totalTeamConceded}</span> / <span className="text-emerald-400">{awaySummary.totalTeamSaves}</span>
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
                    {currentTeam.players.length} atleti in rosa
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
                      const pStat = currentSummary.goalkeepers.find(s => s.playerId === p.id);
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
                              {pStat ? ` • ${pStat.saves} par. | ${pStat.goalsConceded} sub.` : ''}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active Goalkeeper Live Cockpit */}
              {activeGkStat && (
                <div className={`rounded-3xl p-4 border bg-gradient-to-b ${
                  isHome 
                    ? 'from-red-950/30 via-slate-950 to-slate-950 border-red-900/40' 
                    : 'from-blue-950/30 via-slate-950 to-slate-950 border-blue-900/40'
                }`}>
                  {/* Player Headline & Efficiency badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-sm text-amber-400">
                        #{activeGkStat.playerNumber}
                      </span>
                      <div>
                        <h4 className="font-black text-base text-white">
                          {activeGkStat.playerName}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Portiere Attivo {isHome ? matchState.homeTeam.name : matchState.awayTeam.name}
                        </span>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${rating.color}`}>
                      <Percent className="w-3.5 h-3.5" />
                      <span>{activeGkStat.efficiencyPct}%</span>
                      <span className="text-[10px] opacity-80 hidden sm:inline">• {rating.label}</span>
                    </div>
                  </div>

                  {/* 3 Main Metrics Counters (Gol Parati, Gol Subiti, Rigori 7m) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                    {/* GOL PARATI */}
                    <div className="bg-slate-900/90 border border-emerald-600/40 rounded-2xl p-3 flex flex-col items-center justify-between text-center shadow-lg shadow-emerald-950/20">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> Gol Parati
                      </span>
                      <div className="my-1.5 text-4xl sm:text-5xl font-mono font-black text-emerald-300 drop-shadow">
                        {activeGkStat.saves}
                      </div>
                      <div className="flex items-center gap-1.5 w-full mt-1">
                        <button
                          onClick={() => handleAdjustSaves(-1)}
                          disabled={activeGkStat.saves <= 0}
                          className="w-10 h-10 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl flex items-center justify-center font-bold text-base transition active:scale-95 border border-slate-700"
                          title="Sottrai 1 parata (-1)"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => handleAdjustSaves(1)}
                          className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-1 font-black text-sm transition active:scale-95 shadow-md shadow-emerald-600/30"
                          title="Aggiungi Gol Parato (+1)"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>+1 PARATA</span>
                        </button>
                      </div>
                    </div>

                    {/* GOL SUBITI (DERIVATI DAI GOL AVVERSARI) */}
                    <div className="bg-slate-900/90 border border-rose-600/40 rounded-2xl p-3 flex flex-col items-center justify-between text-center shadow-lg shadow-rose-950/20">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" /> Gol Subiti
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          Derivato
                        </span>
                      </div>
                      <div className="my-1.5 text-4xl sm:text-5xl font-mono font-black text-rose-300 drop-shadow">
                        {activeGkStat.goalsConceded}
                      </div>
                      
                      {/* Riassegna Gol a... */}
                      <div className="w-full mt-1">
                        {isReassigning ? (
                          <div className="space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800 text-left">
                            <span className="text-[10px] font-bold text-slate-300 block">Sposta 1 gol subito a:</span>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {currentSummary.goalkeepers
                                .filter(g => g.playerId !== activeGkStat.playerId)
                                .map(g => (
                                  <button
                                    key={g.playerId}
                                    onClick={() => {
                                      if (onReassignConcededGoal) {
                                        onReassignConcededGoal(selectedTeam, activeGkStat.playerId, g.playerId);
                                      }
                                      setIsReassigning(false);
                                    }}
                                    className="w-full text-left text-xs py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-between"
                                  >
                                    <span>#{g.playerNumber} {g.playerName}</span>
                                    <span className="text-[10px] text-rose-300">{g.goalsConceded} sub.</span>
                                  </button>
                                ))}
                              <button
                                onClick={() => {
                                  if (onReassignConcededGoal) {
                                    onReassignConcededGoal(selectedTeam, activeGkStat.playerId, null);
                                  }
                                  setIsReassigning(false);
                                }}
                                className="w-full text-left text-xs py-1 px-2 rounded bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 flex items-center justify-between"
                              >
                                <span>🚨 Porta Vuota</span>
                              </button>
                            </div>
                            <button
                              onClick={() => setIsReassigning(false)}
                              className="text-[10px] text-slate-400 hover:text-white underline mt-1"
                            >
                              Annulla
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsReassigning(true)}
                            disabled={activeGkStat.goalsConceded <= 0}
                            className="w-full h-10 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-rose-300 border border-slate-700 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition active:scale-95"
                            title="Riassegna uno dei gol subiti a un altro portiere o a porta vuota"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Riassegna gol a…</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* RIGORI 7 METRI (DERIVATI DAGLI EVENTI 7M) */}
                    <div className="bg-slate-900/90 border border-cyan-600/40 rounded-2xl p-3 flex flex-col items-center justify-between text-center shadow-lg shadow-cyan-950/20">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" /> Rigori 7m Parati
                      </span>
                      <div className="my-1.5 text-4xl sm:text-5xl font-mono font-black text-cyan-300 drop-shadow">
                        {activeGkStat.penaltySaves || 0}
                      </div>

                      {/* Tasto apri 7m */}
                      <button
                        onClick={() => {
                          const opponentTeam = selectedTeam === 'home' ? 'away' : 'home';
                          if (onOpenSevenMeterModal) {
                            onOpenSevenMeterModal(opponentTeam);
                          }
                        }}
                        className="w-full h-10 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition active:scale-95 shadow-md shadow-cyan-600/20"
                        title="Registra un tiro dai 7 Metri per l'avversario"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Registra 7m</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <span>Tiri totali affrontati: <strong className="text-white font-mono">{activeGkStat.totalShots}</strong></span>
                    {activeGkStat.goalsScored > 0 && (
                      <span className="text-amber-300 font-bold">Gol segnati dal portiere: {activeGkStat.goalsScored}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Porta vuota card se presenti gol subiti a porta sguarnita */}
              {currentSummary.emptyNetGoalsConceded > 0 && (
                <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="font-bold text-amber-200">Gol subiti a Porta Vuota (7v6):</span>
                  </div>
                  <span className="font-mono font-black text-base text-amber-400">
                    {currentSummary.emptyNetGoalsConceded}
                  </span>
                </div>
              )}
            </>
          ) : (
            /* Comparison Tab: Tutte le statistiche derivate a confronto */
            <div className="space-y-4">
              {/* Home Team Table */}
              <div className="border border-red-900/50 rounded-2xl p-3 bg-slate-950/60">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-xs uppercase text-red-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    {homeSummary.teamName} (Tot. Reti Subite: {homeSummary.totalTeamConceded})
                  </h5>
                  <span className="text-[11px] font-mono text-emerald-300 font-bold">
                    {homeSummary.teamEfficiencyPct}% Media
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                        <th className="py-1">Portiere</th>
                        <th className="py-1 text-center">Parate</th>
                        <th className="py-1 text-center">7m</th>
                        <th className="py-1 text-center">Subiti</th>
                        <th className="py-1 text-center">Tiri</th>
                        <th className="py-1 text-center">% Eff.</th>
                        <th className="py-1 text-center">Gol P.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {homeSummary.goalkeepers.map(g => (
                        <tr key={g.playerId} className={g.isCurrentInGoal ? 'bg-red-950/20' : ''}>
                          <td className="py-1.5 font-sans font-semibold text-white">
                            #{g.playerNumber} {g.playerName} {g.isCurrentInGoal ? '🧤' : ''}
                          </td>
                          <td className="py-1.5 text-center text-emerald-400 font-bold">{g.saves}</td>
                          <td className="py-1.5 text-center text-cyan-300">{g.penaltySaves || 0}</td>
                          <td className="py-1.5 text-center text-rose-400">{g.goalsConceded}</td>
                          <td className="py-1.5 text-center text-slate-300">{g.totalShots}</td>
                          <td className="py-1.5 text-center text-amber-300 font-bold">{g.efficiencyPct}%</td>
                          <td className="py-1.5 text-center text-slate-300">{g.goalsScored}</td>
                        </tr>
                      ))}
                      {homeSummary.emptyNetGoalsConceded > 0 && (
                        <tr className="bg-amber-950/20 text-amber-300">
                          <td className="py-1.5 font-sans font-semibold">🚨 Porta Vuota</td>
                          <td className="py-1.5 text-center">-</td>
                          <td className="py-1.5 text-center">-</td>
                          <td className="py-1.5 text-center font-bold">{homeSummary.emptyNetGoalsConceded}</td>
                          <td className="py-1.5 text-center">{homeSummary.emptyNetGoalsConceded}</td>
                          <td className="py-1.5 text-center">0.0%</td>
                          <td className="py-1.5 text-center">-</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Away Team Table */}
              <div className="border border-blue-900/50 rounded-2xl p-3 bg-slate-950/60">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-xs uppercase text-blue-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    {awaySummary.teamName} (Tot. Reti Subite: {awaySummary.totalTeamConceded})
                  </h5>
                  <span className="text-[11px] font-mono text-emerald-300 font-bold">
                    {awaySummary.teamEfficiencyPct}% Media
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                        <th className="py-1">Portiere</th>
                        <th className="py-1 text-center">Parate</th>
                        <th className="py-1 text-center">7m</th>
                        <th className="py-1 text-center">Subiti</th>
                        <th className="py-1 text-center">Tiri</th>
                        <th className="py-1 text-center">% Eff.</th>
                        <th className="py-1 text-center">Gol P.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {awaySummary.goalkeepers.map(g => (
                        <tr key={g.playerId} className={g.isCurrentInGoal ? 'bg-blue-950/20' : ''}>
                          <td className="py-1.5 font-sans font-semibold text-white">
                            #{g.playerNumber} {g.playerName} {g.isCurrentInGoal ? '🧤' : ''}
                          </td>
                          <td className="py-1.5 text-center text-emerald-400 font-bold">{g.saves}</td>
                          <td className="py-1.5 text-center text-cyan-300">{g.penaltySaves || 0}</td>
                          <td className="py-1.5 text-center text-rose-400">{g.goalsConceded}</td>
                          <td className="py-1.5 text-center text-slate-300">{g.totalShots}</td>
                          <td className="py-1.5 text-center text-amber-300 font-bold">{g.efficiencyPct}%</td>
                          <td className="py-1.5 text-center text-slate-300">{g.goalsScored}</td>
                        </tr>
                      ))}
                      {awaySummary.emptyNetGoalsConceded > 0 && (
                        <tr className="bg-amber-950/20 text-amber-300">
                          <td className="py-1.5 font-sans font-semibold">🚨 Porta Vuota</td>
                          <td className="py-1.5 text-center">-</td>
                          <td className="py-1.5 text-center">-</td>
                          <td className="py-1.5 text-center font-bold">{awaySummary.emptyNetGoalsConceded}</td>
                          <td className="py-1.5 text-center">{awaySummary.emptyNetGoalsConceded}</td>
                          <td className="py-1.5 text-center">0.0%</td>
                          <td className="py-1.5 text-center">-</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
