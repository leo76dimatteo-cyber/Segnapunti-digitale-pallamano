import React, { useState } from 'react';
import { MatchState } from '../types';
import { CATEGORIES } from '../utils/categories';
import { generateMatchReportPDF } from '../utils/pdfGenerator';
import { exportStandaloneHTML } from '../utils/exportHtml';
import { exportMatchJson } from '../utils/jsonExport';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  Share2, 
  Check, 
  Award,
  ShieldAlert,
  FileCode,
  FileJson
} from 'lucide-react';

interface OfficialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchState: MatchState;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({
  isOpen,
  onClose,
  matchState,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentCategory = CATEGORIES[matchState.settings.category] || CATEGORIES.under_14;
  const isU14 = currentCategory.isU14Format;

  const handlePrintNative = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateMatchReportPDF(matchState);
  };

  const handleCopySummary = () => {
    const winnerText = isU14
      ? matchState.homeTotalPoints > matchState.awayTotalPoints
        ? `Vittoria ${matchState.homeTeam.name}`
        : matchState.awayTotalPoints > matchState.homeTotalPoints
        ? `Vittoria ${matchState.awayTeam.name}`
        : 'Pareggio'
      : matchState.homeTotalGoals > matchState.awayTotalGoals
      ? `Vittoria ${matchState.homeTeam.name}`
      : matchState.awayTotalGoals > matchState.homeTotalGoals
      ? `Vittoria ${matchState.awayTeam.name}`
      : 'Pareggio';

    let text = `🤾 RISULTATO PARTITA PALLAMANO FIGH\n`;
    text += `🏆 ${currentCategory.name} - ${matchState.settings.championship || ''}\n`;
    text += `📅 ${matchState.settings.matchDate} | ${matchState.settings.venue || ''}\n\n`;
    text += `🔴 ${matchState.homeTeam.name} vs 🔵 ${matchState.awayTeam.name}\n`;

    if (isU14) {
      text += `⭐ RISULTATO UFFICIALE A PUNTI: ${matchState.homeTotalPoints} - ${matchState.awayTotalPoints} (${winnerText})\n`;
      text += `📊 Dettaglio Tempi:\n`;
      matchState.periodResults.forEach(p => {
        text += `  • ${p.period}°T: ${p.homeGoals}-${p.awayGoals} -> Punti: ${p.homePoints}-${p.awayPoints}\n`;
      });
      text += `📈 Totale Reti Gara: ${matchState.homeTotalGoals} - ${matchState.awayTotalGoals}\n`;
    } else {
      text += `⭐ RISULTATO FINALE: ${matchState.homeTotalGoals} - ${matchState.awayTotalGoals} (${winnerText})\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in print:p-0 print:bg-white">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col print:max-w-none print:border-none print:bg-white print:text-black print:p-0 print:max-h-none">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Referto Ufficiale di Gara FIGH
              </h3>
              <p className="text-xs text-slate-400">
                Anteprima e generazione PDF / Stampa A4 conforme alle disposizioni federali
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySummary}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border border-slate-700"
              title="Copia riassunto per WhatsApp o social"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
              <span>{copied ? 'Copiato!' : 'Condividi'}</span>
            </button>

            <button
              onClick={handlePrintNative}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border border-slate-700"
              title="Stampa con la finestra nativa del browser (funziona 100% offline)"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Stampa A4</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95"
              title="Scarica referto in formato PDF vettoriale"
            >
              <Download className="w-4 h-4" />
              <span>Scarica PDF</span>
            </button>

            <button
              onClick={() => exportStandaloneHTML(matchState)}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              title="Scarica come file HTML singolo"
            >
              <FileCode className="w-4 h-4" />
              <span>HTML</span>
            </button>

            <button
              onClick={() => exportMatchJson(matchState)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              title="Salva ed esporta la partita completa in formato JSON"
            >
              <FileJson className="w-4 h-4 text-amber-400" />
              <span>Partita JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Scoresheet Container */}
        <div id="printable-match-sheet" className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1 print:overflow-visible print:space-y-3">
          {/* Official Federal Header */}
          <div className="border border-slate-700 print:border-black rounded-2xl p-4 bg-slate-950/70 print:bg-white print:text-black">
            <div className="text-center pb-3 border-b border-slate-800 print:border-black">
              <h2 className="font-extrabold text-sm sm:text-base tracking-widest uppercase text-amber-400 print:text-black">
                FEDERAZIONE ITALIANA GIUOCO HANDBALL
              </h2>
              <h3 className="text-xs text-slate-400 print:text-gray-700 font-semibold mt-0.5">
                REFERTO DIGITALE DI GARA • STAGIONE AGONISTICA 2026/2027
              </h3>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
              <div>
                <span className="text-slate-400 print:text-gray-600 text-[10px] uppercase font-bold block">Campionato:</span>
                <strong className="text-slate-200 print:text-black">{matchState.settings.championship || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-600 text-[10px] uppercase font-bold block">Categoria:</span>
                <strong className="text-amber-300 print:text-black">{currentCategory.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-600 text-[10px] uppercase font-bold block">Gara N° / Codice:</span>
                <strong className="text-slate-200 print:text-black">{matchState.settings.matchNumber || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-600 text-[10px] uppercase font-bold block">Data e Ora:</span>
                <strong className="text-slate-200 print:text-black">{matchState.settings.matchDate} {matchState.settings.matchTime}</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-600 text-[10px] uppercase font-bold block">Impianto / Campo:</span>
                <strong className="text-slate-200 print:text-black">{matchState.settings.venue || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-600 text-[10px] uppercase font-bold block">1° Arbitro:</span>
                <strong className="text-slate-200 print:text-black">{matchState.settings.referee1 || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-600 text-[10px] uppercase font-bold block">2° Arbitro:</span>
                <strong className="text-slate-200 print:text-black">{matchState.settings.referee2 || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-600 text-[10px] uppercase font-bold block">Segnapunti / Crono:</span>
                <strong className="text-slate-200 print:text-black">{matchState.settings.scorekeeper || '-'} / {matchState.settings.timekeeper || '-'}</strong>
              </div>
            </div>
          </div>

          {/* Scores Banner */}
          <div className="bg-slate-950 print:bg-gray-100 border border-slate-700 print:border-black rounded-2xl p-4 flex items-center justify-between text-center">
            <div className="flex-1">
              <span className="text-xs uppercase font-bold text-red-400 print:text-red-700 block">SQUADRA CASA</span>
              <h4 className="text-lg sm:text-2xl font-black text-white print:text-black mt-0.5">
                {matchState.homeTeam.name}
              </h4>
            </div>

            <div className="px-4">
              <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-amber-400 print:text-black">
                {isU14 
                  ? `${matchState.homeTotalPoints} - ${matchState.awayTotalPoints}`
                  : `${matchState.homeTotalGoals} - ${matchState.awayTotalGoals}`}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 print:text-gray-600 block mt-1">
                {isU14 ? 'RISULTATO UFFICIALE A PUNTI' : 'RISULTATO FINALE (RETI)'}
              </span>
              {isU14 && (
                <div className="text-xs text-slate-400 print:text-gray-700 font-mono mt-1">
                  Totale Reti (statistica): <strong>{matchState.homeTotalGoals} - {matchState.awayTotalGoals}</strong>
                </div>
              )}
            </div>

            <div className="flex-1">
              <span className="text-xs uppercase font-bold text-blue-400 print:text-blue-700 block">SQUADRA OSPITI</span>
              <h4 className="text-lg sm:text-2xl font-black text-white print:text-black mt-0.5">
                {matchState.awayTeam.name}
              </h4>
            </div>
          </div>

          {/* U14 Specific Periods Table or Classic Half Table */}
          {isU14 ? (
            <div className="border border-slate-700 print:border-black rounded-2xl p-3.5 bg-slate-950/60 print:bg-white">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Dettaglio Tempi (Format Sperimentale U14 MHC FIGH)
              </h4>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 print:border-black text-slate-400 print:text-black">
                    <th className="py-1.5 px-2">Tempo</th>
                    <th className="py-1.5 px-2 text-center">Reti {matchState.homeTeam.shortName || 'Casa'}</th>
                    <th className="py-1.5 px-2 text-center">Reti {matchState.awayTeam.shortName || 'Ospiti'}</th>
                    <th className="py-1.5 px-2 text-center">Esito Tempo</th>
                    <th className="py-1.5 px-2 text-right">Punti Assegnati</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {[1, 2, 3].map(pNum => {
                    const pr = matchState.periodResults.find(r => r.period === pNum);
                    return (
                      <tr key={pNum} className="text-slate-300 print:text-black">
                        <td className="py-2 px-2 font-bold">{pNum}° Tempo (15 min)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold">{pr ? pr.homeGoals : 0}</td>
                        <td className="py-2 px-2 text-center font-mono font-bold">{pr ? pr.awayGoals : 0}</td>
                        <td className="py-2 px-2 text-center">
                          {pr ? (
                            pr.homePoints > pr.awayPoints ? `Vittoria ${matchState.homeTeam.shortName || 'Casa'}` :
                            pr.awayPoints > pr.homePoints ? `Vittoria ${matchState.awayTeam.shortName || 'Ospiti'}` :
                            'Pareggio (0.5 ciascuno)'
                          ) : 'Non disputato'}
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-black text-amber-400 print:text-black">
                          {pr ? `${pr.homePoints} pt - ${pr.awayPoints} pt` : '0 pt - 0 pt'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-amber-500/10 print:bg-gray-200 font-bold text-slate-100 print:text-black">
                    <td className="py-2 px-2">TOTALE UFFICIALE GARA</td>
                    <td className="py-2 px-2 text-center font-mono">{matchState.homeTotalGoals}</td>
                    <td className="py-2 px-2 text-center font-mono">{matchState.awayTotalGoals}</td>
                    <td className="py-2 px-2 text-center">
                      {matchState.homeTotalPoints > matchState.awayTotalPoints ? `Vincitore: ${matchState.homeTeam.name}` :
                       matchState.awayTotalPoints > matchState.homeTotalPoints ? `Vincitore: ${matchState.awayTeam.name}` :
                       'Pareggio'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-black text-amber-400 print:text-black">
                      {matchState.homeTotalPoints} PUNTI - {matchState.awayTotalPoints} PUNTI
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-slate-700 print:border-black rounded-2xl p-3.5 bg-slate-950/60 print:bg-white">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black mb-2">
                Riepilogo Tempi
              </h4>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 print:border-black text-slate-400 print:text-black">
                    <th className="py-1.5 px-2">Periodo</th>
                    <th className="py-1.5 px-2 text-center">Reti {matchState.homeTeam.name}</th>
                    <th className="py-1.5 px-2 text-center">Reti {matchState.awayTeam.name}</th>
                    <th className="py-1.5 px-2 text-right">Progressivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  <tr className="text-slate-300 print:text-black">
                    <td className="py-2 px-2 font-bold">1° Tempo</td>
                    <td className="py-2 px-2 text-center font-mono">{matchState.goals.filter(g => g.team === 'home' && g.period === 1).length}</td>
                    <td className="py-2 px-2 text-center font-mono">{matchState.goals.filter(g => g.team === 'away' && g.period === 1).length}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold">
                      {matchState.goals.filter(g => g.team === 'home' && g.period === 1).length} - {matchState.goals.filter(g => g.team === 'away' && g.period === 1).length}
                    </td>
                  </tr>
                  <tr className="text-slate-300 print:text-black">
                    <td className="py-2 px-2 font-bold">2° Tempo</td>
                    <td className="py-2 px-2 text-center font-mono">{matchState.goals.filter(g => g.team === 'home' && g.period === 2).length}</td>
                    <td className="py-2 px-2 text-center font-mono">{matchState.goals.filter(g => g.team === 'away' && g.period === 2).length}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold">
                      {matchState.homeTotalGoals} - {matchState.awayTotalGoals}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Rosters and Scorers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Home Roster */}
            <div className="border border-slate-700 print:border-black rounded-2xl p-3 bg-slate-950/60 print:bg-white">
              <h5 className="text-xs font-bold text-red-400 print:text-black mb-2 uppercase">
                {matchState.homeTeam.name} (Distinta &amp; Reti)
              </h5>
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 print:border-black text-slate-400 print:text-black text-left">
                    <th className="py-1 px-1.5">N°</th>
                    <th className="py-1 px-1.5">Giocatore</th>
                    <th className="py-1 px-1.5 text-center">Reti</th>
                    <th className="py-1 px-1.5 text-right">Sanzioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  {matchState.homeTeam.players.map(p => {
                    const gCount = matchState.goals.filter(g => g.team === 'home' && g.playerId === p.id).length;
                    const sList = matchState.sanctions.filter(s => s.team === 'home' && s.playerId === p.id);
                    return (
                      <tr key={p.id} className="text-slate-300 print:text-black">
                        <td className="py-1 px-1.5 font-mono font-bold">#{p.number}</td>
                        <td className="py-1 px-1.5">{p.name} {p.role === 'Portiere' ? '(P)' : p.role === 'Capitano' ? '(C)' : ''}</td>
                        <td className="py-1 px-1.5 text-center font-mono font-bold">{gCount}</td>
                        <td className="py-1 px-1.5 text-right font-mono text-[10px]">
                          {sList.map(s => s.type === 'yellow' ? 'G ' : s.type === '2min' ? '2\' ' : s.type === 'red' ? 'R ' : 'B ').join('') || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Away Roster */}
            <div className="border border-slate-700 print:border-black rounded-2xl p-3 bg-slate-950/60 print:bg-white">
              <h5 className="text-xs font-bold text-blue-400 print:text-black mb-2 uppercase">
                {matchState.awayTeam.name} (Distinta &amp; Reti)
              </h5>
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 print:border-black text-slate-400 print:text-black text-left">
                    <th className="py-1 px-1.5">N°</th>
                    <th className="py-1 px-1.5">Giocatore</th>
                    <th className="py-1 px-1.5 text-center">Reti</th>
                    <th className="py-1 px-1.5 text-right">Sanzioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  {matchState.awayTeam.players.map(p => {
                    const gCount = matchState.goals.filter(g => g.team === 'away' && g.playerId === p.id).length;
                    const sList = matchState.sanctions.filter(s => s.team === 'away' && s.playerId === p.id);
                    return (
                      <tr key={p.id} className="text-slate-300 print:text-black">
                        <td className="py-1 px-1.5 font-mono font-bold">#{p.number}</td>
                        <td className="py-1 px-1.5">{p.name} {p.role === 'Portiere' ? '(P)' : p.role === 'Capitano' ? '(C)' : ''}</td>
                        <td className="py-1 px-1.5 text-center font-mono font-bold">{gCount}</td>
                        <td className="py-1 px-1.5 text-right font-mono text-[10px]">
                          {sList.map(s => s.type === 'yellow' ? 'G ' : s.type === '2min' ? '2\' ' : s.type === 'red' ? 'R ' : 'B ').join('') || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sanctions Log */}
          {matchState.sanctions.length > 0 && (
            <div className="border border-slate-700 print:border-black rounded-2xl p-3 bg-slate-950/60 print:bg-white">
              <h5 className="text-xs font-bold text-slate-300 print:text-black mb-2 uppercase flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Registro Sanzioni Disciplinari
              </h5>
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 print:border-black text-slate-400 print:text-black text-left">
                    <th className="py-1 px-2">Minuto/Tempo</th>
                    <th className="py-1 px-2">Squadra</th>
                    <th className="py-1 px-2">Giocatore</th>
                    <th className="py-1 px-2 text-right">Provvedimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  {matchState.sanctions.map(s => (
                    <tr key={s.id} className="text-slate-300 print:text-black">
                      <td className="py-1 px-2 font-mono">{s.period}°T ({s.minute}'{s.second < 10 ? '0' : ''}{s.second}")</td>
                      <td className="py-1 px-2">{s.team === 'home' ? matchState.homeTeam.name : matchState.awayTeam.name}</td>
                      <td className="py-1 px-2">#{s.playerNumber} {s.playerName}</td>
                      <td className="py-1 px-2 text-right font-bold">
                        {s.type === 'yellow' ? 'Ammonizione (Giallo)' :
                         s.type === '2min' ? '2 Minuti (Esclusione)' :
                         s.type === 'red' ? 'Squalifica (Rosso)' :
                         'Squalifica con Rapporto (Blu)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures Section */}
          <div className="border border-slate-700 print:border-black rounded-2xl p-4 bg-slate-950/60 print:bg-white mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs text-slate-400 print:text-black">
              <div>
                <div className="h-10 border-b border-slate-700 print:border-black"></div>
                <span className="mt-1 block text-[10px]">Firma 1° Arbitro</span>
              </div>
              <div>
                <div className="h-10 border-b border-slate-700 print:border-black"></div>
                <span className="mt-1 block text-[10px]">Firma 2° Arbitro</span>
              </div>
              <div>
                <div className="h-10 border-b border-slate-700 print:border-black"></div>
                <span className="mt-1 block text-[10px]">Firma Segnapunti</span>
              </div>
              <div>
                <div className="h-10 border-b border-slate-700 print:border-black"></div>
                <span className="mt-1 block text-[10px]">Firma Dirigenti</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
