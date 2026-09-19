import React, { useState } from 'react';
import { MatchState, MatchSettings, CategoryId, Team } from '../types';
import { CATEGORIES } from '../utils/categories';
import { Settings, X, Check, Save, Trophy, Shield, Clock, UserCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchState: MatchState;
  onSaveSettings: (settings: MatchSettings, homeTeam: Team, awayTeam: Team) => void;
  onChangeCategory: (newCat: CategoryId) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  matchState,
  onSaveSettings,
  onChangeCategory,
}) => {
  const [settings, setSettings] = useState<MatchSettings>({ ...matchState.settings });
  const [homeTeam, setHomeTeam] = useState<Team>({ ...matchState.homeTeam });
  const [awayTeam, setAwayTeam] = useState<Team>({ ...matchState.awayTeam });
  const [activeTab, setActiveTab] = useState<'category' | 'match_info' | 'teams'>('category');

  if (!isOpen) return null;

  const handleCategorySelect = (catId: CategoryId) => {
    const cat = CATEGORIES[catId];
    setSettings(prev => ({
      ...prev,
      category: catId,
      periodDurationMinutes: cat.periodDurationMinutes,
      intervalDurationMinutes: cat.intervalDurationMinutes,
      totalPeriods: cat.totalPeriods,
    }));
    onChangeCategory(catId);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(settings, homeTeam, awayTeam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Impostazioni Partita &amp; Regolamento
              </h3>
              <p className="text-xs text-slate-400">
                Configurazione categoria, durata tempi, arbitri e squadre
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mt-4 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('category')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'category' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Categoria &amp; Tempi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'teams' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Squadre &amp; Colori</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('match_info')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'match_info' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Referto &amp; Ufficiali</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {/* TAB 1: CATEGORY & TIMING */}
          {activeTab === 'category' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Seleziona Categoria FIGH:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(CATEGORIES) as CategoryId[]).map((catId) => {
                    const cat = CATEGORIES[catId];
                    const isSelected = settings.category === catId;
                    return (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => handleCategorySelect(catId)}
                        className={`p-3.5 rounded-2xl border text-left transition relative ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-100">
                            {cat.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                          {cat.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timing parameters for selected category */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Parametri Minutaggi (Personalizzabili)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Numero Periodi/Tempi:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={settings.totalPeriods}
                      onChange={(e) => setSettings({ ...settings, totalPeriods: parseInt(e.target.value, 10) || 2 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Durata Tempo (minuti):
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={settings.periodDurationMinutes}
                      onChange={(e) => setSettings({ ...settings, periodDurationMinutes: parseInt(e.target.value, 10) || 15 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Durata Intervallo (min):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.intervalDurationMinutes}
                      onChange={(e) => setSettings({ ...settings, intervalDurationMinutes: parseInt(e.target.value, 10) || 5 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEAMS & COLORS */}
          {activeTab === 'teams' && (
            <div className="space-y-4">
              {/* Home Team */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-red-900/40 space-y-3">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                  Squadra Casa:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Nome Squadra:</label>
                    <input
                      type="text"
                      value={homeTeam.name}
                      onChange={(e) => setHomeTeam({ ...homeTeam, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Sigla / Breve:</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={homeTeam.shortName}
                      onChange={(e) => setHomeTeam({ ...homeTeam, shortName: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Away Team */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-blue-900/40 space-y-3">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                  Squadra Ospiti:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Nome Squadra:</label>
                    <input
                      type="text"
                      value={awayTeam.name}
                      onChange={(e) => setAwayTeam({ ...awayTeam, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Sigla / Breve:</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={awayTeam.shortName}
                      onChange={(e) => setAwayTeam({ ...awayTeam, shortName: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REFERTO & UFFICIALI */}
          {activeTab === 'match_info' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Campionato:</label>
                  <input
                    type="text"
                    value={settings.championship}
                    onChange={(e) => setSettings({ ...settings, championship: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Gara N° / Codice FIGH:</label>
                  <input
                    type="text"
                    value={settings.matchNumber}
                    onChange={(e) => setSettings({ ...settings, matchNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Impianto / Palasport:</label>
                  <input
                    type="text"
                    value={settings.venue}
                    onChange={(e) => setSettings({ ...settings, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Data Gara:</label>
                  <input
                    type="date"
                    value={settings.matchDate}
                    onChange={(e) => setSettings({ ...settings, matchDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">1° Arbitro:</label>
                  <input
                    type="text"
                    value={settings.referee1}
                    onChange={(e) => setSettings({ ...settings, referee1: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">2° Arbitro:</label>
                  <input
                    type="text"
                    value={settings.referee2}
                    onChange={(e) => setSettings({ ...settings, referee2: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Segnapunti:</label>
                  <input
                    type="text"
                    value={settings.scorekeeper}
                    onChange={(e) => setSettings({ ...settings, scorekeeper: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Cronometrista:</label>
                  <input
                    type="text"
                    value={settings.timekeeper}
                    onChange={(e) => setSettings({ ...settings, timekeeper: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Salva Impostazioni</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
