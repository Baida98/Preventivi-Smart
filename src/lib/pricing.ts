/**
   * @module pricing
   * @description Prezzi base e logica di calcolo del benchmark di mercato.
   *
   * ## Fonti dei dati
   * I prezzi base (`base`) in questa tabella sono derivati da:
   * - **DEI — Tipologie dei costi della costruzione** (ediz. 2024-2025)
   * - **CRESME — Osservatorio prezzi costruzioni** (aggiornamento Mag 2026)
   * - **ISTAT — Indici dei prezzi delle opere pubbliche**
   *   → https://www.istat.it/it/archivio/prezzi+delle+opere+pubbliche
   * - **Prezzari Regionali** delle singole regioni italiane
   *
   * Per la lista completa con URL e note per voce vedere:
   * → `data/istat-prices-2026.json`
   *
   * ## Disclaimer
   * I prezzi sono riferimenti orientativi. Le condizioni effettive variano
   * in base a cantiere, materiali, impresa e periodo. Vedere ISTAT_DISCLAIMER.
   *
   * @lastUpdated 2026-05-01
   */

  /** Disclaimer legale da mostrare in tutte le schermate di risultato */
  export const ISTAT_DISCLAIMER =
    "⚠️ Riferimento orientativo basato su prezzari DEI 2024, CRESME 2025 e indici ISTAT. " +
    "Non costituisce un'offerta contrattuale. I prezzi effettivi possono variare. " +
    "Dati aggiornati a Maggio 2026.";

  import {
  Brush,
  Hammer,
  Wrench,
  Zap,
  LayoutGrid,
  Wind,
  DoorOpen,
  Sparkles,
  Sun,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { MARKET_INDICATORS, getDynamicInflationFactor, getQuoteExpiryDate, getSectorVolatilityClass } from "./market-config";

export type FieldOption = { value: string; label: string; multiplier: number };
export type Field = {
  id: string;
  label: string;
  options: FieldOption[];
};
export type Job = {
  id: string;
  label: string;
  categoryId: string;
  base: number;
  unit: string;
  unitLabel: string;
  fields: Field[];
  defaultQty?: number;
  description?: string;
};
export type Category = {
  id: string;
  label: string;
  Icon: LucideIcon;
  blurb: string;
  jobs: Job[];
};

const F = (id: string, label: string, options: FieldOption[]): Field => ({
  id,
  label,
  options,
});

export const REGIONS = [
  { id: "lombardia", label: "Lombardia", index: 1.12 },
  { id: "lazio", label: "Lazio", index: 1.08 },
  { id: "campania", label: "Campania", index: 0.95 },
  { id: "sicilia", label: "Sicilia", index: 0.92 },
  { id: "veneto", label: "Veneto", index: 1.05 },
  { id: "emilia-romagna", label: "Emilia-Romagna", index: 1.06 },
  { id: "piemonte", label: "Piemonte", index: 1.04 },
  { id: "puglia", label: "Puglia", index: 0.94 },
  { id: "toscana", label: "Toscana", index: 1.03 },
  { id: "calabria", label: "Calabria", index: 0.88 },
  { id: "sardegna", label: "Sardegna", index: 0.96 },
  { id: "liguria", label: "Liguria", index: 1.07 },
  { id: "marche", label: "Marche", index: 0.98 },
  { id: "abruzzo", label: "Abruzzo", index: 0.96 },
  { id: "friuli-venezia-giulia", label: "Friuli-Venezia Giulia", index: 1.02 },
  { id: "trentino-alto-adige", label: "Trentino-Alto Adige", index: 1.15 },
  { id: "umbria", label: "Umbria", index: 0.97 },
  { id: "basilicata", label: "Basilicata", index: 0.91 },
  { id: "molise", label: "Molise", index: 0.90 },
  { id: "valle-daosta", label: "Valle d'Aosta", index: 1.10 },
];

export const CATEGORIES: Category[] = [
  {
    id: "edilizia",
    label: "Edilizia & Muratura",
    Icon: Hammer,
    blurb: "Muratura, cartongesso, demolizioni, massetti.",
    jobs: [
      {
        id: "muratura",
        label: "Muratura generica",
        categoryId: "edilizia",
        base: 45,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 20,
        fields: [
          F("complessita", "Complessità strutturale", [
            { value: "semplice", label: "Lineare (pareti dritte)", multiplier: 1.0 },
            { value: "media", label: "Media (con angoli/nicchie)", multiplier: 1.18 },
            { value: "complessa", label: "Alta (archi/strutture curve)", multiplier: 1.4 },
          ]),
          F("accessibilita", "Accessibilità cantiere", [
            { value: "facile", label: "Piano terra / con ascensore", multiplier: 1.0 },
            { value: "difficile", label: "Piani alti senza ascensore", multiplier: 1.25 },
            { value: "centro", label: "Centro storico (ZTL/Logistica)", multiplier: 1.15 },
          ]),
          F("materiale", "Qualità Materiale", [
            { value: "standard", label: "Laterizio forato standard", multiplier: 1.0 },
            { value: "premium", label: "Blocchi isolanti (Ytong/Termico)", multiplier: 1.25 },
          ]),
        ],
      },
      {
        id: "cartongesso",
        label: "Cartongesso",
        categoryId: "edilizia",
        base: 35,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 15,
        fields: [
          F("tipo", "Tipo struttura", [
            { value: "parete", label: "Parete divisoria", multiplier: 1.0 },
            { value: "controsoffitto", label: "Controsoffitto piano", multiplier: 1.15 },
            { value: "ribassato", label: "Velette / Gole luminose", multiplier: 1.45 },
          ]),
          F("lastra", "Tipo di Lastra", [
            { value: "standard", label: "Standard (Grigia)", multiplier: 1.0 },
            { value: "idro", label: "Idrorepellente (Verde - Bagni)", multiplier: 1.15 },
            { value: "fuoco", label: "Ignifuga (Rossa)", multiplier: 1.25 },
          ]),
          F("isolamento", "Isolamento interno", [
            { value: "no", label: "Nessuno", multiplier: 1.0 },
            { value: "lana", label: "Lana di roccia standard", multiplier: 1.25 },
            { value: "premium", label: "Pannelli alta densità (Acustico)", multiplier: 1.45 },
          ]),
        ],
      },
    ],
  },
  {
    id: "clima",
    label: "Climatizzazione",
    Icon: Wind,
    blurb: "Installazione condizionatori, pompe di calore, ricarica gas.",
    jobs: [
      {
        id: "installazione-clima",
        label: "Installazione Mono Split",
        categoryId: "clima",
        base: 450,
        unit: "unità",
        unitLabel: "unità",
        defaultQty: 1,
        fields: [
          F("btu", "Potenza termica", [
            { value: "9000", label: "9000 BTU (fino a 25mq)", multiplier: 1.0 },
            { value: "12000", label: "12000 BTU (fino a 40mq)", multiplier: 1.15 },
            { value: "18000", label: "18000 BTU (oltre 40mq)", multiplier: 1.4 },
          ]),
          F("posizionamento", "Difficoltà installazione", [
            { value: "spalla", label: "Spalla a spalla (standard)", multiplier: 1.0 },
            { value: "balcone", label: "Su balcone (accessibile)", multiplier: 1.1 },
            { value: "parete", label: "Parete esterna (richiede ponteggio/cestello)", multiplier: 1.8 },
          ]),
          F("predisposizione", "Stato tubazioni", [
            { value: "si", label: "Predisposizione esistente", multiplier: 1.0 },
            { value: "no", label: "Da realizzare (tracce/canalina)", multiplier: 1.6 },
          ]),
        ],
      },
    ],
  },
  {
    id: "infissi",
    label: "Infissi & Serramenti",
    Icon: DoorOpen,
    blurb: "Finestre PVC/Alluminio, porte blindate, zanzariere.",
    jobs: [
      {
        id: "finestra-pvc",
        label: "Finestra PVC",
        categoryId: "infissi",
        base: 650,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 2,
        fields: [
          F("profilo", "Qualità Profilo", [
            { value: "standard", label: "5 camere (Standard)", multiplier: 1.0 },
            { value: "premium", label: "7 camere (Alta efficienza)", multiplier: 1.2 },
          ]),
          F("vetro", "Configurazione Vetro", [
            { value: "doppio", label: "Doppio vetro basso emissivo", multiplier: 1.0 },
            { value: "triplo", label: "Triplo vetro (Efficienza Max)", multiplier: 1.25 },
            { value: "blindato", label: "Vetro Antisfondamento", multiplier: 1.4 },
          ]),
          F("posa", "Metodo di Montaggio", [
            { value: "standard", label: "Sovrapposizione a telaio esistente", multiplier: 1.0 },
            { value: "totale", label: "Rimozione totale vecchio telaio", multiplier: 1.25 },
            { value: "clima", label: "Posa Certificata (PosaClima)", multiplier: 1.35 },
          ]),
        ],
      },
    ],
  },
  {
    id: "fotovoltaico",
    label: "Energia Solare",
    Icon: Sun,
    blurb: "Impianti fotovoltaici, batterie accumulo, inverter.",
    jobs: [
      {
        id: "impianto-fv",
        label: "Impianto Fotovoltaico",
        categoryId: "fotovoltaico",
        base: 1800,
        unit: "kWp",
        unitLabel: "kW di picco",
        defaultQty: 3,
        fields: [
          F("pannello", "Tecnologia Pannelli", [
            { value: "mono", label: "Monocristallino Standard", multiplier: 1.0 },
            { value: "half-cut", label: "Half-Cut (Alta resa ombre)", multiplier: 1.15 },
            { value: "n-type", label: "N-Type (Top di gamma)", multiplier: 1.3 },
          ]),
          F("struttura", "Tipo di Installazione", [
            { value: "falda", label: "Su tetto a falda (tegole)", multiplier: 1.0 },
            { value: "piano", label: "Tetto piano (con zavorre)", multiplier: 1.2 },
            { value: "facciata", label: "Integrazione architettonica", multiplier: 1.5 },
          ]),
          F("monitoraggio", "Gestione Energia", [
            { value: "standard", label: "Inverter standard", multiplier: 1.0 },
            { value: "ottimizzatori", label: "Con Ottimizzatori (SolarEdge/Tigo)", multiplier: 1.25 },
          ]),
        ],
      },
    ],
  },
  {
    id: "imbiancatura",
    label: "Imbiancatura & Pittura",
    Icon: Brush,
    blurb: "Imbiancatura standard, pittura decorativa, stucco veneziano.",
    jobs: [
      {
        id: "imbiancatura-standard",
        label: "Imbiancatura professionale",
        categoryId: "imbiancatura",
        base: 10,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 60,
        fields: [
          F("preparazione", "Preparazione supporti", [
            { value: "minima", label: "Sola stuccatura buchi", multiplier: 1.0 },
            { value: "fissativo", label: "Fissativo + 2 mani", multiplier: 1.2 },
            { value: "rasatura", label: "Rasatura completa (muri rovinati)", multiplier: 1.8 },
          ]),
          F("ambiente", "Tipo di Ambiente", [
            { value: "vuoto", label: "Casa vuota", multiplier: 1.0 },
            { value: "arredato", label: "Casa arredata (coperture incluse)", multiplier: 1.25 },
          ]),
          F("pittura", "Tipologia Pittura", [
            { value: "traspirante", label: "Traspirante standard", multiplier: 1.0 },
            { value: "lavabile", label: "Lavabile acrilica", multiplier: 1.25 },
            { value: "termica", label: "Termoisolante / Antimuffa", multiplier: 1.45 },
          ]),
        ],
      },
    ],
  },
  {
    id: "idraulica",
    label: "Idraulica & Riscaldamento",
    Icon: Wrench,
    blurb: "Riparazioni, sanitari, caldaia, scaldabagno.",
    jobs: [
      {
        id: "rifacimento-bagno",
        label: "Rifacimento punto idrico",
        categoryId: "idraulica",
        base: 220,
        unit: "punto",
        unitLabel: "punti acqua",
        defaultQty: 4,
        fields: [
          F("tubazioni", "Materiale tubi", [
            { value: "multistrato", label: "Multistrato standard", multiplier: 1.0 },
            { value: "rame", label: "Rame (Premium)", multiplier: 1.3 },
          ]),
          F("scarichi", "Rifacimento scarichi", [
            { value: "no", label: "Solo adduzione", multiplier: 1.0 },
            { value: "si", label: "Incluso scarichi nuovi", multiplier: 1.45 },
          ]),
        ],
      },
    ],
  },
  {
    id: "elettrico",
    label: "Impianto Elettrico",
    Icon: Zap,
    blurb: "Punti luce/presa, quadro elettrico, certificazione.",
    jobs: [
      {
        id: "punto-elettrico",
        label: "Punto luce / presa",
        categoryId: "elettrico",
        base: 60,
        unit: "punto",
        unitLabel: "punti",
        defaultQty: 6,
        fields: [
          F("tipologia", "Tipo di Punto", [
            { value: "presa", label: "Presa / Luce standard", multiplier: 1.0 },
            { value: "shuko", label: "Presa Shuko (Elettrodomestici)", multiplier: 1.2 },
            { value: "dati", label: "Punto Rete / TV", multiplier: 1.4 },
          ]),
          F("posa", "Modalità di posa", [
            { value: "sottotraccia", label: "Sottotraccia (richiede opere murarie)", multiplier: 1.0 },
            { value: "esterna", label: "Esterna a vista (canalina)", multiplier: 0.85 },
          ]),
          F("serie", "Finitura Placche", [
            { value: "base", label: "Serie base (es. Matix)", multiplier: 1.0 },
            { value: "media", label: "Serie media (es. Arkè/Livinglight)", multiplier: 1.25 },
            { value: "lusso", label: "Serie lusso (es. Eikon/Axolute)", multiplier: 1.6 },
          ]),
        ],
      },
    ],
  },
];

export interface MarketAnalysis {
  expected: number;
  marketMin: number;
  marketMid: number;
  marketMax: number;
  confidence: number;
  manodopera: number;
  materiali: number;
  margine: number;
  volatilityClass: string;
  inflationImpact: number;
  logisticsImpact: number;
  expiryDate: Date;
}

export function findCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function findJob(categoryId: string, jobId: string): Job | undefined {
  return findCategory(categoryId)?.jobs.find((j) => j.id === jobId);
}

const KEYWORDS_MULTIPLIERS: Record<string, number> = {
  rame: 1.15,
  demolizione: 1.2,
  urgente: 1.3,
  rifacimento: 1.25,
  ristrutturazione: 1.1,
  bonus: 0.95,
};

function applyKeywordImpact(text: string, price: number): number {
  let result = price;
  Object.keys(KEYWORDS_MULTIPLIERS).forEach((word) => {
    if (text.toLowerCase().includes(word)) {
      result *= KEYWORDS_MULTIPLIERS[word];
    }
  });
  return result;
}

const RISK_MAP: Record<string, number> = {
  basso: 1.05,
  medio: 1.15,
  alto: 1.3,
};

function addRiskMargin(price: number, riskLevel: string = "basso"): number {
  return price * (RISK_MAP[riskLevel] || 1.05);
}

export function calculateMarketAnalysis(
  job: Job,
  quantity: number,
  selections: Record<string, string>,
  regionId: string,
  notes: string = ""
): MarketAnalysis {
  let totalMultiplier = 1.0;
  job.fields.forEach((f) => {
    const sel = selections[f.id];
    const opt = f.options.find((o) => o.value === sel);
    if (opt) totalMultiplier *= opt.multiplier;
  });

  let baseTotal = job.base * quantity * totalMultiplier;
  
  // Apply keywords impact if notes are provided
  if (notes) {
    baseTotal = applyKeywordImpact(notes, baseTotal);
  }

  // Apply risk margin based on complexity/accessibility
  const riskLevel = selections["complessita"] === "complessa" || selections["accessibilita"] === "difficile" ? "alto" : 
                    selections["complessita"] === "media" || selections["accessibilita"] === "centro" ? "medio" : "basso";
  baseTotal = addRiskMargin(baseTotal, riskLevel);

  const inflationFactor = getDynamicInflationFactor();
  const region = REGIONS.find(r => r.id === regionId);
  const regionFactor = region?.index || 1.0;
  
  const expected = baseTotal * inflationFactor * regionFactor;
  
  const volatility = getSectorVolatilityClass(job.categoryId);
  const spread = volatility === "high" ? 0.25 : volatility === "medium" ? 0.15 : 0.1;

  const marketMid = expected;
  const marketMin = expected * (1 - spread);
  const marketMax = expected * (1 + spread);

  return {
    expected,
    marketMin,
    marketMid,
    marketMax,
    confidence: 0.85 + (quantity > 10 ? 0.05 : 0),
    manodopera: expected * 0.45,
    materiali: expected * 0.35,
    margine: expected * 0.20,
    volatilityClass: volatility,
    inflationImpact: expected * (inflationFactor - 1),
    logisticsImpact: expected * (regionFactor - 1),
    expiryDate: getQuoteExpiryDate(job.categoryId),
  };
}

// Alias per compatibilità legacy
export const computeMarket = calculateMarketAnalysis;
