# Preventivi-Smart Pro

Verifica in pochi secondi se il preventivo dell'artigiano è onesto.
Confronto con prezzi di mercato regionali, verdetto chiaro e consigli pratici.

App **italiana**, dark theme premium, **frontend puro** (nessun backend),
dati salvati localmente sul browser dell'utente.

## Stack

- **React 19** + **TypeScript**
- **Vite 7** (dev server e build)
- **Tailwind CSS 4** + componenti **shadcn/ui** (Radix)
- **Recharts** per i grafici
- **Framer Motion** per le animazioni
- **Lucide** per le icone
- **localStorage** per l'archivio preventivi

Nessun backend, nessuna registrazione, nessun tracciamento.

## Avvio rapido

Servono **Node.js 22+** e **pnpm**.

```bash
# 1. Installa le dipendenze
pnpm install

# 2. Avvia in sviluppo (http://localhost:5173)
pnpm run dev

# 3. Esegui i test
pnpm test

# 4. Build di produzione (cartella dist/)
pnpm run build

# 5. Anteprima della build
pnpm run preview

# 6. Controllo tipi TypeScript
pnpm run typecheck
```

## Struttura del progetto

```
preventivi-smart-pro/
├── index.html              # entry HTML (lang="it", meta SEO)
├── vite.config.ts          # config Vite + alias @/ → src/
├── tsconfig.json           # config TypeScript strict
├── tailwind                # configurato via @tailwindcss/vite + src/index.css
├── components.json         # configurazione shadcn/ui
└── src/
    ├── main.tsx            # entrypoint React
    ├── App.tsx             # shell principale (landing + wizard)
    ├── index.css           # design system: palette dark, fonts, utilities
    ├── lib/
    │   ├── pricing.ts      # 8 categorie, ~30 lavori, 20 regioni, calcolo mercato
    │   ├── verdict.ts      # 5 verdetti + raccomandazioni in italiano
    │   ├── storage.ts      # archivio in localStorage
    │   ├── format.ts       # formatter € e date in locale it-IT
    │   └── utils.ts        # cn() helper per Tailwind
    ├── components/
    │   ├── Header.tsx      # logo + bottone archivio
    │   ├── Hero.tsx        # "Il prezzo è giusto?" + CTA
    │   ├── HowItWorks.tsx  # 3 passi
    │   ├── Categories.tsx  # 8 categorie cliccabili
    │   ├── Trust.tsx       # ISTAT, GDPR, anonimo
    │   ├── Examples.tsx    # 3 casi reali
    │   ├── FAQ.tsx         # accordion domande frequenti
    │   ├── Footer.tsx      # copyright e link
    │   ├── Wizard.tsx      # wizard 3-passi (price asked once)
    │   ├── Results.tsx     # verdetto + chart + breakdown + consigli
    │   ├── Archive.tsx     # sheet con preventivi salvati
    │   └── ui/             # primitive shadcn (Radix)
    └── hooks/              # hook utility
```

## Le due modalità del wizard

1. **Analizza Preventivo** (3 passi):
   `categoria → dettagli → prezzo → verdetto`
   Il prezzo viene chiesto **una sola volta**, sul passo dedicato.

2. **Stima Rapida** (2 passi):
   `categoria → dettagli → fascia di mercato`
   Nessun prezzo richiesto: l'app mostra il range onesto.

## Modello di prezzo

Per ogni lavoro: prezzo base × moltiplicatori dei campi × quantità × moltiplicatore regionale.
Fascia onesta: `[mid × 0.78, mid × 1.28]`.

Verdetti:
- **Sospetto**: `< marketMin × 0.85` (anomalmente basso)
- **Ottimo**: `≤ marketMin`
- **Equo**: `≤ marketMax`
- **Alto**: `≤ marketMax × 1.20`
- **Troppo alto**: oltre

Composizione costo: 55% manodopera, 35% materiali, 10% margine impresa.

## Personalizzazione

- **Categorie e prezzi**: `src/lib/pricing.ts` — aggiungi un job nell'array
  `CATEGORIES`, oppure modifica `REGIONS` per cambiare i moltiplicatori
  regionali.
- **Soglie verdetto**: `src/lib/verdict.ts`.
- **Palette colori**: variabili HSL in `src/index.css` (`--background`,
  `--primary`, `--accent`...).
- **Testi e copy**: tutti i componenti in `src/components/`. Sono semplici
  componenti React, niente i18n in mezzo.

## Deploy

Genera una build statica in `dist/` con `npm run build`. Puoi pubblicarla
ovunque (Vercel, Netlify, Cloudflare Pages, GitHub Pages, qualunque
hosting statico). Esempi:

- **Vercel**: collega il repo, framework `Vite`, build `npm run build`,
  output `dist`.
- **Netlify**: build `npm run build`, publish directory `dist`.
- **GitHub Pages**: builda in locale e committa `dist/` su un branch
  `gh-pages` (oppure usa una action). Se servi da un sotto-percorso,
  imposta `base: "/nome-repo/"` in `vite.config.ts`.

## Licenza

MIT — fai quello che vuoi, ma sii chiaro coi tuoi utenti su come stimi
i prezzi e dichiara la fonte dei dati di mercato.
