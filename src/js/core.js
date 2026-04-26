export function calcolaBase({ tipo, mq, qualita, citta }) {

  const base = {
    imbiancatura: 12,
    piastrelle: 25,
    bagno: 1200
  };

  const q = {
    bassa: 0.8,
    media: 1,
    alta: 1.3
  };

  const c = {
    milano: 1.25,
    roma: 1.15,
    napoli: 0.95
  };

  // Validazione input
  if (!tipo || !mq || !qualita || !citta) {
    console.warn("Input mancante:", { tipo, mq, qualita, citta });
  }

  const priceBase = base[tipo] ?? 10;
  const mqSafe = Number(mq) > 0 ? Number(mq) : 1;

  const mid = priceBase * mqSafe * (q[qualita] ?? 1) * (c[citta] ?? 1);

  return {
    min: Math.round(mid * 0.85 * 100) / 100,
    mid: Math.round(mid * 100) / 100,
    max: Math.round(mid * 1.2 * 100) / 100
  };
}
