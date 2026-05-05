# Analisi Architetturale - Discrepanze Firebase

## Problema Identificato

Esiste un'incoerenza critica nella struttura dei percorsi Firestore tra due moduli principali:

### storage.ts (Modulo di Archiviazione)
- **Percorso utenti autenticati**: `users/{uid}/preventivi`
- **Percorso ospiti**: `guests/guest/preventivi`
- **Modello dati**: `SavedQuote` (legacy con campi di pricing)
- **Operazioni**: loadArchive, saveQuote, deleteQuote, syncArchiveWithCloud

### firebase-service.ts (Servizio Cloud)
- **Percorso utenti autenticati**: `users/{uid}/quotes`
- **Percorso counter**: `users/{uid}/counters/quotes`
- **Modello dati**: `Quote` (modello completo con servizi)
- **Operazioni**: createQuote, getQuote, getUserQuotes, updateQuote, deleteQuote

## Impatto

1. **Duplicazione di Logica**: Due sistemi paralleli di salvataggio/caricamento
2. **Conflitto di Percorsi**: `preventivi` vs `quotes` causano mancata sincronizzazione
3. **Modelli Incoerenti**: SavedQuote vs Quote hanno strutture diverse
4. **Rischio di Perdita Dati**: Dati salvati in un modulo non visibili nell'altro

## Soluzione Proposta

### Fase 1: Unificazione Percorsi Firestore
Standardizzare su `users/{uid}/quotes` come percorso primario:
- Migrare dati da `preventivi` a `quotes`
- Aggiornare storage.ts per usare il nuovo percorso
- Mantenere retrocompatibilità durante la transizione

### Fase 2: Convergenza Modelli Dati
Creare un modello unificato che combina SavedQuote e Quote:
- Estendere Quote con campi legacy di SavedQuote
- Creare funzioni di conversione bidirezionali
- Standardizzare su Quote come modello primario

### Fase 3: Sincronizzazione Intelligente
Implementare un sistema di sincronizzazione che:
- Rileva conflitti tra locale e cloud
- Applica strategia "last-write-wins"
- Registra tutte le operazioni in evento log

## Priorità Implementazione

1. **Alta**: Unificazione percorsi (impatto immediato)
2. **Alta**: Convergenza modelli (evita future confusioni)
3. **Media**: Sincronizzazione intelligente (migliora UX)

## File Interessati

- `src/lib/storage.ts` - Richiede aggiornamento percorsi
- `src/lib/firebase-service.ts` - Richiede aggiornamento percorsi
- `src/lib/quote-model.ts` - Potrebbe estendere SavedQuote
- `SECURITY.md` - Aggiornare regole Firestore
- `DEPLOY.md` - Aggiornare documentazione deployment
