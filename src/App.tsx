import React, { useState, useEffect, useRef } from 'react';
import { 
  MatchState, 
  MatchSettings, 
  CategoryId, 
  Team, 
  Player, 
  SanctionType, 
  GoalEvent, 
  SanctionEvent,
  ActiveSuspension,
  PeriodResult
} from './types';
import { CATEGORIES, calculatePeriodPoints } from './utils/categories';
import { 
  loadMatchState, 
  saveMatchState, 
  clearMatchState, 
  createInitialMatchState,
  SavedRoster 
} from './utils/storage';
import { sound } from './utils/sound';
import { useWakeLock } from './hooks/useWakeLock';
import { Header } from './components/Header';
import { Scoreboard } from './components/Scoreboard';
import { SuspensionsBar } from './components/SuspensionsBar';
import { U14PeriodBreakdown } from './components/U14PeriodBreakdown';
import { TeamRosterPanel } from './components/TeamRosterPanel';
import { MatchLog } from './components/MatchLog';
import { DisciplinaryModal } from './components/DisciplinaryModal';
import { GoalAssignModal } from './components/GoalAssignModal';
import { OfficialReportModal } from './components/OfficialReportModal';
import { SettingsModal } from './components/SettingsModal';
import { RosterManagerModal } from './components/RosterManagerModal';
import { JsonDataManagerModal } from './components/JsonDataManagerModal';
import { TimeoutModal } from './components/TimeoutModal';
import confetti from 'canvas-confetti';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [matchState, setMatchState] = useState<MatchState>(() => loadMatchState());

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRosterManagerOpen, setIsRosterManagerOpen] = useState(false);
  const [isJsonDataModalOpen, setIsJsonDataModalOpen] = useState(false);
  const [disciplinaryModalData, setDisciplinaryModalData] = useState<{
    isOpen: boolean;
    team: 'home' | 'away';
    player?: Player | null;
  }>({ isOpen: false, team: 'home', player: null });
  const [goalAssignModalData, setGoalAssignModalData] = useState<{
    isOpen: boolean;
    team: 'home' | 'away';
  }>({ isOpen: false, team: 'home' });

  // Confirmation alerts
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Fullscreen & WakeLock
  const { isLocked: isWakeLocked, toggleLock: toggleWakeLock } = useWakeLock();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ref for timer interval
  const timerIntervalRef = useRef<number | null>(null);

  // Auto-save matchState to localStorage on every change
  useEffect(() => {
    saveMatchState(matchState);
  }, [matchState]);

  // Handle Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Timer Tick Engine
  useEffect(() => {
    if (matchState.isTimerRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setMatchState(prev => {
          if (!prev.isTimerRunning) return prev;

          // If interval is running
          if (prev.isInterval) {
            if (prev.intervalSecondsRemaining <= 1) {
              if (prev.settings.soundEnabled) sound.playBuzzer();
              return {
                ...prev,
                isInterval: false,
                intervalSecondsRemaining: 0,
                isTimerRunning: false,
              };
            }
            return {
              ...prev,
              intervalSecondsRemaining: prev.intervalSecondsRemaining - 1,
            };
          }

          // If match period is running
          const newPeriodSeconds = prev.periodSecondsRemaining - 1;

          // Tick active 2-minute suspensions
          const updatedSuspensions = prev.activeSuspensions
            .map(s => ({ ...s, remainingSeconds: s.remainingSeconds - 1 }))
            .filter(s => {
              if (s.remainingSeconds <= 0) {
                if (prev.settings.soundEnabled) sound.playWarningBeep();
                return false;
              }
              return true;
            });

          // Check if period time ended
          if (newPeriodSeconds <= 0) {
            if (prev.settings.soundEnabled) sound.playBuzzer();
            if (prev.settings.vibrateEnabled && 'vibrate' in navigator) {
              navigator.vibrate([300, 100, 300, 100, 500]);
            }
            return {
              ...prev,
              periodSecondsRemaining: 0,
              isTimerRunning: false,
              activeSuspensions: updatedSuspensions,
            };
          }

          return {
            ...prev,
            periodSecondsRemaining: newPeriodSeconds,
            activeSuspensions: updatedSuspensions,
          };
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [matchState.isTimerRunning]);

  // Timeout countdown engine
  useEffect(() => {
    let timeoutTimer: number | null = null;
    if (matchState.activeTimeout?.isRunning) {
      timeoutTimer = window.setInterval(() => {
        setMatchState(prev => {
          if (!prev.activeTimeout || !prev.activeTimeout.isRunning) return prev;
          const rem = prev.activeTimeout.secondsRemaining - 1;
          if (rem <= 0) {
            if (prev.settings.soundEnabled) sound.playBuzzer();
            return {
              ...prev,
              activeTimeout: { ...prev.activeTimeout, secondsRemaining: 0, isRunning: false },
            };
          }
          return {
            ...prev,
            activeTimeout: { ...prev.activeTimeout, secondsRemaining: rem },
          };
        });
      }, 1000);
    }
    return () => {
      if (timeoutTimer) clearInterval(timeoutTimer);
    };
  }, [matchState.activeTimeout?.isRunning]);

  // --- ACTIONS & HANDLERS ---

  const handleToggleTimer = () => {
    if (matchState.periodSecondsRemaining === 0 && !matchState.isInterval) {
      handleClosePeriodOrNext();
      return;
    }
    setMatchState(prev => {
      const nextRunning = !prev.isTimerRunning;
      if (nextRunning && prev.settings.soundEnabled) {
        sound.playWhistle();
      }
      return { ...prev, isTimerRunning: nextRunning };
    });
  };

  const handleResetTimer = () => {
    setMatchState(prev => ({
      ...prev,
      isTimerRunning: false,
      periodSecondsRemaining: prev.settings.periodDurationMinutes * 60,
    }));
  };

  const handleAdjustTime = (deltaSeconds: number) => {
    setMatchState(prev => {
      const current = prev.isInterval ? prev.intervalSecondsRemaining : prev.periodSecondsRemaining;
      const maxSeconds = prev.isInterval ? prev.settings.intervalDurationMinutes * 60 : prev.settings.periodDurationMinutes * 60;
      const updated = Math.max(0, Math.min(maxSeconds, current + deltaSeconds));

      return prev.isInterval
        ? { ...prev, intervalSecondsRemaining: updated }
        : { ...prev, periodSecondsRemaining: updated };
    });
  };

  const handleToggleSound = () => {
    setMatchState(prev => ({
      ...prev,
      settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled }
    }));
  };

  // Trigger Goal Prompt
  const handleGoalClick = (team: 'home' | 'away') => {
    setGoalAssignModalData({ isOpen: true, team });
  };

  // Confirm Goal
  const handleConfirmGoal = (team: 'home' | 'away', player?: Player) => {
    const isU14 = (CATEGORIES[matchState.settings.category] || CATEGORIES.under_14).isU14Format;

    const totalSecondsInPeriod = matchState.settings.periodDurationMinutes * 60;
    const elapsedSeconds = totalSecondsInPeriod - matchState.periodSecondsRemaining;
    const minute = Math.floor(elapsedSeconds / 60) + 1;
    const second = elapsedSeconds % 60;

    const newHomeLive = team === 'home' ? matchState.homePeriodGoals + 1 : matchState.homePeriodGoals;
    const newAwayLive = team === 'away' ? matchState.awayPeriodGoals + 1 : matchState.awayPeriodGoals;
    const newHomeTotal = team === 'home' ? matchState.homeTotalGoals + 1 : matchState.homeTotalGoals;
    const newAwayTotal = team === 'away' ? matchState.awayTotalGoals + 1 : matchState.awayTotalGoals;

    const goalEvent: GoalEvent = {
      id: 'goal_' + Date.now(),
      team,
      period: matchState.currentPeriod,
      minute,
      second,
      playerId: player?.id,
      playerNumber: player?.number,
      playerName: player?.name,
      timestamp: Date.now(),
      homePeriodScore: newHomeLive,
      awayPeriodScore: newAwayLive,
      homeTotalGoals: newHomeTotal,
      awayTotalGoals: newAwayTotal,
    };

    if (matchState.settings.soundEnabled) {
      sound.playGoalSound();
    }

    setMatchState(prev => ({
      ...prev,
      homePeriodGoals: newHomeLive,
      awayPeriodGoals: newAwayLive,
      homeTotalGoals: newHomeTotal,
      awayTotalGoals: newAwayTotal,
      goals: [...prev.goals, goalEvent],
    }));
  };

  // Undo Last Goal
  const handleUndoLastGoal = () => {
    if (matchState.goals.length === 0) return;

    const lastGoal = matchState.goals[matchState.goals.length - 1];
    const isHome = lastGoal.team === 'home';

    setMatchState(prev => {
      const newGoals = prev.goals.slice(0, -1);
      const newHomePeriod = isHome && lastGoal.period === prev.currentPeriod
        ? Math.max(0, prev.homePeriodGoals - 1)
        : prev.homePeriodGoals;
      const newAwayPeriod = !isHome && lastGoal.period === prev.currentPeriod
        ? Math.max(0, prev.awayPeriodGoals - 1)
        : prev.awayPeriodGoals;
      const newHomeTotal = isHome ? Math.max(0, prev.homeTotalGoals - 1) : prev.homeTotalGoals;
      const newAwayTotal = !isHome ? Math.max(0, prev.awayTotalGoals - 1) : prev.awayTotalGoals;

      return {
        ...prev,
        homePeriodGoals: newHomePeriod,
        awayPeriodGoals: newAwayPeriod,
        homeTotalGoals: newHomeTotal,
        awayTotalGoals: newAwayTotal,
        goals: newGoals,
      };
    });
  };

  // Delete individual goal from log
  const handleDeleteGoal = (goalId: string) => {
    setMatchState(prev => {
      const goalToDelete = prev.goals.find(g => g.id === goalId);
      if (!goalToDelete) return prev;

      const newGoals = prev.goals.filter(g => g.id !== goalId);
      const isHome = goalToDelete.team === 'home';
      const isCurrentPeriod = goalToDelete.period === prev.currentPeriod;

      const newHomePeriod = isHome && isCurrentPeriod ? Math.max(0, prev.homePeriodGoals - 1) : prev.homePeriodGoals;
      const newAwayPeriod = !isHome && isCurrentPeriod ? Math.max(0, prev.awayPeriodGoals - 1) : prev.awayPeriodGoals;
      const newHomeTotal = isHome ? Math.max(0, prev.homeTotalGoals - 1) : prev.homeTotalGoals;
      const newAwayTotal = !isHome ? Math.max(0, prev.awayTotalGoals - 1) : prev.awayTotalGoals;

      return {
        ...prev,
        homePeriodGoals: newHomePeriod,
        awayPeriodGoals: newAwayPeriod,
        homeTotalGoals: newHomeTotal,
        awayTotalGoals: newAwayTotal,
        goals: newGoals,
      };
    });
  };

  // Open Disciplinary Modal
  const handleOpenSanctionModal = (team: 'home' | 'away', player?: Player | null) => {
    setDisciplinaryModalData({ isOpen: true, team, player });
  };

  // Apply Disciplinary Sanction
  const handleApplySanction = (
    team: 'home' | 'away',
    playerId: string,
    playerNumber: number,
    playerName: string,
    type: SanctionType,
    note?: string
  ) => {
    const totalSecondsInPeriod = matchState.settings.periodDurationMinutes * 60;
    const elapsedSeconds = totalSecondsInPeriod - matchState.periodSecondsRemaining;
    const minute = Math.floor(elapsedSeconds / 60) + 1;
    const second = elapsedSeconds % 60;

    const sanctionEvent: SanctionEvent = {
      id: 'sanction_' + Date.now(),
      team,
      period: matchState.currentPeriod,
      minute,
      second,
      playerId,
      playerNumber,
      playerName,
      type,
      timestamp: Date.now(),
      note,
    };

    if (matchState.settings.soundEnabled) {
      sound.playWhistle();
    }

    setMatchState(prev => {
      const newSanctions = [...prev.sanctions, sanctionEvent];
      let newActiveSuspensions = [...prev.activeSuspensions];

      // If it's a 2-minute suspension, start countdown
      if (type === '2min') {
        const suspension: ActiveSuspension = {
          id: 'susp_' + Date.now(),
          sanctionId: sanctionEvent.id,
          team,
          playerId,
          playerNumber,
          playerName,
          startedAtMatchSeconds: prev.periodSecondsRemaining,
          durationSeconds: 120,
          remainingSeconds: 120,
          period: prev.currentPeriod,
        };
        newActiveSuspensions.push(suspension);

        // Check 3rd 2-min rule -> Automatic Red Card!
        const existingCount = prev.sanctions.filter(s => s.team === team && s.playerId === playerId && s.type === '2min').length + 1;
        if (existingCount >= 3) {
          const redEvent: SanctionEvent = {
            id: 'sanction_auto_red_' + Date.now(),
            team,
            period: prev.currentPeriod,
            minute,
            second,
            playerId,
            playerNumber,
            playerName,
            type: 'red',
            timestamp: Date.now() + 10,
            note: "Squalifica automatica per 3ª esclusione da 2'",
          };
          newSanctions.push(redEvent);
          setNotificationBanner(`⚠️ Squalifica automatica: #${playerNumber} ${playerName} ha raggiunto 3 esclusioni da 2'!`);
          setTimeout(() => setNotificationBanner(null), 5000);
        }
      }

      return {
        ...prev,
        sanctions: newSanctions,
        activeSuspensions: newActiveSuspensions,
      };
    });
  };

  // Delete Sanction
  const handleDeleteSanction = (sanctionId: string) => {
    setMatchState(prev => ({
      ...prev,
      sanctions: prev.sanctions.filter(s => s.id !== sanctionId),
      activeSuspensions: prev.activeSuspensions.filter(s => s.sanctionId !== sanctionId),
    }));
  };

  // Cancel Suspension
  const handleCancelSuspension = (suspensionId: string) => {
    setMatchState(prev => ({
      ...prev,
      activeSuspensions: prev.activeSuspensions.filter(s => s.id !== suspensionId),
    }));
  };

  // Timeout trigger
  const handleTriggerTimeout = (team: 'home' | 'away') => {
    if (matchState.settings.soundEnabled) sound.playWhistle();

    setMatchState(prev => {
      const currentTeam = team === 'home' ? prev.homeTeam : prev.awayTeam;
      const totalSecondsInPeriod = prev.settings.periodDurationMinutes * 60;
      const elapsedSeconds = totalSecondsInPeriod - prev.periodSecondsRemaining;
      const minute = Math.floor(elapsedSeconds / 60) + 1;

      const updatedHome = team === 'home' ? { ...prev.homeTeam, timeoutsTaken: [...prev.homeTeam.timeoutsTaken, minute] } : prev.homeTeam;
      const updatedAway = team === 'away' ? { ...prev.awayTeam, timeoutsTaken: [...prev.awayTeam.timeoutsTaken, minute] } : prev.awayTeam;

      return {
        ...prev,
        isTimerRunning: false, // Stop game clock during timeout
        homeTeam: updatedHome,
        awayTeam: updatedAway,
        activeTimeout: {
          team,
          secondsRemaining: 60,
          isRunning: true,
        }
      };
    });
  };

  /**
   * =========================================================================
   * PERIOD CLOSURE & U14 FIGH 2026/2027 FORMAT MHC LOGIC
   * =========================================================================
   */
  const handleClosePeriodOrNext = () => {
    const isU14 = (CATEGORIES[matchState.settings.category] || CATEGORIES.under_14).isU14Format;
    const curPeriod = matchState.currentPeriod;
    const totalPeriods = matchState.settings.totalPeriods;

    if (matchState.isMatchOver) {
      // Reopen last period
      handleReopenPeriod(totalPeriods);
      return;
    }

    if (matchState.isInterval) {
      // End interval, start next period
      setMatchState(prev => ({
        ...prev,
        isInterval: false,
        isTimerRunning: false,
        periodSecondsRemaining: prev.settings.periodDurationMinutes * 60,
      }));
      return;
    }

    // Freeze and close the current period
    let homeP = 0;
    let awayP = 0;

    if (isU14) {
      const pts = calculatePeriodPoints(matchState.homePeriodGoals, matchState.awayPeriodGoals);
      homeP = pts.homePoints;
      awayP = pts.awayPoints;
    }

    const currentPeriodResult: PeriodResult = {
      period: curPeriod,
      homeGoals: matchState.homePeriodGoals,
      awayGoals: matchState.awayPeriodGoals,
      homePoints: homeP,
      awayPoints: awayP,
      isClosed: true,
      endedAtTimestamp: Date.now(),
    };

    setMatchState(prev => {
      // Update period results list
      const newResults = prev.periodResults.filter(r => r.period !== curPeriod);
      newResults.push(currentPeriodResult);
      newResults.sort((a, b) => a.period - b.period);

      // Sum all closed periods points (for U14)
      const sumHomePoints = newResults.reduce((acc, r) => acc + r.homePoints, 0);
      const sumAwayPoints = newResults.reduce((acc, r) => acc + r.awayPoints, 0);

      const isFinal = curPeriod >= totalPeriods;

      if (isFinal) {
        if (prev.settings.soundEnabled) sound.playBuzzer();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        return {
          ...prev,
          isTimerRunning: false,
          isMatchOver: true,
          periodResults: newResults,
          homeTotalPoints: sumHomePoints,
          awayTotalPoints: sumAwayPoints,
          periodSecondsRemaining: 0,
        };
      } else {
        // Transition to interval or next period
        // FOR U14: Reset live period score to 0-0!
        return {
          ...prev,
          isTimerRunning: false,
          isInterval: true,
          intervalSecondsRemaining: prev.settings.intervalDurationMinutes * 60,
          currentPeriod: curPeriod + 1,
          homePeriodGoals: 0, // Reset to 0-0 for next period
          awayPeriodGoals: 0, // Reset to 0-0 for next period
          periodResults: newResults,
          homeTotalPoints: sumHomePoints,
          awayTotalPoints: sumAwayPoints,
          periodSecondsRemaining: prev.settings.periodDurationMinutes * 60,
        };
      }
    });
  };

  // Reopen Closed Period (For Referee corrections & retroactive points recalculation)
  const handleReopenPeriod = (periodNum: number) => {
    setMatchState(prev => {
      const isU14 = (CATEGORIES[prev.settings.category] || CATEGORIES.under_14).isU14Format;
      const targetResult = prev.periodResults.find(r => r.period === periodNum);

      const updatedResults = prev.periodResults.filter(r => r.period !== periodNum);

      // Recalculate remaining closed periods points
      const sumHomePoints = updatedResults.reduce((acc, r) => acc + r.homePoints, 0);
      const sumAwayPoints = updatedResults.reduce((acc, r) => acc + r.awayPoints, 0);

      const restoredHomePeriodGoals = targetResult ? targetResult.homeGoals : 0;
      const restoredAwayPeriodGoals = targetResult ? targetResult.awayGoals : 0;

      return {
        ...prev,
        currentPeriod: periodNum,
        isMatchOver: false,
        isInterval: false,
        isTimerRunning: false,
        homePeriodGoals: restoredHomePeriodGoals,
        awayPeriodGoals: restoredAwayPeriodGoals,
        periodResults: updatedResults,
        homeTotalPoints: sumHomePoints,
        awayTotalPoints: sumAwayPoints,
        periodSecondsRemaining: prev.settings.periodDurationMinutes * 60,
      };
    });

    setNotificationBanner(`Tempo ${periodNum}° riaperto per modifiche e correzioni.`);
    setTimeout(() => setNotificationBanner(null), 3000);
  };

  // Roster Management
  const handleAddPlayer = (teamType: 'home' | 'away', playerData: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
    };
    setMatchState(prev => {
      const isHome = teamType === 'home';
      const targetTeam = isHome ? prev.homeTeam : prev.awayTeam;
      const updatedPlayers = [...targetTeam.players, newPlayer].sort((a, b) => a.number - b.number);
      return isHome
        ? { ...prev, homeTeam: { ...prev.homeTeam, players: updatedPlayers } }
        : { ...prev, awayTeam: { ...prev.awayTeam, players: updatedPlayers } };
    });
  };

  const handleRemovePlayer = (teamType: 'home' | 'away', playerId: string) => {
    setMatchState(prev => {
      const isHome = teamType === 'home';
      const targetTeam = isHome ? prev.homeTeam : prev.awayTeam;
      const updatedPlayers = targetTeam.players.filter(p => p.id !== playerId);
      return isHome
        ? { ...prev, homeTeam: { ...prev.homeTeam, players: updatedPlayers } }
        : { ...prev, awayTeam: { ...prev.awayTeam, players: updatedPlayers } };
    });
  };

  const handleUpdatePlayer = (teamType: 'home' | 'away', player: Player) => {
    setMatchState(prev => {
      const isHome = teamType === 'home';
      const targetTeam = isHome ? prev.homeTeam : prev.awayTeam;
      const updatedPlayers = targetTeam.players.map(p => p.id === player.id ? player : p);
      return isHome
        ? { ...prev, homeTeam: { ...prev.homeTeam, players: updatedPlayers } }
        : { ...prev, awayTeam: { ...prev.awayTeam, players: updatedPlayers } };
    });
  };

  const handleLoadRosterIntoTeam = (teamType: 'home' | 'away', savedRoster: SavedRoster) => {
    setMatchState(prev => {
      const updatedTeam: Team = {
        id: teamType,
        name: savedRoster.teamName,
        shortName: savedRoster.shortName,
        color: savedRoster.color || (teamType === 'home' ? '#dc2626' : '#2563eb'),
        textColor: '#ffffff',
        players: savedRoster.players,
        timeoutsTaken: [],
      };
      return teamType === 'home'
        ? { ...prev, homeTeam: updatedTeam }
        : { ...prev, awayTeam: updatedTeam };
    });
  };

  const handleClearTeamRoster = (teamType: 'home' | 'away') => {
    setMatchState(prev => {
      const isHome = teamType === 'home';
      const updatedTeam: Team = isHome
        ? { ...prev.homeTeam, players: [] }
        : { ...prev.awayTeam, players: [] };
      return isHome
        ? { ...prev, homeTeam: updatedTeam }
        : { ...prev, awayTeam: updatedTeam };
    });
    setNotificationBanner(`Rosa ${teamType === 'home' ? 'Squadra Casa' : 'Squadra Ospiti'} svuotata.`);
    setTimeout(() => setNotificationBanner(null), 3000);
  };

  const handleNewTeam = (teamType: 'home' | 'away', name: string, shortName: string) => {
    setMatchState(prev => {
      const isHome = teamType === 'home';
      const updatedTeam: Team = isHome
        ? { ...prev.homeTeam, name, shortName }
        : { ...prev.awayTeam, name, shortName };
      return isHome
        ? { ...prev, homeTeam: updatedTeam }
        : { ...prev, awayTeam: updatedTeam };
    });
    setNotificationBanner(`Squadra ${teamType === 'home' ? 'Casa' : 'Ospiti'} aggiornata in "${name}".`);
    setTimeout(() => setNotificationBanner(null), 3000);
  };

  // Reset Match State
  const handleConfirmReset = () => {
    const fresh = createInitialMatchState(matchState.settings.category);
    setMatchState(fresh);
    clearMatchState();
    setResetConfirmOpen(false);
    setNotificationBanner('Nuova partita inizializzata.');
    setTimeout(() => setNotificationBanner(null), 3000);
  };

  // Category switch
  const handleChangeCategory = (newCat: CategoryId) => {
    const cat = CATEGORIES[newCat];
    setMatchState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        category: newCat,
        periodDurationMinutes: cat.periodDurationMinutes,
        intervalDurationMinutes: cat.intervalDurationMinutes,
        totalPeriods: cat.totalPeriods,
      },
      periodSecondsRemaining: cat.periodDurationMinutes * 60,
    }));
  };

  // Save Settings
  const handleSaveSettings = (newSettings: MatchSettings, newHome: Team, newAway: Team) => {
    setMatchState(prev => ({
      ...prev,
      settings: newSettings,
      homeTeam: { ...newHome, players: prev.homeTeam.players },
      awayTeam: { ...newAway, players: prev.awayTeam.players },
      periodSecondsRemaining: prev.periodSecondsRemaining === prev.settings.periodDurationMinutes * 60
        ? newSettings.periodDurationMinutes * 60
        : prev.periodSecondsRemaining,
    }));
  };

  const isU14 = (CATEGORIES[matchState.settings.category] || CATEGORIES.under_14).isU14Format;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 pb-12">
      {/* App Header */}
      <Header
        matchState={matchState}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenRosterManager={() => setIsRosterManagerOpen(true)}
        onOpenJsonData={() => setIsJsonDataModalOpen(true)}
        onResetMatch={() => setResetConfirmOpen(true)}
        onToggleSound={handleToggleSound}
        isWakeLocked={isWakeLocked}
        onToggleWakeLock={toggleWakeLock}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Notification Toast */}
      {notificationBanner && (
        <div className="max-w-7xl mx-auto px-4 mt-2 w-full animate-in slide-in-from-top duration-200">
          <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-between shadow-xl">
            <span>{notificationBanner}</span>
            <button onClick={() => setNotificationBanner(null)} className="font-bold text-xs p-1">✕</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-4">
        {/* Suspensions Bar (if any player is on 2' exclusion) */}
        <SuspensionsBar
          matchState={matchState}
          onCancelSuspension={handleCancelSuspension}
        />

        {/* Primary Digital Scoreboard */}
        <Scoreboard
          matchState={matchState}
          onGoalClick={handleGoalClick}
          onUndoLastGoal={handleUndoLastGoal}
          onToggleTimer={handleToggleTimer}
          onResetTimer={handleResetTimer}
          onAdjustTime={handleAdjustTime}
          onClosePeriodOrNext={handleClosePeriodOrNext}
          onTriggerTimeout={handleTriggerTimeout}
          onOpenSanctionModal={(team) => handleOpenSanctionModal(team)}
        />

        {/* Under 14 MHC FIGH 3-Period Breakdown Panel */}
        {isU14 && (
          <U14PeriodBreakdown
            matchState={matchState}
            onReopenPeriod={handleReopenPeriod}
          />
        )}

        {/* Team Rosters Side-by-Side (or stacked on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <TeamRosterPanel
            team={matchState.homeTeam}
            teamType="home"
            matchState={matchState}
            onQuickGoal={(teamType, player) => handleConfirmGoal(teamType, player)}
            onQuickSanction={(teamType, player) => handleOpenSanctionModal(teamType, player)}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            onUpdatePlayer={handleUpdatePlayer}
            onClearTeam={handleClearTeamRoster}
            onNewTeam={handleNewTeam}
          />

          <TeamRosterPanel
            team={matchState.awayTeam}
            teamType="away"
            matchState={matchState}
            onQuickGoal={(teamType, player) => handleConfirmGoal(teamType, player)}
            onQuickSanction={(teamType, player) => handleOpenSanctionModal(teamType, player)}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            onUpdatePlayer={handleUpdatePlayer}
            onClearTeam={handleClearTeamRoster}
            onNewTeam={handleNewTeam}
          />
        </div>

        {/* Chronological Event Log & Timeline */}
        <MatchLog
          matchState={matchState}
          onDeleteGoal={handleDeleteGoal}
          onDeleteSanction={handleDeleteSanction}
        />
      </main>

      {/* Disciplinary Sanction Modal */}
      <DisciplinaryModal
        isOpen={disciplinaryModalData.isOpen}
        onClose={() => setDisciplinaryModalData({ isOpen: false, team: 'home', player: null })}
        matchState={matchState}
        selectedTeam={disciplinaryModalData.team}
        initialPlayer={disciplinaryModalData.player}
        onApplySanction={handleApplySanction}
      />

      {/* Goal Assignment Modal */}
      <GoalAssignModal
        isOpen={goalAssignModalData.isOpen}
        onClose={() => setGoalAssignModalData({ isOpen: false, team: 'home' })}
        matchState={matchState}
        selectedTeam={goalAssignModalData.team}
        onConfirmGoal={handleConfirmGoal}
      />

      {/* Official Match Report / PDF Modal */}
      <OfficialReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        matchState={matchState}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        matchState={matchState}
        onSaveSettings={handleSaveSettings}
        onChangeCategory={handleChangeCategory}
      />

      {/* Roster Presets Manager Modal */}
      <RosterManagerModal
        isOpen={isRosterManagerOpen}
        onClose={() => setIsRosterManagerOpen(false)}
        matchState={matchState}
        onLoadRosterIntoTeam={handleLoadRosterIntoTeam}
        onClearTeamRoster={handleClearTeamRoster}
      />

      {/* JSON Data & Backup Manager Modal */}
      <JsonDataManagerModal
        isOpen={isJsonDataModalOpen}
        onClose={() => setIsJsonDataModalOpen(false)}
        matchState={matchState}
        onLoadMatchState={(loadedMatch) => {
          setMatchState(loadedMatch);
          setNotificationBanner(`Partita caricata con successo da JSON: ${loadedMatch.homeTeam.name} vs ${loadedMatch.awayTeam.name}`);
        }}
        onLoadRosterIntoTeam={handleLoadRosterIntoTeam}
      />

      {/* Timeout Countdown Active Modal */}
      <TimeoutModal
        matchState={matchState}
        onCloseTimeout={() => setMatchState(prev => ({ ...prev, activeTimeout: null }))}
        onToggleTimeoutTimer={() => setMatchState(prev => prev.activeTimeout ? ({
          ...prev,
          activeTimeout: { ...prev.activeTimeout, isRunning: !prev.activeTimeout.isRunning }
        }) : prev)}
      />

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 text-red-400 border border-red-800/80 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-white">Nuova Partita / Azzera</h3>
            <p className="text-xs text-slate-400 mt-2">
              Sei sicuro di voler azzerare il tabellone e iniziare una nuova partita? Tutti i gol e cartellini della partita in corso verranno rimossi.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition active:scale-95"
              >
                Sì, Azzera Tutto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
