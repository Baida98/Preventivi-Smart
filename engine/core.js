export function calcolaBase({ tipo, mq, qualita, citta }) {

  const baseMap = {
    imbiancatura: 12,
    piastrelle: 25,
    bagno: 1200
  };

  const qualitaMap = {
    bassa: 0.8,
    media: 1,
    alta: 1.3
  };

  const cittaMap = {
    milano: 1.25,
    roma: 1.15,
    napoli: 0.95
  };

  const base = baseMap[tipo] ?? 10;
  const q = qualitaMap[qualita] ?? 1;
  const c = cittaMap[citta] ?? 1;
  const mqSafe = Number(mq) > 0 ? Number(mq) : 1;

  const mid = base * mqSafe * q * c;

  return {
    min: mid * 0.85,
    mid,
    max: mid * 1.2
  };
}
