export function calcolaPreventivo({ tipo, mq, qualita, citta }) {

  const baseCityMultiplier = {
    milano: 1.25,
    roma: 1.15,
    napoli: 0.95,
    default: 1
  };

  const base = {
    imbiancatura: 12,
    piastrelle: 25,
    bagno: 1200
  }[tipo] || 10;

  const qualitaM = {
    bassa: 0.8,
    media: 1,
    alta: 1.35
  }[qualita];

  const cityM = baseCityMultiplier[citta] || 1;

  const mid = base * mq * qualitaM * cityM;

  return {
    min: mid * 0.85,
    mid,
    max: mid * 1.2
  };
}
