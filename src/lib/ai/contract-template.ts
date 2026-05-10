/**
 * AI Contract Template — Genera template contrattuale personalizzato
 *
 * L'utente può scaricare un template di contratto professionale
 * già personalizzato per il tipo di lavoro specifico.
 */

import { callLLM } from "./llm-provider";

export interface ContractTemplate {
  title: string;
  sections: {
    heading: string;
    content: string;
  }[];
  notes: string;
}

export async function generateContractTemplate(params: {
  jobLabel: string;
  categoryId: string;
  price: number;
  regionLabel: string;
  quantity: number;
  unitLabel: string;
}): Promise<ContractTemplate | null> {
  const { jobLabel, categoryId, price, regionLabel, quantity, unitLabel } = params;

  const msg = `Genera un template di contratto professionale in italiano per:
Lavoro: ${jobLabel} (${categoryId})
Luogo: ${regionLabel}
Quantità: ${quantity} ${unitLabel}
Importo: €${price.toLocaleString("it-IT")}

Il contratto deve includere le sezioni fondamentali:
- Oggetto del contratto
- Durata e tempistiche
- Pagamenti e modalità
- Garanzie e responsabilità
- Clausola penale
- Clausola di recesso

Rispondi con JSON: {
  "title": "titolo del contratto",
  "sections": [
    {"heading": "Art. 1 - Oggetto del Contratto", "content": "..."},
    {"heading": "Art. 2 - ...", "content": "..."}
  ],
  "notes": "Note legali finali (max 2 righe)"
}

Massimo 6 articoli, linguaggio chiaro ma professionale.`;

  try {
    const response = await callLLM(
      [
        {
          role: "system",
          content:
            "Sei un avvocato specializzato in diritto dei contratti per lavori edili italiani. Produci template professionali ma accessibili. Rispondi SOLO con JSON valido.",
        },
        { role: "user", content: msg },
      ],
      { model: "smart", temperature: 0.3, maxTokens: 1500, jsonMode: true }
    );
    return JSON.parse(response) as ContractTemplate;
  } catch {
    return null;
  }
}

export function formatContractAsText(template: ContractTemplate, params: {
  jobLabel: string;
  regionLabel: string;
  price: number;
}): string {
  const today = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  const lines = [
    "═══════════════════════════════════════════",
    template.title.toUpperCase(),
    `Generato il ${today} da Preventivi Smart`,
    "═══════════════════════════════════════════",
    "",
    `Lavoro: ${params.jobLabel} | Regione: ${params.regionLabel}`,
    `Importo concordato: €${params.price.toLocaleString("it-IT")}`,
    "",
    ...template.sections.flatMap(s => [
      `─── ${s.heading} ───`,
      s.content,
      "",
    ]),
    "═══════════════════════════════════════════",
    template.notes,
    "",
    "ATTENZIONE: Questo template è generato da AI a scopo orientativo.",
    "Si raccomanda la revisione da parte di un professionista legale.",
    "═══════════════════════════════════════════",
  ];
  return lines.join("\n");
}
