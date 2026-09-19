# Referto Pallamano Digitale & Segnapunti FIGH 🤾‍♂️

> **Progressive Web App / Single-Page Application** per il referto di gara e tabellone segnapunti da bordocampo per la pallamano, conforme alle disposizioni **FIGH** (Federazione Italiana Giuoco Handball) e alle novità regolamentari (compreso il format **Under 14 MHC** a 3 tempi).

[![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%2F%207.x-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Panoramica del Progetto

Il **Referto Pallamano Digitale** è un'applicazione web mobile-first pensata per dirigenti, arbitri e segnapunti di società sportive per la gestione completa di una partita di pallamano direttamente da smartphone, tablet o PC portatile a bordocampo.

L'applicazione funziona al **100% lato client (offline-first)**, memorizzando ogni singola azione in tempo reale su `localStorage` per prevenire qualsiasi perdita di dati in caso di chiusura accidentale o disconnessione della rete.

---

## ✨ Funzionalità Principali

### ⏱️ 1. Cronometro di Gara & Sirena Acustica
- **Gestione Tempi:** Avvio, pausa, ripresa e regolazione di precisione (`+1m`, `-1m`, `+10s`, `-10s`).
- **Sirena Ufficiale:** Segnale acustico sintetizzato via Web Audio API alla scadenza dei periodi e dei time-out.
- **Time-Out di Squadra:** Modale con timer dedicato di 60 secondi, tracciamento del minuto di chiamata e della squadra richiedente.
- **Screen WakeLock & Fullscreen:** Previene lo spegnimento dello schermo del dispositivo durante la partita.

### 🏆 2. Supporto Categorie & Regolamento FIGH
- **Senior & Serie B / A2:** 2 tempi da 30 minuti con time-out regolamentari.
- **Giovanili U18 / U16:** 2 tempi da 30' o 25'.
- **Under 14 (Format MHC FIGH):**
  - **3 periodi da 15 minuti ciascuno**.
  - Punteggio per ogni tempo (1 punto alla vincente del periodo, 0.5 in caso di parità).
  - Punti classifica calcolati in automatico: **fino a 5 punti totali** (3 punti dai singoli tempi + 2 punti bonus per la somma gol complessiva).

### 🟥 3. Provvedimenti Disciplinari & Sanzioni
- **Ammonizione (Cartellino Giallo):** Con blocco/avviso per superamento quota squadra.
- **Sospensione Temporanea (2 Minuti):**
  - Barra attiva con conto alla rovescia parallelo per ciascun atleta escluso.
  - **Terza esclusione automatica:** Conversione automatica in Cartellino Rosso alla 3ª sospensione dello stesso atleta.
- **Squalifica (Cartellino Rosso):** Diretta o per cumulo di sospensioni.
- **Cartellino Blu:** Con annotazione e spazio note per il referto arbitrale.

### 👥 4. Gestione Rose & Archivio Formazioni
- Creazione e modifica delle distinte di gara (numero maglia, nome, ruolo atleta: *Giocatore*, *Portiere*, *Capitano*).
- **Archivio Squadre:** Salvataggio delle formazioni preferite per riutilizzarle in gare successive con caricamento in 1 click (Casa / Ospiti).

### 📄 5. Esportazione PDF Ufficiale & Stampa A4
- Generazione del **Referto di Gara A4** client-side (con `jsPDF` e `jspdf-autotable`).
- Tabella dettagliata dei marcatori, cronologia gol, sanzioni disciplinari, firme capitani e ufficiali di gara.
- Supporto completo a `@media print` per stampa diretta nativa da browser.

### 💾 6. Salvataggio & Scambio Dati JSON
- **Esporta / Importa Rosa:** Condividi la distinta di una singola squadra (`.json`).
- **Esporta / Importa Archivio Squadre:** Salva e trasferisci l'intero database delle squadre memorizzate.
- **Esporta / Importa Partita Completa:** Salva lo stato esatto della gara in qualsiasi momento o importa un match per consultazione storica.

---

## 🛠️ Architettura e Stack Tecnologico

- **Frontend Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **Stile & Layout:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icone:** [Lucide React](https://lucide.dev/)
- **Generazione Documenti:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Persistenza:** Web Storage API (`localStorage`)
- **Audio & Dispositivi:** Web Audio API, Screen Wake Lock API, Fullscreen API

---

## 🚀 Avvio Rapido in Locale

### Prerequisiti
- [Node.js](https://nodejs.org/) (versione 18 o superiore consigliata)
- `npm` oppure `bun`

### Installazione

1. Clona il repository:
   ```bash
   git clone https://github.com/tuo-username/referto-pallamano-digitale.git
   cd referto-pallamano-digitale
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

4. Apri il browser all'indirizzo indicato (default: `http://localhost:3000`).

### Build di Produzione

Per compilare l'applicazione per la distribuzione statica:
```bash
npm run build
```
I file pronti per il deploy (HTML, JS, CSS) saranno generati nella directory `dist/`.

Per verificare il tipo statico senza avviare la build:
```bash
npm run lint
# oppure: npx tsc --noEmit
```

---

## 📱 Struttura del Progetto

```text
├── index.html                   # Entry point HTML dell'applicazione
├── package.json                 # Configurazione dipendenze e script
├── vite.config.ts               # Configurazione Vite e plugin React/Tailwind
├── src/
│   ├── main.tsx                 # Bootstrap React
│   ├── App.tsx                  # Componente radice e gestione stato globale
│   ├── types.ts                 # Definizioni TypeScript (MatchState, Player, Team, Sanctions)
│   ├── index.css                # Direttive Tailwind CSS
│   ├── components/
│   │   ├── Header.tsx           # Barra superiore con controlli audio, fullscreen e navigazione
│   │   ├── Scoreboard.tsx       # Tabellone punteggio, periodo e cronometro centrale
│   │   ├── SuspensionsBar.tsx   # Barra attiva delle sospensioni 2' in corso
│   │   ├── U14PeriodBreakdown.tsx # Box riassuntivo format MHC Under 14
│   │   ├── TeamRosterPanel.tsx  # Distinta atleti con bottoni touch per gol e sanzioni
│   │   ├── MatchLog.tsx         # Registro cronologico eventi
│   │   ├── DisciplinaryModal.tsx # Modale assegnazione cartellini e sanzioni 2'
│   │   ├── GoalAssignModal.tsx  # Modale rapida selezione marcatore
│   │   ├── OfficialReportModal.tsx # Modale referto di gara e download PDF
│   │   ├── SettingsModal.tsx    # Configurazione categoria, minutaggi e info gara
│   │   ├── RosterManagerModal.tsx # Gestione e archivio rose/formazioni
│   │   ├── JsonDataManagerModal.tsx # Centro import/export dati JSON
│   │   └── TimeoutModal.tsx     # Timer di 60s per time-out attivo
│   ├── utils/
│   │   ├── categories.ts        # Regolamenti e configurazioni delle categorie FIGH
│   │   ├── storage.ts           # Gestione persistenza localStorage
│   │   ├── jsonExport.ts        # Logica di serializzazione e download file JSON
│   │   ├── pdfGenerator.ts      # Generazione layout referto PDF con jsPDF
│   │   └── sound.ts             # Sintetizzatore audio sirena di gara
│   └── hooks/
│       └── useWakeLock.ts       # Hook per prevenire standby dello schermo
```

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza [MIT](LICENSE).
Sviluppato con passione per la comunità e le società di pallamano italiane.
