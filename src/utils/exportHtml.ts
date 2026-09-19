import { MatchState } from '../types';
import { CATEGORIES } from './categories';

/**
 * Generates an ultra-lightweight, 100% self-contained standalone HTML report & interactive scoreboard
 * that can be opened locally in any browser without internet connection or external servers.
 */
export function exportStandaloneHTML(state: MatchState): void {
  const cat = CATEGORIES[state.settings.category] || CATEGORIES.under_14;
  const isU14 = cat.isU14Format;

  const htmlContent = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Referto Pallamano: ${state.homeTeam.name} vs ${state.awayTeam.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #0f172a; color: #f8fafc; padding: 16px; line-height: 1.5; }
    .container { max-width: 900px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 16px; margin-bottom: 20px; }
    .header h1 { font-size: 20px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px; }
    .header h2 { font-size: 14px; color: #94a3b8; font-weight: normal; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; background: #0f172a; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
    .meta-grid div span { color: #94a3b8; }
    .score-banner { display: flex; align-items: center; justify-content: space-between; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center; }
    .team-box { flex: 1; }
    .team-name { font-size: 22px; font-weight: 800; }
    .team-home { color: #ef4444; }
    .team-away { color: #3b82f6; }
    .score-center { padding: 0 20px; }
    .big-score { font-size: 44px; font-weight: 900; font-family: monospace; color: #f8fafc; letter-spacing: 4px; }
    .score-type { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #f59e0b; font-weight: bold; }
    .stat-goals { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    th { background: #334155; color: #f8fafc; text-align: left; padding: 8px 12px; font-weight: 600; }
    td { padding: 8px 12px; border-bottom: 1px solid #334155; }
    tr:nth-child(even) { background: rgba(255,255,255,0.02); }
    .section-title { font-size: 15px; font-weight: 700; color: #f8fafc; margin: 20px 0 10px; display: flex; align-items: center; gap: 8px; }
    .tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .tag-yellow { background: #eab308; color: #000; }
    .tag-2min { background: #f97316; color: #fff; }
    .tag-red { background: #ef4444; color: #fff; }
    .tag-blue { background: #2563eb; color: #fff; }
    .print-btn { display: inline-block; background: #2563eb; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 16px; }
    .print-btn:hover { background: #1d4ed8; }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .container { background: #fff; box-shadow: none; padding: 0; }
      .print-btn { display: none; }
      .meta-grid, .score-banner { background: #f8fafc; border: 1px solid #ccc; color: #000; }
      th { background: #e2e8f0; color: #000; }
      td { border-bottom: 1px solid #e2e8f0; color: #000; }
      .big-score { color: #000; }
    }
  </style>
</head>
<body>
  <div class="container">
    <button class="print-btn" onclick="window.print()">🖨️ Stampa / Salva in PDF nativo</button>
    <div class="header">
      <h1>FEDERAZIONE ITALIANA GIUOCO HANDBALL</h1>
      <h2>REFERTO DI GARA DIGITALE AUTOSUFFICIENTE</h2>
    </div>

    <div class="meta-grid">
      <div><span>Categoria:</span> <strong>${cat.name}</strong></div>
      <div><span>Campionato:</span> <strong>${state.settings.championship || '-'}</strong></div>
      <div><span>Data/Ora:</span> <strong>${state.settings.matchDate} ${state.settings.matchTime}</strong></div>
      <div><span>Impianto:</span> <strong>${state.settings.venue || '-'}</strong></div>
      <div><span>Gara N°:</span> <strong>${state.settings.matchNumber || '-'}</strong></div>
      <div><span>1° Arbitro:</span> <strong>${state.settings.referee1 || '-'}</strong></div>
      <div><span>2° Arbitro:</span> <strong>${state.settings.referee2 || '-'}</strong></div>
      <div><span>Segnapunti:</span> <strong>${state.settings.scorekeeper || '-'}</strong></div>
    </div>

    <div class="score-banner">
      <div class="team-box team-home">
        <div class="team-name">${state.homeTeam.name}</div>
        <div style="font-size:12px; color:#94a3b8">CASA</div>
      </div>
      <div class="score-center">
        <div class="big-score">${isU14 ? `${state.homeTotalPoints} - ${state.awayTotalPoints}` : `${state.homeTotalGoals} - ${state.awayTotalGoals}`}</div>
        <div class="score-type">${isU14 ? 'Punti Ufficiali (Format MHC FIGH)' : 'Risultato Finale Reti'}</div>
        ${isU14 ? `<div class="stat-goals">Reti totali gara (statistica): ${state.homeTotalGoals} - ${state.awayTotalGoals}</div>` : ''}
      </div>
      <div class="team-box team-away">
        <div class="team-name">${state.awayTeam.name}</div>
        <div style="font-size:12px; color:#94a3b8">OSPITI</div>
      </div>
    </div>

    ${isU14 ? `
      <div class="section-title">📊 Dettaglio Tempi (Regolamento Sperimentale U14 FIGH 2026/2027)</div>
      <table>
        <thead>
          <tr>
            <th>Periodo</th>
            <th>Reti nel Tempo</th>
            <th>Esito</th>
            <th>Punti Assegnati</th>
          </tr>
        </thead>
        <tbody>
          ${state.periodResults.map(p => `
            <tr>
              <td><strong>${p.period}° Tempo</strong></td>
              <td>${p.homeGoals} - ${p.awayGoals}</td>
              <td>${p.homePoints > p.awayPoints ? 'Vittoria Casa' : p.awayPoints > p.homePoints ? 'Vittoria Ospiti' : 'Pareggio'}</td>
              <td><strong>${p.homePoints} - ${p.awayPoints}</strong></td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold; background: rgba(239,68,68,0.1)">
            <td>TOTALE PUNTI GARA</td>
            <td>${state.homeTotalGoals} - ${state.awayTotalGoals} (Reti)</td>
            <td>${state.homeTotalPoints > state.awayTotalPoints ? state.homeTeam.name : state.awayTotalPoints > state.homeTotalPoints ? state.awayTeam.name : 'Pareggio'}</td>
            <td>${state.homeTotalPoints} - ${state.awayTotalPoints} PUNTI</td>
          </tr>
        </tbody>
      </table>
    ` : ''}

    <div class="section-title">🏃 Marcatori & Sanzioni: ${state.homeTeam.name}</div>
    <table>
      <thead>
        <tr><th>N°</th><th>Giocatore</th><th>Ruolo</th><th>Gol</th><th>Sanzioni</th></tr>
      </thead>
      <tbody>
        ${state.homeTeam.players.map(p => {
          const gCount = state.goals.filter(g => g.team === 'home' && g.playerId === p.id).length;
          const sList = state.sanctions.filter(s => s.team === 'home' && s.playerId === p.id);
          return `<tr>
            <td><strong>#${p.number}</strong></td>
            <td>${p.name}</td>
            <td>${p.role || 'Giocatore'}</td>
            <td><strong>${gCount}</strong></td>
            <td>${sList.map(s => `<span class="tag tag-${s.type}">${s.type}</span> `).join('') || '-'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <div class="section-title">🏃 Marcatori & Sanzioni: ${state.awayTeam.name}</div>
    <table>
      <thead>
        <tr><th>N°</th><th>Giocatore</th><th>Ruolo</th><th>Gol</th><th>Sanzioni</th></tr>
      </thead>
      <tbody>
        ${state.awayTeam.players.map(p => {
          const gCount = state.goals.filter(g => g.team === 'away' && g.playerId === p.id).length;
          const sList = state.sanctions.filter(s => s.team === 'away' && s.playerId === p.id);
          return `<tr>
            <td><strong>#${p.number}</strong></td>
            <td>${p.name}</td>
            <td>${p.role || 'Giocatore'}</td>
            <td><strong>${gCount}</strong></td>
            <td>${sList.map(s => `<span class="tag tag-${s.type}">${s.type}</span> `).join('') || '-'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <div class="section-title">📋 Registro Sanzioni Disciplinari</div>
    <table>
      <thead><tr><th>Minuto</th><th>Squadra</th><th>Giocatore</th><th>Tipo</th></tr></thead>
      <tbody>
        ${state.sanctions.length > 0 ? state.sanctions.map(s => `
          <tr>
            <td>${s.period}°T - ${s.minute}'${s.second < 10 ? '0' : ''}${s.second}"</td>
            <td>${s.team === 'home' ? state.homeTeam.name : state.awayTeam.name}</td>
            <td>#${s.playerNumber} ${s.playerName}</td>
            <td><span class="tag tag-${s.type}">${s.type.toUpperCase()}</span></td>
          </tr>
        `).join('') : '<tr><td colspan="4">Nessuna sanzione registrata.</td></tr>'}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Referto_Autonomo_${state.homeTeam.shortName || 'CASA'}_vs_${state.awayTeam.shortName || 'OSPITI'}_${state.settings.matchDate}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
