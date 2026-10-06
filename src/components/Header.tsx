import React, { useState, useEffect, useRef } from 'react';
import { MatchState } from '../types';
import { CATEGORIES } from '../utils/categories';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Trophy, 
  Settings, 
  RotateCcw, 
  FileText, 
  Users, 
  Volume2, 
  VolumeX, 
  Sun, 
  Maximize2, 
  Minimize2, 
  FileCode, 
  FileJson, 
  Shield,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { exportStandaloneHTML } from '../utils/exportHtml';

interface HeaderProps {
  matchState: MatchState;
  onOpenSettings: () => void;
  onOpenReport: () => void;
  onOpenRosterManager: () => void;
  onOpenJsonData: () => void;
  onOpenGoalkeepers: () => void;
  onResetMatch: () => void;
  onToggleSound: () => void;
  isWakeLocked: boolean;
  onToggleWakeLock: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  matchState,
  onOpenSettings,
  onOpenReport,
  onOpenRosterManager,
  onOpenJsonData,
  onOpenGoalkeepers,
  onResetMatch,
  onToggleSound,
  isWakeLocked,
  onToggleWakeLock,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const currentCategory = CATEGORIES[matchState.settings.category] || CATEGORIES.under_14;
  const totalSaves = matchState.goalkeeperStats?.reduce((acc, c) => acc + c.saves, 0) || 0;

  // Close menu on click outside or ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleAction = (callback: () => void) => {
    setIsMenuOpen(false);
    callback();
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2 sm:px-4 sm:py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Category info */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-950 border border-amber-500/40 flex items-center justify-center text-white shadow-md shadow-amber-500/10 overflow-hidden p-0.5">
            <img src="/icon.svg?v=3" alt="Handball Score Pro Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-extrabold text-xs sm:text-base tracking-tight text-white truncate">
                Handball Scorer <span className="text-amber-400 font-mono text-xs">FIGH</span>
              </h1>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wide uppercase ${
                currentCategory.isU14Format 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {currentCategory.id === 'under_14' ? 'U14' : currentCategory.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              {matchState.homeTeam.name} vs {matchState.awayTeam.name}
            </p>
          </div>
        </div>

        {/* Quick action controls & Collapsible Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 relative">
          {/* PWA Install */}
          <PWAInstallButton />

          {/* Direct Portieri button */}
          <button
            id="btn-open-goalkeepers"
            onClick={onOpenGoalkeepers}
            className="p-2 sm:px-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition active:scale-95 flex items-center gap-1.5 shadow-sm"
            title="Statistiche Portieri: Gol parati, subiti, fatti e % efficienza"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline text-[11px] font-bold">Portieri</span>
            {totalSaves > 0 && (
              <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                {totalSaves}
              </span>
            )}
          </button>

          {/* Direct Official Match Report / PDF button */}
          <button
            id="btn-open-report"
            onClick={onOpenReport}
            className="px-2.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition active:scale-95 flex items-center gap-1.5"
            title="Apri referto ufficiale di gara & Genera PDF"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Referto PDF</span>
          </button>

          {/* MENÙ A SCOMPARSA (Collapsible Hamburger Drawer Toggle) */}
          <button
            ref={menuButtonRef}
            id="btn-toggle-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 sm:px-3 rounded-xl text-xs font-bold border transition active:scale-95 flex items-center gap-1.5 shadow-md ${
              isMenuOpen
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
            }`}
            title="Apri menù a scomparsa con tutte le funzioni e impostazioni"
            aria-expanded={isMenuOpen}
            aria-label="Menù a scomparsa"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4 text-amber-400" />}
            <span className="hidden sm:inline text-[11px] uppercase font-black tracking-wider">Menù</span>
          </button>

          {/* DROPDOWN / MENÙ A SCOMPARSA CONTENT */}
          {isMenuOpen && (
            <>
              {/* Dark backdrop overlay for mobile & desktop */}
              <div 
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:bg-transparent"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Collapsible Menu Popover Panel */}
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-2 w-80 sm:w-88 max-h-[85vh] overflow-y-auto z-50 bg-slate-900 border border-slate-700 rounded-3xl p-3 sm:p-4 shadow-2xl text-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-slate-700/50"
              >
                {/* Menu Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Menu className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-white">Menù Strumenti</h3>
                      <p className="text-[10px] text-slate-400 truncate font-mono">
                        {matchState.homeTeam.shortName || 'CASA'} vs {matchState.awayTeam.shortName || 'OSP'} • FIGH
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section 1: GARA & REFERTI */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider px-1">
                    Gara &amp; Referti
                  </span>

                  {/* Referto PDF */}
                  <button
                    onClick={() => handleAction(onOpenReport)}
                    className="w-full p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-200 block group-hover:text-amber-300">
                          Referto Ufficiale &amp; PDF
                        </span>
                        <span className="text-[10px] text-slate-400 block">Stampa, firma e verbale gara</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition" />
                  </button>

                  {/* Portieri & Statistiche */}
                  <button
                    onClick={() => handleAction(onOpenGoalkeepers)}
                    className="w-full p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-200 block group-hover:text-emerald-300">
                          Rendimento Portieri
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Parate ({totalSaves}), 7m ed efficienza %
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
                  </button>
                </div>

                {/* Section 2: ROSE & DATI JSON */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider px-1">
                    Archivi &amp; Dati
                  </span>

                  {/* Roster Manager */}
                  <button
                    onClick={() => handleAction(onOpenRosterManager)}
                    className="w-full p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 flex items-center justify-between text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-200 block group-hover:text-sky-300">
                          Gestione Rose &amp; Formazioni
                        </span>
                        <span className="text-[10px] text-slate-400 block">Carica o salva squadre in archivio</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition" />
                  </button>

                  {/* Salva/Esporta JSON */}
                  <button
                    onClick={() => handleAction(onOpenJsonData)}
                    className="w-full p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <FileJson className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-200 block group-hover:text-amber-300">
                          Gestione Dati JSON (Backup)
                        </span>
                        <span className="text-[10px] text-slate-400 block">Esporta e importa rose o partite</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition" />
                  </button>

                  {/* Esporta File HTML Autonomo */}
                  <button
                    onClick={() => {
                      exportStandaloneHTML(matchState);
                      setIsMenuOpen(false);
                    }}
                    className="w-full p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-200 block group-hover:text-emerald-300">
                          Salva File HTML Autonomo
                        </span>
                        <span className="text-[10px] text-slate-400 block">Documento offline 100% indipendente</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
                  </button>
                </div>

                {/* Section 3: IMPOSTAZIONI & HARDWARE */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider px-1">
                    Impostazioni &amp; Controlli
                  </span>

                  {/* Match Settings Modal */}
                  <button
                    onClick={() => handleAction(onOpenSettings)}
                    className="w-full p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-200 block group-hover:text-purple-300">
                          Impostazioni Regolamento &amp; Categorie
                        </span>
                        <span className="text-[10px] text-slate-400 block">Tempi, U14 FIGH, sirene e arbitri</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition" />
                  </button>

                  {/* Toggle Controls Grid: WakeLock, Sound, Fullscreen */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {/* WakeLock */}
                    <button
                      onClick={onToggleWakeLock}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition active:scale-95 ${
                        isWakeLocked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                      title="Mantieni schermo sempre attivo senza spegnimento"
                    >
                      <Sun className={`w-4 h-4 mb-0.5 ${isWakeLocked ? 'text-amber-400 animate-pulse' : ''}`} />
                      <span className="text-[10px] font-bold">Schermo</span>
                      <span className="text-[8px] opacity-75">{isWakeLocked ? 'ON' : 'OFF'}</span>
                    </button>

                    {/* Sound */}
                    <button
                      onClick={onToggleSound}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition active:scale-95 ${
                        matchState.settings.soundEnabled
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-950/80 text-slate-500 border-slate-800 hover:bg-slate-800'
                      }`}
                      title="Attiva o silenzia sirene e avvisi acustici"
                    >
                      {matchState.settings.soundEnabled ? (
                        <Volume2 className="w-4 h-4 mb-0.5 text-amber-400" />
                      ) : (
                        <VolumeX className="w-4 h-4 mb-0.5" />
                      )}
                      <span className="text-[10px] font-bold">Sirena</span>
                      <span className="text-[8px] opacity-75">{matchState.settings.soundEnabled ? 'ON' : 'MUTO'}</span>
                    </button>

                    {/* Fullscreen */}
                    <button
                      onClick={onToggleFullscreen}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition active:scale-95 ${
                        isFullscreen
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                          : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                      title="Passa a schermo intero"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-4 h-4 mb-0.5 text-sky-400" />
                      ) : (
                        <Maximize2 className="w-4 h-4 mb-0.5" />
                      )}
                      <span className="text-[10px] font-bold">Display</span>
                      <span className="text-[8px] opacity-75">{isFullscreen ? 'Normale' : 'Intero'}</span>
                    </button>
                  </div>
                </div>

                {/* Section 4: AZIONI CRITICHE (Reset Partita) */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleAction(onResetMatch)}
                    className="w-full p-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
                    title="Azzera il punteggio o avvia una nuova gara"
                  >
                    <RotateCcw className="w-4 h-4 text-red-400" />
                    <span>Azzera Gara / Nuova Partita</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
