# Preventivi-Smart

Un'applicazione web intelligente per la generazione automatica di preventivi per lavori edili e di manutenzione. L'app utilizza Firebase per l'autenticazione e l'archiviazione dei dati, e incorpora un sistema di intelligenza artificiale per migliorare le stime dei prezzi nel tempo.


### Regole di Sicurezza Firestore (esempio)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quotes/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /ai_stats/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Errori Corretti (Revisione Completa)

### Ciclo 1
- ✅ Errori di riferimento DOM (authDiv/appDiv)
- ✅ Variabili non definite (db)
- ✅ Funzionalità mancanti (Export PDF, Save button)
- ✅ Librerie mancanti (Chart.js)
- ✅ Problemi di stile CSS

### Ciclo 2
- ✅ Integrazione della validazione input
- ✅ Aggiunta della history dei preventivi
- ✅ Rendering dinamico dei grafici
- ✅ Miglioramento della formattazione valuta
- ✅ Aggiunta di label e attributi di accessibilità
- ✅ Responsive design per mobile
- ✅ Gestione errori migliorata

## Roadmap Futura

- [ ] Supporto per più tipi di lavori (da data.json)
- [ ] Dashboard di analytics per l'amministratore
- [ ] Esportazione preventivi in PDF vero (non solo TXT)
- [ ] Notifiche email per i preventivi salvati
- [ ] Integrazione con sistemi di pagamento
- [ ] App mobile nativa
- [ ] Supporto per più lingue

## Licenza

Questo progetto è distribuito sotto licenza MIT.

## Supporto

Per problemi o suggerimenti, aprire un issue su GitHub.

---

**Ultimo aggiornamento**: Aprile 2026
**Versione**: 2.0 (Revisione Completa)
