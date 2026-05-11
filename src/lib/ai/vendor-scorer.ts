/**
 * AI Vendor Scorer — Valutazione automatica del fornitore
 *
 * Analizza il testo di un preventivo e fornisce un punteggio
 * di affidabilità e professionalità del fornitore.
 */

import { callLLM } from "./llm-provider";

export interface VendorScore {
  overall: number; // 0-100
  categories: {
    professionalism: number; // 0-100 (completezza intestazione, partita IVA, ecc.)
    clarity: number; // 0-100 (chiarezza descrizioni, voci separate, ecc.)
    pricing: number; // 0-100 (trasparenza prezzi, IVA esposta, ecc.)
    terms: number; // 0-100 (garanzie, tempistiche, penali, ecc.)
  };
  badges: string[]; // es. ["IVA esposta", "Garanzia inclusa", "Dettaglio manodopera"]
  redFlags: string[]; // es. ["Nessun codice fiscale", "Prezzi tutto compreso (poco chiaro)"]
  verdict: "eccellente" | "buono" | "sufficiente" | "scarso";
  recommendation: string;
}

export async function scoreVendor(
  documentText: string,
  jobLabel: string
): Promise<VendorScore | null> {
  if (!documentText || documentText.length < 50) return null;

  const snippet = documentText.slice(0, 2000); // stay within token budget
  const msg = `Analizza il seguente preventivo/documento e valuta il fornitore:

=== DOCUMENTO ===
${snippet}
=== FINE DOCUMENTO ===

Lavoro: ${jobLabel}

Valuta il fornitore su 4 dimensioni (0-100):
1. professionalism: intestazione, P.IVA, CF, timbro, firma
2. clarity: descrizioni chiare, singole voci separate, unità di misura
3. pricing: trasparenza prezzi, IVA separata, materiale/manodopera distinti
4. terms: garanzie, tempistiche, modalità pagamento, penali

Rispondi in JSON: {
  "overall": 0-100,
  "categories": { "professionalism": 0-100, "clarity": 0-100, "pricing": 0-100, "terms": 0-100 },
  "badges": ["punto positivo 1", "punto positivo 2"],
  "redFlags": ["problema 1", "problema 2"],
  "verdict": "eccellente|buono|sufficiente|scarso",
  "recommendation": "consiglio in 1 frase"
}`;

  try {
    const response = await callLLM(
      [
        {
          role: "system",
          content:
            "Sei un esperto di qualità documentale per preventivi edilizi italiani. Sei rigoroso ma equo. Rispondi SOLO con JSON valido.",
        },
        { role: "user", content: msg },
      ],
      { model: "fast", temperature: 0.2, maxTokens: 500, jsonMode: true }
    );
    return JSON.parse(response) as VendorScore;
  } catch {
    return null;
  }
}
