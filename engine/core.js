export function calcolaBase({ tipo, mq, qualita, citta }) {

  // PREZZI BASE
  const basePrezzi = {
    imbiancatura: 12,
    piastrelle: 25,
    bagno: 1200
  };

  const base = basePrezzi[tipo] || 10;

  // QUALITÀ
  const molQualita = {
    bassa: 0.8,
    media: 1,
    alta: 1.3
  };

  // CITTÀ (mercato reale semplificato)
  const molCitta = {
    milano: 1.25,
    roma: 1.15,
    napoli: 0.95,
    default: 1
  };

  const mqSafe = mq && mq > 0 ? mq : 1;

  const mid =
    base *
    mqSafe *
    (molQualita[qualita] || 1) *
    (molCitta[citta] || molCitta.default);

  return {
    min: mid * 0.85,
    mid,
    max: mid * 1.2
  };
}
