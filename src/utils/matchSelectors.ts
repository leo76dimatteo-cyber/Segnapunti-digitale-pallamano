import { MatchState, GoalkeeperStat, SevenMeterEvent, GoalEvent } from '../types';

export interface SevenMeterTeamStats {
  attempted: number;
  scored: number;
  saved: number;
  missed: number;
  post: number;
  efficiencyPct: string;
}

export interface MatchSevenMeterSummary {
  home: SevenMeterTeamStats;
  away: SevenMeterTeamStats;
}

export interface DerivedGoalkeeperStat extends GoalkeeperStat {
  totalShots: number;
  efficiencyPct: string;
  isCurrentInGoal: boolean;
}

export interface TeamGoalkeeperSummary {
  team: 'home' | 'away';
  teamName: string;
  goalkeepers: DerivedGoalkeeperStat[];
  emptyNetGoalsConceded: number;
  totalTeamConceded: number;
  opponentTotalGoals: number;
  isConsistent: boolean;
  totalTeamSaves: number;
  totalTeamPenaltySaves: number;
  teamEfficiencyPct: string;
}

/**
 * Calcola le statistiche dei 7 metri (rigori) per entrambe le squadre.
 * La squadra associata all'evento è quella che effettua il tiro.
 */
export function computeSevenMeterStats(matchState: MatchState): MatchSevenMeterSummary {
  const events = matchState.sevenMeterEvents || [];

  const calcForTeam = (team: 'home' | 'away'): SevenMeterTeamStats => {
    const teamEvents = events.filter(e => e.team === team);
    const attempted = teamEvents.length;
    const scored = teamEvents.filter(e => e.outcome === 'goal').length;
    const saved = teamEvents.filter(e => e.outcome === 'saved').length;
    const missed = teamEvents.filter(e => e.outcome === 'missed').length;
    const post = teamEvents.filter(e => e.outcome === 'post').length;
    const efficiencyPct = attempted > 0 ? ((scored / attempted) * 100).toFixed(1) : '0.0';

    return {
      attempted,
      scored,
      saved,
      missed,
      post,
      efficiencyPct,
    };
  };

  return {
    home: calcForTeam('home'),
    away: calcForTeam('away'),
  };
}

/**
 * Calcola in modo puramente derivato le statistiche dei portieri basandosi sui GoalEvent e SevenMeterEvent.
 * Invariante federale garantita:
 * somma(goalsConceded) + emptyNetGoalsConceded = gol totali segnati dalla squadra avversaria.
 */
export function computeGoalkeeperStats(matchState: MatchState): {
  home: TeamGoalkeeperSummary;
  away: TeamGoalkeeperSummary;
  allStats: DerivedGoalkeeperStat[];
} {
  const sevenMeterSummary = matchState.sevenMeterEvents || [];
  const existingStats = matchState.goalkeeperStats || [];

  const computeForTeam = (teamType: 'home' | 'away'): TeamGoalkeeperSummary => {
    const teamObj = teamType === 'home' ? matchState.homeTeam : matchState.awayTeam;
    const opponentType = teamType === 'home' ? 'away' : 'home';
    const opponentGoals = matchState.goals.filter(g => g.team === opponentType);
    const activeGkId = matchState.activeGoalkeepers?.[teamType];

    // Portieri identificati: ruolo 'Portiere', o già tracciati, o attualmente attivi
    const gkPlayerIds = new Set<string>();
    teamObj.players.forEach(p => {
      if (p.role === 'Portiere') gkPlayerIds.add(p.id);
    });
    existingStats.filter(s => s.team === teamType).forEach(s => gkPlayerIds.add(s.playerId));
    if (activeGkId) gkPlayerIds.add(activeGkId);

    // Se non ci sono portieri ma ci sono gol subiti attribuiti a qualcuno
    opponentGoals.forEach(g => {
      if (g.concededByGoalkeeperId) {
        gkPlayerIds.add(g.concededByGoalkeeperId);
      }
    });

    const goalkeepers: DerivedGoalkeeperStat[] = [];
    let assignedGoalsConcededTotal = 0;

    gkPlayerIds.forEach(playerId => {
      const playerObj = teamObj.players.find(p => p.id === playerId);
      const existing = existingStats.find(s => s.team === teamType && s.playerId === playerId);

      // 1. Gol subiti: derivati rigorosamente dai GoalEvent dell'avversario
      const goalsConceded = opponentGoals.filter(g => g.concededByGoalkeeperId === playerId).length;
      assignedGoalsConcededTotal += goalsConceded;

      // 2. Parate 7m: derivate dai SevenMeterEvent subiti da questo portiere con esito 'saved' + eventuale legacy
      const penaltySavesFromEvents = sevenMeterSummary.filter(
        e => e.team === opponentType && e.goalkeeperId === playerId && e.outcome === 'saved'
      ).length;
      const legacyPenalties = existing?.penaltySaves ?? 0;
      // Se non ci sono eventi 7m ma esiste un dato storico legacy salvato
      const penaltySaves = Math.max(penaltySavesFromEvents, (sevenMeterSummary.length === 0 ? legacyPenalties : penaltySavesFromEvents));

      // 3. Parate totali: le parate manuali salvate (saves) o almeno pari alle parate 7m
      const baseSaves = existing?.saves ?? 0;
      const saves = Math.max(baseSaves, penaltySaves);

      // 4. Gol segnati dal portiere: derivati dai GoalEvent segnati da lui
      const goalsScored = matchState.goals.filter(g => g.team === teamType && g.playerId === playerId).length;

      const totalShots = saves + goalsConceded;
      const efficiencyPct = totalShots > 0 ? ((saves / totalShots) * 100).toFixed(1) : '0.0';

      goalkeepers.push({
        playerId,
        playerNumber: playerObj?.number ?? (existing?.playerNumber || 0),
        playerName: playerObj?.name ?? (existing?.playerName || 'Portiere'),
        team: teamType,
        saves,
        penaltySaves,
        goalsConceded,
        goalsScored,
        totalShots,
        efficiencyPct,
        isCurrentInGoal: playerId === activeGkId,
      });
    });

    // Ordina: prima chi è in porta, poi per numero maglia
    goalkeepers.sort((a, b) => {
      if (a.isCurrentInGoal && !b.isCurrentInGoal) return -1;
      if (!a.isCurrentInGoal && b.isCurrentInGoal) return 1;
      return a.playerNumber - b.playerNumber;
    });

    // Gol subiti a porta vuota (o senza portiere assegnato)
    const emptyNetGoalsConceded = opponentGoals.filter(
      g => g.concededByGoalkeeperId === null || g.concededByGoalkeeperId === undefined || !gkPlayerIds.has(g.concededByGoalkeeperId)
    ).length;

    const totalTeamConceded = assignedGoalsConcededTotal + emptyNetGoalsConceded;
    const opponentTotalGoals = opponentGoals.length;
    const isConsistent = totalTeamConceded === opponentTotalGoals;

    const totalTeamSaves = goalkeepers.reduce((sum, g) => sum + g.saves, 0);
    const totalTeamPenaltySaves = goalkeepers.reduce((sum, g) => sum + (g.penaltySaves || 0), 0);
    const teamTotalShots = totalTeamSaves + totalTeamConceded;
    const teamEfficiencyPct = teamTotalShots > 0 ? ((totalTeamSaves / teamTotalShots) * 100).toFixed(1) : '0.0';

    return {
      team: teamType,
      teamName: teamObj.name,
      goalkeepers,
      emptyNetGoalsConceded,
      totalTeamConceded,
      opponentTotalGoals,
      isConsistent,
      totalTeamSaves,
      totalTeamPenaltySaves,
      teamEfficiencyPct,
    };
  };

  const home = computeForTeam('home');
  const away = computeForTeam('away');

  return {
    home,
    away,
    allStats: [...home.goalkeepers, ...away.goalkeepers],
  };
}

/**
 * Funzione di migrazione e riconciliazione automatica per garantire che tutti i GoalEvent
 * abbiano concededByGoalkeeperId coerente e che non vi siano discrepanze tra gol subiti e punteggio.
 */
export function reconcileMatchState(state: MatchState): MatchState {
  let needsUpdate = false;
  const newGoals: GoalEvent[] = [];

  // Assicura array 7m
  const sevenMeterEvents = Array.isArray(state.sevenMeterEvents) ? [...state.sevenMeterEvents] : [];
  if (!state.sevenMeterEvents) needsUpdate = true;

  // Portieri attivi di partenza
  let activeHomeGk = state.activeGoalkeepers?.home;
  let activeAwayGk = state.activeGoalkeepers?.away;

  if (!activeHomeGk) {
    const firstHomeGk = state.homeTeam.players.find(p => p.role === 'Portiere');
    if (firstHomeGk) {
      activeHomeGk = firstHomeGk.id;
      needsUpdate = true;
    }
  }

  if (!activeAwayGk) {
    const firstAwayGk = state.awayTeam.players.find(p => p.role === 'Portiere');
    if (firstAwayGk) {
      activeAwayGk = firstAwayGk.id;
      needsUpdate = true;
    }
  }

  for (const goal of state.goals) {
    if (goal.concededByGoalkeeperId === undefined) {
      needsUpdate = true;
      const opponentTeam = goal.team === 'home' ? 'away' : 'home';
      const targetGkId = opponentTeam === 'home' ? activeHomeGk : activeAwayGk;
      newGoals.push({
        ...goal,
        concededByGoalkeeperId: targetGkId || null,
      });
    } else {
      newGoals.push(goal);
    }
  }

  if (!needsUpdate) return state;

  return {
    ...state,
    goals: newGoals,
    sevenMeterEvents,
    activeGoalkeepers: {
      home: activeHomeGk || null,
      away: activeAwayGk || null,
    },
  };
}
