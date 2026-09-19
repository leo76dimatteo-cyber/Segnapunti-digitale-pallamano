import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatchState } from '../types';
import { CATEGORIES } from './categories';

export function generateMatchReportPDF(state: MatchState): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const cat = CATEGORIES[state.settings.category] || CATEGORIES.under_14;
  const isU14 = cat.isU14Format;

  // Header Colors
  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [220, 38, 38]; // Red

  // Page title / Federation header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(10, 8, 190, 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('FEDERAZIONE ITALIANA GIUOCO HANDBALL', 105, 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('REFERTO UFFICIALE DIGITALE DI GARA', 105, 20, { align: 'center' });

  // Match Info Bar
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  const startY = 28;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(10, startY, 190, 18);

  doc.text(`Campionato: ${state.settings.championship || 'N/D'}`, 14, startY + 5);
  doc.text(`Categoria: ${cat.name}`, 14, startY + 10);
  doc.text(`Gara N°: ${state.settings.matchNumber || 'N/D'}`, 14, startY + 15);

  doc.text(`Data: ${state.settings.matchDate || 'N/D'}`, 80, startY + 5);
  doc.text(`Ora: ${state.settings.matchTime || 'N/D'}`, 80, startY + 10);
  doc.text(`Impianto: ${state.settings.venue || 'N/D'}`, 80, startY + 15);

  doc.text(`1° Arbitro: ${state.settings.referee1 || 'N/D'}`, 135, startY + 5);
  doc.text(`2° Arbitro: ${state.settings.referee2 || 'N/D'}`, 135, startY + 10);
  doc.text(`Segnapunti: ${state.settings.scorekeeper || 'N/D'}`, 135, startY + 15);

  // Teams & Scores banner
  const teamBannerY = startY + 22;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(10, teamBannerY, 190, 24, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(10, teamBannerY, 190, 24, 2, 2, 'S');

  // Home
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(220, 38, 38);
  doc.text(state.homeTeam.name.toUpperCase(), 35, teamBannerY + 8, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('(SQUADRA CASA)', 35, teamBannerY + 13, { align: 'center' });

  // Away
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text(state.awayTeam.name.toUpperCase(), 175, teamBannerY + 8, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('(SQUADRA OSPITI)', 175, teamBannerY + 13, { align: 'center' });

  // Center Score Display
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);

  if (isU14) {
    // Show Points (Official) and Goals (Stats)
    doc.text(`${state.homeTotalPoints}  -  ${state.awayTotalPoints}`, 105, teamBannerY + 11, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('RISULTATO UFFICIALE A PUNTI (Format MHC)', 105, teamBannerY + 16, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Totale Reti Gara (statistica): ${state.homeTotalGoals} - ${state.awayTotalGoals}`, 105, teamBannerY + 21, { align: 'center' });
  } else {
    doc.text(`${state.homeTotalGoals}  -  ${state.awayTotalGoals}`, 105, teamBannerY + 12, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('RISULTATO FINALE (Reti Totali)', 105, teamBannerY + 18, { align: 'center' });
  }

  // Periods Detail Table
  let curY = teamBannerY + 27;

  if (isU14) {
    const periodRows: (string | number)[][] = [];
    const maxPeriods = state.settings.totalPeriods || 3;

    for (let p = 1; p <= maxPeriods; p++) {
      const pr = state.periodResults.find(r => r.period === p);
      if (pr) {
        periodRows.push([
          `${p}° Tempo (15 min)`,
          `${pr.homeGoals} - ${pr.awayGoals}`,
          pr.homePoints > pr.awayPoints ? `Vittoria ${state.homeTeam.shortName || 'Casa'}` : pr.awayPoints > pr.homePoints ? `Vittoria ${state.awayTeam.shortName || 'Ospiti'}` : 'Pareggio',
          `${pr.homePoints} pt - ${pr.awayPoints} pt`
        ]);
      } else if (p === state.currentPeriod && !state.isMatchOver) {
        periodRows.push([
          `${p}° Tempo (IN CORSO)`,
          `${state.homePeriodGoals} - ${state.awayPeriodGoals}`,
          'In svolgimento',
          'Da assegnare a fine tempo'
        ]);
      } else {
        periodRows.push([`${p}° Tempo`, '0 - 0', 'Non disputato', '0 pt - 0 pt']);
      }
    }

    // Official Totals Row
    periodRows.push([
      'TOTALE UFFICIALE GARA',
      `${state.homeTotalGoals} - ${state.awayTotalGoals} (Reti complessive)`,
      state.homeTotalPoints > state.awayTotalPoints ? `Vincitore: ${state.homeTeam.name}` : state.awayTotalPoints > state.homeTotalPoints ? `Vincitore: ${state.awayTeam.name}` : 'Pareggio',
      `${state.homeTotalPoints} PUNTI - ${state.awayTotalPoints} PUNTI`
    ]);

    autoTable(doc, {
      startY: curY,
      head: [['Periodo / Tempo', 'Reti Segnate nel Tempo', 'Esito Tempo', 'Punti Assegnati']],
      body: periodRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 45, halign: 'center' },
        2: { cellWidth: 50, halign: 'center' },
        3: { cellWidth: 50, halign: 'center', fontStyle: 'bold' }
      },
      margin: { left: 10, right: 10 },
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
    // Classic 2 halves
    const half1GoalsHome = state.goals.filter(g => g.team === 'home' && g.period === 1).length;
    const half1GoalsAway = state.goals.filter(g => g.team === 'away' && g.period === 1).length;
    const half2GoalsHome = state.goals.filter(g => g.team === 'home' && g.period === 2).length;
    const half2GoalsAway = state.goals.filter(g => g.team === 'away' && g.period === 2).length;

    autoTable(doc, {
      startY: curY,
      head: [['Tempo', 'Reti Casa', 'Reti Ospiti', 'Progressivo']],
      body: [
        ['1° Tempo', `${half1GoalsHome}`, `${half1GoalsAway}`, `${half1GoalsHome} - ${half1GoalsAway}`],
        ['2° Tempo', `${half2GoalsHome}`, `${half2GoalsAway}`, `${half1GoalsHome + half2GoalsHome} - ${half1GoalsAway + half2GoalsAway}`],
        ['RISULTATO FINALE', `${state.homeTotalGoals}`, `${state.awayTotalGoals}`, `${state.homeTotalGoals} - ${state.awayTotalGoals}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59], halign: 'center' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' }, 3: { fontStyle: 'bold' } },
      margin: { left: 10, right: 10 },
      didParseCell: (data) => {
        if (data.row.index === 2) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  }

  // Rosters & Scorers side-by-side or stacked
  const calcPlayerStats = (team: 'home' | 'away') => {
    const pList = team === 'home' ? state.homeTeam.players : state.awayTeam.players;
    return pList.map(p => {
      const goalsCount = state.goals.filter(g => g.team === team && g.playerId === p.id).length;
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

      return [
        p.number.toString(),
        p.name + (p.role === 'Portiere' ? ' (P)' : p.role === 'Capitano' ? ' (C)' : ''),
        goalsCount.toString(),
        sanzioniStr.trim()
      ];
    });
  };

  const homeStats = calcPlayerStats('home');
  const awayStats = calcPlayerStats('away');

  // Title for Teams
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`ROSA & MARCATORI: ${state.homeTeam.name}`, 10, curY + 3);

  autoTable(doc, {
    startY: curY + 4,
    head: [['N°', 'Giocatore / Ruolo', 'Reti', 'Sanzioni (A, 2\', R, B)']],
    body: homeStats.length > 0 ? homeStats : [['-', 'Nessun giocatore registrato', '0', '-']],
    theme: 'striped',
    headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 100 },
      2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 58, halign: 'center' }
    },
    margin: { left: 10, right: 10 }
  });

  curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // Check page overflow
  if (curY > 210) {
    doc.addPage();
    curY = 15;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`ROSA & MARCATORI: ${state.awayTeam.name}`, 10, curY + 3);

  autoTable(doc, {
    startY: curY + 4,
    head: [['N°', 'Giocatore / Ruolo', 'Reti', 'Sanzioni (A, 2\', R, B)']],
    body: awayStats.length > 0 ? awayStats : [['-', 'Nessun giocatore registrato', '0', '-']],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 100 },
      2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 58, halign: 'center' }
    },
    margin: { left: 10, right: 10 }
  });

  curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

  // Sanctions Table if any
  if (state.sanctions.length > 0) {
    if (curY > 220) {
      doc.addPage();
      curY = 15;
    }

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('CRONOLOGIA PROVVEDIMENTI DISCIPLINARI (Cartellini & Sospensioni 2\')', 10, curY + 3);

    const sanctionRows = state.sanctions.map(s => {
      const typeLabel = s.type === 'yellow' ? 'Cartellino Giallo (Ammonizione)' :
        s.type === '2min' ? 'Esclusione 2 Minuti' :
        s.type === 'red' ? 'Cartellino Rosso (Espulsione/Squalifica)' :
        'Cartellino Blu (Squalifica + Rapporto Scritto FIGH)';
      const teamName = s.team === 'home' ? state.homeTeam.name : state.awayTeam.name;

      return [
        `${s.period}° T (${s.minute}'${s.second < 10 ? '0' : ''}${s.second}")`,
        teamName,
        `#${s.playerNumber} ${s.playerName}`,
        typeLabel
      ];
    });

    autoTable(doc, {
      startY: curY + 4,
      head: [['Minuto', 'Squadra', 'Giocatore', 'Tipo Provvedimento']],
      body: sanctionRows,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
      bodyStyles: { fontSize: 6.8, textColor: [15, 23, 42] },
      columnStyles: {
        0: { cellWidth: 28, halign: 'center' },
        1: { cellWidth: 48 },
        2: { cellWidth: 50 },
        3: { cellWidth: 64, fontStyle: 'bold' }
      },
      margin: { left: 10, right: 10 }
    });

    curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  }

  // Signatures Section
  if (curY > 235) {
    doc.addPage();
    curY = 20;
  }

  doc.setDrawColor(203, 213, 225);
  doc.rect(10, curY, 190, 22);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  doc.text('Firma 1° Arbitro', 25, curY + 5, { align: 'center' });
  doc.line(15, curY + 16, 45, curY + 16);

  doc.text('Firma 2° Arbitro', 65, curY + 5, { align: 'center' });
  doc.line(55, curY + 16, 85, curY + 16);

  doc.text('Firma Segnapunti', 105, curY + 5, { align: 'center' });
  doc.line(95, curY + 16, 125, curY + 16);

  doc.text('Firma Dirigente Casa', 145, curY + 5, { align: 'center' });
  doc.line(135, curY + 16, 155, curY + 16);

  doc.text('Firma Dirigente Ospiti', 178, curY + 5, { align: 'center' });
  doc.line(168, curY + 16, 192, curY + 16);

  // Footer note
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const nowStr = new Date().toLocaleString('it-IT');
  doc.text(`Documento generato digitalmente con Handball Scorer PWA FIGH il ${nowStr} • Valido come referto gara ufficiale`, 105, 290, { align: 'center' });

  // Save the PDF
  const safeHome = state.homeTeam.shortName || 'CASA';
  const safeAway = state.awayTeam.shortName || 'OSPITI';
  const fileName = `Referto_${state.settings.category}_${safeHome}_vs_${safeAway}_${state.settings.matchDate}.pdf`;
  doc.save(fileName);
}
