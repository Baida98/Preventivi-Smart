# Documentazione Tecnica Avanzata - Preventivi Smart

**Autore**: Manus AI
**Data**: 30 Aprile 2026

## 1. Introduzione

Questo documento fornisce una panoramica tecnica approfondita dell'applicazione **Preventivi Smart**, uno strumento progettato per aiutare gli utenti a stimare e analizzare preventivi per vari servizi artigianali. L'obiettivo è garantire trasparenza e sicurezza nelle transazioni, fornendo un'analisi di mercato e un verdetto sul prezzo proposto. Questa documentazione copre l'architettura, la logica di business, le misure di sicurezza e la strategia di testing implementate nel progetto.

## 2. Architettura del Progetto

Il progetto **Preventivi Smart** è una Single Page Application (SPA) sviluppata con **React** e **TypeScript**, utilizzando **Vite** come build tool e **TailwindCSS** per lo styling. La struttura del progetto è organizzata in modo modulare per facilitare la manutenibilità e l'espansione.

### 2.1. Struttura delle Directory Principali

```
preventivi-smart/
├── public/                 # Risorse statiche (immagini, favicon)
├── src/                    # Codice sorgente dell'applicazione
│   ├── App.tsx             # Componente principale dell'applicazione
│   ├── components/         # Componenti React riutilizzabili (es. Wizard, Header, Footer)
│   │   └── ui/             # Componenti UI generici (shadcn/ui)
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Logica di business e utility (pricing, verdict, storage, validation, security)
│   ├── pages/              # Pagine principali dell'applicazione (es. not-found)
│   ├── test/               # Test unitari e di integrazione
│   └── ...
├── .gitignore              # File e directory da ignorare per Git
├── package.json            # Dipendenze e script del progetto
├── vite.config.ts          # Configurazione di Vite
├── vitest.config.ts        # Configurazione di Vitest
├── SECURITY.md             # Documentazione sulla sicurezza
└── README.md               # Descrizione generale del progetto
```

### 2.2. Tecnologie Utilizzate

| Tecnologia       | Descrizione                                                                  |
| :---------------- | :--------------------------------------------------------------------------- |
| **React**         | Libreria JavaScript per la costruzione di interfacce utente.                 |
| **TypeScript**    | Superset di JavaScript che aggiunge la tipizzazione statica.                 |
| **Vite**          | Tool di build rapido per lo sviluppo frontend.                               |
| **TailwindCSS**   | Framework CSS utility-first per uno styling rapido e responsivo.             |
| **Zod**           | Libreria per la validazione degli schemi, TypeScript-first.                  |
| **Vitest**        | Framework di testing unitario e di integrazione, compatibile con Vite.       |
| **Framer Motion** | Libreria per animazioni e interazioni UI.                                    |
| **Lucide React**  | Libreria di icone.                                                           |
| **Sonner**        | Libreria per notifiche toast.                                                |

## 3. Logica di Pricing (`src/lib/pricing.ts`)

Il modulo `pricing.ts` definisce la struttura dei dati per categorie, lavori, opzioni di campo e regioni, oltre alla logica centrale per il calcolo del prezzo di mercato.

### 3.1. Strutture Dati Principali

-   **`FieldOption`**: Definisce un'opzione per un campo specifico, con un `value`, una `label` e un `multiplier` che influenza il prezzo.
-   **`Field`**: Rappresenta un campo configurabile per un lavoro, contenente un `id`, una `label` e un array di `FieldOption`.
-   **`Job`**: Descrive un servizio specifico (es. 
Muratura generica), con `id`, `label`, `categoryId`, `base` (prezzo base), `unit`, `unitLabel`, `defaultQty` e un array di `Field`.
-   **`Category`**: Raggruppa i `Job` correlati, con `id`, `label`, `Icon` (icona Lucide React), `blurb` (breve descrizione) e un array di `Job`.
-   **`REGIONS`**: Un array di oggetti che definiscono le regioni italiane, ciascuna con un `id`, `label` e un `multiplier` che aggiusta il prezzo base in base alla località.

### 3.2. Funzione `computeMarket`

La funzione `computeMarket` è il cuore della logica di pricing. Calcola il prezzo atteso di un servizio e i relativi intervalli di mercato (minimo, medio, massimo) basandosi su:

-   **`job`**: Lavoro selezionato.
-   **`regionId`**: ID della regione selezionata dall'utente.
-   **`quantity`**: Quantità del servizio (es. metri quadri).
-   **`fieldValues`**: Valori selezionati per i campi extra del lavoro.

Il calcolo avviene come segue:

1.  **Moltiplicatore Regionale (`regMul`)**: Recupera il moltiplicatore dalla costante `REGIONS` in base a `regionId`. Se non trovato, usa `1`.
2.  **Moltiplicatore Extra (`extras`)**: Itera sui `fieldValues` forniti dall'utente. Per ogni campo, trova l'opzione corrispondente e aggiunge il suo `multiplier` al valore base di `1`.
3.  **Prezzo Atteso (`expected`)**: Viene calcolato come `job.base * extras * Math.max(1, quantity) * regMul`.
4.  **Analisi di Mercato**: Vengono derivati `marketMin`, `marketMid` (uguale a `expected`) e `marketMax` applicando percentuali fisse al prezzo atteso (es. `expected * 0.78` per `marketMin`).

```typescript
// src/lib/pricing.ts
export function computeMarket(
  job: Job,
  regionId: string,
  quantity: number,
  fieldValues: Record<string, string>,
): MarketAnalysis {
  const region = REGIONS.find((r) => r.id === regionId);
  const regMul = region?.multiplier ?? 1;
  let extras = 1;
  for (const f of job.fields) {
    const v = fieldValues[f.id];
    if (!v) continue;
    const opt = f.options.find((o) => o.value === v);
    if (opt) extras += opt.multiplier;
  }
  const expected = job.base * extras * Math.max(1, quantity) * regMul;
  return {
    expected,
    marketMin: expected * 0.78,
    marketMid: expected,
    marketMax: expected * 1.28,
    pricePerUnit: (job.base * extras * regMul),
    manodopera: expected * 0.55,
    materiali: expected * 0.35,
    margine: expected * 0.1,
  };
}
```

## 4. Logica di Verdetto (`src/lib/verdict.ts`)

Il modulo `verdict.ts` è responsabile di analizzare il prezzo fornito dall'utente rispetto all'analisi di mercato e assegnare un 
verdetto (es. Ottimo, Equo, Alto, Sospetto). Fornisce anche raccomandazioni specifiche basate sul verdetto.

### 4.1. Funzione `judge`

La funzione `judge` prende in input il `price` fornito dall'utente e l'oggetto `MarketAnalysis` calcolato da `computeMarket`. Determina il verdetto confrontando il prezzo con gli intervalli `marketMin`, `marketMid` e `marketMax`.

```typescript
// src/lib/verdict.ts
export function judge(price: number, m: MarketAnalysis): Verdict {
  const diffPct = (price - m.marketMid) / m.marketMid;
  let v: VerdictKey;
  if (price < m.marketMin * 0.85) v = "sospetto";
  else if (price <= m.marketMin) v = "ottimo";
  else if (price <= m.marketMax) v = "equo";
  else if (price <= m.marketMax * 1.2) v = "alto";
  else v = "troppo-alto";

  // ... (omissis per brevità, include raccomandazioni e etichette)

  return {
    key: v,
    ...labels[v],
    color: COLORS[v],
    recommendations: recommendations[v],
  };
}
```

I verdetti sono categorizzati come segue:

| Verdetto      | Descrizione                                                                                                                              |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Sospetto**  | Il prezzo è anomalamente basso (inferiore all'85% del `marketMin`), suggerendo potenziali problemi di qualità o conformità.             |
| **Ottimo**    | Il prezzo è inferiore o uguale al `marketMin`, indicando un'ottima offerta.                                                              |
| **Equo**      | Il prezzo rientra nell'intervallo di mercato (`marketMin` - `marketMax`), considerato un prezzo giusto.                                  |
| **Alto**      | Il prezzo è superiore al `marketMax` ma entro il 120% di esso, suggerendo un margine di trattativa.                                      |
| **Troppo Alto** | Il prezzo è significativamente superiore al 120% del `marketMax`, indicando un prezzo eccessivo che richiede ulteriori confronti. |

## 5. Validazione e Sicurezza

L'applicazione implementa robuste misure di validazione e sicurezza per proteggere l'integrità dei dati e prevenire vulnerabilità comuni.

### 5.1. Validazione degli Input con Zod (`src/lib/validation.ts`)

**Zod** è utilizzato per definire schemi di validazione rigorosi per tutti i dati in ingresso. Questo garantisce che i dati siano del tipo e formato attesi, prevenendo errori e attacchi basati su input non validi.

-   **`WizardDataSchema`**: Schema per la validazione dei dati inseriti nel wizard (categorie, lavori, regioni, quantità, valori dei campi, note, prezzo).
-   **`QuoteInputSchema`**: Schema per la validazione dei dati di un preventivo salvato.
-   **`validateWizardData` / `validateQuoteInput`**: Funzioni per eseguire la validazione.
-   **`validateAndSanitizeWizardData`**: Combina validazione e sanitizzazione.

### 5.2. Sanitizzazione e Prevenzione XSS (`src/lib/validation.ts`)

-   **`sanitizeString(input: string)`**: Rimuove caratteri potenzialmente pericolosi (`<`, `>`) e limita la lunghezza delle stringhe per prevenire attacchi Cross-Site Scripting (XSS).
-   **`encodeHtml(text: string)`**: Converte caratteri speciali HTML in entità HTML per evitare che vengano interpretati come codice eseguibile nel browser.

### 5.3. Header di Sicurezza HTTP (`src/lib/security.ts`)

L'applicazione configura meta tag per gli header di sicurezza HTTP per mitigare diverse classi di attacchi web:

-   **`X-Content-Type-Options: nosniff`**: Impedisce al browser di "indovinare" il tipo MIME di un file, riducendo il rischio di attacchi basati su script eseguiti con un tipo MIME errato.
-   **`X-Frame-Options: DENY`**: Impedisce che la pagina venga inclusa in un `<iframe>`, ` <frame>`, `<embed>` o `<object>`, proteggendo da attacchi di clickjacking.
-   **`X-XSS-Protection: 1; mode=block`**: Abilita la protezione XSS integrata nei browser moderni.
-   **`Referrer-Policy: strict-origin-when-cross-origin`**: Controlla quali informazioni del referrer vengono inviate nelle richieste, migliorando la privacy.
-   **`Permissions-Policy`**: Disabilita l'accesso a funzionalità sensibili del browser (es. geolocalizzazione, microfono, fotocamera) se non esplicitamente necessarie.
-   **`Content-Security-Policy` (CSP)**: Definisce una whitelist di sorgenti consentite per script, stili, immagini, ecc., bloccando l'esecuzione di codice malevolo da sorgenti non autorizzate.

## 6. Strategia di Testing

Il progetto adotta una strategia di testing basata su **Vitest** e **React Testing Library** per garantire l'affidabilità e la correttezza della logica di business e dei componenti UI.

### 6.1. Configurazione di Vitest

-   **`vitest.config.ts`**: Configura Vitest per utilizzare l'ambiente `jsdom` (per testare componenti React in un ambiente DOM simulato) e `globals: true` per un accesso più semplice alle API di test. Il file `setup.ts` viene eseguito prima di ogni test suite.
-   **`src/test/setup.ts`**: Configura `jest-dom` per estendere le capacità di `expect` con matchers specifici per il DOM e assicura la pulizia del DOM dopo ogni test (`cleanup()`).

### 6.2. Test Unitari

-   **`src/test/pricing.test.ts`**: Contiene test per la funzione `computeMarket`, verificando il calcolo del prezzo base, l'applicazione dei moltiplicatori regionali e dei campi extra. Assicura che la logica di pricing sia accurata e robusta.
-   **`src/test/verdict.test.ts`**: Contiene test per la funzione `judge`, verificando che i verdetti (Ottimo, Equo, Alto, Sospetto, Troppo Alto) siano assegnati correttamente in base al prezzo fornito e all'analisi di mercato. Questo garantisce che il feedback all'utente sia sempre coerente e significativo.
-   **`src/test/validation.test.ts`**: Contiene test per le funzioni di validazione e sanitizzazione (`validateWizardData`, `sanitizeString`, `validateAndSanitizeWizardData`), assicurando che gli input siano correttamente validati, che i dati invalidi vengano rifiutati e che le stringhe siano sanitizzate per prevenire XSS.

### 6.3. Esecuzione dei Test

I test possono essere eseguiti tramite il comando:

```bash
npm test
```

Questo comando avvierà Vitest ed eseguirà tutti i test definiti nelle directory appropriate, fornendo un feedback immediato sulla qualità del codice.

## 7. Conclusioni

L'applicazione **Preventivi Smart** è stata progettata con un'attenzione particolare alla modularità, alla correttezza della logica di business e alla sicurezza. L'implementazione di test unitari completi e di misure di sicurezza proattive garantisce un'esperienza utente affidabile e protetta, ponendo le basi per future espansioni e miglioramenti.

---

### Riferimenti

[1] React Documentation: [https://react.dev/](https://react.dev/)
[2] TypeScript Documentation: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
[3] Vite Documentation: [https://vitejs.dev/](https://vitejs.dev/)
[4] TailwindCSS Documentation: [https://tailwindcss.com/](https://tailwindcss.com/)
[5] Zod Documentation: [https://zod.dev/](https://zod.dev/)
[6] Vitest Documentation: [https://vitest.dev/](https://vitest.dev/)
[7] React Testing Library Documentation: [https://testing-library.com/docs/react-testing-library/intro/](https://testing-library.com/docs/react-testing-library/intro/)
[8] OWASP Top 10: [https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)
[9] WCAG 2.1: [https://www.w3.org/TR/WCAG21/](https://www.w3.org/TR/WCAG21/)
