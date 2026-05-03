# Deploy Guide — Preventivi Smart Pro

## Requisiti
- Node.js 18+
- Firebase project (Authentication + Firestore abilitati)
- `firebase-tools` installato globalmente

## 1. Setup Firebase

### 1.1 Crea progetto Firebase
1. Vai su https://console.firebase.google.com
2. Crea nuovo progetto
3. Abilita **Authentication** → Google provider
4. Abilita **Firestore Database** in modalità produzione

### 1.2 Configura variabili d'ambiente
```bash
cp .env.example .env
```
Compila il file `.env` con i valori dal Firebase Console → Project Settings → General → Your apps

### 1.3 Deploy Firestore Rules
```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules
```

## 2. Build e Deploy

### Build produzione
```bash
pnpm install
pnpm --filter preventivi-smart build
```

### Deploy su Firebase Hosting (opzionale)
```bash
firebase deploy --only hosting
```

## 3. Verifica Funzionamento

### Checklist post-deploy
- [ ] Login Google funziona
- [ ] Creazione preventivo salva su Firestore
- [ ] User A non vede preventivi di User B
- [ ] qualityScore appare nell'archivio
- [ ] Export PDF funziona
- [ ] OCR pipeline processa PDF (richiede Tesseract.js per scansioni)

## 4. Struttura Dati Firestore

```
users/{uid}
  ├── quotes/{quoteId}       ← preventivi utente
  └── counters/quotes        ← contatore numerazione
```

## 5. Monitoraggio

### Firebase Console
- **Firestore** → Usage → monitora reads/writes
- **Authentication** → Users → monitora registrazioni
- **Hosting** → monitora traffico

### Errori comuni
| Errore | Causa | Fix |
|--------|-------|-----|
| `PERMISSION_DENIED` | User non autenticato | Verifica Firebase Auth setup |
| `Missing required field` | Quote incompleta | Verifica `ambito`, `sottotipo`, `stato`, `source` |
| `Quota exceeded` | Troppo traffico | Upgrade piano Firebase |

## 6. Variabili d'Ambiente

| Variabile | Descrizione | Obbligatoria |
|-----------|-------------|--------------|
| `VITE_FIREBASE_API_KEY` | API Key Firebase | Sì |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | Sì |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | Sì |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | No |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | No |
| `VITE_FIREBASE_APP_ID` | App ID | Sì |
