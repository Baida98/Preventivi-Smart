import { z } from 'zod';

/**
 * Schema di validazione per i dati del wizard
 * Garantisce che tutti gli input siano corretti e sicuri
 */

export const WizardDataSchema = z.object({
  categoryId: z.string().min(1, 'Categoria obbligatoria').max(50),
  jobId: z.string().min(1, 'Lavoro obbligatorio').max(50),
  regionId: z.string().min(1, 'Regione obbligatoria').max(50),
  quantity: z.number().positive('La quantità deve essere positiva').finite(),
  fieldValues: z.record(z.string(), z.string().max(100)),
  notes: z.string().max(2000, 'Le note non possono superare 2000 caratteri').optional(),
  price: z.number().positive('Il prezzo deve essere positivo').finite().optional(),
});

export const QuoteInputSchema = z.object({
  categoryId: z.string().min(1).max(50),
  jobId: z.string().min(1).max(50),
  regionId: z.string().min(1).max(50),
  quantity: z.number().positive().finite(),
  fieldValues: z.record(z.string(), z.string().max(100)),
  notes: z.string().max(2000).optional(),
  price: z.number().positive().finite().optional(),
  verdict: z.string().optional(),
});

export type WizardData = z.infer<typeof WizardDataSchema>;
export type QuoteInput = z.infer<typeof QuoteInputSchema>;

/**
 * Valida i dati del wizard
 * @param data I dati da validare
 * @returns Risultato della validazione con errori dettagliati
 */
export function validateWizardData(data: unknown) {
  return WizardDataSchema.safeParse(data);
}

/**
 * Valida i dati di un preventivo
 * @param data I dati da validare
 * @returns Risultato della validazione con errori dettagliati
 */
export function validateQuoteInput(data: unknown) {
  return QuoteInputSchema.safeParse(data);
}

/**
 * Sanitizza una stringa per prevenire XSS
 * @param input La stringa da sanitizzare
 * @returns La stringa sanitizzata
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Rimuove < e >
    .trim()
    .slice(0, 2000); // Limita la lunghezza
}

/**
 * Valida e sanitizza i dati del wizard
 * @param data I dati da validare e sanitizzare
 * @returns I dati validati e sanitizzati, o null se invalidi
 */
export function validateAndSanitizeWizardData(data: unknown): WizardData | null {
  const result = validateWizardData(data);
  if (!result.success) {
    console.error('Validazione fallita:', result.error.errors);
    return null;
  }
  return result.data;
}
