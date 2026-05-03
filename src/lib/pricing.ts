import {
  Brush,
  Hammer,
  Wrench,
  Zap,
  LayoutGrid,
  Wind,
  DoorOpen,
  Sparkles,
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
          F("isolamento", "Isolamento integrato", [
            { value: "no", label: "No", multiplier: 1.0 },
            { value: "si", label: "Sì", multiplier: 1.25 },
          ]),
          F("tipo", "Tipo struttura", [
            { value: "parete", label: "Parete", multiplier: 1.0 },
            { value: "controsoffitto", label: "Controsoffitto", multiplier: 1.15 },
            { value: "ribassato", label: "Ribassato decorativo", multiplier: 1.35 },
          ]),
        ],
      },
      {
        id: "massetto",
        label: "Massetto",
        categoryId: "edilizia",
        base: 28,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 30,
        fields: [
          F("spessore", "Spessore", [
            { value: "leggero", label: "Fino a 5 cm", multiplier: 1.0 },
            { value: "medio", label: "5–8 cm", multiplier: 1.15 },
            { value: "alto", label: "Oltre 8 cm", multiplier: 1.3 },
          ]),
        ],
      },
      {
        id: "demolizioni",
        label: "Demolizioni",
        categoryId: "edilizia",
        base: 22,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 10,
        fields: [
          F("tipo", "Tipo elemento", [
            { value: "tramezzi", label: "Tramezzi", multiplier: 1.0 },
            { value: "muri", label: "Muri portanti", multiplier: 1.6 },
          ]),
          F("smaltimento", "Smaltimento", [
            { value: "no", label: "Non incluso", multiplier: 1.0 },
            { value: "si", label: "Incluso", multiplier: 1.2 },
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
          F("pittura", "Tipo di pittura", [
            { value: "base", label: "Base traspirante", multiplier: 1.0 },
            { value: "lavabile", label: "Lavabile", multiplier: 1.1 },
            { value: "antimuffa", label: "Antimuffa premium", multiplier: 1.25 },
          ]),
          F("colori", "Colore", [
            { value: "bianco", label: "Bianco", multiplier: 1.0 },
            { value: "colorato", label: "Colorato", multiplier: 1.2 },
          ]),
        ],
      },
      {
        id: "pittura-decorativa",
        label: "Pittura decorativa",
        categoryId: "imbiancatura",
        base: 28,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 20,
        fields: [
          F("tecnica", "Tecnica", [
            { value: "spatolato", label: "Spatolato", multiplier: 1.0 },
            { value: "metallizzato", label: "Effetto metallizzato", multiplier: 1.3 },
            { value: "sabbiato", label: "Sabbiato", multiplier: 1.2 },
          ]),
        ],
      },
      {
        id: "stucco-veneziano",
        label: "Stucco veneziano",
        categoryId: "imbiancatura",
        base: 55,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 12,
        fields: [
          F("mani", "Mani di stucco", [
            { value: "due", label: "2 mani", multiplier: 1.0 },
            { value: "tre", label: "3 mani lucide", multiplier: 1.25 },
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
        id: "riparazione-idraulica",
        label: "Riparazione idraulica",
        categoryId: "idraulica",
        base: 80,
        unit: "intervento",
        unitLabel: "interventi",
        defaultQty: 1,
        fields: [
          F("urgenza", "Tipologia", [
            { value: "normale", label: "Programmata", multiplier: 1.0 },
            { value: "urgente", label: "Urgente", multiplier: 1.4 },
            { value: "festiva", label: "Festivo / notturno", multiplier: 1.8 },
          ]),
        ],
      },
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
            { value: "bidet", label: "Bidet", multiplier: 0.95 },
            { value: "doccia", label: "Piatto doccia", multiplier: 1.5 },
            { value: "vasca", label: "Vasca", multiplier: 1.9 },
          ]),
          F("smaltimento", "Smaltimento vecchio", [
            { value: "no", label: "Non incluso", multiplier: 1.0 },
            { value: "si", label: "Incluso", multiplier: 1.15 },
          ]),
        ],
      },
      {
        id: "caldaia",
        label: "Installazione caldaia",
        categoryId: "idraulica",
        base: 1800,
        unit: "elemento",
        unitLabel: "caldaie",
        defaultQty: 1,
        fields: [
          F("tipologia", "Tipologia", [
            { value: "standard", label: "Standard", multiplier: 1.0 },
            { value: "condensazione", label: "Condensazione", multiplier: 1.2 },
            { value: "ibrida", label: "Ibrida", multiplier: 1.45 },
          ]),
          F("smontaggio", "Smontaggio vecchia", [
            { value: "no", label: "Non incluso", multiplier: 1.0 },
            { value: "si", label: "Incluso", multiplier: 1.1 },
          ]),
        ],
      },
      {
        id: "scaldabagno",
        label: "Scaldabagno elettrico",
        categoryId: "idraulica",
        base: 380,
        unit: "elemento",
        unitLabel: "elementi",
        defaultQty: 1,
        fields: [
          F("capacita", "Capacità", [
            { value: "50", label: "50 L", multiplier: 1.0 },
            { value: "80", label: "80 L", multiplier: 1.2 },
            { value: "100", label: "100 L", multiplier: 1.4 },
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
          F("frutto", "Tipo frutto", [
            { value: "standard", label: "Standard", multiplier: 1.0 },
            { value: "premium", label: "Linea premium", multiplier: 1.25 },
          ]),
        ],
      },
      {
        id: "quadro-elettrico",
        label: "Quadro elettrico",
        categoryId: "elettrico",
        base: 450,
        unit: "elemento",
        unitLabel: "quadri",
        defaultQty: 1,
        fields: [
          F("dimensione", "Dimensione", [
            { value: "piccolo", label: "Fino a 12 moduli", multiplier: 1.0 },
            { value: "medio", label: "12–24 moduli", multiplier: 1.3 },
            { value: "grande", label: "Oltre 24 moduli", multiplier: 1.6 },
          ]),
        ],
      },
      {
        id: "certificazione-dm37",
        label: "Certificazione DM 37/08",
        categoryId: "elettrico",
        base: 280,
        unit: "intervento",
        unitLabel: "certificazioni",
        defaultQty: 1,
        fields: [
          F("complessita", "Complessità impianto", [
            { value: "civile", label: "Abitazione civile", multiplier: 1.0 },
            { value: "commerciale", label: "Commerciale / industriale", multiplier: 1.5 },
          ]),
        ],
      },
    ],
  },
  {
    id: "pavimenti",
    label: "Pavimenti",
    Icon: LayoutGrid,
    blurb: "Posa piastrelle, parquet, resina.",
    jobs: [
      {
        id: "posa-piastrelle",
        label: "Posa piastrelle",
        categoryId: "pavimenti",
        base: 38,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 25,
        fields: [
          F("rimozione", "Rimozione vecchio", [
            { value: "no", label: "No", multiplier: 1.0 },
            { value: "si", label: "Sì", multiplier: 1.4 },
          ]),
          F("schema", "Schema di posa", [
            { value: "semplice", label: "Diritto", multiplier: 1.0 },
            { value: "diagonale", label: "Diagonale", multiplier: 1.15 },
            { value: "complesso", label: "Spina / mosaico", multiplier: 1.3 },
          ]),
          F("formato", "Formato piastrella", [
            { value: "standard", label: "Standard", multiplier: 1.0 },
            { value: "grande", label: "Grande formato (>60×60)", multiplier: 1.2 },
          ]),
        ],
      },
      {
        id: "parquet",
        label: "Posa parquet",
        categoryId: "pavimenti",
        base: 42,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 25,
        fields: [
          F("tipo", "Tipo", [
            { value: "prefinito", label: "Prefinito flottante", multiplier: 1.0 },
            { value: "incollato", label: "Incollato", multiplier: 1.25 },
            { value: "massello", label: "Massello", multiplier: 1.5 },
          ]),
          F("battiscopa", "Battiscopa", [
            { value: "no", label: "Escluso", multiplier: 1.0 },
            { value: "si", label: "Incluso", multiplier: 1.1 },
          ]),
        ],
      },
      {
        id: "resina",
        label: "Pavimento in resina",
        categoryId: "pavimenti",
        base: 95,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 30,
        fields: [
          F("finitura", "Finitura", [
            { value: "opaca", label: "Opaca", multiplier: 1.0 },
            { value: "lucida", label: "Lucida", multiplier: 1.2 },
            { value: "decorata", label: "Decorata multistrato", multiplier: 1.45 },
          ]),
        ],
      },
    ],
  },
  {
    id: "climatizzazione",
    label: "Climatizzazione",
    Icon: Wind,
    blurb: "Climatizzatori mono e multi-split, manutenzioni.",
    jobs: [
      {
        id: "clima-mono",
        label: "Climatizzatore mono-split",
        categoryId: "climatizzazione",
        base: 650,
        unit: "elemento",
        unitLabel: "split",
        defaultQty: 1,
        fields: [
          F("piano", "Piano installazione", [
            { value: "terra", label: "Piano terra", multiplier: 1.0 },
            { value: "alto", label: "Piano alto / piattaforma", multiplier: 1.2 },
          ]),
          F("classe", "Classe energetica", [
            { value: "a", label: "A", multiplier: 1.0 },
            { value: "ap", label: "A++ inverter", multiplier: 1.25 },
          ]),
        ],
      },
      {
        id: "clima-multi",
        label: "Climatizzatore multi-split",
        categoryId: "climatizzazione",
        base: 1400,
        unit: "elemento",
        unitLabel: "impianti",
        defaultQty: 1,
        fields: [
          F("split", "Numero split interni", [
            { value: "due", label: "2 split", multiplier: 1.0 },
            { value: "tre", label: "3 split", multiplier: 1.35 },
            { value: "quattro", label: "4 split", multiplier: 1.7 },
          ]),
        ],
      },
      {
        id: "clima-manutenzione",
        label: "Manutenzione climatizzatore",
        categoryId: "climatizzazione",
        base: 80,
        unit: "elemento",
        unitLabel: "split",
        defaultQty: 1,
        fields: [
          F("tipo", "Tipo intervento", [
            { value: "pulizia", label: "Pulizia filtri / sanificazione", multiplier: 1.0 },
            { value: "ricarica", label: "Ricarica gas", multiplier: 1.5 },
          ]),
        ],
      },
    ],
  },
  {
    id: "serramenti",
    label: "Serramenti",
    Icon: DoorOpen,
    blurb: "Finestre PVC e alluminio, persiane, zanzariere.",
    jobs: [
      {
        id: "finestra-pvc",
        label: "Finestra in PVC",
        categoryId: "serramenti",
        base: 480,
        unit: "elemento",
        unitLabel: "finestre",
        defaultQty: 4,
        fields: [
          F("vetro", "Vetro", [
            { value: "doppio", label: "Doppio vetro", multiplier: 1.0 },
            { value: "triplo", label: "Triplo vetro", multiplier: 1.2 },
          ]),
          F("smontaggio", "Smontaggio vecchio", [
            { value: "no", label: "Non incluso", multiplier: 1.0 },
            { value: "si", label: "Incluso", multiplier: 1.12 },
          ]),
        ],
      },
      {
        id: "finestra-alluminio",
        label: "Finestra in alluminio",
        categoryId: "serramenti",
        base: 620,
        unit: "elemento",
        unitLabel: "finestre",
        defaultQty: 4,
        fields: [
          F("taglio", "Taglio termico", [
            { value: "no", label: "No", multiplier: 1.0 },
            { value: "si", label: "Sì", multiplier: 1.18 },
          ]),
        ],
      },
      {
        id: "persiane",
        label: "Persiane",
        categoryId: "serramenti",
        base: 350,
        unit: "elemento",
        unitLabel: "persiane",
        defaultQty: 4,
        fields: [
          F("materiale", "Materiale", [
            { value: "legno", label: "Legno", multiplier: 1.0 },
            { value: "alluminio", label: "Alluminio", multiplier: 1.15 },
          ]),
        ],
      },
      {
        id: "zanzariere",
        label: "Zanzariere",
        categoryId: "serramenti",
        base: 145,
        unit: "elemento",
        unitLabel: "zanzariere",
        defaultQty: 4,
        fields: [
          F("tipo", "Tipo", [
            { value: "fissa", label: "Fissa", multiplier: 1.0 },
            { value: "avvolgibile", label: "Avvolgibile", multiplier: 1.4 },
            { value: "plisse", label: "Plissé", multiplier: 1.6 },
          ]),
        ],
      },
    ],
  },
  {
    id: "pulizie",
    label: "Pulizie & Manutenzione",
    Icon: Sparkles,
    blurb: "Pulizie post-cantiere, giardino, potatura.",
    jobs: [
      {
        id: "pulizie-cantiere",
        label: "Pulizie post-cantiere",
        categoryId: "pulizie",
        base: 8,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 80,
        fields: [
          F("sporco", "Livello di sporco", [
            { value: "basso", label: "Basso", multiplier: 1.0 },
            { value: "medio", label: "Medio", multiplier: 1.25 },
            { value: "alto", label: "Molto sporco", multiplier: 1.5 },
          ]),
          F("vetri", "Pulizia vetri inclusa", [
            { value: "no", label: "No", multiplier: 1.0 },
            { value: "si", label: "Sì", multiplier: 1.2 },
          ]),
        ],
      },
      {
        id: "giardino-manutenzione",
        label: "Manutenzione giardino",
        categoryId: "pulizie",
        base: 6,
        unit: "mq",
        unitLabel: "metri quadri",
        defaultQty: 100,
        fields: [
          F("freq", "Frequenza", [
            { value: "spot", label: "Una tantum", multiplier: 1.0 },
            { value: "mensile", label: "Mensile", multiplier: 0.85 },
          ]),
          F("siepi", "Taglio siepi", [
            { value: "no", label: "Non incluso", multiplier: 1.0 },
            { value: "si", label: "Incluso", multiplier: 1.25 },
          ]),
        ],
      },
      {
        id: "potatura",
        label: "Potatura alberi",
        categoryId: "pulizie",
        base: 95,
        unit: "elemento",
        unitLabel: "alberi",
        defaultQty: 2,
        fields: [
          F("altezza", "Altezza pianta", [
            { value: "bassa", label: "Fino a 4 m", multiplier: 1.0 },
            { value: "media", label: "4–8 m", multiplier: 1.4 },
            { value: "alta", label: "Oltre 8 m (con cestello)", multiplier: 2.2 },
          ]),
        ],
      },
    ],
  },
];

export type RegionData = {
  id: string;
  label: string;
  multiplier: number;
  source: string;
  confidence: number;
  notes?: string;
};

export const REGIONS: RegionData[] = [
  { id: "abruzzo", label: "Abruzzo", multiplier: 0.92, source: "CRESME 2024", confidence: 0.82 },
  { id: "basilicata", label: "Basilicata", multiplier: 0.85, source: "CRESME 2024", confidence: 0.78 },
  { id: "calabria", label: "Calabria", multiplier: 0.88, source: "CRESME 2024", confidence: 0.78 },
  { id: "campania", label: "Campania", multiplier: 0.95, source: "CRESME 2024", confidence: 0.85 },
  { id: "emilia-romagna", label: "Emilia-Romagna", multiplier: 1.08, source: "CRESME 2024", confidence: 0.88 },
  { id: "friuli-vg", label: "Friuli-Venezia Giulia", multiplier: 1.12, source: "CRESME 2024", confidence: 0.85 },
  { id: "lazio", label: "Lazio", multiplier: 1.15, source: "CRESME 2024", confidence: 0.88 },
  { id: "liguria", label: "Liguria", multiplier: 1.18, source: "CRESME 2024", confidence: 0.85 },
  { id: "lombardia", label: "Lombardia", multiplier: 1.25, source: "CRESME 2024", confidence: 0.90 },
  { id: "marche", label: "Marche", multiplier: 0.98, source: "CRESME 2024", confidence: 0.82 },
  { id: "molise", label: "Molise", multiplier: 0.82, source: "CRESME 2024", confidence: 0.75 },
  { id: "piemonte", label: "Piemonte", multiplier: 1.10, source: "CRESME 2024", confidence: 0.88 },
  { id: "puglia", label: "Puglia", multiplier: 0.90, source: "CRESME 2024", confidence: 0.83 },
  { id: "sardegna", label: "Sardegna", multiplier: 0.92, source: "CRESME 2024", confidence: 0.78 },
  { id: "sicilia", label: "Sicilia", multiplier: 0.88, source: "CRESME 2024", confidence: 0.78 },
  { id: "toscana", label: "Toscana", multiplier: 1.05, source: "CRESME 2024", confidence: 0.86 },
  { id: "trentino", label: "Trentino-Alto Adige", multiplier: 1.20, source: "CRESME 2024", confidence: 0.87 },
  { id: "umbria", label: "Umbria", multiplier: 0.95, source: "CRESME 2024", confidence: 0.81 },
  { id: "valle-aosta", label: "Valle d'Aosta", multiplier: 1.22, source: "CRESME 2024", confidence: 0.80 },
  { id: "veneto", label: "Veneto", multiplier: 1.15, source: "CRESME 2024", confidence: 0.88 },
];

export type CompositionBreakdown = {
  labor: number;
  materials: number;
  margin: number;
};

export const COMPOSITION_BY_CATEGORY: Record<string, CompositionBreakdown> = {
  edilizia: { labor: 0.50, materials: 0.35, margin: 0.15 },
  imbiancatura: { labor: 0.70, materials: 0.20, margin: 0.10 },
  idraulica: { labor: 0.45, materials: 0.45, margin: 0.10 },
  elettrico: { labor: 0.45, materials: 0.40, margin: 0.15 },
  climatizzazione: { labor: 0.35, materials: 0.50, margin: 0.15 },
  serramenti: { labor: 0.30, materials: 0.55, margin: 0.15 },
  pulizie: { labor: 0.85, materials: 0.10, margin: 0.05 },
  pavimenti: { labor: 0.55, materials: 0.35, margin: 0.10 },
};

export type MarketRange = {
  minVariance: number;
  maxVariance: number;
};

export const MARKET_RANGES: Record<string, MarketRange> = {
  edilizia: { minVariance: 0.75, maxVariance: 1.30 },
  imbiancatura: { minVariance: 0.85, maxVariance: 1.15 },
  idraulica: { minVariance: 0.70, maxVariance: 1.35 },
  elettrico: { minVariance: 0.75, maxVariance: 1.25 },
  climatizzazione: { minVariance: 0.65, maxVariance: 1.40 },
  serramenti: { minVariance: 0.60, maxVariance: 1.40 },
  pulizie: { minVariance: 0.85, maxVariance: 1.15 },
  pavimenti: { minVariance: 0.75, maxVariance: 1.25 },
};

export function findJob(id: string): Job | undefined {
  for (const c of CATEGORIES) {
    const j = c.jobs.find((j) => j.id === id);
    if (j) return j;
  }
  return undefined;
}

export function findCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export type MarketAnalysis = {
  expected: number;
  marketMin: number;
  marketMid: number;
  marketMax: number;
  pricePerUnit: number;
  manodopera: number;
  materiali: number;
  margine: number;
  confidence: number;
  inflationImpact: number;
  logisticsImpact: number; // Impatto logistica in Euro
  expiryDate: Date;        // Data scadenza suggerita
  volatilityClass: 'low' | 'medium' | 'high' | 'critical';
};

export function computeMarket(
  job: Job,
  regionId: string,
  quantity: number,
  fieldValues: Record<string, string>,
  logisticsData?: { zoneId?: string; propertyTypeId?: string }
): MarketAnalysis {
  const region = REGIONS.find((r) => r.id === regionId);
  const regMul = region?.multiplier ?? 1;
  const regionConfidence = region?.confidence ?? 0.8;
  
  // 1. Calcolo base con moltiplicatori utente
  let extrasMul = 1.0;
  for (const f of job.fields) {
    const v = fieldValues[f.id];
    if (!v) continue;
    const opt = f.options.find((o) => o.value === v);
    if (opt) extrasMul *= opt.multiplier;
  }

  // 2. Applicazione Fattore Inflazione Dinamico
  const inflationFactor = getDynamicInflationFactor();
  const sectorVolatility = MARKET_INDICATORS.sectorVolatility[job.categoryId as keyof typeof MARKET_INDICATORS.sectorVolatility] || 1.05;
  
  // Il prezzo base viene corretto per l'inflazione e la volatilità del settore
  const adjustedBase = job.base * inflationFactor;
  
  // 3. Calcolo Impatto Logistica
  let logisticsMul = 1.0;
  if (logisticsData) {
    if (logisticsData.zoneId) {
      logisticsMul *= MARKET_INDICATORS.logistics.zones[logisticsData.zoneId as keyof typeof MARKET_INDICATORS.logistics.zones]?.multiplier ?? 1.0;
    }
    if (logisticsData.propertyTypeId) {
      logisticsMul *= MARKET_INDICATORS.logistics.propertyType[logisticsData.propertyTypeId as keyof typeof MARKET_INDICATORS.logistics.propertyType]?.multiplier ?? 1.0;
    }
  }

  // 4. Calcolo finale
  const baseExpected = adjustedBase * extrasMul * Math.max(1, quantity) * regMul;
  const expected = baseExpected * logisticsMul;
  
  const inflationImpact = (adjustedBase - job.base) * extrasMul * Math.max(1, quantity) * regMul * logisticsMul;
  const logisticsImpact = expected - baseExpected;
  
  const composition = COMPOSITION_BY_CATEGORY[job.categoryId] || { labor: 0.55, materials: 0.35, margin: 0.1 };
  
  // 5. Calcolo Range di Mercato (corretto per volatilità settore)
  const baseRange = MARKET_RANGES[job.categoryId] || { minVariance: 0.78, maxVariance: 1.28 };
  const range = {
    minVariance: baseRange.minVariance,
    maxVariance: baseRange.maxVariance * (1 + (sectorVolatility - 1) * 0.5)
  };

  return {
    expected,
    marketMin: expected * range.minVariance,
    marketMid: expected,
    marketMax: expected * range.maxVariance,
    pricePerUnit: (adjustedBase * extrasMul * regMul * logisticsMul),
    manodopera: expected * composition.labor,
    materiali: expected * composition.materials,
    margine: expected * composition.margin,
    confidence: regionConfidence,
    inflationImpact,
    logisticsImpact,
    expiryDate: getQuoteExpiryDate(job.categoryId),
    volatilityClass: getSectorVolatilityClass(job.categoryId),
  };
}
