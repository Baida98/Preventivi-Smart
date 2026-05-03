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
          F("complessita", "Complessità", [
            { value: "semplice", label: "Semplice", multiplier: 1.0 },
            { value: "media", label: "Media", multiplier: 1.18 },
            { value: "complessa", label: "Complessa", multiplier: 1.4 },
          ]),
          F("smaltimento", "Smaltimento macerie", [
            { value: "no", label: "Non incluso", multiplier: 1.0 },
            { value: "si", label: "Incluso", multiplier: 1.15 },
          ]),
          F("materiale", "Materiale", [
            { value: "standard", label: "Standard (Laterizio)", multiplier: 1.0 },
            { value: "premium", label: "Premium (Ytong/Termico)", multiplier: 1.25 },
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
            { value: "parete", label: "Parete", multiplier: 1.0 },
            { value: "controsoffitto", label: "Controsoffitto", multiplier: 1.15 },
            { value: "ribassato", label: "Ribassato decorativo", multiplier: 1.35 },
          ]),
          F("isolamento", "Isolamento termoacustico", [
            { value: "no", label: "No", multiplier: 1.0 },
            { value: "lana", label: "Lana di roccia", multiplier: 1.25 },
            { value: "premium", label: "Fibra poliestere", multiplier: 1.4 },
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
          F("btu", "Potenza (BTU)", [
            { value: "9000", label: "9000 BTU", multiplier: 1.0 },
            { value: "12000", label: "12000 BTU", multiplier: 1.15 },
            { value: "18000", label: "18000 BTU", multiplier: 1.4 },
          ]),
          F("distanza", "Distanza Unità Int/Est", [
            { value: "spalla", label: "Spalla a spalla", multiplier: 1.0 },
            { value: "media", label: "Fino a 5 metri", multiplier: 1.3 },
            { value: "lunga", label: "Oltre 5 metri", multiplier: 1.6 },
          ]),
          F("predisposizione", "Predisposizione", [
            { value: "si", label: "Esistente", multiplier: 1.0 },
            { value: "no", label: "Da realizzare", multiplier: 1.6 },
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
        label: "Finestra PVC Standard",
        categoryId: "infissi",
        base: 650,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 2,
        fields: [
          F("vetro", "Tipo Vetro", [
            { value: "doppio", label: "Doppio Vetro", multiplier: 1.0 },
            { value: "triplo", label: "Triplo Vetro (Termico)", multiplier: 1.25 },
          ]),
          F("apertura", "Tipo Apertura", [
            { value: "battente", label: "Battente", multiplier: 1.0 },
            { value: "vasistas", label: "Anta Ribalta", multiplier: 1.1 },
            { value: "scorrevole", label: "Scorrevole", multiplier: 1.35 },
          ]),
          F("posa", "Tipo di Posa", [
            { value: "standard", label: "Standard (Schiuma)", multiplier: 1.0 },
            { value: "clima", label: "Posa Clima (Nastri)", multiplier: 1.2 },
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
          F("accumulo", "Sistema di Accumulo", [
            { value: "no", label: "Senza Batterie", multiplier: 1.0 },
            { value: "5kwh", label: "Batteria 5kWh", multiplier: 1.8 },
            { value: "10kwh", label: "Batteria 10kWh", multiplier: 2.5 },
          ]),
          F("tetto", "Tipo Tetto", [
            { value: "falda", label: "Falda inclinata", multiplier: 1.0 },
            { value: "piano", label: "Tetto piano", multiplier: 1.15 },
          ]),
          F("ottimizzatori", "Ottimizzatori", [
            { value: "no", label: "No", multiplier: 1.0 },
            { value: "si", label: "Sì (per pannello)", multiplier: 1.2 },
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
        label: "Imbiancatura standard",
        categoryId: "imbiancatura",
        base: 10,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 60,
        fields: [
          F("stato", "Stato dei muri", [
            { value: "buono", label: "Buono", multiplier: 1.0 },
            { value: "medio", label: "Medio (piccoli ritocchi)", multiplier: 1.15 },
            { value: "alto", label: "Rovinato (rasatura)", multiplier: 1.35 },
          ]),
          F("pittura", "Qualità Pittura", [
            { value: "traspirante", label: "Traspirante", multiplier: 1.0 },
            { value: "lavabile", label: "Lavabile Premium", multiplier: 1.2 },
            { value: "antimuffa", label: "Antimuffa/Termica", multiplier: 1.35 },
          ]),
        ],
      },
    ],
  },
  {
    id: "idraulica",
    label: "Idraulica",
    Icon: Wrench,
    blurb: "Riparazioni, sanitari, caldaia, scaldabagno.",
    jobs: [
      {
        id: "sostituzione-sanitari",
        label: "Sostituzione sanitari",
        categoryId: "idraulica",
        base: 280,
        unit: "elemento",
        unitLabel: "elementi",
        defaultQty: 1,
        fields: [
          F("tipo", "Elemento", [
            { value: "wc", label: "WC", multiplier: 1.0 },
            { value: "lavabo", label: "Lavabo", multiplier: 0.9 },
            { value: "doccia", label: "Piatto doccia", multiplier: 1.5 },
          ]),
          F("finitura", "Qualità Elemento", [
            { value: "standard", label: "Standard", multiplier: 1.0 },
            { value: "premium", label: "Sospesi / Design", multiplier: 1.4 },
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
          F("tracce", "Tracce nel muro", [
            { value: "no", label: "Non necessarie", multiplier: 1.0 },
            { value: "si", label: "Sì, da realizzare", multiplier: 1.3 },
          ]),
          F("serie", "Serie civile", [
            { value: "standard", label: "Standard (es. Bticino Matix)", multiplier: 1.0 },
            { value: "premium", label: "Premium (es. Living Now)", multiplier: 1.35 },
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

export function calculateMarketAnalysis(
  job: Job,
  quantity: number,
  selections: Record<string, string>,
  regionId: string
): MarketAnalysis {
  let totalMultiplier = 1.0;
  job.fields.forEach((f) => {
    const sel = selections[f.id];
    const opt = f.options.find((o) => o.value === sel);
    if (opt) totalMultiplier *= opt.multiplier;
  });

  const baseTotal = job.base * quantity * totalMultiplier;
  
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
