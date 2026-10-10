import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatchState, GoalkeeperStat } from '../types';
import { CATEGORIES } from './categories';

/**
 * Genera ed esporta il referto ufficiale di gara in formato PDF conforme agli standard FIGH
 * Include:
 * 1. Intestazione federale ufficiale e dettagli incontro
 * 2. Riepilogo punteggio gara e dettaglio periodi/tempi (inclusa Circolare 47 per Under 14)
 * 3. Distinte giocatori e marcatori (Casa e Ospiti) con riepilogo sanzioni
 * 4. Statistiche complete rendimento portieri (parate, rigori 7m, gol subiti, % efficienza, gol fatti)
 * 5. Registro cronologico provvedimenti disciplinari (gialli, 2', rossi, blu)
 * 6. Sequenza cronologica marcature / timeline reti
 * 7. Riquadri per firme ufficiali di gara (Arbitri, Segnapunti, Cronometrista, Dirigenti)
 */
export function generateMatchReportPDF(state: MatchState): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const cat = CATEGORIES[state.settings.category] || CATEGORIES.under_14;
  const isU14 = cat.isU14Format;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 10;
  const contentWidth = pageWidth - (marginX * 2); // 190mm on A4

  // --- 1. FEDERATION HEADER BANNER ---
  // Navy background header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(marginX, 8, contentWidth, 18, 'F');

  // Gold accent line underneath
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(marginX, 26, contentWidth, 1.2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('FEDERAZIONE ITALIANA GIUOCO HANDBALL', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240); // slate-200
  doc.text('REFERTO UFFICIALE DIGITALE DI GARA • STAGIONE AGONISTICA 2026/2027', pageWidth / 2, 21.5, { align: 'center' });

  // --- 2. MATCH METADATA GRID ---
  const metaY = 30;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(marginX, metaY, contentWidth, 20, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFont('helvetica', 'bold');

  // Column 1
  doc.text(`Campionato: ${state.settings.championship || 'N/D'}`, marginX + 3, metaY + 5);
  doc.text(`Categoria: ${cat.name}`, marginX + 3, metaY + 10);
  doc.text(`Gara N°: ${state.settings.matchNumber || 'N/D'}`, marginX + 3, metaY + 15);

  // Column 2
  doc.text(`Data: ${state.settings.matchDate || 'N/D'}`, marginX + 65, metaY + 5);
  doc.text(`Ora d'inizio: ${state.settings.matchTime || 'N/D'}`, marginX + 65, metaY + 10);
  doc.text(`Impianto: ${state.settings.venue || 'N/D'}`, marginX + 65, metaY + 15);

  // Column 3
  doc.text(`1° Arbitro: ${state.settings.referee1 || 'N/D'}`, marginX + 130, metaY + 5);
  doc.text(`2° Arbitro: ${state.settings.referee2 || 'N/D'}`, marginX + 130, metaY + 10);
  doc.text(`Segnapunti / Crono: ${state.settings.scorekeeper || 'N/D'} / ${state.settings.timekeeper || 'N/D'}`, marginX + 130, metaY + 15);

  // --- 3. TEAMS & SCORE BANNER ---
  const teamBannerY = metaY + 23;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, teamBannerY, contentWidth, 24, 2, 2, 'FD');

  // Home Team Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(220, 38, 38); // red-600
  doc.text(state.homeTeam.name.toUpperCase(), marginX + 35, teamBannerY + 8, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('(SQUADRA CASA)', marginX + 35, teamBannerY + 13, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Reti Totali: ${state.homeTotalGoals}`, marginX + 35, teamBannerY + 18, { align: 'center' });

  // Away Team Block
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(state.awayTeam.name.toUpperCase(), marginX + contentWidth - 35, teamBannerY + 8, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('(SQUADRA OSPITI)', marginX + contentWidth - 35, teamBannerY + 13, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Reti Totali: ${state.awayTotalGoals}`, marginX + contentWidth - 35, teamBannerY + 18, { align: 'center' });

  // Center Score Display
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);

  if (isU14) {
    doc.text(`${state.homeTotalPoints}  -  ${state.awayTotalPoints}`, pageWidth / 2, teamBannerY + 10, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text('RISULTATO UFFICIALE A PUNTI (Circolare FIGH n. 47)', pageWidth / 2, teamBannerY + 15, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const u14Winner = state.homeTotalPoints > state.awayTotalPoints 
      ? `Vittoria: ${state.homeTeam.name}` 
      : state.awayTotalPoints > state.homeTotalPoints 
      ? `Vittoria: ${state.awayTeam.name}` 
      : 'Incontro terminato in Pareggio';
    doc.text(`${u14Winner} • Reti Gara: ${state.homeTotalGoals} - ${state.awayTotalGoals}`, pageWidth / 2, teamBannerY + 20, { align: 'center' });
  } else {
    doc.text(`${state.homeTotalGoals}  -  ${state.awayTotalGoals}`, pageWidth / 2, teamBannerY + 11, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    const winner = state.homeTotalGoals > state.awayTotalGoals 
      ? `Vittoria: ${state.homeTeam.name}` 
      : state.awayTotalGoals > state.homeTotalGoals 
      ? `Vittoria: ${state.awayTeam.name}` 
      : 'Incontro terminato in Pareggio';
    doc.text(`RISULTATO FINALE: ${winner}`, pageWidth / 2, teamBannerY + 18, { align: 'center' });
  }

  // --- 4. PERIODS BREAKDOWN TABLE ---
  let curY = teamBannerY + 27;

  if (isU14) {
    const periodRows: (string | number)[][] = [];
    const maxPeriods = state.settings.totalPeriods || 3;
    const pDur = state.settings.periodDurationMinutes || 20;

    for (let p = 1; p <= maxPeriods; p++) {
      const pr = state.periodResults.find(r => r.period === p);
      if (pr) {
        periodRows.push([
          `${p}° Tempo (${pDur} min)`,
          `${pr.homeGoals} - ${pr.awayGoals}`,
          pr.homePoints > pr.awayPoints ? `Vittoria ${state.homeTeam.shortName || 'Casa'}` : pr.awayPoints > pr.homePoints ? `Vittoria ${state.awayTeam.shortName || 'Ospiti'}` : 'Pareggio',
          `${pr.homePoints} pt - ${pr.awayPoints} pt`
        ]);
      } else if (p === state.currentPeriod && !state.isMatchOver) {
        periodRows.push([
          `${p}° Tempo (${pDur} min - IN CORSO)`,
          `${state.homePeriodGoals} - ${state.awayPeriodGoals}`,
          'In svolgimento',
          'Da assegnare a fine tempo'
        ]);
      } else {
        periodRows.push([`${p}° Tempo (${pDur} min)`, '0 - 0', 'Non disputato', '0 pt - 0 pt']);
      }
    }

    periodRows.push([
      'TOTALE UFFICIALE GARA',
      `${state.homeTotalGoals} - ${state.awayTotalGoals} (Reti complessive)`,
      state.homeTotalPoints > state.awayTotalPoints ? `Vincitore: ${state.homeTeam.name}` : state.awayTotalPoints > state.homeTotalPoints ? `Vincitore: ${state.awayTeam.name}` : 'Pareggio',
      `${state.homeTotalPoints} PUNTI - ${state.awayTotalPoints} PUNTI`
    ]);

    autoTable(doc, {
      startY: curY,
      head: [['Periodo / Frazione di Gioco', 'Reti nel Tempo', 'Esito Frazione', 'Punti Assegnati (1 pt vittoria, 0.5 pt pari)']],
      body: periodRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
      bodyStyles: { fontSize: 7.2, textColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 46, fontStyle: 'bold' },
        1: { cellWidth: 38, halign: 'center' },
        2: { cellWidth: 46, halign: 'center' },
        3: { cellWidth: 60, halign: 'center', fontStyle: 'bold' }
      },
      margin: { left: marginX, right: marginX },
      didParseCell: (data) => {
        if (data.row.index === periodRows.length - 1) {
          data.cell.styles.fillColor = [254, 242, 242];
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  } else {
    const half1GoalsHome = state.goals.filter(g => g.team === 'home' && g.period === 1).length;
    const half1GoalsAway = state.goals.filter(g => g.team === 'away' && g.period === 1).length;
    const half2GoalsHome = state.goals.filter(g => g.team === 'home' && g.period === 2).length;
    const half2GoalsAway = state.goals.filter(g => g.team === 'away' && g.period === 2).length;

    autoTable(doc, {
      startY: curY,
      head: [['Frazione di Gioco', 'Reti Casa', 'Reti Ospiti', 'Progressivo Gara']],
      body: [
        ['1° Tempo', `${half1GoalsHome}`, `${half1GoalsAway}`, `${half1GoalsHome} - ${half1GoalsAway}`],
        ['2° Tempo', `${half2GoalsHome}`, `${half2GoalsAway}`, `${half1GoalsHome + half2GoalsHome} - ${half1GoalsAway + half2GoalsAway}`],
        ['RISULTATO FINALE', `${state.homeTotalGoals}`, `${state.awayTotalGoals}`, `${state.homeTotalGoals} - ${state.awayTotalGoals}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
      bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], halign: 'center' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold', cellWidth: 50 }, 3: { fontStyle: 'bold' } },
      margin: { left: marginX, right: marginX },
      didParseCell: (data) => {
        if (data.row.index === 2) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  }

  // Helper to compile player stats
  const calcPlayerStats = (team: 'home' | 'away') => {
    const pList = team === 'home' ? state.homeTeam.players : state.awayTeam.players;
    let totalTeamGoals = 0;

    const rows = pList.map(p => {
      const goalsCount = state.goals.filter(g => g.team === team && g.playerId === p.id).length;
      totalTeamGoals += goalsCount;

      const yellowCount = state.sanctions.filter(s => s.team === team && s.playerId === p.id && s.type === 'yellow').length;
      const twoMinCount = state.sanctions.filter(s => s.team === team && s.playerId === p.id && s.type === '2min').length;
      const redCount = state.sanctions.filter(s => s.team === team && s.playerId === p.id && s.type === 'red').length;
      const blueCount = state.sanctions.filter(s => s.team === team && s.playerId === p.id && s.type === 'blue').length;

      let sanzioniStr = '';
      if (yellowCount > 0) sanzioniStr += 'A ';
      if (twoMinCount > 0) sanzioniStr += `2'(${twoMinCount}) `;
      if (redCount > 0) sanzioniStr += 'R ';
      if (blueCount > 0) sanzioniStr += 'B ';
      if (!sanzioniStr) sanzioniStr = '-';

      const roleBadge = p.role === 'Portiere' ? ' (P)' : p.role === 'Capitano' ? ' (C)' : '';

      return [
        p.number.toString(),
        p.name + roleBadge,
        goalsCount.toString(),
        sanzioniStr.trim()
      ];
    });

    // Add total row
    if (rows.length > 0) {
      rows.push([
        '',
        'TOTALE RETI SQUADRA',
        totalTeamGoals.toString(),
        ''
      ]);
    }

    return rows;
  };

  const homeStats = calcPlayerStats('home');
  const awayStats = calcPlayerStats('away');

  // --- 5. ROSTER & SCORERS TABLES ---
  // If not enough room for home roster, add page
  if (curY > 215) {
    doc.addPage();
    curY = 15;
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(`DISTINTA & MARCATORI: ${state.homeTeam.name.toUpperCase()} (CASA)`, marginX, curY + 3);

  autoTable(doc, {
    startY: curY + 4.5,
    head: [['N°', 'Cognome e Nome / Ruolo', 'Reti', 'Sanzioni Disciplinari (A, 2\', R, B)']],
    body: homeStats.length > 0 ? homeStats : [['-', 'Nessun atleta registrato in distinta', '0', '-']],
    theme: 'striped',
    headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.2 },
    bodyStyles: { fontSize: 6.8, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 100 },
      2: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 56, halign: 'center' }
    },
    margin: { left: marginX, right: marginX },
    didParseCell: (data) => {
      if (data.row.index === homeStats.length - 1 && homeStats.length > 0) {
        data.cell.styles.fillColor = [254, 242, 242];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  if (curY > 215) {
    doc.addPage();
    curY = 15;
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(`DISTINTA & MARCATORI: ${state.awayTeam.name.toUpperCase()} (OSPITI)`, marginX, curY + 3);

  autoTable(doc, {
    startY: curY + 4.5,
    head: [['N°', 'Cognome e Nome / Ruolo', 'Reti', 'Sanzioni Disciplinari (A, 2\', R, B)']],
    body: awayStats.length > 0 ? awayStats : [['-', 'Nessun atleta registrato in distinta', '0', '-']],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.2 },
    bodyStyles: { fontSize: 6.8, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 100 },
      2: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 56, halign: 'center' }
    },
    margin: { left: marginX, right: marginX },
    didParseCell: (data) => {
      if (data.row.index === awayStats.length - 1 && awayStats.length > 0) {
        data.cell.styles.fillColor = [239, 246, 255];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

  // --- 6. GOALKEEPER STATISTICS TABLE (STATISTICHE PORTIERI) ---
  // Ensure we collect all goalkeepers from both teams
  const gkList: Array<{
    team: 'home' | 'away';
    teamName: string;
    number: number;
    name: string;
    role: string;
    saves: number;
    penaltySaves: number;
    goalsConceded: number;
    totalShots: number;
    efficiencyPct: string;
    goalsScored: number;
  }> = [];

  const existingStats = state.goalkeeperStats || [];

  // Home Team Goalkeepers
  state.homeTeam.players.forEach(p => {
    if (p.role === 'Portiere' || existingStats.some(s => s.team === 'home' && s.playerId === p.id)) {
      const stat = existingStats.find(s => s.team === 'home' && s.playerId === p.id);
      const saves = stat ? stat.saves : 0;
      const penaltySaves = stat ? (stat.penaltySaves || 0) : 0;
      const goalsConceded = stat ? stat.goalsConceded : 0;
      const goalsScored = stat ? stat.goalsScored : 0;
      const totalShots = saves + goalsConceded;
      const efficiencyPct = totalShots > 0 ? ((saves / totalShots) * 100).toFixed(1) + '%' : '0.0%';

      gkList.push({
        team: 'home',
        teamName: state.homeTeam.name,
        number: p.number,
        name: p.name,
        role: p.role || 'Portiere',
        saves,
        penaltySaves,
        goalsConceded,
        totalShots,
        efficiencyPct,
        goalsScored
      });
    }
  });

  // Away Team Goalkeepers
  state.awayTeam.players.forEach(p => {
    if (p.role === 'Portiere' || existingStats.some(s => s.team === 'away' && s.playerId === p.id)) {
      const stat = existingStats.find(s => s.team === 'away' && s.playerId === p.id);
      const saves = stat ? stat.saves : 0;
      const penaltySaves = stat ? (stat.penaltySaves || 0) : 0;
      const goalsConceded = stat ? stat.goalsConceded : 0;
      const goalsScored = stat ? stat.goalsScored : 0;
      const totalShots = saves + goalsConceded;
      const efficiencyPct = totalShots > 0 ? ((saves / totalShots) * 100).toFixed(1) + '%' : '0.0%';

      gkList.push({
        team: 'away',
        teamName: state.awayTeam.name,
        number: p.number,
        name: p.name,
        role: p.role || 'Portiere',
        saves,
        penaltySaves,
        goalsConceded,
        totalShots,
        efficiencyPct,
        goalsScored
      });
    }
  });

  // Any other tracked goalkeepers not found in roster list
  existingStats.forEach(s => {
    const alreadyIncluded = gkList.some(g => g.team === s.team && g.number === s.playerNumber && g.name === s.playerName);
    if (!alreadyIncluded) {
      const totalShots = s.saves + s.goalsConceded;
      const efficiencyPct = totalShots > 0 ? ((s.saves / totalShots) * 100).toFixed(1) + '%' : '0.0%';
      gkList.push({
        team: s.team,
        teamName: s.team === 'home' ? state.homeTeam.name : state.awayTeam.name,
        number: s.playerNumber,
        name: s.playerName,
        role: 'Portiere',
        saves: s.saves,
        penaltySaves: s.penaltySaves || 0,
        goalsConceded: s.goalsConceded,
        totalShots,
        efficiencyPct,
        goalsScored: s.goalsScored || 0
      });
    }
  });

  if (curY > 210) {
    doc.addPage();
    curY = 15;
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text('STATISTICHE & RENDIMENTO PORTIERI (Parate, Rigori 7m, % Efficienza)', marginX, curY + 3);

  const gkTableRows: (string | number)[][] = [];

  if (gkList.length > 0) {
    let totSaves = 0;
    let totPenSaves = 0;
    let totConceded = 0;
    let totShots = 0;
    let totScored = 0;

    gkList.forEach(gk => {
      totSaves += gk.saves;
      totPenSaves += gk.penaltySaves;
      totConceded += gk.goalsConceded;
      totShots += gk.totalShots;
      totScored += gk.goalsScored;

      gkTableRows.push([
        gk.teamName,
        `#${gk.number}`,
        gk.name,
        gk.role === 'Portiere' ? 'Portiere' : 'Gioc. di Movimento',
        gk.saves.toString(),
        gk.penaltySaves.toString(),
        gk.goalsConceded.toString(),
        gk.totalShots.toString(),
        gk.efficiencyPct,
        gk.goalsScored.toString()
      ]);
    });

    const totEfficiency = totShots > 0 ? ((totSaves / totShots) * 100).toFixed(1) + '%' : '0.0%';
    gkTableRows.push([
      'RIEPILOGO TOTALE',
      '-',
      'Tutti i portieri',
      '-',
      totSaves.toString(),
      totPenSaves.toString(),
      totConceded.toString(),
      totShots.toString(),
      totEfficiency,
      totScored.toString()
    ]);
  } else {
    gkTableRows.push(['-', '-', 'Nessun portiere registrato in distinta o con statistiche tracciate', '-', '0', '0', '0', '0', '0.0%', '0']);
  }

  autoTable(doc, {
    startY: curY + 4.5,
    head: [['Squadra', 'N°', 'Portiere', 'Ruolo', 'Parate', 'Rigori 7m', 'Gol Subiti', 'Tiri Affr.', '% Efficienza', 'Gol Fatti']],
    body: gkTableRows,
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { fontSize: 6.8, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 34, fontStyle: 'bold' },
      1: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 38 },
      3: { cellWidth: 26, fontSize: 6.2 },
      4: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 15, halign: 'center' },
      8: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      9: { cellWidth: 12, halign: 'center' }
    },
    margin: { left: marginX, right: marginX },
    didParseCell: (data) => {
      if (gkList.length > 0 && data.row.index === gkTableRows.length - 1) {
        data.cell.styles.fillColor = [236, 253, 245]; // emerald-50
        data.cell.styles.textColor = [4, 120, 87]; // emerald-700
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

  // --- 7. DISCIPLINARY ACTIONS (SANZIONI DISCIPLINARI) ---
  if (curY > 215) {
    doc.addPage();
    curY = 15;
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('REGISTRO SANZIONI DISCIPLINARI (Cartellini Gialli, Sospensioni 2\', Rossi, Blu)', marginX, curY + 3);

  const sanctionRows: (string | number)[][] = [];

  if (state.sanctions.length > 0) {
    state.sanctions.forEach(s => {
      const typeLabel = s.type === 'yellow' ? 'Cartellino Giallo (Ammonizione - Reg. 16:1)' :
        s.type === '2min' ? 'Esclusione 2 Minuti (Sospensione Temporanea - Reg. 16:3)' :
        s.type === 'red' ? 'Cartellino Rosso (Squalifica / Espulsione - Reg. 16:6)' :
        'Cartellino Blu (Squalifica con Relazione Scritta FIGH - Reg. 16:8)';

      const teamName = s.team === 'home' ? state.homeTeam.name : state.awayTeam.name;

      sanctionRows.push([
        `${s.period}° Tempo (${s.minute}'${s.second < 10 ? '0' : ''}${s.second}")`,
        teamName,
        `#${s.playerNumber}`,
        s.playerName,
        typeLabel
      ]);
    });
  } else {
    sanctionRows.push(['-', 'Entrambe', '-', 'Nessun atleta o dirigente', 'Nessun provvedimento disciplinare comminato durante la gara']);
  }

  autoTable(doc, {
    startY: curY + 4.5,
    head: [['Minuto / Tempo', 'Squadra', 'N°', 'Tesserato', 'Tipo di Provvedimento Disciplinare']],
    body: sanctionRows,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { fontSize: 6.8, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 28, halign: 'center' },
      1: { cellWidth: 38 },
      2: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 44 },
      4: { cellWidth: 70, fontStyle: 'bold' }
    },
    margin: { left: marginX, right: marginX }
  });

  curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

  // --- 8. PROGRESSIONE CRONOLOGICA RETI (GOAL PROGRESSION TIMELINE) ---
  if (state.goals.length > 0) {
    if (curY > 215) {
      doc.addPage();
      curY = 15;
    }

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('PROGRESSIONE CRONOLOGICA DELLE MARCATURE (Sequenza Reti)', marginX, curY + 3);

    const goalRows = state.goals.map((g, idx) => {
      const teamLabel = g.team === 'home' ? state.homeTeam.shortName || 'CASA' : state.awayTeam.shortName || 'OSPITI';
      const playerStr = g.playerName ? `#${g.playerNumber || '-'} ${g.playerName}` : 'Rete non assegnata';
      const periodScore = `${g.homePeriodScore} - ${g.awayPeriodScore}`;
      const totalScore = `${g.homeTotalGoals} - ${g.awayTotalGoals}`;

      return [
        (idx + 1).toString(),
        `${g.period}° Tempo (${g.minute}'${g.second < 10 ? '0' : ''}${g.second}")`,
        teamLabel,
        playerStr,
        isU14 ? `${periodScore} (Tot: ${totalScore})` : totalScore
      ];
    });

    autoTable(doc, {
      startY: curY + 4.5,
      head: [['Prog.', 'Tempo / Minuto', 'Squadra', 'Marcatore', 'Punteggio Progressivo']],
      body: goalRows,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
      bodyStyles: { fontSize: 6.8, textColor: [15, 23, 42] },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 32, halign: 'center' },
        2: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 70 },
        4: { cellWidth: 50, halign: 'center', fontStyle: 'bold' }
      },
      margin: { left: marginX, right: marginX }
    });

    curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  // --- 9. OFFICIAL SIGNATURES BLOCK ---
  if (curY > 235) {
    doc.addPage();
    curY = 20;
  }

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, curY, contentWidth, 24, 'FD');

  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  const sigWidth = contentWidth / 4;

  // Box 1: 1° Arbitro
  doc.text('Firma 1° Arbitro', marginX + (sigWidth * 0.5), curY + 5, { align: 'center' });
  doc.setDrawColor(148, 163, 184);
  doc.line(marginX + 6, curY + 18, marginX + sigWidth - 6, curY + 18);

  // Box 2: 2° Arbitro
  doc.text('Firma 2° Arbitro', marginX + (sigWidth * 1.5), curY + 5, { align: 'center' });
  doc.line(marginX + sigWidth + 6, curY + 18, marginX + (sigWidth * 2) - 6, curY + 18);

  // Box 3: Segnapunti / Cronometrista
  doc.text('Firma Segnapunti / Crono', marginX + (sigWidth * 2.5), curY + 5, { align: 'center' });
  doc.line(marginX + (sigWidth * 2) + 6, curY + 18, marginX + (sigWidth * 3) - 6, curY + 18);

  // Box 4: Dirigenti Responsabili
  doc.text('Firma Dirigenti Resp.', marginX + (sigWidth * 3.5), curY + 5, { align: 'center' });
  doc.line(marginX + (sigWidth * 3) + 6, curY + 18, marginX + contentWidth - 6, curY + 18);

  // --- 10. PAGE NUMBERING & WATERMARK / FOOTER ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  const nowStr = new Date().toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Subtle bottom border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 11, marginX + contentWidth, pageHeight - 11);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    doc.text(
      `Handball Scorer PWA FIGH • Referto Ufficiale Digitale generato il ${nowStr}`,
      marginX,
      pageHeight - 6.5
    );

    doc.text(
      `Pagina ${i} di ${totalPages}`,
      marginX + contentWidth,
      pageHeight - 6.5,
      { align: 'right' }
    );
  }

  // --- 11. SAVE THE PDF FILE ---
  const safeHome = (state.homeTeam.shortName || state.homeTeam.name || 'CASA').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeAway = (state.awayTeam.shortName || state.awayTeam.name || 'OSPITI').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeDate = (state.settings.matchDate || 'Oggi').replace(/[^a-zA-Z0-9_-]/g, '-');
  const fileName = `Referto_FIGH_${state.settings.category}_${safeHome}_vs_${safeAway}_${safeDate}.pdf`;

  doc.save(fileName);
}
