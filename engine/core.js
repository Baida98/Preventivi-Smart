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

  const priceBase = base[tipo] ?? 10;
  const mqSafe = Number(mq) > 0 ? Number(mq) : 1;

  const mid = priceBase * mqSafe * (q[qualita] ?? 1) * (c[citta] ?? 1);

  return {
    min: mid * 0.85,
    mid,
    max: mid * 1.2
  };
}
