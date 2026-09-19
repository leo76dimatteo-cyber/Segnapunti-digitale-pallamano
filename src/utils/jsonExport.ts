import { MatchState, Player, Team } from '../types';
import { SavedRoster } from './storage';

export type JsonExportType = 'ROSTER' | 'TEAMS_ARCHIVE' | 'MATCH' | 'FULL_BACKUP';

export interface ExportMetadata {
  format: 'FIGH_HANDBALL_DATA';
  version: '1.0';
  exportedAt: string;
  type: JsonExportType;
  appName: 'Handball Scorer FIGH';
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

export type ParseImportResult =
  | { type: 'ROSTER'; roster: SavedRoster }
  | { type: 'TEAMS_ARCHIVE'; teams: SavedRoster[] }
  | { type: 'MATCH'; matchState: MatchState }
  | { type: 'FULL_BACKUP'; matchState: MatchState; teams: SavedRoster[] }
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

    // 2. Fallbacks for untagged or standard exports
    // Check if it's a MatchState object directly
    if (data.homeTeam && data.awayTeam && data.settings && typeof data.periodSecondsRemaining === 'number') {
      return { type: 'MATCH', matchState: data as MatchState };
    }

    // Check if it's an array of teams
    if (Array.isArray(data)) {
      const valid = data.every(item => item && (item.teamName || item.name) && Array.isArray(item.players));
      if (valid && data.length > 0) {
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
      error: 'Formato JSON non riconosciuto. Assicurati che sia una Rosa, un Archivio Squadre o una Partita esportata da questa app.',
    };
  } catch (err: any) {
    return { type: 'INVALID', error: `Errore nella lettura del file: ${err.message || 'JSON non valido'}` };
  }
}
