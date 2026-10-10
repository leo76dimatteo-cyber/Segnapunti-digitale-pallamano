import { MatchState, Player, Team, RegistryPlayer, CategoryPlayerGroup } from '../types';
import { SavedRoster } from './storage';
import { getPlayersGroupedByCategory, getCategoryLabel, REGISTRY_CATEGORIES } from './playerRegistry';

export type JsonExportType = 'ROSTER' | 'TEAMS_ARCHIVE' | 'MATCH' | 'FULL_BACKUP' | 'PLAYERS_REGISTRY';

export interface ExportMetadata {
  format: 'FIGH_HANDBALL_DATA';
  version: '1.0';
  exportedAt: string;
  type: JsonExportType;
  appName: 'Handball Scorer FIGH';
}

export interface PlayersRegistryExport extends ExportMetadata {
  type: 'PLAYERS_REGISTRY';
  totalPlayers: number;
  filterCategory?: string;
  categories: CategoryPlayerGroup[];
  byCategory: Record<string, RegistryPlayer[]>;
  players: RegistryPlayer[];
}

export interface SingleRosterExport extends ExportMetadata {
  type: 'ROSTER';
  roster: {
    id: string;
    teamName: string;
    shortName: string;
    color: string;
    players: Player[];
    savedAt?: number;
  };
}

export interface TeamsArchiveExport extends ExportMetadata {
  type: 'TEAMS_ARCHIVE';
  count: number;
  teams: SavedRoster[];
}

export interface MatchExport extends ExportMetadata {
  type: 'MATCH';
  matchInfo: {
    category: string;
    championship: string;
    date: string;
    venue: string;
    homeTeam: string;
    awayTeam: string;
    score: string;
    points?: string;
  };
  matchState: MatchState;
}

export interface FullBackupExport extends ExportMetadata {
  type: 'FULL_BACKUP';
  matchState: MatchState;
  teams: SavedRoster[];
}

/**
 * Triggers a browser download of any serializable object as formatted JSON
 */
export function downloadJsonFile(data: unknown, filename: string): void {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Errore durante il download del file JSON:', err);
    alert('Impossibile scaricare il file JSON');
  }
}

function sanitizeFilename(str: string): string {
  return (str || 'team')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_');
}

function formatDateForFile(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}${mm}${dd}_${hh}${min}`;
}

/**
 * 1. Esporta ROSA singola (singola squadra o rosa in campo)
 */
export function exportSingleRosterJson(
  teamOrRoster: SavedRoster | Team | { name: string; shortName: string; color?: string; players: Player[] }
): void {
  const isTeam = 'players' in teamOrRoster;
  if (!isTeam) return;

  const teamName = 'teamName' in teamOrRoster ? teamOrRoster.teamName : teamOrRoster.name;
  const shortName = teamOrRoster.shortName || teamName.substring(0, 3).toUpperCase();
  const color = teamOrRoster.color || '#2563eb';
  const players = teamOrRoster.players || [];
  const id = 'id' in teamOrRoster && teamOrRoster.id ? teamOrRoster.id : 'roster_' + Date.now();

  const payload: SingleRosterExport = {
    format: 'FIGH_HANDBALL_DATA',
    version: '1.0',
    type: 'ROSTER',
    appName: 'Handball Scorer FIGH',
    exportedAt: new Date().toISOString(),
    roster: {
      id,
      teamName,
      shortName,
      color,
      players,
      savedAt: Date.now(),
    },
  };

  const filename = `rosa_${sanitizeFilename(teamName)}_${formatDateForFile()}.json`;
  downloadJsonFile(payload, filename);
}

/**
 * 2. Esporta Archivio SQUADRE (tutte le formazioni salvate in memoria)
 */
export function exportTeamsArchiveJson(teams: SavedRoster[]): void {
  const payload: TeamsArchiveExport = {
    format: 'FIGH_HANDBALL_DATA',
    version: '1.0',
    type: 'TEAMS_ARCHIVE',
    appName: 'Handball Scorer FIGH',
    exportedAt: new Date().toISOString(),
    count: teams.length,
    teams,
  };

  const filename = `archivio_squadre_figh_${formatDateForFile()}.json`;
  downloadJsonFile(payload, filename);
}

/**
 * 3. Esporta PARTITA (Stato completo gara, referto, eventi, punteggi, sanzioni)
 */
export function exportMatchJson(matchState: MatchState): void {
  const home = matchState.homeTeam.name || 'Casa';
  const away = matchState.awayTeam.name || 'Ospiti';
  const homeScore = matchState.homeTotalGoals;
  const awayScore = matchState.awayTotalGoals;

  const payload: MatchExport = {
    format: 'FIGH_HANDBALL_DATA',
    version: '1.0',
    type: 'MATCH',
    appName: 'Handball Scorer FIGH',
    exportedAt: new Date().toISOString(),
    matchInfo: {
      category: matchState.settings.category,
      championship: matchState.settings.championship || '',
      date: matchState.settings.matchDate || new Date().toISOString().slice(0, 10),
      venue: matchState.settings.venue || '',
      homeTeam: home,
      awayTeam: away,
      score: `${homeScore} - ${awayScore}`,
      points: `${matchState.homeTotalPoints} - ${matchState.awayTotalPoints}`,
    },
    matchState,
  };

  const cleanHome = sanitizeFilename(matchState.homeTeam.shortName || home);
  const cleanAway = sanitizeFilename(matchState.awayTeam.shortName || away);
  const filename = `partita_${cleanHome}_vs_${cleanAway}_${formatDateForFile()}.json`;
  downloadJsonFile(payload, filename);
}

/**
 * 4. Esporta Backup Completo (Partita + Archivio Squadre)
 */
export function exportFullBackupJson(matchState: MatchState, teams: SavedRoster[]): void {
  const payload: FullBackupExport = {
    format: 'FIGH_HANDBALL_DATA',
    version: '1.0',
    type: 'FULL_BACKUP',
    appName: 'Handball Scorer FIGH',
    exportedAt: new Date().toISOString(),
    matchState,
    teams,
  };

  const filename = `backup_completo_figh_${formatDateForFile()}.json`;
  downloadJsonFile(payload, filename);
}

/**
 * 5. Esporta REGISTRO GIOCATORI suddiviso per Categorie
 */
export function exportCategorizedPlayersJson(players: RegistryPlayer[], specificCategory?: string): void {
  const filteredPlayers = specificCategory
    ? players.filter(p => p.category === specificCategory)
    : players;

  const categoriesGroup = getPlayersGroupedByCategory(filteredPlayers);
  const byCategoryMap: Record<string, RegistryPlayer[]> = {};

  categoriesGroup.forEach(group => {
    byCategoryMap[group.categoryId] = group.players;
  });

  const payload: PlayersRegistryExport = {
    format: 'FIGH_HANDBALL_DATA',
    version: '1.0',
    type: 'PLAYERS_REGISTRY',
    appName: 'Handball Scorer FIGH',
    exportedAt: new Date().toISOString(),
    totalPlayers: filteredPlayers.length,
    filterCategory: specificCategory,
    categories: categoriesGroup,
    byCategory: byCategoryMap,
    players: filteredPlayers,
  };

  const catSuffix = specificCategory ? `_${sanitizeFilename(specificCategory)}` : '_tutte_categorie';
  const filename = `registro_giocatori_figh${catSuffix}_${formatDateForFile()}.json`;
  downloadJsonFile(payload, filename);
}

/**
 * 6. Scarica Modello / Template JSON per Anagrafica Giocatori per Categorie
 */
export function downloadPlayersRegistryTemplateJson(): void {
  const templatePayload = {
    format: 'FIGH_HANDBALL_DATA',
    version: '1.0',
    type: 'PLAYERS_REGISTRY',
    appName: 'Handball Scorer FIGH',
    exportedAt: new Date().toISOString(),
    istruzioni: 'Modello JSON per importazione anagrafica atleti suddivisi per categorie. Compila i campi per ciascun atleta.',
    categorieValide: REGISTRY_CATEGORIES.map(c => ({ id: c.id, nome: c.name, descrizione: c.description })),
    byCategory: {
      under_14: [
        {
          id: 'u14_modello_1',
          number: 1,
          name: 'Nome Portiere U14',
          category: 'under_14',
          role: 'Portiere',
          position: 'Portiere',
          clubName: 'Società Sportiva Esempio',
          birthYear: 2012,
          cardId: 'FIGH-000001',
          notes: 'Esempio atleta U14',
        },
        {
          id: 'u14_modello_2',
          number: 7,
          name: 'Nome Capitano U14',
          category: 'under_14',
          role: 'Capitano',
          position: 'Centrale',
          clubName: 'Società Sportiva Esempio',
          birthYear: 2012,
          cardId: 'FIGH-000002',
          notes: 'Regista',
        }
      ],
      under_16: [
        {
          id: 'u16_modello_1',
          number: 12,
          name: 'Nome Portiere U16',
          category: 'under_16',
          role: 'Portiere',
          position: 'Portiere',
          clubName: 'Società Sportiva Esempio',
          birthYear: 2010,
          cardId: 'FIGH-000003',
          notes: 'Esempio atleta U16',
        }
      ],
      serie_b: [
        {
          id: 'sb_modello_1',
          number: 5,
          name: 'Nome Atleta Senior',
          category: 'serie_b',
          role: 'Giocatore',
          position: 'Terzino',
          clubName: 'Società Sportiva Esempio',
          birthYear: 2000,
          cardId: 'FIGH-000004',
          notes: 'Esempio Serie B',
        }
      ]
    },
    players: [
      {
        id: 'u14_modello_1',
        number: 1,
        name: 'Nome Portiere U14',
        category: 'under_14',
        role: 'Portiere',
        position: 'Portiere',
        clubName: 'Società Sportiva Esempio',
        birthYear: 2012,
        cardId: 'FIGH-000001',
        notes: 'Esempio atleta U14',
      },
      {
        id: 'u14_modello_2',
        number: 7,
        name: 'Nome Capitano U14',
        category: 'under_14',
        role: 'Capitano',
        position: 'Centrale',
        clubName: 'Società Sportiva Esempio',
        birthYear: 2012,
        cardId: 'FIGH-000002',
        notes: 'Regista',
      },
      {
        id: 'u16_modello_1',
        number: 12,
        name: 'Nome Portiere U16',
        category: 'under_16',
        role: 'Portiere',
        position: 'Portiere',
        clubName: 'Società Sportiva Esempio',
        birthYear: 2010,
        cardId: 'FIGH-000003',
        notes: 'Esempio atleta U16',
      },
      {
        id: 'sb_modello_1',
        number: 5,
        name: 'Nome Atleta Senior',
        category: 'serie_b',
        role: 'Giocatore',
        position: 'Terzino',
        clubName: 'Società Sportiva Esempio',
        birthYear: 2000,
        cardId: 'FIGH-000004',
        notes: 'Esempio Serie B',
      }
    ]
  };

  downloadJsonFile(templatePayload, 'modello_registro_giocatori_per_categorie.json');
}

export type ParseImportResult =
  | { type: 'ROSTER'; roster: SavedRoster }
  | { type: 'TEAMS_ARCHIVE'; teams: SavedRoster[] }
  | { type: 'MATCH'; matchState: MatchState }
  | { type: 'FULL_BACKUP'; matchState: MatchState; teams: SavedRoster[] }
  | { type: 'PLAYERS_REGISTRY'; players: RegistryPlayer[]; categories: CategoryPlayerGroup[] }
  | { type: 'INVALID'; error: string };

/**
 * Parse and validate any imported JSON text
 */
export function parseImportedJson(jsonText: string): ParseImportResult {
  try {
    const data = JSON.parse(jsonText);
    if (!data || typeof data !== 'object') {
      return { type: 'INVALID', error: 'Il file JSON non contiene un oggetto valido.' };
    }

    // 1. Check tagged formats
    if (data.type === 'PLAYERS_REGISTRY') {
      let rawList: any[] = [];
      if (Array.isArray(data.players)) {
        rawList = data.players;
      } else if (data.byCategory && typeof data.byCategory === 'object') {
        Object.values(data.byCategory).forEach((arr: any) => {
          if (Array.isArray(arr)) rawList.push(...arr);
        });
      } else if (Array.isArray(data.categories)) {
        data.categories.forEach((catGroup: any) => {
          if (Array.isArray(catGroup.players)) rawList.push(...catGroup.players);
        });
      }

      const validPlayers: RegistryPlayer[] = rawList
        .filter((p: any) => p && p.name && (typeof p.number === 'number' || !isNaN(Number(p.number))))
        .map((p: any) => {
          const num = Number(p.number) || 0;
          const cat = p.category || 'under_14';
          return {
            id: p.id || 'reg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            number: num,
            name: String(p.name).trim(),
            category: cat,
            categoryName: p.categoryName || getCategoryLabel(cat),
            role: p.role || 'Giocatore',
            position: p.position || 'Giocatore',
            clubName: p.clubName || '',
            birthYear: p.birthYear ? Number(p.birthYear) : undefined,
            cardId: p.cardId || '',
            notes: p.notes || '',
            savedAt: p.savedAt || Date.now(),
          };
        });

      if (validPlayers.length === 0) {
        return { type: 'INVALID', error: 'Nessun giocatore valido trovato nel file del registro.' };
      }

      return {
        type: 'PLAYERS_REGISTRY',
        players: validPlayers,
        categories: getPlayersGroupedByCategory(validPlayers),
      };
    }

    if (data.type === 'ROSTER' && data.roster && data.roster.teamName) {
      const r = data.roster;
      return {
        type: 'ROSTER',
        roster: {
          id: r.id || 'roster_' + Date.now(),
          teamName: r.teamName,
          shortName: r.shortName || r.teamName.slice(0, 3).toUpperCase(),
          color: r.color || '#2563eb',
          players: Array.isArray(r.players) ? r.players : [],
          savedAt: r.savedAt || Date.now(),
        },
      };
    }

    if (data.type === 'TEAMS_ARCHIVE' && Array.isArray(data.teams)) {
      const validTeams: SavedRoster[] = data.teams
        .filter((t: any) => t && (t.teamName || t.name))
        .map((t: any) => ({
          id: t.id || 'roster_' + Math.random().toString(36).slice(2, 9),
          teamName: t.teamName || t.name,
          shortName: t.shortName || (t.teamName || t.name).slice(0, 3).toUpperCase(),
          color: t.color || '#2563eb',
          players: Array.isArray(t.players) ? t.players : [],
          savedAt: t.savedAt || Date.now(),
        }));
      return { type: 'TEAMS_ARCHIVE', teams: validTeams };
    }

    if (data.type === 'MATCH' && data.matchState && data.matchState.homeTeam && data.matchState.settings) {
      return { type: 'MATCH', matchState: data.matchState };
    }

    if (data.type === 'FULL_BACKUP' && data.matchState && Array.isArray(data.teams)) {
      return { type: 'FULL_BACKUP', matchState: data.matchState, teams: data.teams };
    }

    // 2. Check if it's an object with byCategory (e.g. { under_14: [...], under_16: [...] })
    if (data.byCategory && typeof data.byCategory === 'object') {
      const rawList: any[] = [];
      Object.entries(data.byCategory).forEach(([catId, arr]: [string, any]) => {
        if (Array.isArray(arr)) {
          arr.forEach(item => {
            if (item && item.name) {
              rawList.push({ ...item, category: item.category || catId });
            }
          });
        }
      });
      if (rawList.length > 0) {
        const validPlayers: RegistryPlayer[] = rawList.map((p: any) => ({
          id: p.id || 'reg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          number: Number(p.number) || 0,
          name: String(p.name).trim(),
          category: p.category || 'under_14',
          categoryName: getCategoryLabel(p.category || 'under_14'),
          role: p.role || 'Giocatore',
          position: p.position || 'Giocatore',
          clubName: p.clubName || '',
          birthYear: p.birthYear ? Number(p.birthYear) : undefined,
          cardId: p.cardId || '',
          notes: p.notes || '',
          savedAt: Date.now(),
        }));
        return {
          type: 'PLAYERS_REGISTRY',
          players: validPlayers,
          categories: getPlayersGroupedByCategory(validPlayers),
        };
      }
    }

    // 3. Fallbacks for untagged or standard exports
    // Check if it's a MatchState object directly
    if (data.homeTeam && data.awayTeam && data.settings && typeof data.periodSecondsRemaining === 'number') {
      return { type: 'MATCH', matchState: data as MatchState };
    }

    // Check if it's an array of players with category
    if (Array.isArray(data)) {
      const isPlayerList = data.every(item => item && item.name && typeof item.number !== 'undefined');
      if (isPlayerList && data.length > 0) {
        const validPlayers: RegistryPlayer[] = data.map((p: any) => ({
          id: p.id || 'reg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          number: Number(p.number) || 0,
          name: String(p.name).trim(),
          category: p.category || 'under_14',
          categoryName: getCategoryLabel(p.category || 'under_14'),
          role: p.role || 'Giocatore',
          position: p.position || 'Giocatore',
          clubName: p.clubName || '',
          birthYear: p.birthYear ? Number(p.birthYear) : undefined,
          cardId: p.cardId || '',
          notes: p.notes || '',
          savedAt: Date.now(),
        }));
        return {
          type: 'PLAYERS_REGISTRY',
          players: validPlayers,
          categories: getPlayersGroupedByCategory(validPlayers),
        };
      }

      // Check if it's an array of teams
      const isTeamList = data.every(item => item && (item.teamName || item.name) && Array.isArray(item.players));
      if (isTeamList && data.length > 0) {
        const teams: SavedRoster[] = data.map((t: any) => ({
          id: t.id || 'roster_' + Math.random().toString(36).slice(2, 9),
          teamName: t.teamName || t.name,
          shortName: t.shortName || (t.teamName || t.name).slice(0, 3).toUpperCase(),
          color: t.color || '#2563eb',
          players: t.players,
          savedAt: t.savedAt || Date.now(),
        }));
        return { type: 'TEAMS_ARCHIVE', teams };
      }
    }

    // Check if it's a single team roster
    if ((data.teamName || data.name) && Array.isArray(data.players)) {
      const name = data.teamName || data.name;
      return {
        type: 'ROSTER',
        roster: {
          id: data.id || 'roster_' + Date.now(),
          teamName: name,
          shortName: data.shortName || name.slice(0, 3).toUpperCase(),
          color: data.color || '#2563eb',
          players: data.players,
          savedAt: Date.now(),
        },
      };
    }

    return {
      type: 'INVALID',
      error: 'Formato JSON non riconosciuto. Assicurati che sia un Registro Giocatori per Categorie, una Rosa, o una Partita esportata da questa app.',
    };
  } catch (err: any) {
    return { type: 'INVALID', error: `Errore nella lettura del file: ${err.message || 'JSON non valido'}` };
  }
}
