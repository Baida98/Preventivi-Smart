export function calcolaAI(dati, tipo, zona) {
  const filtrati = dati.filter(p => p.tipo === tipo && p.zona === zona);

  if (filtrati.length < 3) return null;

  let totale = 0;

  filtrati.forEach(p => totale += p.stima);

  const media = totale / filtrati.length;

  return {
    min: media * 0.85,
    medio: media,
    max: media * 1.2,
    affidabilita: Math.min(95, 50 + filtrati.length * 5)
  };
}
