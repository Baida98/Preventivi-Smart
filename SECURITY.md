# Security Policy — Preventivi Smart Pro

## Phase 2: Data Isolation & Access Control

### Overview
This document defines the security model for Firestore data access. Every operation is scoped to the authenticated user (`uid`).

### Principles

1. **Ownership enforcement**: Every quote has an immutable `uid` field matching the creator
2. **No global queries**: Users cannot see other users' data
3. **Server-side validation**: Firestore rules validate required fields and data integrity
4. **Immutable identity**: Cannot change `uid`, `createdAt`, `numero` after creation
5. **State control**: Only valid state transitions allowed

### Firestore Rules Structure

#### Collection: `users/{uid}`
- **Read**: Only owner can read their own user document
- **Create**: Only authenticated user can create their own document
- **Update**: Cannot change `uid` or `createdAt` (immutable)
- **Delete**: Only owner can delete

#### Collection: `users/{uid}/quotes/{quoteId}`
- **Read**: Only owner can read their quotes
- **Create**: 
  - `uid` must match request user
  - All required fields must be present (validated server-side)
  - `createdAt` = `request.time`
  - `updatedAt` = `request.time`
  - `stato` must be valid enum value
  - `source` must be valid enum value
  - `totale` ≥ 0
  - `servizi` array non-empty

- **Update**:
  - `uid`, `createdAt`, `numero` are immutable
  - `updatedAt` automatically set to `request.time`
  - Same validation as create
  
- **Delete**: Only owner can delete

#### Collection: `users/{uid}/counters/quotes`
- Maintains per-user quote counter for auto-numbering
- Read/write scoped to owner only
- Auto-updated by `createQuote()` transaction

### Validation Rules

**Required Fields:**
- `id` (string, non-empty)
- `numero` (string, auto-generated format YYYY-NNNN)
- `uid` (string, equals `request.auth.uid`)
- `data` (ISO 8601 date string)
- `createdAt` (timestamp, immutable)
- `updatedAt` (timestamp, updated on each write)
- `cliente` (object with at least `nome` field)
- `ambito` (string, non-empty)
- `sottotipo` (string, non-empty)
- `stato` (enum: bozza|finalizzato|inviato|accettato|rifiutato|archiviato)
- `source` (enum: manuale|pdf|ocr|import)
- `servizi` (array, non-empty)
- `totale` (number ≥ 0)

**Optional Fields:**
- `mq` (number)
- `qualityScore`, `anomalyScore` (number 0-100)
- `validated` (boolean)
- `verdict`, `verdictLabel`
- `marketMin`, `marketMid`, `marketMax`
- `receivedPrice`
- `note`

### Deployment

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database → Rules
4. Replace the default rules with content from `firestore.rules`
5. Publish rules

### Testing

Use the Firestore Rules Simulator in Console:

**Test 1: User A cannot read User B's quotes**
```
uid: "userA"
path: users/userB/quotes/quote1
operation: read
Expected: DENY
```

**Test 2: User can create own quote with valid data**
```
uid: "userA"
path: users/userA/quotes/newQuote
operation: create
data: {
  id: "abc",
  numero: "2026-0001",
  uid: "userA",
  data: "2026-05-03",
  createdAt: now,
  updatedAt: now,
  cliente: {nome: "Mario"},
  ambito: "edilizia",
  sottotipo: "muratura",
  stato: "finalizzato",
  source: "manuale",
  servizi: [{...}],
  totale: 1000
}
Expected: ALLOW
```

**Test 3: User cannot forge uid on create**
```
uid: "userA"
data with uid: "userB"
Expected: DENY
```

### Common Issues

**Issue**: `PERMISSION_DENIED: Missing or insufficient permissions`
- **Cause**: User not authenticated or trying to access other user's data
- **Fix**: Check `request.auth` is not null and `uid` matches

**Issue**: `Invalid data - required field missing`
- **Cause**: Quote missing required fields like `ambito`, `sottotipo`, `stato`, `source`
- **Fix**: Ensure `createEmptyQuote()` and `createQuote()` populate all required fields

**Issue**: Unauthenticated users cannot read
- **Cause**: Firestore rules require `isSignedIn()` check
- **Fix**: For guest mode (localStorage), don't use Firestore — use local storage only

### Future Phases

**Phase 3**: Add validation webhooks for OCR data
**Phase 4**: Add audit logs (read/write timestamps + user agent)
**Phase 5**: Rate limiting on write operations
