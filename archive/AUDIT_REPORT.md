# Audit Report - Preventivi Smart

## 1. File Duplicati e Versioni Obsolete
- **JS**: `app.js`, `app-v3-backup.js`, `app-v3.js` sembrano versioni diverse dello stesso file. `app-v3.js` è quella attualmente in uso.
- **CSS**: Ci sono oltre 10 file CSS (`style.css`, `style-unified.css`, `style-premium.css`, ecc.). Molti sembrano sovrapporsi o essere versioni alternative non utilizzate.
- **Report**: Numerosi file `.md` di report (`REPORT_v29.md`, `report_correzioni.md`, ecc.) che intasano la root.

## 2. Problemi Strutturali
- Mancanza di una cartella `src/` per il codice sorgente.
- Logica di business, UI e configurazione Firebase mescolate in `app-v3.js`.
- Motore dei prezzi (`engine/`) frammentato in troppi piccoli file.

## 3. Bug e Criticità Identificate
- **CRITICO**: I pulsanti non funzionano a causa di un refactoring incompleto in `app-v3.js` (event listeners non collegati correttamente).
- **IMPORTANTE**: Gestione dei prezzi non deterministica in alcuni moduli (uso di moltiplicatori sparsi).
- **MEDIO**: Performance ridotte dal caricamento di molteplici file CSS non necessari.

## 4. Piano d'Azione (Priorità)
1. **CRITICO**: Ripristinare funzionalità base (tasti).
2. **IMPORTANTE**: Riorganizzazione cartelle (`src/js`, `src/css`).
3. **IMPORTANTE**: Consolidamento CSS in un unico Design System.
4. **MEDIO**: Refactoring modulare di `app-v3.js`.
