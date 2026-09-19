export type CategoryId = 'serie_b' | 'under_18' | 'under_16' | 'under_14';

export interface CategoryConfig {
  id: CategoryId;
  name: string;
  isU14Format: boolean; // FIGH MHC Format (3 periods x 15m, goal reset, points system)
  totalPeriods: number;
  periodDurationMinutes: number; // Duration of each period
  intervalDurationMinutes: number; // Break between periods
  description: string;
}

export type SanctionType = '2min' | 'yellow' | 'red' | 'blue';

export interface Player {
  id: string;
  number: number;
  name: string;
  role?: 'Portiere' | 'Capitano' | 'Giocatore';
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

  createdAt: number;
  updatedAt: number;
}
