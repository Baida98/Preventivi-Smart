import { z } from "zod";

/**
 * Funzione di sanitizzazione stringhe potenziata.
 * Rimuove tag HTML, caratteri pericolosi e normalizza gli spazi.
 */
export function sanitizeString(val: unknown): string {
  if (typeof val !== 'string' || !val) return "";
  return val
    .replace(/<[^>]*>?/gm, "")      // Rimuove tag HTML
    .replace(/[<>`"']/g, "")        // Rimuove caratteri potenzialmente pericolosi
    .replace(/\s+/g, ' ')           // Normalizza spazi multipli
    .trim()
    .slice(0, 2000);               // Limita la lunghezza
}


/**
 * Schema di validazione per i dati del Wizard (Livello 1).
 * Implementa la "Validazione Forte" richiesta dall'architettura.
 */
export const WizardDataSchema = z.object({
  categoryId: z.string({ required_error: "Categoria obbligatoria" }).min(1, "Categoria obbligatoria").max(50),
  jobId: z.string({ required_error: "Lavoro obbligatorio" }).min(1, "Lavoro obbligatorio").max(50),
  regionId: z.string({ required_error: "Regione obbligatoria" }).min(1, "Regione obbligatoria").max(50),
  quantity: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val),
    z.number({ invalid_type_error: "La quantità deve essere un numero" }).positive("La quantità deve essere maggiore di zero").finite()
  ),
  fieldValues: z.record(z.string().max(100)),
  notes: z.string().max(2000, "Le note non possono superare 2000 caratteri").optional().transform(sanitizeString),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val),
    z.number({ invalid_type_error: "Il prezzo deve essere un numero" }).nonnegative("Il prezzo non può essere negativo").finite().optional()
  ),
});

export type WizardData = z.infer<typeof WizardDataSchema>;


/**
 * Funzione di validazione e sanitizzazione per i dati del Wizard.
 * Esegue la validazione di Livello 1 (schema) e Livello 2 (business logic).
 * @param data I dati grezzi in input dal form.
 * @returns Un oggetto con `success` (boolean), `data` (dati validati) o `errors` (array di stringhe).
 */
export function validateWizardData(data: unknown): { success: boolean; data?: WizardData; errors?: string[] } {
  // Livello 1: Validazione dello schema e sanitizzazione automatica
  const result = WizardDataSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map(e => e.message),
    };
  }

  const validatedData = result.data;

  // Livello 2: Controlli di coerenza logica (Business Logic)
  const businessLogicErrors: string[] = [];
  
  if (["muratura", "imbiancatura-standard", "posa-piastrelle"].includes(validatedData.jobId) && validatedData.quantity < 2) {
    businessLogicErrors.push("Per questo lavoro, la quantità minima è 2.");
  }

  if (validatedData.price !== undefined) {
    if (validatedData.price > 1000000) {
        businessLogicErrors.push("Il prezzo sembra eccessivo (oltre 1M€). Controlla il valore inserito.");
    }
    if (validatedData.price > 0 && validatedData.price < 10) {
        businessLogicErrors.push("Un prezzo inferiore a 10€ è insolito. Verifica il dato.");
    }
  }

  if (businessLogicErrors.length > 0) {
    return {
        success: false,
        errors: businessLogicErrors,
    };
  }

  return { success: true, data: validatedData };
}

/**
 * Valida, sanitizza e restituisce i dati del wizard già trasformati,
 * oppure null se la validazione fallisce.
 */
export function validateAndSanitizeWizardData(data: unknown): WizardData | null {
  const result = validateWizardData(data);
  if (!result.success || !result.data) return null;
  return result.data;
}
