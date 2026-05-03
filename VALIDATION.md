# Validation System — Phase 4

## Overview

Three-level validation system ensures only high-quality, reliable data enters the training dataset.

```
Livello 1: Errori impossibili (Structural)
    ↓
Livello 2: Coerenza interna (Business logic)
    ↓
Livello 3: Statistica (Outliers & anomalies)
    ↓
qualityScore (0-100) + anomalyScore (0-100) + validated (boolean)
```

---

## Livello 1: Errori Impossibili (Structural Validation)

**Severity**: ERROR — Quote rejected if any Level 1 error

### Required Fields
- `id`, `numero`, `uid` (immutabili)
- `data` (ISO 8601, non oltre 2 anni fa)
- `cliente.nome` (required)
- `ambito`, `sottotipo` (categorizzazione)
- `stato` (enum: bozza|finalizzato|inviato|accettato|rifiutato|archiviato)
- `source` (enum: manuale|pdf|ocr|import)
- `servizi` (array, non-empty)
- `totale` (number > 0)

### Per-Service Validation
- `descrizione` (required, non-empty)
- `quantita` > 0
- `prezzoUnitario` ≥ 0
- `totale` ≥ 0

### Ranges
- `mq` (if present): 1 ≤ mq ≤ 1,000,000
- `data`: Non più di 2 anni fa

**Example Error**:
```
level: 1
field: "totale"
message: "Totale preventivo mancante o non valido"
severity: "error"
```

---

## Livello 2: Coerenza Interna (Business Logic)

**Severity**: ERROR or WARNING

### 1. Coherence: Sum of Services = Total
- Somma totali servizi deve corrispondere a totale preventivo
- Tolleranza: max(5%, €5)

**Formula**:
```
abs(sum(servizi[i].totale) - quote.totale) <= max(0.05 * quote.totale, 5)
```

**Example**:
```
Servizi: €1000 + €500 + €200 = €1700
Dichiarato: €1800
Differenza: €100 (5.9% > 5%) → WARNING
```

### 2. Per-Service Calculation
- Ogni riga: quantita × prezzoUnitario ≈ totale
- Tolleranza: max(2%, €1)

### 3. Plausible Units
Accepted units: `mq`, `m²`, `m`, `pz`, `pezzo`, `ora`, `h`, `giorno`, `gg`, `kg`, `litro`, `l`, `unità`, `forfettario`

### 4. Scope-Service Compatibility
- Soft checks for inconsistencies
- Example: "Posa piastrelle" in "Impianti" → WARNING

**Example Errors**:
```
level: 2
field: "totale"
message: "Totale incoerente: servizi €1700, dichiarato €1800 (diff: €100)"
severity: "error"

level: 2
field: "servizi[1].totale"
message: "Totale servizio incoerente: 10 × €50 = €500, dichiarato €480"
severity: "warning"
```

---

## Livello 3: Statistica (Outlier Detection)

**Severity**: WARNING — Doesn't fail validation, but flags anomalies

### 1. Z-Score Analysis
- Misura: `z = (price - mean) / stdDev`
- Soglia: |z| > 3 → WARNING

**Formula**:
```
if |z| > 3:
  warning: "Prezzo anomalo (z-score: 3.5)"
```

### 2. Range Check (IQR Method)
- Price < min/10 or price > max*10 → WARNING

### 3. Segment-Specific Analysis
- Per ogni `sottotipo`, controlla deviation da segment average
- Soglia: >50% diff → WARNING

**Context**: Dati ISTAT 2025

```typescript
"edilizia:muratura": {
  averagePrice: 3500,
  stdDev: 1200,
  minPrice: 500,
  maxPrice: 15000,
  avgBySegment: {
    "muratura-interna": 2800,
    "muratura-esterna": 4200,
  }
}
```

**Example**:
```
Segmento: "muratura-interna"
Avg segmento: €2800
Quote price: €6000
Deviation: (6000-2800)/2800 = 114% → WARNING
```

---

## Quality & Anomaly Scores

### Quality Score (0-100)
Base: 100
- Level 1 error: -25
- Level 1 warning: -10
- Level 2 warning: -5
- Level 3 warning: -3

**Example**:
```
1 Level 1 error: 100 - 25 = 75
1 Level 2 warning: 75 - 5 = 70
2 Level 3 warnings: 70 - 6 = 64
Final: 64% (borderline)
```

### Anomaly Score (0-100)
- 0: Normal
- 20 per Level 3 warning (max 100)

**Example**:
```
2 Level 3 warnings: 2 × 20 = 40 (anomaly detected)
```

---

## Validation Status Classification

```
Quality ≥ 80 + No Level 1 errors     → ACCEPTED (✅)
Quality 50-79 + No Level 1 errors    → REVIEW (⚠️)
Quality < 50 or Level 1 errors       → REJECTED (❌)
```

### Training Eligibility
- Quality ≥ 70%
- No Level 1 errors
- Anomaly < 60%

---

## Usage in Code

```typescript
import { validateQuoteMultiLevel, isQuoteValidForTraining } from "@/lib/validation-rules";
import { validationContext } from "@/lib/validation-context";

// Valida preventivo
const context = validationContext.getContext("edilizia", "muratura");
const result = validateQuoteMultiLevel(quote, context);

// Controlla qualità
if (isQuoteValidForTraining(result, 70)) {
  // Quote è pronto per training
}

// Mostra errori all'utente
result.errors.forEach(err => {
  console.log(`[L${err.level}] ${err.field}: ${err.message}`);
});
```

---

## Data Flow

```
PDF/Manual Input
    ↓
OCR Pipeline (Phase 3)
    ↓
validateQuoteMultiLevel()
    ↓
qualityScore, anomalyScore, validated
    ↓
if (validated && qualityScore ≥ 70):
    → Add to training dataset
else:
    → Save as "review" | "rejected"
    → Show warnings to user
```

---

## Context Management

### Initial Data (ISTAT 2025)
Hardcoded baseline per categoria italiana (20 regioni, 8 macro-categorie).

### Updates
- Ogni validated quote (quality ≥ 75%) aggiorna context
- Rolling average: `new_avg = old_avg * (n-1)/n + price/n`
- In produzione: backend batch job giornaliero

### Export/Import
```typescript
// Salva stato corrente
const backup = validationContext.export();

// Ripristina
validationContext.import(backup);

// Reset a baseline
validationContext.reset();
```

---

## Future Enhancements

**Phase 5**: Train model only from validated quotes
**Phase 6**: Add segment-specific pricing engine
**Phase 7**: Implement confidence engine (verde/giallo/rosso)
**Phase 8**: UX improvements (guided user feedback)
