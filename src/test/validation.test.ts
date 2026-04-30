import { describe, it, expect } from 'vitest';
import {
  validateWizardData,
  validateQuoteInput,
  sanitizeString,
  validateAndSanitizeWizardData,
} from '../lib/validation';

describe('Validazione con Zod', () => {
  it('valida correttamente i dati del wizard', () => {
    const validData = {
      categoryId: 'edilizia',
      jobId: 'muratura',
      regionId: 'lombardia',
      quantity: 10,
      fieldValues: { complessita: 'semplice' },
      notes: 'Prova',
    };

    const result = validateWizardData(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(10);
    }
  });

  it('rifiuta i dati del wizard invalidi', () => {
    const invalidData = {
      categoryId: 'edilizia',
      jobId: 'muratura',
      regionId: '',
      quantity: -5, // Negativo
      fieldValues: {},
    };

    const result = validateWizardData(invalidData);
    expect(result.success).toBe(false);
  });

  it('sanitizza le stringhe correttamente', () => {
    const input = '<script>alert("xss")</script>Testo';
    const sanitized = sanitizeString(input);
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
    expect(sanitized).toContain('Testo');
  });

  it('valida e sanitizza i dati del wizard', () => {
    const validData = {
      categoryId: 'edilizia',
      jobId: 'muratura',
      regionId: 'lombardia',
      quantity: 10,
      fieldValues: { complessita: 'semplice' },
      notes: 'Note sicure',
    };

    const result = validateAndSanitizeWizardData(validData);
    expect(result).not.toBeNull();
    expect(result?.quantity).toBe(10);
  });

  it('rifiuta dati con note troppo lunghe', () => {
    const longNotes = 'a'.repeat(2001);
    const invalidData = {
      categoryId: 'edilizia',
      jobId: 'muratura',
      regionId: 'lombardia',
      quantity: 10,
      fieldValues: {},
      notes: longNotes,
    };

    const result = validateWizardData(invalidData);
    expect(result.success).toBe(false);
  });
});
