# Strategia di Sincronizzazione Cloud - Preventivi-Smart

## Panoramica

Questo documento descrive l'architettura di sincronizzazione tra il client (browser) e Firestore, implementata nei moduli `storage.ts` e `firebase-service.ts`.

## Principi Fondamentali

### 1. Firestore è la Fonte di Verità
- I dati su Firestore sono sempre considerati corretti
- localStorage è usato solo come cache locale per offline
- In caso di conflitto, i dati cloud hanno priorità

### 2. Architettura a Due Livelli

```
┌─────────────────────────────────────────┐
│         Browser (Client)                │
├─────────────────────────────────────────┤
│  localStorage (Cache)  │  In-Memory UI  │
└──────────────┬──────────────────────────┘
               │ (sync)
┌──────────────▼──────────────────────────┐
│      Firestore (Cloud)                  │
├─────────────────────────────────────────┤
│  users/{uid}/quotes (Authenticated)     │
│  guests/guest/quotes (Anonymous)        │
└─────────────────────────────────────────┘
```

### 3. Flusso di Sincronizzazione

#### Lettura (loadArchive)
1. Se utente autenticato e Firestore disponibile:
   - Carica da `users/{uid}/quotes`
   - Aggiorna cache locale
   - Ritorna dati cloud
2. Se offline o guest:
   - Carica da localStorage
   - Ritorna cache locale

#### Scrittura (saveQuote)
1. Se utente autenticato e Firestore disponibile:
   - Salva su `users/{uid}/quotes` (merge: true)
   - Aggiorna cache locale
2. Se offline o guest:
   - Salva solo su localStorage
   - Sincronizzerà al prossimo accesso online

#### Eliminazione (deleteQuote)
1. Se utente autenticato e Firestore disponibile:
   - Elimina da `users/{uid}/quotes`
   - Aggiorna cache locale
2. Se offline o guest:
   - Elimina da localStorage
   - Sincronizzerà al prossimo accesso online

## Struttura Dati Firestore

### Utenti Autenticati
```
users/
  {uid}/
    quotes/
      {quoteId}/
        id: string
        numero: string
        createdAt: string
        updatedAt: string
        data: string
        cliente: { nome, email, ... }
        ambito: string
        sottotipo: string
        servizi: Service[]
        totale: number
        stato: string
        source: string
        qualityScore: number
        anomalyScore: number
        validated: boolean
        uid: string
    counters/
      quotes/
        year: number
        sequence: number
        updatedAt: Timestamp
    events/
      {eventId}/
        preventivoId: string
        type: string
        timestamp: number
        uid: string
```

### Ospiti Anonimi
```
guests/
  guest/
    quotes/
      {quoteId}/
        [stessa struttura di utenti autenticati]
```

## Gestione degli Errori

### Offline Mode
- Le operazioni vengono salvate localmente
- Un toast notifica l'utente dello stato offline
- Al riconnessione, i dati vengono sincronizzati automaticamente

### Conflitti di Sincronizzazione
- **Strategia**: Last-Write-Wins (LWW)
- Il campo `updatedAt` determina quale versione è più recente
- Se il cloud è più recente, sovrascrive il locale
- Se il locale è più recente, viene inviato al cloud

### Limiti Guest
- Massimo 5 preventivi per utente anonimo
- Dopo il limite, viene mostrato un messaggio di upgrade
- I dati rimangono in localStorage fino al login

## Implementazione Dettagliata

### storage.ts - Modulo di Archiviazione
Responsabile della gestione dell'archivio preventivi con sincronizzazione cloud.

**Funzioni Principali**:
- `loadArchive()`: Carica preventivi da cloud o cache
- `saveQuote(q)`: Salva un preventivo su cloud e cache
- `deleteQuote(id)`: Elimina un preventivo da cloud e cache
- `syncArchiveWithCloud()`: Sincronizza esplicitamente con il cloud
- `isGuestLimitReached()`: Verifica limite ospiti

### firebase-service.ts - Servizio Cloud
Fornisce operazioni CRUD su Firestore per il modello Quote completo.

**Funzioni Principali**:
- `createQuote(userId, quoteData)`: Crea un nuovo preventivo con numerazione
- `getQuote(userId, quoteId)`: Recupera un singolo preventivo
- `getUserQuotes(userId)`: Recupera tutti i preventivi dell'utente
- `updateQuote(userId, quoteId, updates)`: Aggiorna un preventivo
- `deleteQuote(userId, quoteId)`: Elimina un preventivo
- `exportQuoteToPDF(userId, quoteId)`: Esporta in PDF

## Migrazione Dati

### Fase di Transizione
Durante la migrazione da `preventivi` a `quotes`:

1. **Lettura Compatibile**: Legge da `quotes` (nuovo percorso)
2. **Scrittura Unificata**: Scrive sempre su `quotes` (nuovo percorso)
3. **Migrazione Batch**: Script backend per migrare dati legacy

### Rollback Plan
Se necessario tornare indietro:
1. Ripristinare backup Firestore
2. Aggiornare percorsi in storage.ts
3. Notificare utenti di interruzione servizio

## Monitoraggio e Debugging

### Log Events
Tutti gli eventi di sincronizzazione vengono registrati:
- `CREATED`: Nuovo preventivo creato
- `UPDATED`: Preventivo modificato
- `DELETED`: Preventivo eliminato
- `SYNCED`: Sincronizzazione completata

### Metriche
- Tempo medio di sincronizzazione
- Tasso di errori di sincronizzazione
- Numero di conflitti risolti

## Future Enhancements

### Prossime Fasi
1. **Sincronizzazione Bidirezionale**: Rilevamento automatico di conflitti
2. **Compressione Dati**: Ridurre dimensione payload
3. **Replicazione Offline**: Sincronizzazione in background
4. **Versionamento**: Mantenere storico delle modifiche

## Riferimenti

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Realtime Sync](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Conflict Resolution Patterns](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)
