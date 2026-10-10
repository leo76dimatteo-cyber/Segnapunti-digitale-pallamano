import { CategoryConfig, CategoryId } from '../types';

export const CATEGORIES: Record<CategoryId, CategoryConfig> = {
  serie_b: {
    id: 'serie_b',
    name: 'Serie B (Senior)',
    isU14Format: false,
    totalPeriods: 2,
    periodDurationMinutes: 30,
    intervalDurationMinutes: 10,
    description: 'Modalità Classica FIGH: 2 tempi da 30 min, punteggio cumulativo.'
  },
  under_18: {
    id: 'under_18',
    name: 'Under 18',
    isU14Format: false,
    totalPeriods: 2,
    periodDurationMinutes: 30,
    intervalDurationMinutes: 10,
    description: 'Modalità Classica FIGH: 2 tempi da 30 min, punteggio cumulativo.'
  },
  under_16: {
    id: 'under_16',
    name: 'Under 16',
    isU14Format: false,
    totalPeriods: 2,
    periodDurationMinutes: 25,
    intervalDurationMinutes: 10,
    description: 'Modalità Classica FIGH: 2 tempi da 25 min, punteggio cumulativo.'
  },
  under_14: {
    id: 'under_14',
    name: 'Under 14 Regionale (Circolare 47)',
    isU14Format: true,
    totalPeriods: 3,
    periodDurationMinutes: 20,
    intervalDurationMinutes: 5,
    description: 'Circolare FIGH n. 47: 3 tempi da 20 min per Campionato Regionale, 5 min di intervallo/recupero. Reti azzerate a 0-0 ad ogni tempo. 1 punto vittoria tempo, 0.5 pareggio. Max 3 pt.'
  },
  under_14_naz: {
    id: 'under_14_naz',
    name: 'Under 14 Concentramenti / Nazionali',
    isU14Format: true,
    totalPeriods: 3,
    periodDurationMinutes: 15,
    intervalDurationMinutes: 5,
    description: 'Circolare FIGH n. 47 (Concentramenti / 2^ Fase Nazionale): 3 tempi da 15 min indipendenti, 5 min di intervallo/recupero. Reti azzerate a ogni tempo (1 pt vittoria, 0.5 pareggio).'
  }
};

/**
 * ====================================================================================
 * REGOLAMENTO FIGH — CIRCOLARE N. 47 (UNDER 14 FORMAT MHC)
 * ====================================================================================
 * LOGICA DI GIOCO E ASSEGNAZIONE PUNTI:
 * 1. Durata tempi di gioco (Circolare 47):
 *    - CAMPIONATO REGIONALE: esattamente 3 tempi da 20 minuti ciascuno.
 *    - Recupero/intervallo tra i tempi: 5 minuti.
 *    - Fasi Nazionali / Concentramenti: 3 tempi da 15 minuti ciascuno, 5 min recupero.
 * 2. Il conteggio reti del tabellone LIVE si AZZERA a 0-0 all'inizio di ciascun tempo.
 *    Ogni tempo è, ai fini dell'esito, una frazione indipendente a sé stante.
 * 3. Assegnazione punti a fine tempo:
 *    - Più reti segnate nel tempo -> 1.0 punto alla squadra vincitrice, 0.0 all'avversaria.
 *    - Reti pari nel tempo -> 0.5 punti a ciascuna squadra (pareggio).
 * 4. Risultato ufficiale gara = Somma dei punti acquisiti nei 3 tempi (es. 2.5 - 0.5, 2 - 1, 1.5 - 1.5).
 *    Il massimo teorico per squadra è di 3.0 punti (se vince tutti e 3 i tempi).
 * 5. Esempio pratico:
 *    - Tempo 1: Squadra Casa 12, Ospiti 2 (scarto di 10 reti) -> Casa guadagna 1.0 punto, Ospiti 0.0.
 *      Nonostante l'ampio divario, nel Tempo 2 le due squadre RIPARTONO DA 0-0!
 *    - Tempo 2: Squadra Casa 4, Ospiti 5 -> Ospiti guadagnano 1.0 punto, Casa 0.0.
 *    - Tempo 3: Squadra Casa 6, Ospiti 6 -> 0.5 punti a Casa e 0.5 punti a Ospiti.
 *    - RISULTATO FINALE GARA: Casa 1.5 punti - Ospiti 1.5 punti.
 *    - TOTALE RETI (statistica accessoria per referto e classifica marcatori): Casa 22 - Ospiti 13.
 * 6. Gestione correzione/riapertura tempo:
 *    Se l'arbitro o l'ufficiale di campo deve correggere un gol di un tempo precedente, la funzione
 *    "riapri tempo" ripristina la modificabilità del tempo e ricalcola all'istante i punti assegnati.
 * ====================================================================================
 */
export function calculatePeriodPoints(homeGoals: number, awayGoals: number): { homePoints: number; awayPoints: number } {
  if (homeGoals > awayGoals) {
    return { homePoints: 1.0, awayPoints: 0.0 };
  } else if (awayGoals > homeGoals) {
    return { homePoints: 0.0, awayPoints: 1.0 };
  } else {
    return { homePoints: 0.5, awayPoints: 0.5 };
  }
}
