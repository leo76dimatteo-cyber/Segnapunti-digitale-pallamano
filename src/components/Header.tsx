import React from 'react';
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
  FileJson
} from 'lucide-react';
import { exportStandaloneHTML } from '../utils/exportHtml';

interface HeaderProps {
  matchState: MatchState;
  onOpenSettings: () => void;
  onOpenReport: () => void;
  onOpenRosterManager: () => void;
  onOpenJsonData: () => void;
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
  onResetMatch,
  onToggleSound,
  isWakeLocked,
  onToggleWakeLock,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const currentCategory = CATEGORIES[matchState.settings.category] || CATEGORIES.under_14;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2 sm:px-4 sm:py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Category info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">
                Handball Scorer <span className="text-amber-400 font-mono text-xs">FIGH</span>
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                currentCategory.isU14Format 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {currentCategory.id === 'under_14' ? 'U14 (MHC FIGH)' : currentCategory.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              {matchState.homeTeam.name} vs {matchState.awayTeam.name}
            </p>
          </div>
        </div>

        {/* Quick action controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install */}
          <PWAInstallButton />

          {/* WakeLock button (Keep Screen On) */}
          <button
            id="btn-wake-lock"
            onClick={onToggleWakeLock}
            className={`p-2 rounded-xl text-xs font-medium border transition active:scale-95 flex items-center gap-1 ${
              isWakeLocked 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
            }`}
            title={isWakeLocked ? "Schermo sempre attivo (ON)" : "Attiva schermo sempre acceso per bordocampo"}
          >
            <Sun className={`w-4 h-4 ${isWakeLocked ? 'animate-pulse text-amber-400' : ''}`} />
            <span className="hidden md:inline text-[11px]">{isWakeLocked ? 'Schermo ON' : 'Schermo'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleSound}
            className={`p-2 rounded-xl text-xs font-medium border transition active:scale-95 ${
              matchState.settings.soundEnabled 
                ? 'bg-slate-800 text-amber-400 border-slate-700' 
                : 'bg-slate-800 text-slate-500 border-slate-800'
            }`}
            title={matchState.settings.soundEnabled ? "Suono sirena attivo" : "Sirena disattivata"}
          >
            {matchState.settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Standalone HTML File Exporter */}
          <button
            id="btn-export-html"
            onClick={() => exportStandaloneHTML(matchState)}
            className="p-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 hidden sm:flex items-center gap-1"
            title="Esporta file HTML autonomo offline"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline text-[11px]">Salva HTML</span>
          </button>

          {/* Salva / Esporta JSON (Rose, Squadre, Partite) */}
          <button
            id="btn-open-json-data"
            onClick={onOpenJsonData}
            className="p-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 flex items-center gap-1"
            title="Salva ed esporta dati JSON: Rosa, Squadre, Partite"
          >
            <FileJson className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline text-[11px]">Dati JSON</span>
          </button>

          {/* Rosters Manager */}
          <button
            id="btn-open-roster"
            onClick={onOpenRosterManager}
            className="p-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 flex items-center gap-1"
            title="Gestisci rose e formazioni giocatori"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline text-[11px]">Rose</span>
          </button>

          {/* Official Match Report / PDF */}
          <button
            id="btn-open-report"
            onClick={onOpenReport}
            className="px-2.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition active:scale-95 flex items-center gap-1.5"
            title="Apri referto ufficiale di gara & Genera PDF"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Referto PDF</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="btn-fullscreen-toggle"
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 hidden sm:block"
            title={isFullscreen ? "Esci da schermo intero" : "Schermo intero"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95"
            title="Impostazioni partita, tempi e categorie"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Reset Match */}
          <button
            id="btn-reset-match"
            onClick={onResetMatch}
            className="p-2 rounded-xl text-xs font-medium bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 transition active:scale-95"
            title="Azzera o avvia nuova partita"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
