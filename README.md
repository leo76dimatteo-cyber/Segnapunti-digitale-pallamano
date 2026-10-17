# Referto Pallamano Digitale & Segnapunti FIGH 🤾‍♂️

> **Progressive Web App (PWA) / Single-Page Application** per la compilazione del referto di gara e tabellone segnapunti digitale da bordocampo per la pallamano, pienamente conforme alle disposizioni della **FIGH (Federazione Italiana Giuoco Handball)**, inclusa la **Circolare n. 47** per i campionati **Under 14** (3 tempi da 20 minuti).

[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%2F%207.x-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple.svg?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Offline First](https://img.shields.io/badge/Offline-100%25%20Client--Side-emerald.svg)](https://developer.mozilla.org/it/docs/Web/API/Web_Storage_API)
[![FIGH Compliant](https://img.shields.io/badge/FIGH-Circolare%2047%20%26%20MHC-red.svg)](https://www.figh.it/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Descrizione del Progetto

Il **Referto Pallamano Digitale** nasce per agevolare dirigenti accompagnatori, segnapunti, cronometristi e arbitri nella gestione completa di una gara di pallamano su qualsiasi dispositivo (smartphone, tablet o notebook) direttamente dalla panchina o dal tavolo degli ufficiali di gara.

L'applicazione funziona al **100% lato client (Offline-First)**: non richiede connessione internet attiva durante la gara e salva ogni singola azione in tempo reale su `localStorage`, garantendo massima affidabilità contro interruzioni accidentali, cali di batteria o chiusure impreviste del browser.

---

## 🚀 Novità e Punti di Forza (Versione 2.0)

### 🧤 1. Invariante Portieri Rigorosa (Gol Subiti = Risultato Gara)
- **Principio a Fonte Unica di Verità:** Le statistiche dei portieri (`goalsConceded`) sono calcolate tramite selettori puri derivati dagli eventi di marcatura (`GoalEvent`), eliminando qualsiasi disallineamento aritmetico.
- **Invariante Matematica:**
  $$\sum (\text{Gol Subiti dai Portieri}) + \text{Gol Subiti a Porta Vuota} = \text{Totale Reti Segnate dall'Avversario}$$
- **Tracciamento Porta Vuota (*Empty Net*):** Toggle dedicato per registrare i gol subiti a porta sguarnita, evidenziati separatamente nel referto.
- **Riassegnazione Retroattiva:** Sostituzione dei contatori manuali arbitrari con la funzione *"Riassegna gol a..."*, che consente di spostare una rete già subita tra portieri o a porta vuota senza alterare il punteggio ufficiale.
- **Calcolo Efficienza %:** Calcolo istantaneo di $\frac{\text{Parate}}{\text{Parate} + \text{Gol Subiti}} \times 100$.

### 🎯 2. Statistica Tiri dai 7 Metri (Rigori) Separata per Squadra
- **Nuovo Selettore Rapido 7m:** Pulsante dedicato per Casa e Ospiti con selezione in 1 tocco dell'esito:
  - 🟢 **Gol:** Registra automaticamente la rete nel punteggio, assegna il marcatore e aggiorna il gol subito dal portiere difensore (nessuna duplicazione dati).
  - 🔵 **Parato:** Assegna in automatico +1 parata e +1 rigore 7m parato al portiere avversario.
  - 🟡 **Fuori:** Registra il tiro tentato senza variazioni sul tabellone.
  - 🟣 **Palo / Traversa:** Registrazione statistica dedicata del legno colpito.
- **Tiratore Opzionale:** Scelta facoltativa dell'atleta dalla distinta.
- **Quadro Statistico per Squadra:** Conteggio separato di tentati, segnati, parati, fuori, legni ed efficienza realizzativa percentuale, visibile su tabellone, registro eventi, referto PDF ed export HTML.
- **Cancellazione Coordinata:** L'eliminazione di un tiro 7m annulla a cascata sia il gol che l'eventuale parata collegata.

### ⏱️ 3. Cronometro di Gara ad Alta Precisione (±1 Secondo)
- **Regolazione al Singolo Secondo:** Modale `ManualTimerModal` con bottoni rapidi `+1s`, `-1s`, `+10s`, `-10s`, `+1m`, `-1m`.
- **Impostazione Numerica Esatta:** Inserimento diretto dei minuti e secondi esatti per sincronizzazione al decimo con il cronometro murale del palasport.
- **Preset Strategici:** Tasti rapidi *"Fine Tempo (00:00)"*, *"Inizio Tempo"*, *"Reset Intervallo"*.
- **Sirena Acustica Federale:** Sintesi sonora con Web Audio API per inizio/fine periodo e avviso time-out.
- **Screen Wake Lock & Fullscreen:** Previene lo standby dello schermo durante l'incontro.

### 🏆 4. Regolamento Under 14 FIGH – Circolare n. 47 & Formato MHC
- **3 Tempi da 20 Minuti:** Conforme alle disposizioni federali per i campionati regionali U14 (20 minuti a tempo + 5 minuti di intervallo).
- **Format Punti per Tempo (MHC):**
  - **1 punto** alla squadra vincente del tempo;
  - **0.5 punti** a ciascuna squadra in caso di parità;
  - **0 punti** alla squadra sconfitta.
- **Punti Classifica Automatici (Fino a 5 Punti):**
  - 3 punti massimi dai singoli tempi + **2 punti bonus** per la somma gol totale della gara.
- **Azzeramento Parziale tra i Tempi:** Il tabellone visualizza il punteggio del periodo corrente (es. 0-0 all'inizio del 2° e 3° tempo) pur mantenendo la somma globale dei gol.
- **Riapertura Retroattiva Tempi:** Possibilità di riaprire un tempo già chiuso per applicare correzioni arbitrali, con ricalcolo automatico e istantaneo della classifica punti.

### 🟥 5. Provvedimenti Disciplinari Sincronizzati
- **Cartellini Gialli, 2 Minuti, Rossi e Blu:** Interfaccia reattiva per entrambe le formazioni.
- **Terza Esclusione da 2' = Rosso Automatico:** Alla 3ª sospensione temporanea dello stesso atleta viene generato automaticamente il cartellino rosso con banner informativo federale.
- **Gestione Squalifiche:** Gli atleti squalificati (rosso o blu) vengono contrassegnati come `(SQUALIFICATO)` e inibiti da nuove sanzioni; le loro sospensioni attive da 2' vengono rimosse dalla barra attiva.
- **Barra Sospensioni Attive:** Countdown visivo in tempo reale con indicazione del numero maglia, atleta e secondi residui.

### 📋 6. Anagrafica Giocatori per Categorie FIGH
- **Categorie Predefinite:** Serie A Gold/Silver, Serie B, U20, U18, U16, U14, U12, Promozionale.
- **Inserimento Batch:** Aggiunta rapida di più atleti contemporaneamente o importazione guidata nella distinta di Casa o Ospiti.
- **Archivio Formazioni:** Salvataggio delle rose societarie su memoria locale con richiamo in 1 click.

### 📄 7. Esportazione Referto Ufficiale Multiformato
- **Referto PDF Vettoriale A4:** Generato al 100% client-side tramite `jsPDF` e `jspdf-autotable`, impaginato secondo i moduli federali ufficiali:
  - Intestazione gara (campionato, data, luogo, arbitri, ufficiali);
  - Distinte complete Casa e Ospiti con numeri di maglia, capitani e ruoli;
  - Tabella marcature cronologica progressiva con minutaggio;
  - Dettaglio tempi e punti per Under 14 format MHC;
  - Quadro sanzioni disciplinari (Ammonizioni, 2', Squalifiche, Rapporti scritti);
  - Tabella statistica tiri dai 7 metri per squadra;
  - Tabella rendimento portieri (Parate ordinarie, Rigori parati, Gol subiti, % Efficienza);
  - Spazio firme capitani e ufficiali di tavolo.
- **Export HTML Standalone:** File `.html` singolo autonomo, consultabile ed archiviabile su qualsiasi dispositivo senza connessione.
- **Stampa Nativa A4:** Foglio di stile dedicato `@media print` per stampare direttamente dal browser su carta o salvare come PDF.
- **Copia Rapida Testo:** Formattazione pronta per WhatsApp, canali Telegram o comunicati stampa societari.

### 📱 8. Layout Mobile Ergonomico & Touch Target
- **Viewport Ottimizzato (360px–430px):** Progettato specificamente per l'uso con una sola mano da smartphone a bordocampo.
- **Breakpoint `xs` su Misura:** Etichette esplicite `GOL {CASA}` e `GOL {OSPITI}` senza ambiguità.
- **Touch Target Ergonomici:** Tutti i pulsanti di azione rispettano gli standard di accessibilità touch (minimo 44×44px).
- **Lista Giocatori a Due Righe:** Riorganizzazione della distinta per eliminare qualsiasi scroll orizzontale o tap accidentale.
- **Supporto Safe-Area:** Gestione nativa del notch e della barra gesti (`env(safe-area-inset-bottom)`).

---

## 🛠️ Stack Tecnologico

| Tecnologia | Scopo |
| :--- | :--- |
| **React 19** | Rendering reattivo dei componenti UI e hook moderni |
| **TypeScript (Strict)** | Tipizzazione statica rigorosa su tutti i modelli di gara ed eventi |
| **Vite 8** | Bundler ultraveloce e HMR di sviluppo |
| **Tailwind CSS v4** | Design system utility-first moderno con tema responsive custom |
| **Lucide React** | Set completo di icone vettoriali per sport e dashboard |
| **jsPDF & jsPDF-AutoTable** | Compilazione ed esportazione PDF vettoriale A4 client-side |
| **Canvas Confetti** | Animazione celebrativa al fischio finale |
| **Vite Plugin PWA** | Service Worker Workbox e Web App Manifest per funzionamento offline |

---

## 📂 Struttura del Repository

```text
├── index.html                     # Entry point HTML dell'applicazione
├── package.json                   # Dipendenze, script di build e metadati di progetto
├── vite.config.ts                 # Configurazione Vite, React, Tailwind v4 e PWA
├── tsconfig.json                  # Configurazione compilatore TypeScript
├── public/                        # Asset statici, icone PWA e manifest
└── src/
    ├── main.tsx                   # Punto di ingresso dell'applicazione React
    ├── App.tsx                    # Controller principale e orchestrazione dello stato
    ├── types.ts                   # Modelli di dati: MatchState, GoalEvent, SevenMeterEvent, Sanctions
    ├── index.css                  # Tema globale, breakpoint xs e stili base Tailwind v4
    │
    ├── components/
    │   ├── Header.tsx             # Barra superiore (wake-lock, audio, full-screen, reset, report)
    │   ├── Scoreboard.tsx         # Tabellone principale, cronometro, pulsanti gol e 7m
    │   ├── SuspensionsBar.tsx     # Barra dinamica con countdown per le esclusioni da 2'
    │   ├── U14PeriodBreakdown.tsx # Pannello format MHC Under 14 (punti periodo e riapertura)
    │   ├── TeamRosterPanel.tsx    # Distinta squadra, cockpit portieri e riga giocatore touch
    │   ├── MatchLog.tsx           # Cronologia eventi con filtri (Tutti, Gol, 7m, Sanzioni)
    │   ├── DisciplinaryModal.tsx  # Modale cartellini (Giallo, 2', Rosso, Blu) con controlli anti-errore
    │   ├── GoalAssignModal.tsx    # Assegnazione rapida del marcatore
    │   ├── SevenMeterModal.tsx    # Modale dedicato esito tiro 7m (Gol, Parato, Fuori, Palo)
    │   ├── GoalkeeperModal.tsx    # Cockpit statistiche portieri e riassegnazione gol subiti
    │   ├── ManualTimerModal.tsx   # Regolazione manuale cronometro (±1s, cifre esatte, preset)
    │   ├── OfficialReportModal.tsx# Anteprima referto, stampa A4, export PDF e HTML
    │   ├── SettingsModal.tsx      # Configurazione categoria, tempi, time-out e info gara
    │   ├── RosterManagerModal.tsx # Archivio rose salvate e caricamento rapido
    │   ├── PlayersRegistryModal.tsx# Anagrafica atleti suddivisa per categorie FIGH
    │   ├── JsonDataManagerModal.tsx# Backup e ripristino dati in formato JSON
    │   └── TimeoutModal.tsx       # Timer dedicato per la sospensione di 1 minuto
    │
    ├── utils/
    │   ├── matchSelectors.ts      # Selettori puri per statistiche portieri, 7m e riconciliazione dati
    │   ├── categories.ts          # Definizioni regolamentari categorie FIGH (U14, U16, U18, Senior)
    │   ├── storage.ts             # Persistenza localStorage e migrazione retrocompatibile
    │   ├── jsonExport.ts          # Serializzazione e parsing file JSON (rose, partite, backup)
    │   ├── pdfGenerator.ts        # Motore di rendering PDF ufficiale A4 con jsPDF
    │   ├── exportHtml.ts          # Esportatore del referto come documento HTML autonomo
    │   ├── playerRegistry.ts      # Logica anagrafica e categorizzazione federale atleti
    │   └── sound.ts               # Sintetizzatore Web Audio per sirena e fischietti
    │
    └── hooks/
        └── useWakeLock.ts         # Hook per il controllo dello Screen Wake Lock API
```

---

## ⚡ Guida Rapida all'Uso

### 1. Avvio Partita e Configurazione
1. Clicca sull'icona **Impostazioni (⚙️)** nell'intestazione per scegliere la categoria (es. *Under 14 - 3 tempi da 20'*, *Serie B*, *Under 18*), inserire la data, il palasport e i nomi delle squadre.
2. Componi la rosa inserendo i giocatori manualmente, caricando un preset salvato o importando gli atleti dall'**Anagrafica Giocatori**.
3. Seleziona il portiere titolare attivo cliccando su *"In Porta"* nella sezione portieri della distinta.

### 2. Gestione Cronometro
- Premi **AVVIA** per far partire il tempo.
- Per correggere il cronometro in qualsiasi istante:
  - Clicca sulle cifre del tempo per aprire il **Modale Regolazione Manuale**;
  - Utilizza i pulsanti rapidi `+1s` / `-1s` oppure digita i minuti e secondi esatti.

### 3. Segnatura Reti e Rigori dai 7 Metri
- **Gol Ordinario:** Premi il tasto **`GOL [SQUADRA]`** sul tabellone oppure il bottone `+GOL` sulla riga del marcatore.
- **Tiro dai 7 Metri:** Premi il pulsante **`7m`** (sul tabellone o nel pannello rosa), scegli l'esito (*Gol*, *Parato*, *Fuori*, *Palo*) e facoltativamente il tiratore. L'applicazione sincronizzerà automaticamente sia il punteggio che le statistiche del portiere.

### 4. Sanzioni Disciplinari
- Clicca su **`Cartellino`** per aprire il modulo sanzioni.
- Seleziona l'atleta e la sanzione (Ammonizione, 2 Minuti, Squalifica, Rapporto).
- In caso di **3ª esclusione da 2'** allo stesso atleta, l'app applicherà automaticamente il cartellino rosso e rimuoverà le sospensioni attive.

### 5. Termine Gara ed Esportazione Referto
- A fine gara, clicca sull'icona **Referto (📄)**:
  - **Scarica PDF:** Genera il file PDF stampabile A4 conforme FIGH.
  - **Scarica HTML:** Salva il referto digitale come pagina web autonoma.
  - **Stampa A4:** Apre la finestra di stampa del browser.
  - **Condividi / Copia:** Copia il testo riassuntivo per l'invio via messaggio o chat societaria.

---

## 💻 Installazione e Sviluppo in Locale

### Prerequisiti
- **Node.js** versione 18.x o superiore (consigliata 20 LTS o 22 LTS).
- **npm** (incluso in Node.js) oppure **pnpm** / **bun**.

### Passaggi

```bash
# 1. Clona il repository
git clone https://github.com/tuo-username/referto-pallamano-digitale.git
cd referto-pallamano-digitale

# 2. Installa le dipendenze
npm install

# 3. Avvia il server di sviluppo su http://localhost:3000
npm run dev
```

### Verifica e Build di Produzione

```bash
# Controllo sintassi TypeScript e assenza errori di tipo
npm run lint

# Compilazione ottimizzata per produzione con service worker PWA
npm run build

# Anteprima locale del pacchetto compilato
npm run preview
```

---

## 📦 Installazione come PWA (App da Bordocampo)

Il Referto Pallamano Digitale è una **Progressive Web App** a tutti gli effetti:
- **Su Android (Chrome):** Tocca il menu a tre puntini e seleziona *"Aggiungi a schermata Home"* o *"Installa applicazione"*.
- **Su iOS / iPadOS (Safari):** Tocca il pulsante di condivisione e seleziona *"Aggiungi alla schermata Home"*.
- **Su PC / Mac (Chrome / Edge):** Clicca sull'icona di installazione nella barra degli indirizzi del browser.

Una volta installata, l'app funziona in modalità standalone a tutto schermo e non richiede connessione dati attiva durante l'uso.

---

## 📄 Licenza

Distribuito sotto licenza **MIT**. Consulta il file [`LICENSE`](LICENSE) per ulteriori informazioni.

---

*Realizzato con cura per la comunità della pallamano italiana, società sportive, dirigenti e ufficiali di gara FIGH.* 🇮🇹🤾‍♀️
