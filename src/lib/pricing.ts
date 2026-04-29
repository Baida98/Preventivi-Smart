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
            { value: "semplice", label: "Semplice", multiplier: 0 },
            { value: "media", label: "Media", multiplier: 0.18 },
            { value: "complessa", label: "Complessa", multiplier: 0.4 },
          ]),
          F("smaltimento", "Smaltimento macerie", [
            { value: "no", label: "Non incluso", multiplier: 0 },
            { value: "si", label: "Incluso", multiplier: 0.15 },
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
            { value: "no", label: "No", multiplier: 0 },
            { value: "si", label: "Sì", multiplier: 0.25 },
          ]),
          F("tipo", "Tipo struttura", [
            { value: "parete", label: "Parete", multiplier: 0 },
            { value: "controsoffitto", label: "Controsoffitto", multiplier: 0.15 },
            { value: "ribassato", label: "Ribassato decorativo", multiplier: 0.35 },
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
            { value: "leggero", label: "Fino a 5 cm", multiplier: 0 },
            { value: "medio", label: "5–8 cm", multiplier: 0.15 },
            { value: "alto", label: "Oltre 8 cm", multiplier: 0.3 },
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
            { value: "tramezzi", label: "Tramezzi", multiplier: 0 },
            { value: "muri", label: "Muri portanti", multiplier: 0.6 },
          ]),
          F("smaltimento", "Smaltimento", [
            { value: "no", label: "Non incluso", multiplier: 0 },
            { value: "si", label: "Incluso", multiplier: 0.2 },
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
            { value: "buono", label: "Buono", multiplier: 0 },
            { value: "medio", label: "Medio (piccoli ritocchi)", multiplier: 0.15 },
            { value: "alto", label: "Rovinato (rasatura)", multiplier: 0.35 },
          ]),
          F("pittura", "Tipo di pittura", [
            { value: "base", label: "Base traspirante", multiplier: 0 },
            { value: "lavabile", label: "Lavabile", multiplier: 0.1 },
            { value: "antimuffa", label: "Antimuffa premium", multiplier: 0.25 },
          ]),
          F("colori", "Colore", [
            { value: "bianco", label: "Bianco", multiplier: 0 },
            { value: "colorato", label: "Colorato", multiplier: 0.2 },
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
            { value: "spatolato", label: "Spatolato", multiplier: 0 },
            { value: "metallizzato", label: "Effetto metallizzato", multiplier: 0.3 },
            { value: "sabbiato", label: "Sabbiato", multiplier: 0.2 },
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
            { value: "due", label: "2 mani", multiplier: 0 },
            { value: "tre", label: "3 mani lucide", multiplier: 0.25 },
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
            { value: "normale", label: "Programmata", multiplier: 0 },
            { value: "urgente", label: "Urgente", multiplier: 0.4 },
            { value: "festiva", label: "Festivo / notturno", multiplier: 0.8 },
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
            { value: "wc", label: "WC", multiplier: 0 },
            { value: "lavabo", label: "Lavabo", multiplier: -0.1 },
            { value: "bidet", label: "Bidet", multiplier: -0.05 },
            { value: "doccia", label: "Piatto doccia", multiplier: 0.5 },
            { value: "vasca", label: "Vasca", multiplier: 0.9 },
          ]),
          F("smaltimento", "Smaltimento vecchio", [
            { value: "no", label: "Non incluso", multiplier: 0 },
            { value: "si", label: "Incluso", multiplier: 0.15 },
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
            { value: "standard", label: "Standard", multiplier: 0 },
            { value: "condensazione", label: "Condensazione", multiplier: 0.2 },
            { value: "ibrida", label: "Ibrida", multiplier: 0.45 },
          ]),
          F("smontaggio", "Smontaggio vecchia", [
            { value: "no", label: "Non incluso", multiplier: 0 },
            { value: "si", label: "Incluso", multiplier: 0.1 },
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
            { value: "50", label: "50 L", multiplier: 0 },
            { value: "80", label: "80 L", multiplier: 0.2 },
            { value: "100", label: "100 L", multiplier: 0.4 },
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
            { value: "no", label: "Non necessarie", multiplier: 0 },
            { value: "si", label: "Sì, da realizzare", multiplier: 0.3 },
          ]),
          F("frutto", "Tipo frutto", [
            { value: "standard", label: "Standard", multiplier: 0 },
            { value: "premium", label: "Linea premium", multiplier: 0.25 },
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
            { value: "piccolo", label: "Fino a 12 moduli", multiplier: 0 },
            { value: "medio", label: "12–24 moduli", multiplier: 0.3 },
            { value: "grande", label: "Oltre 24 moduli", multiplier: 0.6 },
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
            { value: "civile", label: "Abitazione civile", multiplier: 0 },
            { value: "commerciale", label: "Commerciale", multiplier: 0.4 },
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
            { value: "no", label: "No", multiplier: 0 },
            { value: "si", label: "Sì", multiplier: 0.4 },
          ]),
          F("schema", "Schema di posa", [
            { value: "semplice", label: "Diritto", multiplier: 0 },
            { value: "diagonale", label: "Diagonale", multiplier: 0.15 },
            { value: "complesso", label: "Spina / mosaico", multiplier: 0.3 },
          ]),
          F("formato", "Formato piastrella", [
            { value: "standard", label: "Standard", multiplier: 0 },
            { value: "grande", label: "Grande formato (>60×60)", multiplier: 0.2 },
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
            { value: "prefinito", label: "Prefinito flottante", multiplier: 0 },
            { value: "incollato", label: "Incollato", multiplier: 0.25 },
            { value: "massello", label: "Massello", multiplier: 0.5 },
          ]),
          F("battiscopa", "Battiscopa", [
            { value: "no", label: "Escluso", multiplier: 0 },
            { value: "si", label: "Incluso", multiplier: 0.1 },
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
            { value: "opaca", label: "Opaca", multiplier: 0 },
            { value: "lucida", label: "Lucida", multiplier: 0.2 },
            { value: "decorata", label: "Decorata multistrato", multiplier: 0.45 },
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
            { value: "terra", label: "Piano terra", multiplier: 0 },
            { value: "alto", label: "Piano alto / piattaforma", multiplier: 0.2 },
          ]),
          F("classe", "Classe energetica", [
            { value: "a", label: "A", multiplier: 0 },
            { value: "ap", label: "A++ inverter", multiplier: 0.25 },
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
            { value: "due", label: "2 split", multiplier: 0 },
            { value: "tre", label: "3 split", multiplier: 0.35 },
            { value: "quattro", label: "4 split", multiplier: 0.7 },
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
            { value: "pulizia", label: "Pulizia filtri / sanificazione", multiplier: 0 },
            { value: "ricarica", label: "Ricarica gas", multiplier: 0.5 },
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
            { value: "doppio", label: "Doppio vetro", multiplier: 0 },
            { value: "triplo", label: "Triplo vetro", multiplier: 0.2 },
          ]),
          F("smontaggio", "Smontaggio vecchio", [
            { value: "no", label: "Non incluso", multiplier: 0 },
            { value: "si", label: "Incluso", multiplier: 0.12 },
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
            { value: "no", label: "No", multiplier: 0 },
            { value: "si", label: "Sì", multiplier: 0.18 },
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
            { value: "legno", label: "Legno", multiplier: 0 },
            { value: "alluminio", label: "Alluminio", multiplier: 0.15 },
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
            { value: "fissa", label: "Fissa", multiplier: 0 },
            { value: "avvolgibile", label: "Avvolgibile", multiplier: 0.4 },
            { value: "plisse", label: "Plissé", multiplier: 0.6 },
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
            { value: "basso", label: "Basso", multiplier: 0 },
            { value: "medio", label: "Medio", multiplier: 0.25 },
            { value: "alto", label: "Molto sporco", multiplier: 0.5 },
          ]),
          F("vetri", "Pulizia vetri inclusa", [
            { value: "no", label: "No", multiplier: 0 },
            { value: "si", label: "Sì", multiplier: 0.2 },
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
            { value: "spot", label: "Una tantum", multiplier: 0 },
            { value: "mensile", label: "Mensile", multiplier: -0.15 },
          ]),
          F("siepi", "Taglio siepi", [
            { value: "no", label: "Non incluso", multiplier: 0 },
            { value: "si", label: "Incluso", multiplier: 0.25 },
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
            { value: "bassa", label: "Fino a 4 m", multiplier: 0 },
            { value: "media", label: "4–8 m", multiplier: 0.4 },
            { value: "alta", label: "Oltre 8 m (con cestello)", multiplier: 1.2 },
          ]),
        ],
      },
    ],
  },
];

export const REGIONS: { id: string; label: string; multiplier: number }[] = [
  { id: "abruzzo", label: "Abruzzo", multiplier: 0.95 },
  { id: "basilicata", label: "Basilicata", multiplier: 0.9 },
  { id: "calabria", label: "Calabria", multiplier: 0.88 },
  { id: "campania", label: "Campania", multiplier: 0.92 },
  { id: "emilia-romagna", label: "Emilia-Romagna", multiplier: 1.1 },
  { id: "friuli-vg", label: "Friuli-Venezia Giulia", multiplier: 1.05 },
  { id: "lazio", label: "Lazio", multiplier: 1.15 },
  { id: "liguria", label: "Liguria", multiplier: 1.13 },
  { id: "lombardia", label: "Lombardia", multiplier: 1.18 },
  { id: "marche", label: "Marche", multiplier: 1.0 },
  { id: "molise", label: "Molise", multiplier: 0.92 },
  { id: "piemonte", label: "Piemonte", multiplier: 1.08 },
  { id: "puglia", label: "Puglia", multiplier: 0.9 },
  { id: "sardegna", label: "Sardegna", multiplier: 1.05 },
  { id: "sicilia", label: "Sicilia", multiplier: 0.9 },
  { id: "toscana", label: "Toscana", multiplier: 1.1 },
  { id: "trentino", label: "Trentino-Alto Adige", multiplier: 1.2 },
  { id: "umbria", label: "Umbria", multiplier: 0.98 },
  { id: "valle-aosta", label: "Valle d'Aosta", multiplier: 1.18 },
  { id: "veneto", label: "Veneto", multiplier: 1.1 },
];

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
};

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
