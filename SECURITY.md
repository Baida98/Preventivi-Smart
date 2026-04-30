# Sicurezza e Validazione - Preventivi Smart

## Panoramica

Questo documento descrive le misure di sicurezza implementate nell'applicazione Preventivi Smart per proteggere i dati degli utenti e prevenire attacchi comuni.

## 1. Validazione degli Input con Zod

Tutti gli input dell'utente sono validati utilizzando **Zod**, uno schema validator TypeScript-first.

### Schema di Validazione

```typescript
// src/lib/validation.ts
export const WizardDataSchema = z.object({
  categoryId: z.string().min(1).max(50),
  jobId: z.string().min(1).max(50),
  regionId: z.string().min(1).max(50),
  quantity: z.number().positive().finite(),
  fieldValues: z.record(z.string(), z.string().max(100)),
  notes: z.string().max(2000).optional(),
  price: z.number().positive().finite().optional(),
});
```

### Funzioni di Validazione

- `validateWizardData(data)`: Valida i dati del wizard
- `validateQuoteInput(data)`: Valida i dati di un preventivo
- `validateAndSanitizeWizardData(data)`: Valida e sanitizza i dati

## 2. Prevenzione XSS

### Sanitizzazione delle Stringhe

La funzione `sanitizeString()` rimuove caratteri pericolosi:
- Rimuove `<` e `>`
- Limita la lunghezza a 2000 caratteri
- Esegue il trim dei whitespace

### HTML Encoding

La funzione `encodeHtml()` codifica i caratteri speciali:
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#039;`

## 3. Header di Sicurezza HTTP

### Headers Implementati

```typescript
// src/lib/security.ts
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};
```

### Content Security Policy

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';
```

## 4. Test di Sicurezza

Tutti i componenti di validazione e sicurezza hanno test unitari:

```bash
npm test
```

### Test Inclusi

- Validazione dei dati del wizard
- Rifiuto di dati invalidi
- Sanitizzazione delle stringhe
- Protezione da input troppo lunghi
- Validazione dei numeri positivi

## 5. Best Practices di Sicurezza

### Per gli Sviluppatori

1. **Sempre validare gli input**: Utilizzare `validateWizardData()` prima di elaborare i dati
2. **Sanitizzare le stringhe**: Utilizzare `sanitizeString()` per i dati user-generated
3. **Usare TypeScript**: Sfruttare il type checking per prevenire errori
4. **Non fidarsi del client**: Implementare validazione anche lato server se necessario

### Per gli Utenti

1. **Non condividere i dati**: I preventivi sono salvati localmente nel browser
2. **Usare HTTPS**: Assicurarsi di accedere all'app tramite HTTPS
3. **Logout**: Pulire il browser cache se si usa un dispositivo condiviso

## 6. Conformità e Standard

- **OWASP Top 10**: Protezione da XSS, Injection, CSRF
- **WCAG 2.1**: Accessibilità (in fase di implementazione)
- **GDPR**: Nessun dato sensibile è trasmesso o memorizzato su server

## 7. Segnalazione di Vulnerabilità

Se scopri una vulnerabilità di sicurezza, contatta il team di sviluppo direttamente.
Non pubblicare vulnerabilità pubblicamente prima di una patch.

---

*Ultimo aggiornamento: 30 Aprile 2026*
