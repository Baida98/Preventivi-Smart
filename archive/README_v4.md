# Preventivi-Smart Pro v4.0 Enterprise Edition

**La piattaforma professionale per preventivi edili istantanei e precisi**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-4.0-green.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-success.svg)

---

## 🎯 Panoramica

**Preventivi-Smart Pro** è una piattaforma SaaS professionale che genera preventivi edili istantanei e precisi basati su:

- **Coefficienti regionali ISTAT 2025** per tutte le 20 regioni italiane
- **10+ mestieri specializzati** con domande tecniche approfondite
- **Algoritmo di calcolo sofisticato** che considera qualità materiali, urgenza, complessità
- **Interfaccia Enterprise White** moderna, minimalista e accattivante
- **Visualizzazioni grafiche avanzate** con breakdown costi e analisi comparativa
- **Autenticazione sicura** con persistenza sessione e cronologia

---

## ✨ Caratteristiche Principali

### 🏗️ Mestieri Supportati

1. **Imbiancatura** - Tinteggiatura e pittura interni/esterni
2. **Piastrellista** - Posa piastrelle e rivestimenti
3. **Elettricista** - Impianti elettrici e illuminazione
4. **Idraulico** - Impianti idrici e sanitari
5. **Muratore** - Muratura e strutture
6. **Cartongessista** - Pareti e controsoffitti
7. **Serramentista** - Finestre, porte e infissi
8. **Climatizzazione** - Impianti HVAC
9. **Giardiniere** - Realizzazione giardini
10. **Pulizie** - Pulizie post-cantiere

### 📊 Funzionalità Avanzate

- **Calcolo Dinamico**: Domande specifiche per ogni mestiere che influenzano il prezzo
- **Coefficienti Regionali**: Prezzi adattati alla regione selezionata (da -25% a +25%)
- **Qualità Materiali**: 4 livelli (Economica, Standard, Premium, Lusso)
- **Breakdown Costi**: Visualizzazione manodopera vs materiali
- **Grafici Interattivi**: Chart.js per analisi visuale dei costi
- **Cronologia**: Salvataggio locale e cloud dei preventivi
- **Export PDF**: Preventivi professionali scaricabili
- **Responsive Design**: Perfetto su desktop, tablet e mobile

---

## 🎨 Design & UX

### Tema Enterprise White

- **Palette Colori Professionali**: Blu Navy (#1E40AF), Oro (#F59E0B), Grigi neutri
- **Tipografia Moderna**: System fonts (SF Pro, Segoe UI, Roboto)
- **Animazioni Fluide**: Transizioni smooth e micro-interazioni
- **Accessibilità**: WCAG 2.1 AA compliant
- **Mobile-First**: Responsive su tutti i dispositivi

### Iconografia 3D

Tutte le icone dei mestieri sono generate in stile 3D moderno e coerente, con:
- Sfondo bianco pulito
- Ombre soft professionali
- Accenti blu per coerenza visiva
- Risoluzione 4K per nitidezza

---

## 🔧 Architettura Tecnica

### Stack Tecnologico

```
Frontend:
├── HTML5 Semantico
├── CSS3 (Grid, Flexbox, Animazioni)
├── JavaScript ES6+ (Moduli)
├── Chart.js (Visualizzazioni)
└── Font Awesome (Icone)

Backend:
├── Firebase Authentication
├── Firestore Database
└── Cloud Storage

Deployment:
└── GitHub Pages / Vercel
```

### Struttura del Progetto

```
Preventivi-Smart/
├── index.html                 # Markup principale
├── style.css                  # Stili Enterprise White
├── app-v3.js                  # Logica principale
├── firebase.js                # Configurazione Firebase
├── engine/
│   ├── database.js            # Mestieri e coefficienti
│   ├── charts-advanced.js     # Visualizzazioni grafiche
│   ├── pdf.js                 # Generazione PDF
│   ├── session.js             # Gestione sessione
│   ├── history.js             # Cronologia preventivi
│   ├── validation.js          # Validazione input
│   └── security.js            # Sicurezza
├── assets/
│   ├── hero_banner_light.png  # Banner hero
│   ├── icon_*.png             # Icone mestieri (3D)
│   └── ...
└── README.md                  # Documentazione
```

---

## 📈 Algoritmo di Calcolo

### Formula Base

```
Prezzo Finale = Prezzo Base × Quantità × Coeff. Regionale × Coeff. Qualità × Moltiplicatore Risposte
```

### Esempio Pratico

**Imbiancatura 50 mq in Lombardia, qualità Premium**

```
Prezzo Base:          €12/mq
Quantità:             50 mq
Coeff. Regionale:     1.25x (Lombardia)
Coeff. Qualità:       1.30x (Premium)
Moltiplicatore:       1.25x (stato muri medio, 2 mani, colori custom)

Prezzo Stimato = 12 × 50 × 1.25 × 1.30 × 1.25 = €1.218,75
Prezzo Minimo:  €1.035,94 (-15%)
Prezzo Massimo: €1.523,44 (+25%)
```

### Coefficienti Regionali (ISTAT 2025)

| Regione | Coefficiente | Variazione |
|---------|-------------|-----------|
| Lombardia | 1.25x | +25% |
| Lazio | 1.15x | +15% |
| Veneto | 1.12x | +12% |
| Toscana | 1.05x | +5% |
| Molise | 0.75x | -25% |

---

## 🔐 Sicurezza

### Misure Implementate

- **Firebase Authentication**: OAuth 2.0 con Google
- **Session Management**: Token-based con localStorage
- **Data Encryption**: HTTPS per tutte le comunicazioni
- **Input Validation**: Sanitizzazione lato client e server
- **CORS Protection**: Configurazione corretta degli header
- **Rate Limiting**: Protezione da abusi

### Privacy

- **GDPR Compliant**: Conformità alle normative europee
- **Dati Locali**: Opzione di salvataggio solo locale
- **Cancellazione Dati**: Possibilità di eliminare cronologia
- **No Tracking**: Nessun tracciamento utente

---

## 📱 Responsive Design

### Breakpoints

```css
Mobile:     < 480px
Tablet:     480px - 768px
Desktop:    768px - 1024px
Large:      > 1024px
```

### Ottimizzazioni

- Immagini responsive con srcset
- Font size fluido
- Touch-friendly buttons (min 44x44px)
- Viewport meta tag configurato

---

## 🚀 Performance

### Metriche Target

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

### Ottimizzazioni

- Lazy loading immagini
- Code splitting moduli
- Minificazione CSS/JS
- Caching strategico
- Compressione asset

---

## 📊 Coefficienti Regionali Completi

```javascript
{
  "Lombardia": 1.25,
  "Trentino-Alto Adige": 1.22,
  "Valle d'Aosta": 1.18,
  "Lazio": 1.15,
  "Veneto": 1.12,
  "Emilia-Romagna": 1.10,
  "Piemonte": 1.08,
  "Liguria": 1.08,
  "Toscana": 1.05,
  "Friuli-Venezia Giulia": 1.02,
  "Marche": 0.98,
  "Umbria": 0.95,
  "Abruzzo": 0.92,
  "Campania": 0.90,
  "Sardegna": 0.88,
  "Puglia": 0.85,
  "Sicilia": 0.82,
  "Basilicata": 0.80,
  "Calabria": 0.78,
  "Molise": 0.75
}
```

---

## 🎓 Domande Tecniche per Mestiere

### Esempio: Imbiancatura

1. **Stato dei muri** (Ottimo/Buono/Medio/Rovinato)
2. **Tipo di pittura** (Acrilica/Lavabile/Antimuffa/Premium)
3. **Numero di mani** (Una/Due/Tre)
4. **Colori speciali** (Bianco/Colorato/Personalizzato)

### Esempio: Idraulica

1. **Tipo di punto** (Rubinetto/Scarico/Punto acqua/Caldaia)
2. **Urgenza** (Normale/Urgente/Emergenza)
3. **Materiale tubature** (PVC/Multistrato/Rame/Acciaio)
4. **Tipo di posa** (Esterno/Incasso/Sottopavimento)

---

## 💡 Casi d'Uso

### Per Professionisti

- Generare preventivi istantanei per clienti
- Comparare prezzi tra regioni
- Analizzare impatto di materiali e complessità
- Esportare preventivi professionali in PDF

### Per Clienti

- Ottenere stime realistiche prima di contattare professionisti
- Comparare costi tra diverse opzioni
- Comprendere la ripartizione manodopera/materiali
- Salvare cronologia preventivi

---

## 🔄 Aggiornamenti Futuri

- [ ] Integrazione con API di professionisti locali
- [ ] Sistema di notifiche push
- [ ] Supporto multi-lingua
- [ ] App mobile nativa (React Native)
- [ ] Integrazione con sistemi CRM
- [ ] Analytics avanzato
- [ ] Machine Learning per predizioni

---

## 📞 Supporto

Per domande, bug report o suggerimenti:

- **Email**: support@preventivi-smart.it
- **GitHub Issues**: [Apri una issue](https://github.com/Baida98/Preventivi-Smart/issues)
- **Chat**: [Contatta il team](https://preventivi-smart.it/contact)

---

## 📄 Licenza

MIT License - Vedi [LICENSE](LICENSE) per dettagli

---

## 👥 Autori

Sviluppato con ❤️ dal team Preventivi-Smart

---

## 🙏 Ringraziamenti

- ISTAT per i dati economici regionali
- Chart.js per le visualizzazioni
- Firebase per l'infrastruttura
- La comunità open-source italiana

---

**Preventivi-Smart Pro v4.0** © 2025 - Tutti i diritti riservati
