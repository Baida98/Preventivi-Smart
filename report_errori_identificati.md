# Report Errori Identificati - Preventivi-Smart Pro

Dopo un'analisi approfondita della repository `Baida98/Preventivi-Smart`, sono stati identificati i seguenti errori e aree di miglioramento:

## 1. Errori di Logica e Dati Mancanti
*   **Database Incompleto**: Molti mestieri nel `TRADES_DATABASE` (in `engine/database.js`) non hanno i campi `estimatedHours` e `hourlyRate`. Questo causa il fallback a valori predefiniti (1 ora e 60€/ora) in `engine/timeline-calculator.js`, rendendo l'analisi della timeline e della manodopera poco accurata per lavori complessi.
*   **Mappatura Categorie Approssimativa**: In `engine/timeline-calculator.js`, la mappatura delle categorie per il calcolo del breakdown dei costi è limitata. Se un mestiere non rientra in `impianti`, `strutture` o `servizi`, viene usato un fallback generico (`finiture`), che potrebbe non riflettere la realtà dei costi.
*   **Incoerenza nei Moltiplicatori**: La funzione `calculateAnswerMultiplier` in `database.js` non gestisce correttamente la nuova struttura delle risposte (oggetti con campo `multiplier`) usata in `app-v3.js`, limitandosi a gestire numeri o stringhe.

## 2. Bug di Integrazione e Runtime
*   **Passaggio Parametri Errato**: In `app-v3.js`, la funzione `performProfessionalAnalysis` viene chiamata senza passare `tradeName`, che è invece richiesto dal motore di analisi in `professional-analyzer.js`.
*   **Gestione Qualità Mancante**: Il motore di analisi si aspetta un parametro `quality`, ma l'interfaccia utente in `index.html` e `app-v3.js` non permette all'utente di selezionarla, forzando sempre il valore `standard`.
*   **Rischio Indici Firebase**: L'uso di `orderBy("createdAt", "desc")` insieme a `where("uid", "==", ...)` in `QuoteManager` richiede la creazione di un indice composito su Firestore, che se mancante causerà il fallimento delle query a runtime.

## 3. Debito Tecnico e Codice Legacy
*   **Moduli Duplicati/Obsoleti**: Sono presenti numerosi file che sembrano versioni precedenti o alternative dello stesso modulo (es. `app.js` vs `app-v3.js`, `database-v6-backup.js`, `ai.js` vs `ai-analyzer.js`). Questo crea confusione e aumenta il rischio di caricare script errati.
*   **Script Inutilizzati**: File come `smart-calculator.js` e `wizard-ui.js` sembrano appartenere a una vecchia architettura e non sono integrati nel flusso principale di `app-v3.js`.

## 4. Problemi di UI/UX
*   **Feedback Visivo Limitato**: Sebbene `ui-feedback.js` sia presente, alcuni errori di rete o di database potrebbero non essere comunicati chiaramente all'utente finale.
*   **Mancanza di Validazione Avanzata**: La validazione dei dati inseriti dall'utente è minima prima dell'invio all'analisi professionale.

---
*Prossimo passo: Correzione sistematica di questi punti partendo dal database e dai motori di calcolo.*
