export function calculate(input, stats) {

  const base = stats[input.tipo] || {
    avg: 30
  };

  let m = 1;

  // stato reale lavoro
  if (input.stato === "scarso") m += 0.45;
  if (input.stato === "buono") m -= 0.15;

  // difficoltà reale
  if (input.difficolta === "alta") m += 0.35;
  if (input.difficolta === "bassa") m -= 0.2;

  // extra nascosti
  if (input.extra) m += 0.2;

  const value = base.avg * input.qta * m;

  return {
    min: value * 0.8,
    mid: value,
    max: value * 1.2
  };
}
