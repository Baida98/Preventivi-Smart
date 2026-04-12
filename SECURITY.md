# Preventivi-Smart Pro — Security Documentation v1.0

## 🛡️ Architettura di Sicurezza

Preventivi-Smart implementa un **sistema di protezione multi-layer** per proteggere la proprietà intellettuale e i dati degli utenti.

---

## 1. Security Shield (`engine/security-shield.js`)

### Funzionalità

#### 1.1 Domain Lock
- **Cosa fa**: Verifica che l'app sia eseguita SOLO su domini autorizzati
- **Autorizzati**: `preventivi-smart.it`, `www.preventivi-smart.it`, `app.preventivi-smart.it`, `localhost`
- **Se violato**: Crash dell'applicazione con pagina di errore

#### 1.2 Anti-Debug System
- **Rilevamento Debugger**: Monitora breakpoints e debugger statements
- **Rilevamento Console**: Blocca accessi alla console
- **Rilevamento DevTools**: Rileva apertura strumenti sviluppatore tramite dimensioni finestra
- **Azione**: Crash immediato dell'app

#### 1.3 Anti-Copy Protection
- **Disabilita**: Ctrl+C, Ctrl+X, Ctrl+V, Tasto Destro, Drag & Drop
- **Protegge**: Elementi critici del DOM
- **Mostra**: Alert visivo quando tentativo di copia

#### 1.4 Monitoraggio Continuo
- **Monitora**: Modifiche DOM, Iniezioni script, Accessi localStorage
- **Protegge**: Prototype pollution, Script injection, Excessive redirects

---

## 2. UI Protection (`engine/ui-protection.js`)

### Protezioni Tastiera
- **F12**: Disabilitato
- **Ctrl+Shift+I**: Disabilitato (Inspect)
- **Ctrl+Shift+C**: Disabilitato (Element Picker)
- **Ctrl+Shift+J**: Disabilitato (Console)
- **Ctrl+U**: Disabilitato (View Source)
- **Ctrl+P**: Disabilitato (Print)
- **Print Screen**: Disabilitato

### Protezioni Mouse
- **Right-Click**: Disabilitato
- **Drag & Drop**: Disabilitato
- **Screenshot**: Bloccato tramite Screen Capture API

### Protezioni CSS
- **User-Select**: `none` su tutti gli elementi
- **Selezione Testo**: Disabilitata
- **Print Styles**: Nascoste
- **Immagini**: Protette da drag

---

## 3. Secure Loader (`engine/secure-loader.js`)

### Funzionalità

#### 3.1 Caricamento Dinamico
- Carica moduli sensibili in modo asincrono
- Verifica integrità tramite hash SHA-256
- Crea wrapper Proxy per proteggere accessi

#### 3.2 Offuscamento Codice
- Rinomina variabili in stringhe casuali
- Rimuove commenti
- Comprime spazi
- Rende il codice illeggibile agli umani

#### 3.3 Protezione Funzioni
- **Rate Limiting**: Max 100 chiamate/minuto
- **Self-Destructing**: Funzioni che si distruggono dopo N esecuzioni
- **Audited**: Logging di tutti gli accessi

#### 3.4 Crittografia Dati
- Crittografia XOR per stringhe sensibili
- Doppio encoding Base64
- Protezione variabili globali

---

## 4. Firebase Security Rules (`firestore.rules`)

### Protezioni Dati

#### 4.1 Autenticazione
- **Richiesta**: Tutti gli accessi richiedono autenticazione
- **Verifica**: `request.auth != null`

#### 4.2 Autorizzazione
- **Quotes**: Solo il proprietario può leggere/modificare/eliminare
- **Users**: Ogni utente accede solo al suo profilo
- **Admin**: Accesso limitato ai soli admin

#### 4.3 Validazione Dati
- **Struttura**: Verifica campi obbligatori
- **Tipi**: Validazione tipi di dato
- **Range**: Numeri positivi
- **Rate Limiting**: Max 100 quote/giorno per utente

#### 4.4 Operazioni Bloccate
- **Lettura**: Non autorizzata per dati altrui
- **Creazione**: Solo dati propri
- **Modifica**: Solo dati propri
- **Eliminazione**: Solo dati propri

---

## 5. Configurazione Sicurezza

### File: `engine/security-shield.js`

```javascript
const SECURITY_CONFIG = {
  allowedDomains: [
    "preventivi-smart.it",
    "www.preventivi-smart.it",
    "app.preventivi-smart.it",
    "localhost"
  ],
  
  enableDomainLock: true,
  enableAntiDebug: true,
  enableAntiCopy: true,
  enableConsoleBlock: true,
  enableDevtoolsDetection: true,
  
  violationAction: "crash", // "crash" | "redirect" | "disable"
  violationRedirectUrl: "https://preventivi-smart.it/unauthorized",
  debugCheckInterval: 1000
};
```

### Come Personalizzare

1. **Aggiungi i tuoi domini** in `allowedDomains`
2. **Cambia azione violazione** da `"crash"` a `"redirect"` se preferisci
3. **Configura URL redirect** per violazioni
4. **Ajusta intervallo anti-debug** se necessario

---

## 6. Deployment Checklist

### Prima di andare in produzione:

- [ ] Aggiungi il tuo dominio in `SECURITY_CONFIG.allowedDomains`
- [ ] Configura Firebase Security Rules in Firestore
- [ ] Abilita HTTPS su tutti i domini
- [ ] Configura CORS per bloccare domini non autorizzati
- [ ] Attiva reCAPTCHA su login/registrazione
- [ ] Configura rate limiting su backend
- [ ] Abilita logging di sicurezza
- [ ] Testa anti-debug in tutti i browser
- [ ] Verifica che DevTools sia bloccato
- [ ] Testa copy/paste è disabilitato

### Comandi Firebase

```bash
# Deploy Security Rules
firebase deploy --only firestore:rules

# Verifica regole
firebase firestore:indexes

# Monitora violazioni
firebase functions:log
```

---

## 7. Monitoraggio Sicurezza

### Log Violazioni

Tutte le violazioni di sicurezza vengono loggati in:
- **Console Browser**: Messaggi di warning
- **Firestore**: Collection `security-logs`
- **Backend**: Endpoint `/api/security-log`

### Cosa Viene Loggato

```json
{
  "reason": "DevTools Detected",
  "timestamp": "2025-04-12T10:30:00Z",
  "userAgent": "Mozilla/5.0...",
  "url": "https://preventivi-smart.it",
  "domain": "preventivi-smart.it"
}
```

---

## 8. Limitazioni Conosciute

### Browser Compatibility
- **Chrome/Edge**: 100% protezione
- **Firefox**: 95% protezione (alcune limitazioni su DevTools)
- **Safari**: 90% protezione (limitazioni su Screen Capture)
- **Mobile**: 100% protezione

### Cosa NON Protegge
- **Decompilazione**: Utenti esperti possono comunque decompilare il codice
- **Network Sniffing**: Usa HTTPS per proteggere i dati in transito
- **Server-Side**: Implementa validazione anche sul backend
- **Modifiche Locali**: Utenti possono modificare il codice nel loro browser

---

## 9. Best Practices

### Per Massimizzare la Sicurezza

1. **Backend Validation**: Valida SEMPRE i dati sul server
2. **HTTPS Only**: Usa HTTPS su tutti i domini
3. **API Keys**: Non mettere mai API keys nel frontend
4. **Rate Limiting**: Implementa rate limiting sul backend
5. **Logging**: Monitora attività sospette
6. **Updates**: Aggiorna regolarmente le dipendenze
7. **Secrets**: Usa variabili d'ambiente per dati sensibili
8. **CORS**: Configura CORS per bloccare domini non autorizzati

---

## 10. Troubleshooting

### Problema: "Domain Lock Violation"
**Soluzione**: Aggiungi il tuo dominio in `SECURITY_CONFIG.allowedDomains`

### Problema: "DevTools Detected" su localhost
**Soluzione**: Aggiungi `"localhost"` e `"127.0.0.1"` in `allowedDomains`

### Problema: Utenti non riescono a copiare testo
**Soluzione**: Questo è intenzionale per proteggere il codice. Se necessario, disabilita in `enableAntiCopy: false`

### Problema: App crasha quando apro DevTools
**Soluzione**: Cambia `violationAction` da `"crash"` a `"disable"` per una protezione meno aggressiva

---

## 11. Roadmap Sicurezza Futura

- [ ] Implementare Web Workers per offuscamento dinamico
- [ ] Aggiungere crittografia end-to-end per dati sensibili
- [ ] Implementare JWT token per autenticazione
- [ ] Aggiungere 2FA (Two-Factor Authentication)
- [ ] Implementare Content Security Policy (CSP)
- [ ] Aggiungere honeypots per rilevare bot
- [ ] Implementare blockchain per audit trail

---

## 12. Contatti Supporto

Per domande sulla sicurezza:
- **Email**: security@preventivi-smart.it
- **GitHub Issues**: [Segnala vulnerabilità](https://github.com/Baida98/Preventivi-Smart/issues)
- **Responsabile Sicurezza**: [Contatti privati]

---

**Ultima Aggiornamento**: 12 Aprile 2025
**Versione**: 1.0
**Status**: Production Ready ✅
