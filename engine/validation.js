/**
 * Modulo di validazione per gli input dell'applicazione
 */

export function validateInput(input) {
  const errors = [];

  // Validazione tipo
  if (!input.tipo || input.tipo.trim() === "") {
    errors.push("Il tipo di lavoro è obbligatorio");
  }

  // Validazione mq
  const mq = Number(input.mq);
  if (isNaN(mq) || mq <= 0) {
    errors.push("I metri quadri devono essere un numero positivo");
  }

  // Validazione qualita
  if (!input.qualita || input.qualita.trim() === "") {
    errors.push("La qualità è obbligatoria");
  }

  // Validazione citta
  if (!input.citta || input.citta.trim() === "") {
    errors.push("La città è obbligatoria");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formatta un numero come valuta EUR
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

/**
 * Valida che un valore sia un numero positivo
 */
export function isPositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}
