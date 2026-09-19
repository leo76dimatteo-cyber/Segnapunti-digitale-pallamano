import { MatchState, MatchSettings, Team, Player, CategoryId } from '../types';
import { CATEGORIES } from './categories';

const MATCH_STATE_KEY = 'figh_handball_match_state_v1';
const SAVED_ROSTERS_KEY = 'figh_handball_saved_rosters_v1';

export const SAMPLE_HOME_PLAYERS: Player[] = [];
export const SAMPLE_AWAY_PLAYERS: Player[] = [];

export function getDefaultMatchSettings(category: CategoryId = 'under_14'): MatchSettings {
  const cat = CATEGORIES[category] || CATEGORIES.under_14;
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const timeStr = today.toTimeString().slice(0, 5);

  return {
    category,
    periodDurationMinutes: cat.periodDurationMinutes,
    intervalDurationMinutes: cat.intervalDurationMinutes,
    totalPeriods: cat.totalPeriods,
    soundEnabled: true,
    vibrateEnabled: true,
    autoSwitchPeriod: false,
    referee1: 'M. Rossi (CRA)',
    referee2: 'L. Bianchi (CRA)',
    timekeeper: 'A. Verdi',
    scorekeeper: 'G. Neri',
    venue: 'Palasport Comunale',
    matchDate: dateStr,
    matchTime: timeStr,
    matchNumber: 'G-2026/042',
    championship: 'Campionato Regionale FIGH',
  };
}

export function createInitialMatchState(category: CategoryId = 'under_14'): MatchState {
  const settings = getDefaultMatchSettings(category);
  const now = Date.now();

  const homeTeam: Team = {
    id: 'home',
    name: 'Squadra Casa',
    shortName: 'CAS',
    color: '#dc2626', // Red
    textColor: '#ffffff',
    players: [],
    timeoutsTaken: [],
  };

  const awayTeam: Team = {
    id: 'away',
    name: 'Squadra Ospiti',
    shortName: 'OSP',
    color: '#2563eb', // Blue
    textColor: '#ffffff',
    players: [],
    timeoutsTaken: [],
  };

  return {
    id: 'match_' + now,
    settings,
    homeTeam,
    awayTeam,
    currentPeriod: 1,
    isInterval: false,
    isMatchOver: false,
    periodSecondsRemaining: settings.periodDurationMinutes * 60,
    intervalSecondsRemaining: settings.intervalDurationMinutes * 60,
    isTimerRunning: false,
    homePeriodGoals: 0,
    awayPeriodGoals: 0,
    periodResults: [],
    homeTotalPoints: 0,
    awayTotalPoints: 0,
    homeTotalGoals: 0,
    awayTotalGoals: 0,
    activeSuspensions: [],
    goals: [],
    sanctions: [],
    activeTimeout: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function loadMatchState(): MatchState {
  if (typeof window === 'undefined') return createInitialMatchState();
  try {
    const raw = localStorage.getItem(MATCH_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MatchState;
      // Basic sanity checks
      if (parsed.settings && parsed.homeTeam && parsed.awayTeam) {
        let modified = false;

        // Purge demo home team players and name
        const isSampleHome = parsed.homeTeam.players.some(p =>
          p.id.startsWith('h') || p.name === 'Marco Vianello' || p.name === 'Federico Rossi' || p.name === 'Andrea Botti (C)'
        );
        if (isSampleHome) {
          parsed.homeTeam.players = [];
          modified = true;
        }
        if (parsed.homeTeam.name === 'Pallamano Rubiera') {
          parsed.homeTeam.name = 'Squadra Casa';
          parsed.homeTeam.shortName = 'CAS';
          modified = true;
        }

        // Purge demo away team players and name
        const isSampleAway = parsed.awayTeam.players.some(p =>
          p.id.startsWith('a') || p.name === 'Christian Oberrauch' || p.name === 'Simone Mengon (C)' || p.name === 'Lukas Pichler'
        );
        if (isSampleAway) {
          parsed.awayTeam.players = [];
          modified = true;
        }
        if (parsed.awayTeam.name === 'Cassano Magnago') {
          parsed.awayTeam.name = 'Squadra Ospiti';
          parsed.awayTeam.shortName = 'OSP';
          modified = true;
        }

        // Clean any sanctions or goals that were referencing sample players
        if (isSampleHome || isSampleAway) {
          parsed.goals = parsed.goals.filter(g => !g.playerId || (!g.playerId.startsWith('h') && !g.playerId.startsWith('a')));
          parsed.sanctions = parsed.sanctions.filter(s => !s.playerId.startsWith('h') && !s.playerId.startsWith('a'));
          parsed.activeSuspensions = parsed.activeSuspensions.filter(s => !s.playerId.startsWith('h') && !s.playerId.startsWith('a'));
          modified = true;
        }

        if (modified) {
          saveMatchState(parsed);
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load match state from localStorage', e);
  }
  return createInitialMatchState();
}

export function saveMatchState(state: MatchState): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = { ...state, updatedAt: Date.now() };
    localStorage.setItem(MATCH_STATE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save match state to localStorage', e);
  }
}

export function clearMatchState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(MATCH_STATE_KEY);
  } catch (e) {
    console.error('Failed to clear match state', e);
  }
}

export interface SavedRoster {
  id: string;
  teamName: string;
  shortName: string;
  color: string;
  players: Player[];
  category?: string;
  savedAt: number;
}

export function loadSavedRosters(): SavedRoster[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_ROSTERS_KEY);
    if (raw) {
      const list: SavedRoster[] = JSON.parse(raw);
      // Clean up any sample presets from previous versions
      const cleaned = list.filter(r => 
        !r.id.startsWith('preset_') &&
        r.teamName !== 'Pallamano Rubiera' &&
        r.teamName !== 'Cassano Magnago' &&
        r.teamName !== 'Accademia Conversano' &&
        r.teamName !== 'SSV Brixen Handball'
      );
      if (cleaned.length !== list.length) {
        localStorage.setItem(SAVED_ROSTERS_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch (e) {
    console.error('Failed to load saved rosters', e);
  }
  return [];
}

export function saveRoster(roster: SavedRoster): void {
  if (typeof window === 'undefined') return;
  try {
    const list = loadSavedRosters();
    const existingIdx = list.findIndex(r => r.id === roster.id || r.teamName.toLowerCase() === roster.teamName.toLowerCase());
    if (existingIdx >= 0) {
      list[existingIdx] = roster;
    } else {
      list.unshift(roster);
    }
    localStorage.setItem(SAVED_ROSTERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save roster to localStorage', e);
  }
}

export function deleteSavedRoster(rosterId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = loadSavedRosters();
    const updated = list.filter(r => r.id !== rosterId);
    localStorage.setItem(SAVED_ROSTERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete roster from localStorage', e);
  }
}

export function clearAllSavedRosters(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SAVED_ROSTERS_KEY);
  } catch (e) {
    console.error('Failed to clear saved rosters from localStorage', e);
  }
}

export function importSavedRosters(incomingTeams: SavedRoster[], replace = false): void {
  if (typeof window === 'undefined') return;
  try {
    if (replace) {
      localStorage.setItem(SAVED_ROSTERS_KEY, JSON.stringify(incomingTeams));
      return;
    }
    const current = loadSavedRosters();
    const map = new Map<string, SavedRoster>();
    current.forEach(t => map.set(t.teamName.toLowerCase(), t));
    incomingTeams.forEach(t => map.set(t.teamName.toLowerCase(), t));
    const merged = Array.from(map.values());
    localStorage.setItem(SAVED_ROSTERS_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to import saved rosters to localStorage', e);
  }
}

