# Preventivi-Smart Pro v31.1 — Visibilità Massima Grafici

  Versione 31.1 = v31.0 FINAL + revisione totale visibilita grafici.
  Sostituisci il contenuto della tua cartella GitHub con questo zip.

  ═══════════════════════════════════════════════════════════════════
  COSA CAMBIA IN v31.1 (rispetto a v31.0)
  ═══════════════════════════════════════════════════════════════════

  PROBLEMA: l'utente ha segnalato che i grafici erano ancora poco
  chiari. I valori in € erano leggibili solo "leggendo" l'asse Y,
  le etichette troppo piccole, le barre neutre quasi invisibili.

  CORREZIONI chart-renderer.js (riscritto v31.1):

  1) VALORI MOSTRATI SOPRA OGNI BARRA
     Plugin custom Chart.js che disegna €2800, €3500, ecc. in
     grassetto direttamente sopra ogni colonna. Non serve piu
     "leggere" il valore dall'asse Y per ogni barra.

  2) "TUO PREZZO" GRIDA
     - Label X-axis: 14px font-weight 900, bianco puro
     - Valore sopra la barra: 14px font-weight 800, bianco puro
     - Bordo barra: 4px (era 3px) in tinta semantica brillante
       rosso/verde/arancione

  3) CONTRASTO RADDOPPIATO
     - Tick assi Y: font 12px / weight 700 / colore #e2e8f0 (slate-200)
     - Tick assi X: 13px / weight 700 / slate-200
     - Barre neutre Min/Max: opacita 0.35 (era 0.18)
     - Bordo barre neutre: opacita 0.7 (era 0.4)

  4) TOOLTIP MIGLIORATI
     - Padding 14px, font 14-15px grassetto
     - Titolo include verdetto: "Tuo Prezzo (TROPPO ALTO)"

  5) GRAFICO TREND + GAUGE
     - Punti linea: bianchi con bordo blu 2.5px (era 2px)
     - Border width linea: 3px (era 2px)
     - Gauge: cutout 78% piu visibile

  Il resto del pacchetto e' invariato rispetto a v31.0 (vedi sotto).

  ═══════════════════════════════════════════════════════════════════
  RIEPILOGO COMPLETO DI TUTTE LE MODIFICHE (v30.0 -> v31.0 FINAL)
  ═══════════════════════════════════════════════════════════════════

  ## 1) GRAFICA & UX (era v30.1)

  - .trade-card-icon ingrandita: 44 -> 88px desktop, 72px tablet, 60px mobile
  - Filter brightness/saturate sulle icone per visibilita su sfondo scuro
  - Drop-shadow + hover scale animato sulle card
  - Coerenza Font Awesome su header / hero / form / button / card-title
  - Smooth scroll globale + scroll-margin per anchor
  - Polish .card / .btn / .quote-item / header backdrop blur
  - Accessibilita :focus-visible (outline coerente per tastiera)
  - Supporto prefers-reduced-motion (animazioni disattivate per chi ha
    problemi di motion sickness o impostazioni di sistema dedicate)

  ## 2) SICUREZZA (era v30.2)

  - firestore.rules:
    * Sezione quotes con resource.data.get('uid','') -> fail-safe per
      documenti legacy senza campo uid
    * isAdmin() override su read/update/delete
  - vercel.json:
    * Header HSTS preload (max-age=63072000, 2 anni, includeSubDomains, preload)
    * Cross-Origin-Opener-Policy: same-origin
    * Rewrites con esclusione di privacy.html e /assets dal fallback SPA
  - escape-html.js gia presente per prevenzione XSS

  ## 3) GDPR / PRIVACY (era v30.2)

  - privacy.html: pagina completa GDPR-compliant con:
    * Indice navigabile (TOC)
    * Sezioni: Titolare trattamento, Dati raccolti, Base giuridica,
      Finalita, Conservazione, Diritti utente, DPO contacts
  - Footer index.html con link "Privacy Policy" e "Contatti GDPR"

  ## 4) PERFORMANCE - IMMAGINI (era v30.3)

  Hero banner:
    hero_banner.png         2384 KB -> 749 KB  (-69%) | webp 167 KB
    hero_banner_light.png   1978 KB -> 593 KB  (-70%) | webp  91 KB
    (ridimensionati a max 1920px width, ricompressi)

  Icone categorie (10 file):
    icon_*.png              ~500 KB -> ~14 KB ognuno  (-97%)
    (ridimensionate a 256px max + palette PNG)

  Totale assets: 8.65 MB -> 1.43 MB (-85%)

  ## 5) DATABASE - INDICI (era v30.4)

  - firestore.indexes.json con 2 indici compositi:
    * quotes(uid ASC, createdAt DESC) — lista preventivi recenti
    * quotes(uid ASC, updatedAt DESC) — ordinamento per modifica
  - Rimosse 9 webp icone (PNG ottimizzati piu piccoli, inutili)
  - Mantenuti webp solo per gli hero (uso futuro)

  ## 6) FIX CONTRASTI GRAFICI (era v30.5)

  PROBLEMA: chart-renderer usava prefers-color-scheme per scegliere
  i colori, ma l'app e' SEMPRE in dark theme. Per chi aveva il sistema
  in modalita chiara, le scritte degli assi diventavano scure
  (#475569, #64748b) su sfondo scuro -> invisibili.

  CORREZIONI chart-renderer.js (riscritto):
  - Rimosso check prefers-color-scheme (app sempre dark)
  - Etichette assi: #cbd5e1 (slate-300, contrasto AA garantito)
  - Griglie: rgba(148,163,184,0.15) — discrete ma visibili
  - Tooltip: fondo slate-900 + testo bianco esplicito
  - Barre Min/Max neutre con opacita aumentata (stacco netto)
  - Barra "TUO PREZZO": label BIANCO PURO grassetto 13px + bordo
    semantico chiaro (rosso/verde/arancione brillanti)
  - Linea trend: punti bianchi su contorno blu chiaro #60a5fa
  - Gauge: arco blu chiaro invece di indaco scuro

  CORREZIONI app.js (3 colori cambiati):
  - Label "Tuo Prezzo": #6366f1 -> #a5b4fc (contrasto 3.1 -> 4.8:1)
  - Icona "Composizione del Costo": #8b5cf6 -> #c4b5fd
  - Icona "Manodopera": #6366f1 -> #a5b4fc

  Risultato: tutti i testi nei grafici e nelle card hanno ora
  contrasto WCAG AA minimo 4.5:1, nessun testo scuro su fondo scuro.

  ═══════════════════════════════════════════════════════════════════
  COME PUBBLICARE SU GITHUB
  ═══════════════════════════════════════════════════════════════════

  1. Scompatta lo zip
  2. Sostituisci interamente la cartella nella tua repo GitHub
  3. git add -A
  4. git commit -m "release: v31.0 final - full UX/security/GDPR/perf"
  5. git push origin main

  Su Firebase Console:
  - Firestore -> Rules: incolla il contenuto di firestore.rules
  - Firestore -> Indexes: applica firestore.indexes.json
    (oppure usa: firebase deploy --only firestore:indexes)

  Vercel/Netlify ridistribuira automaticamente al push.

  ═══════════════════════════════════════════════════════════════════
  COSA NON E' INCLUSO
  ═══════════════════════════════════════════════════════════════════
  - archive/ (vecchi report, rimossi per pulizia)
  - node_modules/ (non servono — progetto vanilla, no build step)

  ═══════════════════════════════════════════════════════════════════
  ELENCO FILE MODIFICATI/AGGIUNTI RISPETTO ALL'ORIGINALE
  ═══════════════════════════════════════════════════════════════════
  NUOVI:
  + privacy.html
  + firestore.indexes.json
  + assets/hero_banner.webp
  + assets/hero_banner_light.webp

  MODIFICATI:
  ~ index.html              (footer GDPR + privacy link)
  ~ vercel.json             (HSTS + COOP + rewrites)
  ~ firestore.rules         (admin override + legacy support)
  ~ src/css/main.css        (icone, focus-visible, reduced-motion, polish)
  ~ src/css/components.css  (polish card/btn/quote-item)
  ~ src/js/chart-renderer.js (riscritto - fix contrasti)
  ~ src/js/app.js           (colori label/icone con contrasto AA)
  ~ assets/hero_banner.png  (ottimizzato -69%)
  ~ assets/hero_banner_light.png (ottimizzato -70%)
  ~ assets/icon_*.png       (10 icone ottimizzate -97% medio)
  