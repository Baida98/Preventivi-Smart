# Preventivi-Smart

Un'applicazione web intelligente per la generazione automatica di preventivi per lavori edili e di manutenzione. L'app utilizza Firebase per l'autenticazione e l'archiviazione dei dati, e incorpora un sistema di intelligenza artificiale per migliorare le stime dei prezzi nel tempo.

## Caratteristiche Principali

- **Calcolo Automatico**: Stima rapida dei costi basata su tipo di lavoro, metratura, qualità e localizzazione
- **Intelligenza Artificiale**: Predizioni di prezzo migliorate tramite machine learning
- **Autenticazione Sicura**: Login con Google via Firebase Authentication
- **Archiviazione Cloud**: Salvataggio automatico dei preventivi su Firestore
- **Visualizzazione Grafica**: Grafici interattivi per tracciare i preventivi nel tempo
- **Export PDF**: Generazione di preventivi in formato testo scaricabile
- **Responsive Design**: Interfaccia ottimizzata per desktop e mobile

## Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Authentication + Firestore)
- **Librerie**: Chart.js per i grafici
- **Hosting**: Compatibile con qualsiasi server web statico

## Struttura del Progetto

```
Preventivi-Smart/
├── index.html              # Pagina principale
├── app.js                  # Logica principale dell'applicazione
├── style.css               # Stili CSS
├── firebase.js             # Configurazione Firebase
├── data.json               # Dati di configurazione (modulo JS)
├── engine/
│   ├── core.js             # Calcolo base dei prezzi
│   ├── ai.js               # Logica di predizione AI
│   ├── charts.js           # Rendering dei grafici
│   ├── pdf.js              # Generazione preventivi
│   ├── validation.js       # Validazione input
│   ├── history.js          # Gestione della storia dei preventivi
│   ├── analytics.js        # Analitiche (non utilizzato)
│   ├── security.js         # Sicurezza lato client
│   └── wizard.js           # Wizard di configurazione (non utilizzato)
└── README.md               # Questo file
```

## Installazione e Utilizzo

### Prerequisiti

- Un account Firebase con progetto configurato
- Un browser moderno con supporto ES6+

### Setup

1. **Clonare il repository**
   ```bash
   git clone https://github.com/Baida98/Preventivi-Smart.git
   cd Preventivi-Smart
   ```

2. **Configurare Firebase**
   - Aggiornare le credenziali Firebase in `firebase.js` con le proprie credenziali del progetto

3. **Servire l'applicazione**
   ```bash
   # Usando Python 3
   python -m http.server 8000
   
   # Oppure usando Node.js
   npx http-server
   ```

4. **Accedere all'applicazione**
   - Aprire `http://localhost:8000` nel browser
   - Effettuare il login con Google

## Flusso di Utilizzo

1. **Login**: Autenticarsi con Google
2. **Compilare il Modulo**: Selezionare tipo di lavoro, metratura, qualità e città
3. **Calcolare**: Fare clic su "Calcola" per ottenere la stima del prezzo
4. **Visualizzare**: Il prezzo stimato viene mostrato con min/max e affidabilità AI
5. **Salvare**: Fare clic su "Salva Preventivo" per archiviare il preventivo
6. **Esportare**: Fare clic su "Export PDF" per scaricare il preventivo come file testo

## Moduli Principali

### `engine/core.js`
Calcola il prezzo base moltiplicando:
- Prezzo base per tipo di lavoro
- Metratura
- Moltiplicatore di qualità
- Moltiplicatore di città

### `engine/ai.js`
- **aiPredict()**: Predice il prezzo basato su dati storici
- **aiTrain()**: Aggiorna il modello AI con nuovi dati

### `engine/validation.js`
Valida gli input dell'utente e formatta i valori in valuta EUR

### `engine/history.js`
Gestisce la cronologia dei preventivi generati durante la sessione

### `engine/charts.js`
Renderizza grafici interattivi usando Chart.js

## Configurazione Firebase

Per il corretto funzionamento dell'app, assicurarsi che:

1. **Authentication**: Google Sign-In abilitato
2. **Firestore**: Database creato con le seguenti collezioni:
   - `quotes`: Archivia i preventivi salvati
   - `ai_stats`: Archivia le statistiche per il training dell'AI

### Regole di Sicurezza Firestore (esempio)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quotes/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /ai_stats/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Errori Corretti (Revisione Completa)

### Ciclo 1
- ✅ Errori di riferimento DOM (authDiv/appDiv)
- ✅ Variabili non definite (db)
- ✅ Funzionalità mancanti (Export PDF, Save button)
- ✅ Librerie mancanti (Chart.js)
- ✅ Problemi di stile CSS

### Ciclo 2
- ✅ Integrazione della validazione input
- ✅ Aggiunta della history dei preventivi
- ✅ Rendering dinamico dei grafici
- ✅ Miglioramento della formattazione valuta
- ✅ Aggiunta di label e attributi di accessibilità
- ✅ Responsive design per mobile
- ✅ Gestione errori migliorata

## Roadmap Futura

- [ ] Supporto per più tipi di lavori (da data.json)
- [ ] Dashboard di analytics per l'amministratore
- [ ] Esportazione preventivi in PDF vero (non solo TXT)
- [ ] Notifiche email per i preventivi salvati
- [ ] Integrazione con sistemi di pagamento
- [ ] App mobile nativa
- [ ] Supporto per più lingue

## Licenza

Questo progetto è distribuito sotto licenza MIT.

## Supporto

Per problemi o suggerimenti, aprire un issue su GitHub.

---

**Ultimo aggiornamento**: Aprile 2026
**Versione**: 2.0 (Revisione Completa)
