import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Player, RegistryPlayer, CategoryPlayerGroup } from '../types';
import { 
  loadRegistryPlayers, 
  saveRegistryPlayer, 
  saveRegistryPlayersBatch,
  deleteRegistryPlayer, 
  clearRegistryPlayers, 
  importRegistryPlayers,
  resetRegistryToDefault,
  REGISTRY_CATEGORIES, 
  getCategoryMeta,
  getCategoryLabel
} from '../utils/playerRegistry';
import { 
  exportCategorizedPlayersJson, 
  downloadPlayersRegistryTemplateJson, 
  parseImportedJson 
} from '../utils/jsonExport';
import { sound } from '../utils/sound';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  X, 
  AlertCircle, 
  Shield, 
  Crown, 
  FileJson, 
  Sparkles, 
  FileText, 
  Edit3, 
  CheckSquare, 
  Square,
  ArrowRight,
  Filter,
  RefreshCw,
  Award
} from 'lucide-react';

interface PlayersRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeamName: string;
  awayTeamName: string;
  homePlayers: Player[];
  awayPlayers: Player[];
  defaultCategory?: string;
  onAddPlayerToTeam: (teamType: 'home' | 'away', player: Omit<Player, 'id'>) => void;
  onAddBatchPlayersToTeam?: (teamType: 'home' | 'away', players: Omit<Player, 'id'>[]) => void;
}

export const PlayersRegistryModal: React.FC<PlayersRegistryModalProps> = ({
  isOpen,
  onClose,
  homeTeamName,
  awayTeamName,
  homePlayers,
  awayPlayers,
  defaultCategory,
  onAddPlayerToTeam,
  onAddBatchPlayersToTeam,
}) => {
  const [players, setPlayers] = useState<RegistryPlayer[]>(() => loadRegistryPlayers());
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>(() => defaultCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Portiere' | 'Capitano' | 'Giocatore'>('all');
  
  // Multi-selection state
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  
  // Feedback messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Create / Edit Player Modal/Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [formNumber, setFormNumber] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string>(() => defaultCategory || 'under_14');
  const [formRole, setFormRole] = useState<'Giocatore' | 'Portiere' | 'Capitano'>('Giocatore');
  const [formPosition, setFormPosition] = useState<string>('Giocatore');
  const [formClub, setFormClub] = useState('');
  const [formBirthYear, setFormBirthYear] = useState('');
  const [formCardId, setFormCardId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  
  // Confirmations
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmResetDefault, setConfirmResetDefault] = useState(false);
  const [isImportMatchOpen, setIsImportMatchOpen] = useState(false);
  const [importMatchCategory, setImportMatchCategory] = useState(defaultCategory || 'under_14');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize players list and selection when modal is opened
  useEffect(() => {
    if (isOpen) {
      setPlayers(loadRegistryPlayers());
      if (defaultCategory && defaultCategory !== 'all') {
        setSelectedCategoryTab(defaultCategory);
      }
      setSelectedPlayerIds(new Set());
    }
  }, [isOpen, defaultCategory]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const refreshList = () => {
    setPlayers(loadRegistryPlayers());
  };

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: players.length };
    REGISTRY_CATEGORIES.forEach(c => { counts[c.id] = 0; });
    players.forEach(p => {
      const cat = p.category || 'altro';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [players]);

  // Filtered player list
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      // Category filter
      if (selectedCategoryTab !== 'all' && p.category !== selectedCategoryTab) {
        return false;
      }
      // Role filter
      if (roleFilter !== 'all' && p.role !== roleFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const numMatch = p.number.toString() === q;
        const nameMatch = p.name.toLowerCase().includes(q);
        const clubMatch = (p.clubName || '').toLowerCase().includes(q);
        const cardMatch = (p.cardId || '').toLowerCase().includes(q);
        const posMatch = (p.position || '').toLowerCase().includes(q);
        if (!numMatch && !nameMatch && !clubMatch && !cardMatch && !posMatch) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      // Sort by category first if all, then by number
      if (selectedCategoryTab === 'all' && a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.number - b.number;
    });
  }, [players, selectedCategoryTab, roleFilter, searchQuery]);

  // Handle Form Open for New
  const handleOpenNewPlayerForm = () => {
    setEditingPlayerId(null);
    setFormNumber('');
    setFormName('');
    setFormCategory(selectedCategoryTab !== 'all' ? selectedCategoryTab : 'under_14');
    setFormRole('Giocatore');
    setFormPosition('Giocatore');
    setFormClub('');
    setFormBirthYear('');
    setFormCardId('');
    setFormNotes('');
    setIsFormOpen(true);
  };

  // Handle Form Open for Edit
  const handleOpenEditPlayerForm = (player: RegistryPlayer) => {
    setEditingPlayerId(player.id);
    setFormNumber(player.number.toString());
    setFormName(player.name);
    setFormCategory(player.category || 'under_14');
    setFormRole(player.role || 'Giocatore');
    setFormPosition(player.position || 'Giocatore');
    setFormClub(player.clubName || '');
    setFormBirthYear(player.birthYear ? player.birthYear.toString() : '');
    setFormCardId(player.cardId || '');
    setFormNotes(player.notes || '');
    setIsFormOpen(true);
  };

  // Save Player from form
  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(formNumber, 10);
    if (isNaN(num) || num < 1 || num > 99) {
      showError('Numero di maglia non valido (1-99)');
      return;
    }
    if (!formName.trim()) {
      showError('Inserisci nome e cognome dell’atleta');
      return;
    }

    const birth = formBirthYear ? parseInt(formBirthYear, 10) : undefined;

    const newPlayerRecord: RegistryPlayer = {
      id: editingPlayerId || 'reg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      number: num,
      name: formName.trim(),
      category: formCategory,
      categoryName: getCategoryLabel(formCategory),
      role: formRole,
      position: formPosition,
      clubName: formClub.trim(),
      birthYear: birth,
      cardId: formCardId.trim(),
      notes: formNotes.trim(),
      savedAt: Date.now(),
    };

    saveRegistryPlayer(newPlayerRecord);
    refreshList();
    setIsFormOpen(false);
    showSuccess(`Atleta #${num} ${formName} salvato nel registro (${getCategoryLabel(formCategory)})!`);
  };

  // Delete Player
  const handleDeletePlayer = (playerId: string, name: string) => {
    deleteRegistryPlayer(playerId);
    refreshList();
    setConfirmDeleteId(null);
    showSuccess(`Atleta "${name}" rimosso dal registro.`);
  };

  // Export Categorized JSON
  const handleExportJson = (specificCat?: string) => {
    if (players.length === 0) {
      showError('Nessun atleta nel registro da esportare.');
      return;
    }
    exportCategorizedPlayersJson(players, specificCat);
    const catLabel = specificCat ? getCategoryLabel(specificCat) : 'Tutte le Categorie';
    showSuccess(`File JSON generato per ${catLabel} con successo!`);
  };

  // Import JSON File
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const parsed = parseImportedJson(content);
      if (parsed.type === 'PLAYERS_REGISTRY') {
        const imported = importRegistryPlayers(parsed.players, false);
        setPlayers(imported);
        showSuccess(`Importati con successo ${parsed.players.length} atleti suddivisi per categorie!`);
      } else if (parsed.type === 'ROSTER') {
        // Convert single roster players to registry
        const categoryToAssign = selectedCategoryTab !== 'all' ? selectedCategoryTab : 'under_14';
        const converted: RegistryPlayer[] = parsed.roster.players.map(p => ({
          ...p,
          id: 'reg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          category: categoryToAssign,
          categoryName: getCategoryLabel(categoryToAssign),
          clubName: parsed.roster.teamName,
          savedAt: Date.now(),
        }));
        const imported = importRegistryPlayers(converted, false);
        setPlayers(imported);
        showSuccess(`Rosa "${parsed.roster.teamName}" (${converted.length} atleti) aggiunta al registro!`);
      } else if (parsed.type === 'TEAMS_ARCHIVE') {
        // Convert all teams archive
        const categoryToAssign = selectedCategoryTab !== 'all' ? selectedCategoryTab : 'under_14';
        const allConverted: RegistryPlayer[] = [];
        parsed.teams.forEach(t => {
          t.players.forEach(p => {
            allConverted.push({
              ...p,
              id: 'reg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              category: categoryToAssign,
              categoryName: getCategoryLabel(categoryToAssign),
              clubName: t.teamName,
              savedAt: Date.now(),
            });
          });
        });
        const imported = importRegistryPlayers(allConverted, false);
        setPlayers(imported);
        showSuccess(`Importati ${allConverted.length} atleti da archivio squadre!`);
      } else {
        showError('File JSON non valido o formato non compatibile.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add Player into Active Match Team
  const handleInsertIntoTeam = (teamType: 'home' | 'away', player: RegistryPlayer) => {
    const targetTeamName = teamType === 'home' ? homeTeamName : awayTeamName;
    const currentTeamPlayers = teamType === 'home' ? homePlayers : awayPlayers;

    // Check duplicate number
    if (currentTeamPlayers.some(p => p.number === player.number)) {
      showError(`Attenzione: Il numero #${player.number} è già assegnato in ${targetTeamName}!`);
      return;
    }

    onAddPlayerToTeam(teamType, {
      number: player.number,
      name: player.name,
      role: player.role || 'Giocatore',
      category: player.category,
      clubName: player.clubName,
      birthYear: player.birthYear,
      cardId: player.cardId,
      position: player.position,
    });

    sound.playGoalSound();
    showSuccess(`Atleta #${player.number} ${player.name} inserito in distinta: ${targetTeamName}!`);
  };

  // Multi-selection toggle
  const toggleSelectPlayer = (id: string) => {
    setSelectedPlayerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedPlayerIds.size === filteredPlayers.length && filteredPlayers.length > 0) {
      setSelectedPlayerIds(new Set());
    } else {
      setSelectedPlayerIds(new Set(filteredPlayers.map(p => p.id)));
    }
  };

  // Batch insert into team
  const handleBatchInsert = (teamType: 'home' | 'away') => {
    const targetTeamName = teamType === 'home' ? homeTeamName : awayTeamName;
    const currentTeamPlayers = teamType === 'home' ? homePlayers : awayPlayers;
    const selectedList = players.filter(p => selectedPlayerIds.has(p.id));

    if (selectedList.length === 0) {
      showError('Nessun atleta selezionato.');
      return;
    }

    let addedCount = 0;
    const skippedNumbers: number[] = [];

    const toAdd: Omit<Player, 'id'>[] = [];
    selectedList.forEach(player => {
      if (currentTeamPlayers.some(p => p.number === player.number) || toAdd.some(p => p.number === player.number)) {
        skippedNumbers.push(player.number);
      } else {
        toAdd.push({
          number: player.number,
          name: player.name,
          role: player.role || 'Giocatore',
          category: player.category,
          clubName: player.clubName,
          birthYear: player.birthYear,
          cardId: player.cardId,
          position: player.position,
        });
        addedCount++;
      }
    });

    if (toAdd.length > 0) {
      if (onAddBatchPlayersToTeam) {
        onAddBatchPlayersToTeam(teamType, toAdd);
      } else {
        toAdd.forEach(p => onAddPlayerToTeam(teamType, p));
      }
      sound.playGoalSound();
    }

    setSelectedPlayerIds(new Set());
    if (skippedNumbers.length > 0) {
      showSuccess(`${addedCount} atleti inseriti in ${targetTeamName}. (Numeri saltati per duplicati: #${skippedNumbers.join(', #')})`);
    } else {
      showSuccess(`Tutti i ${addedCount} atleti selezionati sono stati inseriti in ${targetTeamName}!`);
    }
  };

  // Import all players from current match into registry
  const handleImportCurrentMatchPlayers = () => {
    const combined: RegistryPlayer[] = [];
    const now = Date.now();

    homePlayers.forEach(p => {
      combined.push({
        ...p,
        id: 'reg_' + now + '_' + Math.random().toString(36).substring(2, 6),
        category: importMatchCategory,
        categoryName: getCategoryLabel(importMatchCategory),
        clubName: homeTeamName,
        savedAt: now,
      });
    });

    awayPlayers.forEach(p => {
      combined.push({
        ...p,
        id: 'reg_' + now + '_' + Math.random().toString(36).substring(2, 6),
        category: importMatchCategory,
        categoryName: getCategoryLabel(importMatchCategory),
        clubName: awayTeamName,
        savedAt: now,
      });
    });

    if (combined.length === 0) {
      showError('Nessun giocatore attualmente presente in distinta gara da importare.');
      return;
    }

    const updated = importRegistryPlayers(combined, false);
    setPlayers(updated);
    setIsImportMatchOpen(false);
    showSuccess(`${combined.length} atleti della partita salvati nel registro con categoria "${getCategoryLabel(importMatchCategory)}"!`);
  };

  // Reset to default sample players
  const handleResetToDefault = () => {
    const reset = resetRegistryToDefault();
    setPlayers(reset);
    setConfirmResetDefault(false);
    showSuccess('Registro ripristinato con i giocatori federali predefiniti.');
  };

  // Clear all
  const handleClearAll = () => {
    clearRegistryPlayers();
    setPlayers([]);
    setConfirmClearAll(false);
    showSuccess('Tutti gli atleti sono stati rimossi dal registro.');
  };

  const selectedCategoryMeta = selectedCategoryTab !== 'all' ? getCategoryMeta(selectedCategoryTab) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 max-h-[94vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-amber-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shadow-md">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Registro Anagrafica Giocatori
                </h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  {players.length} Atleti
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Archivio suddiviso per Categorie FIGH con generazione &amp; importazione file JSON
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            title="Chiudi registro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alerts */}
        {successMsg && (
          <div className="mt-3 p-2.5 bg-emerald-950/90 border border-emerald-600 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in flex-shrink-0">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-2.5 bg-red-950/90 border border-red-600 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2 animate-in fade-in flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Category Selector Tabs */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 flex-shrink-0 scrollbar-thin">
          <button
            onClick={() => setSelectedCategoryTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedCategoryTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>Tutte le Categorie</span>
            <span className="font-mono text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full">
              {categoryCounts.all || 0}
            </span>
          </button>

          {REGISTRY_CATEGORIES.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategoryTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryTab(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap border ${
                  isSelected
                    ? `${cat.bgColor} ${cat.color} ${cat.borderColor} shadow-sm ring-1 ring-white/20`
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{cat.shortName}</span>
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/40 font-black' : 'bg-slate-900 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Description of current active category */}
        {selectedCategoryMeta && (
          <div className={`mt-2 p-2 rounded-xl text-xs flex items-center justify-between gap-2 border flex-shrink-0 ${selectedCategoryMeta.bgColor} ${selectedCategoryMeta.borderColor}`}>
            <div className="flex items-center gap-2">
              <Award className={`w-4 h-4 ${selectedCategoryMeta.color}`} />
              <span className="font-bold text-white">{selectedCategoryMeta.name}:</span>
              <span className="text-slate-300 text-[11px] hidden sm:inline">{selectedCategoryMeta.description}</span>
            </div>
            <button
              onClick={() => handleExportJson(selectedCategoryMeta.id)}
              className="text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1 flex-shrink-0"
              title="Esporta solo questa categoria"
            >
              <Download className="w-3 h-3" />
              <span>Esporta solo {selectedCategoryMeta.shortName} JSON</span>
            </button>
          </div>
        )}

        {/* Actions Toolbar */}
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap flex-shrink-0">
          {/* Left action buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Add Player */}
            <button
              onClick={handleOpenNewPlayerForm}
              className="py-1.5 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition active:scale-95 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuovo Giocatore</span>
            </button>

            {/* Export JSON Button (MAIN REQUIREMENT) */}
            <button
              onClick={() => handleExportJson()}
              className="py-1.5 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 hover:border-amber-400 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="Genera ed esporta il file JSON dell'archivio suddiviso per Categorie"
            >
              <FileJson className="w-4 h-4 text-amber-400" />
              <span>Genera JSON Categorie</span>
            </button>

            {/* Import JSON */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportJsonFile}
              className="hidden"
              id="registry-json-file"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              title="Importa anagrafica atleti da file JSON"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Importa JSON</span>
            </button>

            {/* Template JSON */}
            <button
              onClick={downloadPlayersRegistryTemplateJson}
              className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition"
              title="Scarica un file modello JSON pronto per essere compilato con le categorie"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Modello JSON</span>
            </button>

            {/* Import from Current Match */}
            {(homePlayers.length > 0 || awayPlayers.length > 0) && (
              <button
                onClick={() => setIsImportMatchOpen(!isImportMatchOpen)}
                className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 flex items-center gap-1.5 transition"
                title="Salva i giocatori attualmente in distinta nel registro"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Salva da Partita ({homePlayers.length + awayPlayers.length})</span>
              </button>
            )}
          </div>

          {/* Right utility buttons: Reset / Clear */}
          <div className="flex items-center gap-1.5">
            {confirmResetDefault ? (
              <div className="flex items-center gap-1 bg-amber-950 p-1 rounded-xl border border-amber-700 text-xs">
                <button
                  onClick={handleResetToDefault}
                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-black font-black rounded-lg text-[10px]"
                >
                  Sì, Ripristina
                </button>
                <button
                  onClick={() => setConfirmResetDefault(false)}
                  className="p-0.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmResetDefault(true)}
                className="p-1.5 text-slate-400 hover:text-amber-300 rounded-xl hover:bg-slate-800 transition"
                title="Ripristina giocatori federali predefiniti di esempio"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            {confirmClearAll ? (
              <div className="flex items-center gap-1 bg-red-950 p-1 rounded-xl border border-red-700 text-xs">
                <button
                  onClick={handleClearAll}
                  className="px-2 py-0.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg text-[10px]"
                >
                  Sì, Svuota
                </button>
                <button
                  onClick={() => setConfirmClearAll(false)}
                  className="p-0.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              players.length > 0 && (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-xl hover:bg-red-950/40 transition"
                  title="Svuota completamente il registro"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Quick Search and Filters */}
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap flex-shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca per nome, maglia, società, cartellino..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none font-semibold"
            >
              <option value="all">Tutti i Ruoli</option>
              <option value="Portiere">Solo Portieri (P)</option>
              <option value="Capitano">Solo Capitani (C)</option>
              <option value="Giocatore">Giocatori di Movimento</option>
            </select>

            <button
              onClick={handleSelectAllFiltered}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 border border-slate-700 transition"
              title="Seleziona / Deseleziona tutti gli atleti visibili"
            >
              {selectedPlayerIds.size === filteredPlayers.length && filteredPlayers.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">Seleziona tutti ({filteredPlayers.length})</span>
            </button>
          </div>
        </div>

        {/* Multi-Selection Batch Action Bar */}
        {selectedPlayerIds.size > 0 && (
          <div className="mt-2.5 p-2 bg-indigo-950/80 border border-indigo-700 rounded-2xl flex items-center justify-between gap-2 flex-wrap animate-in fade-in flex-shrink-0 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-indigo-200">
                {selectedPlayerIds.size} atleti selezionati:
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleBatchInsert('home')}
                className="py-1 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
              >
                <span>+ Inserisci in {homeTeamName || 'Casa'}</span>
              </button>
              <button
                onClick={() => handleBatchInsert('away')}
                className="py-1 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
              >
                <span>+ Inserisci in {awayTeamName || 'Ospiti'}</span>
              </button>
              <button
                onClick={() => {
                  const selectedPlayers = players.filter(p => selectedPlayerIds.has(p.id));
                  exportCategorizedPlayersJson(selectedPlayers);
                  showSuccess(`Esportati ${selectedPlayers.length} atleti selezionati in JSON!`);
                }}
                className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/50 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Download className="w-3 h-3 text-amber-400" />
                <span>Esporta JSON</span>
              </button>
              <button
                onClick={() => setSelectedPlayerIds(new Set())}
                className="p-1 text-slate-400 hover:text-white"
                title="Deseleziona"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Sub-form: Import from Current Match Dialog */}
        {isImportMatchOpen && (
          <div className="mt-3 p-3 bg-indigo-950/60 border border-indigo-800 rounded-2xl space-y-2 animate-in fade-in flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Salva giocatori della partita in corso nel Registro Categorie
              </span>
              <button onClick={() => setIsImportMatchOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-300">
              Verranno archiviati {homePlayers.length} atleti di {homeTeamName} e {awayPlayers.length} atleti di {awayTeamName}.
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <label className="text-xs text-slate-300">Assegna Categoria:</label>
              <select
                value={importMatchCategory}
                onChange={(e) => setImportMatchCategory(e.target.value)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
              >
                {REGISTRY_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={handleImportCurrentMatchPlayers}
                className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Conferma e Salva nel Registro
              </button>
            </div>
          </div>
        )}

        {/* CREATE / EDIT PLAYER FORM MODAL */}
        {isFormOpen && (
          <form onSubmit={handleSavePlayer} className="mt-3 p-4 bg-slate-950 border border-amber-500/50 rounded-2xl space-y-3 animate-in fade-in flex-shrink-0 shadow-xl">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                {editingPlayerId ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {editingPlayerId ? 'Modifica Atleta nel Registro' : 'Registra Nuovo Atleta per Categoria'}
              </h4>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">N° Maglia (1-99)*</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  placeholder="Es. 7"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-amber-400"
                  required
                  autoFocus
                />
              </div>

              <div className="col-span-2 sm:col-span-3">
                <label className="block text-[11px] text-slate-400 mb-1">Nome e Cognome Atleta*</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Es. Marco Rossi"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Categoria FIGH*</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none"
                >
                  {REGISTRY_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Ruolo Base</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:outline-none"
                >
                  <option value="Giocatore">Giocatore</option>
                  <option value="Portiere">Portiere (P)</option>
                  <option value="Capitano">Capitano (C)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Posizione Tattica</label>
                <select
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="Giocatore">Generale / Movimento</option>
                  <option value="Portiere">Portiere</option>
                  <option value="Centrale">Centrale (Regista)</option>
                  <option value="Terzino">Terzino</option>
                  <option value="Ala">Ala</option>
                  <option value="Pivot">Pivot</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Società / Club</label>
                <input
                  type="text"
                  value={formClub}
                  onChange={(e) => setFormClub(e.target.value)}
                  placeholder="Es. HC Rubiera"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Anno Nascita</label>
                <input
                  type="number"
                  min="1950"
                  max="2025"
                  value={formBirthYear}
                  onChange={(e) => setFormBirthYear(e.target.value)}
                  placeholder="Es. 2012"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Cartellino FIGH</label>
                <input
                  type="text"
                  value={formCardId}
                  onChange={(e) => setFormCardId(e.target.value)}
                  placeholder="Es. FIGH-749102"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Note Tecniche</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Es. Mancino, rigorista, capitano vice"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95 shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salva nel Registro</span>
              </button>
            </div>
          </form>
        )}

        {/* Players List Card Grid */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredPlayers.length === 0 ? (
            <div className="py-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-300">Nessun atleta trovato</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {searchQuery || roleFilter !== 'all'
                  ? 'Nessun risultato corrisponde ai filtri di ricerca applicati.'
                  : 'Nessun atleta presente in questa categoria. Aggiungine uno con il pulsante "+ Nuovo Giocatore" o importa da un file JSON.'}
              </p>
              <button
                onClick={handleOpenNewPlayerForm}
                className="mt-4 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Registra Primo Atleta</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredPlayers.map(player => {
                const isSelected = selectedPlayerIds.has(player.id);
                const catMeta = getCategoryMeta(player.category);
                const isGoalkeeper = player.role === 'Portiere';
                const isCaptain = player.role === 'Capitano';

                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-2xl border transition flex flex-col justify-between gap-2 shadow-sm ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-400/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top row: Checkbox, Number, Name, Role Icon, Category Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleSelectPlayer(player.id)}
                          className="text-slate-400 hover:text-indigo-400 transition flex-shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>

                        {/* Shirt Number Badge */}
                        <div className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center flex-shrink-0 border shadow-sm ${
                          isGoalkeeper
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                            : isCaptain
                            ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                            : 'bg-slate-800 text-white border-slate-700'
                        }`}>
                          #{player.number}
                        </div>

                        {/* Name and club */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-sm text-white truncate">
                              {player.name}
                            </span>
                            {isGoalkeeper && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-md border border-emerald-500/30 flex items-center gap-0.5">
                                <Shield className="w-2.5 h-2.5" /> P
                              </span>
                            )}
                            {isCaptain && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded-md border border-amber-500/30 flex items-center gap-0.5">
                                <Crown className="w-2.5 h-2.5" /> C
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate mt-0.5">
                            {player.clubName && <span className="truncate">{player.clubName}</span>}
                            {player.position && player.position !== 'Giocatore' && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-300">{player.position}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Category Badge & Edit / Delete */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${catMeta.bgColor} ${catMeta.color} ${catMeta.borderColor}`}>
                          {catMeta.shortName}
                        </span>
                        <button
                          onClick={() => handleOpenEditPlayerForm(player)}
                          className="p-1 text-slate-400 hover:text-sky-300 rounded-lg hover:bg-slate-800 transition"
                          title="Modifica dati atleta"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {confirmDeleteId === player.id ? (
                          <div className="flex items-center gap-1 bg-red-950 p-0.5 rounded-lg border border-red-800">
                            <button
                              onClick={() => handleDeletePlayer(player.id, player.name)}
                              className="px-1.5 py-0.5 bg-red-700 text-white font-bold rounded text-[10px]"
                            >
                              Sì
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="p-0.5 text-slate-400 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(player.id)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                            title="Elimina dal registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom row: Details (Birth, Card ID, Notes) and Fast Match Insert Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900/80 flex-wrap">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        {player.birthYear && (
                          <span title="Anno di nascita">Anno {player.birthYear}</span>
                        )}
                        {player.cardId && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span title="Cartellino federale FIGH">{player.cardId}</span>
                          </>
                        )}
                        {player.notes && (
                          <span className="text-slate-400 font-sans italic truncate max-w-[150px]" title={player.notes}>
                            • {player.notes}
                          </span>
                        )}
                      </div>

                      {/* Fast Insert Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleInsertIntoTeam('home', player)}
                          className="py-1 px-2.5 rounded-lg text-[11px] font-bold bg-red-950/70 hover:bg-red-900/90 text-red-200 border border-red-800/80 flex items-center gap-1 transition active:scale-95 shadow-sm"
                          title={`Inserisci ${player.name} nella distinta di ${homeTeamName || 'Casa'}`}
                        >
                          <Plus className="w-3 h-3 text-red-400" />
                          <span>+ Casa</span>
                        </button>
                        <button
                          onClick={() => handleInsertIntoTeam('away', player)}
                          className="py-1 px-2.5 rounded-lg text-[11px] font-bold bg-blue-950/70 hover:bg-blue-900/90 text-blue-200 border border-blue-800/80 flex items-center gap-1 transition active:scale-95 shadow-sm"
                          title={`Inserisci ${player.name} nella distinta di ${awayTeamName || 'Ospiti'}`}
                        >
                          <Plus className="w-3 h-3 text-blue-400" />
                          <span>+ Ospiti</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & Summary */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-400 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <span>Visualizzati <strong>{filteredPlayers.length}</strong> di <strong>{players.length}</strong> atleti</span>
            {selectedCategoryTab !== 'all' && (
              <span className="text-[11px] font-bold text-indigo-400">
                (Filtro: {getCategoryLabel(selectedCategoryTab)})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportJson()}
              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95 shadow-md flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Esporta Tutto in JSON</span>
            </button>
            <button
              onClick={onClose}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
            >
              Chiudi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
