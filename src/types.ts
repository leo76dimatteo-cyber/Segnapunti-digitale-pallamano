export type CategoryId = 'serie_b' | 'under_18' | 'under_16' | 'under_14' | 'under_14_naz';

export interface CategoryConfig {
  id: CategoryId;
  name: string;
  isU14Format: boolean; // FIGH Circolare 47 (3 tempi da 20m Regionale / 15m Nazionali, 5 min recupero, azzeramento reti, punti a tempo)
  totalPeriods: number;
  periodDurationMinutes: number; // Duration of each period (e.g. 20 min for U14 Regionale, 5 min recupero)
  intervalDurationMinutes: number; // Break/recovery between periods (5 min for U14)
  description: string;
}

export type SanctionType = '2min' | 'yellow' | 'red' | 'blue';

export interface Player {
  id: string;
  number: number;
  name: string;
  role?: 'Portiere' | 'Capitano' | 'Giocatore';
  category?: string;
  clubName?: string;
  birthYear?: number;
  cardId?: string; // Cartellino FIGH
  position?: string;
}

export interface RegistryPlayer extends Player {
  category: string; // e.g. 'under_14' | 'under_16' | 'under_18' | 'serie_b' | 'serie_a' | 'master' | string
  categoryName?: string;
  clubName?: string;
  birthYear?: number;
  cardId?: string;
  position?: string;
  notes?: string;
  savedAt: number;
}

export interface CategoryPlayerGroup {
  categoryId: string;
  categoryName: string;
  count: number;
  players: RegistryPlayer[];
}

export interface Team {
  id: 'home' | 'away';
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  players: Player[];
  timeoutsTaken: number[]; // Minute of timeout taken
}

export interface GoalEvent {
  id: string;
  team: 'home' | 'away';
  period: number; // 1, 2 or 3
  minute: number; // Minute in match or period
  second: number;
  playerId?: string;
  playerNumber?: number;
  playerName?: string;
  timestamp: number;
  homePeriodScore: number;
  awayPeriodScore: number;
  homeTotalGoals: number;
  awayTotalGoals: number;
}

export interface SanctionEvent {
  id: string;
  team: 'home' | 'away';
  period: number;
  minute: number;
  second: number;
  playerId: string;
  playerNumber: number;
  playerName: string;
  type: SanctionType;
  timestamp: number;
  note?: string;
}

export interface ActiveSuspension {
  id: string;
  sanctionId: string;
  team: 'home' | 'away';
  playerId: string;
  playerNumber: number;
  playerName: string;
  startedAtMatchSeconds: number; // Match seconds when started
  durationSeconds: number; // usually 120
  remainingSeconds: number;
  period: number;
}

export interface PeriodResult {
  period: number;
  homeGoals: number;
  awayGoals: number;
  homePoints: number; // 1.0 (win), 0.5 (draw), 0.0 (loss)
  awayPoints: number;
  isClosed: boolean;
  endedAtTimestamp?: number;
}

export interface MatchSettings {
  category: CategoryId;
  periodDurationMinutes: number;
  intervalDurationMinutes: number;
  totalPeriods: number;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  autoSwitchPeriod: boolean;
  referee1: string;
  referee2: string;
  timekeeper: string;
  scorekeeper: string;
  venue: string;
  matchDate: string;
  matchTime: string;
  matchNumber: string;
  championship: string;
}

export interface MatchState {
  id: string;
  settings: MatchSettings;
  homeTeam: Team;
  awayTeam: Team;
  currentPeriod: number; // 1, 2, 3...
  isInterval: boolean;
  isMatchOver: boolean;
  periodSecondsRemaining: number;
  intervalSecondsRemaining: number;
  isTimerRunning: boolean;
  
  // Current live period goals
  homePeriodGoals: number;
  awayPeriodGoals: number;

  // Closed periods history (Crucial for U14 FIGH 3-period system)
  periodResults: PeriodResult[];

  // Cumulative match points (For U14 format: sum of period points, e.g., 2.5 - 0.5)
  homeTotalPoints: number;
  awayTotalPoints: number;

  // Cumulative match goals (Statistical for U14, Official for Classic)
  homeTotalGoals: number;
  awayTotalGoals: number;

  // Active 2-minute penalties ticking down
  activeSuspensions: ActiveSuspension[];

  // Event Logs
  goals: GoalEvent[];
  sanctions: SanctionEvent[];

  // Timeouts active
  activeTimeout: {
    team: 'home' | 'away';
    secondsRemaining: number;
    isRunning: boolean;
  } | null;

  // Dedicated Goalkeeper Statistics (Gol Parati, Gol Subiti, Gol Fatti, Rigori 7m)
  goalkeeperStats?: GoalkeeperStat[];
  activeGoalkeepers?: {
    home?: string | null;
    away?: string | null;
  };
  emptyNet?: {
    home?: boolean;
    away?: boolean;
  };

  createdAt: number;
  updatedAt: number;
}

export interface GoalkeeperStat {
  playerId: string;
  playerNumber: number;
  playerName: string;
  team: 'home' | 'away';
  saves: number;         // Gol parati totali
  penaltySaves?: number; // Rigori 7m parati
  goalsConceded: number; // Gol subiti
  goalsScored: number;   // Gol fatti (es. porta a porta / porta vuota)
}

