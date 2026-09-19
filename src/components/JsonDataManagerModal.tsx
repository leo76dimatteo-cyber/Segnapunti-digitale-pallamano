import React, { useState, useRef } from 'react';
import { MatchState, Team } from '../types';
import { loadSavedRosters, saveRoster, importSavedRosters, SavedRoster } from '../utils/storage';
import { 
  exportSingleRosterJson, 
  exportTeamsArchiveJson, 
  exportMatchJson, 
  exportFullBackupJson, 
  parseImportedJson,
  ParseImportResult
} from '../utils/jsonExport';
import { 
  FileJson, 
  Download, 
  Upload, 
  Check, 
  X, 
  AlertCircle, 
  Users, 
  Trophy, 
  Database,
  ArrowRight
} from 'lucide-react';

interface JsonDataManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchState: MatchState;
  onLoadMatchState: (newState: MatchState) => void;
  onLoadRosterIntoTeam: (teamType: 'home' | 'away', roster: SavedRoster) => void;
}

export const JsonDataManagerModal: React.FC<JsonDataManagerModalProps> = ({
  isOpen,
  onClose,
  matchState,
  onLoadMatchState,
  onLoadRosterIntoTeam,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [savedRosters, setSavedRosters] = useState<SavedRoster[]>(() => loadSavedRosters());
  const [selectedRosterId, setSelectedRosterId] = useState<string>('');

  // Import state
  const [importedResult, setImportedResult] = useState<ParseImportResult | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // Handlers for Exports
  const handleExportMatch = () => {
    exportMatchJson(matchState);
    showSuccess('File JSON della partita esportato con successo!');
  };

  const handleExportTeamsArchive = () => {
    const teams = loadSavedRosters();
    if (teams.length === 0) {
      showError('Nessuna squadra presente in archivio da esportare.');
      return;
    }
    exportTeamsArchiveJson(teams);
    showSuccess(`Archivio con ${teams.length} squadre esportato in JSON!`);
  };

  const handleExportHomeRoster = () => {
    if (matchState.homeTeam.players.length === 0) {
      showError('La rosa della Squadra Casa non ha giocatori.');
    }
    exportSingleRosterJson(matchState.homeTeam);
    showSuccess(`Rosa "${matchState.homeTeam.name}" salvata in file JSON!`);
  };

  const handleExportAwayRoster = () => {
    if (matchState.awayTeam.players.length === 0) {
      showError('La rosa della Squadra Ospiti non ha giocatori.');
    }
    exportSingleRosterJson(matchState.awayTeam);
    showSuccess(`Rosa "${matchState.awayTeam.name}" salvata in file JSON!`);
  };

  const handleExportSelectedSavedRoster = () => {
    if (!selectedRosterId) {
      showError('Seleziona una squadra da esportare.');
      return;
    }
    const roster = savedRosters.find(r => r.id === selectedRosterId);
    if (!roster) return;
    exportSingleRosterJson(roster);
    showSuccess(`Rosa "${roster.teamName}" salvata in file JSON!`);
  };

  const handleExportFullBackup = () => {
    const teams = loadSavedRosters();
    exportFullBackupJson(matchState, teams);
    showSuccess('Backup globale (Partita + Archivio Squadre) esportato in JSON!');
  };

  // Import File Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        showError('Impossibile leggere il file.');
        return;
      }
      const parsed = parseImportedJson(content);
      setImportedResult(parsed);
      if (parsed.type === 'INVALID') {
        showError(parsed.error);
      } else {
        setErrorMsg('');
      }
    };
    reader.onerror = () => {
      showError('Errore durante il caricamento del file JSON.');
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Actions on Parsed Import
  const handleApplyImportedMatch = (match: MatchState) => {
    onLoadMatchState(match);
    showSuccess('Partita ripristinata con successo dal file JSON!');
    setImportedResult(null);
    setFileName('');
  };

  const handleApplyImportedRoster = (teamType: 'home' | 'away', roster: SavedRoster) => {
    onLoadRosterIntoTeam(teamType, roster);
    showSuccess(`Rosa "${roster.teamName}" applicata a Squadra ${teamType === 'home' ? 'Casa' : 'Ospiti'}!`);
  };

  const handleSaveImportedRosterToArchive = (roster: SavedRoster) => {
    saveRoster(roster);
    setSavedRosters(loadSavedRosters());
    showSuccess(`Rosa "${roster.teamName}" aggiunta all'archivio squadre!`);
  };

  const handleImportTeamsToArchive = (teams: SavedRoster[], replace = false) => {
    importSavedRosters(teams, replace);
    setSavedRosters(loadSavedRosters());
    showSuccess(`${teams.length} squadre importate con successo nell'archivio!`);
    setImportedResult(null);
    setFileName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Salvataggio &amp; Esportazione Dati JSON
              </h3>
              <p className="text-xs text-slate-400">
                Salva, esporta e carica formazioni, archivi e gare in formato standard JSON
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

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mt-4 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'export' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Esporta / Salva JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'import' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importa / Carica JSON</span>
          </button>
        </div>

        {/* Feedback messages */}
        {successMsg && (
          <div className="mt-3 p-2.5 bg-emerald-950/90 border border-emerald-600 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-3 p-2.5 bg-red-950/90 border border-red-800 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              {/* SECTION 1: SALVA PARTITA */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h4 className="font-extrabold text-sm text-white">1. Salva Partita Completa (JSON)</h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                    {matchState.homeTotalGoals} - {matchState.awayTotalGoals} ({matchState.currentPeriod}°T)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Esporta l'intero stato della gara in corso: squadre, punteggi tempi per tempo, cronometro, elenco gol e sanzioni per giocatore, referto arbitrale e configurazione regolamentare.
                </p>
                <button
                  onClick={handleExportMatch}
                  className="w-full sm:w-auto py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Scarica Partita JSON ({matchState.homeTeam.name} vs {matchState.awayTeam.name})</span>
                </button>
              </div>

              {/* SECTION 2: SALVA ROSA SINGOLA */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-extrabold text-sm text-white">2. Salva Rosa Singola (JSON)</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Esporta una singola formazione (nome squadra, colori sociali e atleti con numeri di maglia e ruoli) in un file JSON leggero e riutilizzabile.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                  {/* Home Team Roster */}
                  <div className="p-3 bg-slate-900/90 border border-red-900/50 rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-100 truncate">{matchState.homeTeam.name}</p>
                      <p className="text-[11px] text-slate-400">Casa • {matchState.homeTeam.players.length} giocatori</p>
                    </div>
                    <button
                      onClick={handleExportHomeRoster}
                      className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Salva Rosa</span>
                    </button>
                  </div>

                  {/* Away Team Roster */}
                  <div className="p-3 bg-slate-900/90 border border-blue-900/50 rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-100 truncate">{matchState.awayTeam.name}</p>
                      <p className="text-[11px] text-slate-400">Ospiti • {matchState.awayTeam.players.length} giocatori</p>
                    </div>
                    <button
                      onClick={handleExportAwayRoster}
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Salva Rosa</span>
                    </button>
                  </div>
                </div>

                {/* From Archive Dropdown */}
                {savedRosters.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-xs text-slate-400 whitespace-nowrap">Oppure da Archivio:</span>
                    <select
                      value={selectedRosterId}
                      onChange={(e) => setSelectedRosterId(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="">-- Seleziona squadra memorizzata --</option>
                      {savedRosters.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.teamName} ({r.players.length} atleti)
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={!selectedRosterId}
                      onClick={handleExportSelectedSavedRoster}
                      className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-xl transition active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Esporta Rosa</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 3: SALVA SQUADRE ARCHIVIO & BACKUP GLOBALE */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-extrabold text-sm text-white">3. Salva Squadre (Archivio) &amp; Backup Globale</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Esporta l'intero elenco delle squadre salvate o un file di backup combinato contenente sia la gara corrente che tutte le squadre per trasferirle su un altro computer o smartphone.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleExportTeamsArchive}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition active:scale-95 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Esporta Archivio Squadre ({savedRosters.length} salvate)</span>
                  </button>

                  <button
                    onClick={handleExportFullBackup}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition active:scale-95 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Backup Completo (Partita + Squadre)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* IMPORT TAB */
            <div className="space-y-4">
              <div className="p-5 bg-slate-950 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl text-center space-y-3 transition">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Carica un file JSON</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Il sistema riconosce automaticamente se si tratta di una <strong>Rosa</strong>, dell'<strong>Archivio Squadre</strong> o di una <strong>Partita</strong>.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="json-file-input"
                />
                <label
                  htmlFor="json-file-input"
                  className="inline-flex items-center gap-2 py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow-lg transition active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>Sfoglia e Seleziona File JSON</span>
                </label>

                {fileName && (
                  <div className="text-xs font-mono text-slate-300 pt-1">
                    File selezionato: <span className="text-amber-400 font-bold">{fileName}</span>
                  </div>
                )}
              </div>

              {/* IMPORT PREVIEW & ACTION */}
              {importedResult && importedResult.type !== 'INVALID' && (
                <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Dati Riconosciuti nel File
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Tipo: {importedResult.type}
                    </span>
                  </div>

                  {/* 1. MATCH IMPORT PREVIEW */}
                  {importedResult.type === 'MATCH' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-white">
                            {importedResult.matchState.homeTeam.name} vs {importedResult.matchState.awayTeam.name}
                          </span>
                          <span className="font-mono font-black text-amber-400">
                            {importedResult.matchState.homeTotalGoals} - {importedResult.matchState.awayTotalGoals}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                          <span>Data: {importedResult.matchState.settings.matchDate}</span>
                          <span>Cat: {importedResult.matchState.settings.category}</span>
                          <span>Gol registrati: {importedResult.matchState.goals.length}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApplyImportedMatch(importedResult.matchState)}
                          className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>Carica Questa Partita su Tabellone</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. ROSTER IMPORT PREVIEW */}
                  {importedResult.type === 'ROSTER' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-white">
                            {importedResult.roster.teamName} ({importedResult.roster.shortName})
                          </span>
                          <span className="text-xs font-mono text-amber-400">
                            {importedResult.roster.players.length} giocatori
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {importedResult.roster.players.map(p => `#${p.number} ${p.name}`).join(' • ') || 'Nessun giocatore'}
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handleSaveImportedRosterToArchive(importedResult.roster)}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
                        >
                          Salva in Archivio
                        </button>
                        <button
                          onClick={() => handleApplyImportedRoster('home', importedResult.roster)}
                          className="py-2 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition active:scale-95"
                        >
                          Carica come Casa
                        </button>
                        <button
                          onClick={() => handleApplyImportedRoster('away', importedResult.roster)}
                          className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition active:scale-95"
                        >
                          Carica come Ospiti
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. TEAMS ARCHIVE IMPORT PREVIEW */}
                  {importedResult.type === 'TEAMS_ARCHIVE' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <p className="text-xs font-bold text-slate-200">
                          {importedResult.teams.length} squadre trovate nel file:
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {importedResult.teams.map(t => (
                            <span key={t.id || t.teamName} className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                              {t.teamName} ({t.players.length} gioc.)
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleImportTeamsToArchive(importedResult.teams, false)}
                          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition active:scale-95"
                        >
                          Unisci all'Archivio Attuale
                        </button>
                        <button
                          onClick={() => handleImportTeamsToArchive(importedResult.teams, true)}
                          className="py-2 px-3 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 font-semibold text-xs rounded-xl transition"
                          title="Sostituisce completamente le squadre attuali con quelle del file"
                        >
                          Sostituisci Archivio
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4. FULL BACKUP IMPORT PREVIEW */}
                  {importedResult.type === 'FULL_BACKUP' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                        <p className="font-bold text-white">Contenuto Backup Completo:</p>
                        <p className="text-slate-400">• Partita: {importedResult.matchState.homeTeam.name} vs {importedResult.matchState.awayTeam.name}</p>
                        <p className="text-slate-400">• Squadre salvate in archivio: {importedResult.teams.length}</p>
                      </div>

                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            importSavedRosters(importedResult.teams, false);
                            setSavedRosters(loadSavedRosters());
                            showSuccess('Archivio squadre importato!');
                          }}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl"
                        >
                          Importa Solo Squadre
                        </button>
                        <button
                          onClick={() => handleApplyImportedMatch(importedResult.matchState)}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl"
                        >
                          Carica Solo Partita
                        </button>
                        <button
                          onClick={() => {
                            importSavedRosters(importedResult.teams, false);
                            setSavedRosters(loadSavedRosters());
                            handleApplyImportedMatch(importedResult.matchState);
                          }}
                          className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition active:scale-95"
                        >
                          Ripristina Tutto (Partita + Squadre)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
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
