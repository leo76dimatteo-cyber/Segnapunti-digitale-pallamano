import { RegistryPlayer, CategoryPlayerGroup } from '../types';

export const PLAYERS_REGISTRY_KEY = 'figh_handball_players_registry_v1';

export interface CategoryMeta {
  id: string;
  name: string;
  shortName: string;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
}

export const REGISTRY_CATEGORIES: CategoryMeta[] = [
  {
    id: 'under_14',
    name: 'Under 14 (Circolare 47)',
    shortName: 'U14',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-500/15',
    description: 'Format FIGH Circolare 47: 3 tempi da 20 min (Regionale), 5 min recupero.',
  },
  {
    id: 'under_16',
    name: 'Under 16',
    shortName: 'U16',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/15',
    description: 'Categoria Allievi FIGH (2010-2011): 2 tempi da 25 min.',
  },
  {
    id: 'under_18',
    name: 'Under 18',
    shortName: 'U18',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/40',
    bgColor: 'bg-indigo-500/15',
    description: 'Categoria Juniores FIGH (2008-2009): 2 tempi da 30 min.',
  },
  {
    id: 'under_20',
    name: 'Under 20',
    shortName: 'U20',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-500/15',
    description: 'Categoria Youth / Promesse: 2 tempi da 30 min.',
  },
  {
    id: 'serie_b',
    name: 'Serie B (Senior)',
    shortName: 'Serie B',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-500/15',
    description: 'Campionato Regionale Senior FIGH: 2 tempi da 30 min.',
  },
  {
    id: 'serie_a',
    name: 'Serie A (Gold/Silver)',
    shortName: 'Serie A',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    bgColor: 'bg-rose-500/15',
    description: 'Campionato Nazionale FIGH: 2 tempi da 30 min.',
  },
  {
    id: 'master',
    name: 'Master / Amatori',
    shortName: 'Master',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/15',
    description: 'Tornei Over 35 e Master FIGH.',
  },
  {
    id: 'altro',
    name: 'Altra Categoria',
    shortName: 'Altro',
    color: 'text-slate-400',
    borderColor: 'border-slate-500/40',
    bgColor: 'bg-slate-500/15',
    description: 'Categoria personalizzata o amichevoli.',
  },
];

export function getCategoryMeta(categoryId: string): CategoryMeta {
  return (
    REGISTRY_CATEGORIES.find((c) => c.id === categoryId) || {
      id: categoryId,
      name: categoryId.replace(/_/g, ' ').toUpperCase(),
      shortName: categoryId.substring(0, 4).toUpperCase(),
      color: 'text-slate-300',
      borderColor: 'border-slate-600',
      bgColor: 'bg-slate-800',
      description: 'Categoria personalizzata',
    }
  );
}

export function getCategoryLabel(categoryId: string): string {
  return getCategoryMeta(categoryId).name;
}

// Initial sample seed dataset of categorized players (Realistic Italian Handball athletes)
export const INITIAL_SEEDED_PLAYERS: RegistryPlayer[] = [
  // UNDER 14
  {
    id: 'reg_u14_01',
    number: 1,
    name: 'Leonardo Ferri',
    category: 'under_14',
    categoryName: 'Under 14 (MHC FIGH)',
    role: 'Portiere',
    position: 'Portiere',
    clubName: 'HC Rubiera U14',
    birthYear: 2012,
    cardId: 'FIGH-749102',
    notes: 'Reattivo sui 7m, capitano vice',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_u14_02',
    number: 7,
    name: 'Matteo Gatti',
    category: 'under_14',
    categoryName: 'Under 14 (MHC FIGH)',
    role: 'Capitano',
    position: 'Centrale',
    clubName: 'HC Rubiera U14',
    birthYear: 2012,
    cardId: 'FIGH-749108',
    notes: 'Regista di gioco, rigorista principale',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_u14_03',
    number: 10,
    name: 'Alessio Donati',
    category: 'under_14',
    categoryName: 'Under 14 (MHC FIGH)',
    role: 'Giocatore',
    position: 'Terzino',
    clubName: 'HC Rubiera U14',
    birthYear: 2013,
    cardId: 'FIGH-749115',
    notes: 'Forte tiro da 9m',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_u14_04',
    number: 14,
    name: 'Davide Morandi',
    category: 'under_14',
    categoryName: 'Under 14 (MHC FIGH)',
    role: 'Giocatore',
    position: 'Ala',
    clubName: 'HC Rubiera U14',
    birthYear: 2012,
    cardId: 'FIGH-749122',
    notes: 'Velocista in contropiede',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_u14_05',
    number: 22,
    name: 'Federico Neri',
    category: 'under_14',
    categoryName: 'Under 14 (MHC FIGH)',
    role: 'Giocatore',
    position: 'Pivot',
    clubName: 'HC Rubiera U14',
    birthYear: 2012,
    cardId: 'FIGH-749130',
    notes: 'Ottima fisicità al centro',
    savedAt: 1712000000000,
  },

  // UNDER 16
  {
    id: 'reg_u16_01',
    number: 12,
    name: 'Giacomo Rinaldi',
    category: 'under_16',
    categoryName: 'Under 16',
    role: 'Portiere',
    position: 'Portiere',
    clubName: 'Bologna United U16',
    birthYear: 2010,
    cardId: 'FIGH-632190',
    notes: 'Portiere alto 1.88m, ottima copertura pali',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_u16_02',
    number: 5,
    name: 'Lorenzo Costa',
    category: 'under_16',
    categoryName: 'Under 16',
    role: 'Capitano',
    position: 'Centrale',
    clubName: 'Bologna United U16',
    birthYear: 2010,
    cardId: 'FIGH-632204',
    notes: 'Capitano, leader difensivo 5-1',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_u16_03',
    number: 9,
    name: 'Riccardo Barbieri',
    category: 'under_16',
    categoryName: 'Under 16',
    role: 'Giocatore',
    position: 'Terzino',
    clubName: 'Bologna United U16',
    birthYear: 2011,
    cardId: 'FIGH-632212',
    notes: 'Terzino sinistro mancino',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_u16_04',
    number: 18,
    name: 'Filippo Grassi',
    category: 'under_16',
    categoryName: 'Under 16',
    role: 'Giocatore',
    position: 'Ala',
    clubName: 'Bologna United U16',
    birthYear: 2010,
    cardId: 'FIGH-632225',
    notes: 'Specialista tiri a girare dall’ala',
    savedAt: 1712000000000,
  },

  // UNDER 18
  {
    id: 'reg_u18_01',
    number: 16,
    name: 'Andrea Montanari',
    category: 'under_18',
    categoryName: 'Under 18',
    role: 'Portiere',
    position: 'Portiere',
    clubName: 'Romagna Handball U18',
    birthYear: 2008,
    cardId: 'FIGH-510044',
    notes: 'Convocato rappresentativa regionale',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_u18_02',
    number: 8,
    name: 'Pietro Zannoni',
    category: 'under_18',
    categoryName: 'Under 18',
    role: 'Capitano',
    position: 'Terzino',
    clubName: 'Romagna Handball U18',
    birthYear: 2008,
    cardId: 'FIGH-510062',
    notes: 'Tiratore potente, capitano',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_u18_03',
    number: 11,
    name: 'Samuele Rossi',
    category: 'under_18',
    categoryName: 'Under 18',
    role: 'Giocatore',
    position: 'Pivot',
    clubName: 'Romagna Handball U18',
    birthYear: 2009,
    cardId: 'FIGH-510077',
    notes: 'Blocchi e inserimenti veloci',
    savedAt: 1712000000000,
  },

  // SERIE B
  {
    id: 'reg_sb_01',
    number: 1,
    name: 'Marco Vianello',
    category: 'serie_b',
    categoryName: 'Serie B (Senior)',
    role: 'Portiere',
    position: 'Portiere',
    clubName: 'Handball Club Rubiera',
    birthYear: 1998,
    cardId: 'FIGH-302199',
    notes: 'Esperienza decennale in campionati federali',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_sb_02',
    number: 4,
    name: 'Federico Rossi',
    category: 'serie_b',
    categoryName: 'Serie B (Senior)',
    role: 'Giocatore',
    position: 'Ala',
    clubName: 'Handball Club Rubiera',
    birthYear: 2001,
    cardId: 'FIGH-302214',
    notes: 'Ala sinistra titolare',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_sb_03',
    number: 6,
    name: 'Andrea Botti',
    category: 'serie_b',
    categoryName: 'Serie B (Senior)',
    role: 'Capitano',
    position: 'Centrale',
    clubName: 'Handball Club Rubiera',
    birthYear: 1996,
    cardId: 'FIGH-302220',
    notes: 'Capitano prima squadra',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_sb_04',
    number: 15,
    name: 'Michele De Luca',
    category: 'serie_b',
    categoryName: 'Serie B (Senior)',
    role: 'Giocatore',
    position: 'Terzino',
    clubName: 'Handball Club Rubiera',
    birthYear: 1999,
    cardId: 'FIGH-302245',
    notes: 'Terzino destro con tiro in sospensione',
    savedAt: 1712000000000,
  },

  // SERIE A
  {
    id: 'reg_sa_01',
    number: 16,
    name: 'Thomas Bortoli',
    category: 'serie_a',
    categoryName: 'Serie A (Gold/Silver)',
    role: 'Portiere',
    position: 'Portiere',
    clubName: 'Cassano Magnago A1',
    birthYear: 1995,
    cardId: 'FIGH-190412',
    notes: 'Portiere Serie A, media parate >38%',
    savedAt: 1712000000000,
  },
  {
    id: 'reg_sa_02',
    number: 10,
    name: 'Christian Oberrauch',
    category: 'serie_a',
    categoryName: 'Serie A (Gold/Silver)',
    role: 'Capitano',
    position: 'Terzino',
    clubName: 'Cassano Magnago A1',
    birthYear: 1997,
    cardId: 'FIGH-190455',
    notes: 'Nazionale FIGH, capocannoniere',
    savedAt: 1712000000000,
  },
];

/**
 * Loads registry players from localStorage (or seeds initial data if first time)
 */
export function loadRegistryPlayers(): RegistryPlayer[] {
  if (typeof window === 'undefined') return INITIAL_SEEDED_PLAYERS;
  try {
    const raw = localStorage.getItem(PLAYERS_REGISTRY_KEY);
    if (raw) {
      const parsed: RegistryPlayer[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // If empty or never saved, seed with standard initial players
    localStorage.setItem(PLAYERS_REGISTRY_KEY, JSON.stringify(INITIAL_SEEDED_PLAYERS));
    return INITIAL_SEEDED_PLAYERS;
  } catch (e) {
    console.error('Failed to load players registry from localStorage', e);
    return INITIAL_SEEDED_PLAYERS;
  }
}

/**
 * Saves a single player to registry (updates if exists by id, or inserts)
 */
export function saveRegistryPlayer(player: RegistryPlayer): void {
  if (typeof window === 'undefined') return;
  try {
    const list = loadRegistryPlayers();
    const existingIndex = list.findIndex((p) => p.id === player.id);
    const updatedPlayer: RegistryPlayer = {
      ...player,
      categoryName: getCategoryLabel(player.category),
      savedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedPlayer;
    } else {
      list.unshift(updatedPlayer);
    }
    localStorage.setItem(PLAYERS_REGISTRY_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save player to registry', e);
  }
}

/**
 * Saves batch of players
 */
export function saveRegistryPlayersBatch(players: RegistryPlayer[]): void {
  if (typeof window === 'undefined') return;
  try {
    const list = loadRegistryPlayers();
    const map = new Map<string, RegistryPlayer>();
    list.forEach((p) => map.set(p.id, p));
    players.forEach((p) => {
      map.set(p.id, {
        ...p,
        categoryName: getCategoryLabel(p.category),
        savedAt: Date.now(),
      });
    });
    const merged = Array.from(map.values());
    localStorage.setItem(PLAYERS_REGISTRY_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to batch save players to registry', e);
  }
}

/**
 * Deletes player by id
 */
export function deleteRegistryPlayer(playerId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = loadRegistryPlayers();
    const updated = list.filter((p) => p.id !== playerId);
    localStorage.setItem(PLAYERS_REGISTRY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete player from registry', e);
  }
}

/**
 * Clears entire registry
 */
export function clearRegistryPlayers(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PLAYERS_REGISTRY_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear registry', e);
  }
}

/**
 * Resets registry to initial seed
 */
export function resetRegistryToDefault(): RegistryPlayer[] {
  if (typeof window === 'undefined') return INITIAL_SEEDED_PLAYERS;
  try {
    localStorage.setItem(PLAYERS_REGISTRY_KEY, JSON.stringify(INITIAL_SEEDED_PLAYERS));
    return INITIAL_SEEDED_PLAYERS;
  } catch (e) {
    console.error('Failed to reset registry', e);
    return INITIAL_SEEDED_PLAYERS;
  }
}

/**
 * Imports players (merge or replace)
 */
export function importRegistryPlayers(
  incoming: RegistryPlayer[],
  replace: boolean = false
): RegistryPlayer[] {
  if (typeof window === 'undefined') return [];
  try {
    let finalPlayers: RegistryPlayer[] = [];
    if (replace) {
      finalPlayers = incoming.map((p) => ({
        ...p,
        categoryName: getCategoryLabel(p.category || 'under_14'),
        savedAt: p.savedAt || Date.now(),
      }));
    } else {
      const current = loadRegistryPlayers();
      const map = new Map<string, RegistryPlayer>();
      current.forEach((p) => map.set(`${p.name.toLowerCase()}_${p.number}_${p.category}`, p));
      incoming.forEach((p) => {
        const key = `${p.name.toLowerCase()}_${p.number}_${p.category || 'under_14'}`;
        map.set(key, {
          ...p,
          id: p.id || 'reg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          category: p.category || 'under_14',
          categoryName: getCategoryLabel(p.category || 'under_14'),
          savedAt: Date.now(),
        });
      });
      finalPlayers = Array.from(map.values());
    }

    localStorage.setItem(PLAYERS_REGISTRY_KEY, JSON.stringify(finalPlayers));
    return finalPlayers;
  } catch (e) {
    console.error('Failed to import players to registry', e);
    return loadRegistryPlayers();
  }
}

/**
 * Groups players by category and sorts them by shirt number
 */
export function getPlayersGroupedByCategory(players?: RegistryPlayer[]): CategoryPlayerGroup[] {
  const list = players || loadRegistryPlayers();

  // Create a map keyed by category
  const groupsMap = new Map<string, RegistryPlayer[]>();

  // Ensure standard categories exist in map in specific order
  REGISTRY_CATEGORIES.forEach((cat) => {
    groupsMap.set(cat.id, []);
  });

  list.forEach((p) => {
    const catId = p.category || 'altro';
    if (!groupsMap.has(catId)) {
      groupsMap.set(catId, []);
    }
    groupsMap.get(catId)!.push(p);
  });

  const result: CategoryPlayerGroup[] = [];

  groupsMap.forEach((playersInCat, catId) => {
    // Sort players in category by shirt number
    playersInCat.sort((a, b) => a.number - b.number);
    result.push({
      categoryId: catId,
      categoryName: getCategoryLabel(catId),
      count: playersInCat.length,
      players: playersInCat,
    });
  });

  return result;
}
