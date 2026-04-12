export function predictPrice(history, tipo) {

  const filtered = history.filter(x => x.tipo === tipo);

  if (filtered.length < 5) {
    return { confidence: 0 };
  }

  const avg = filtered.reduce((s, x) => s + x.mid, 0) / filtered.length;

  const variance = filtered.reduce((s, x) =>
    s + Math.pow(x.mid - avg, 2), 0
  ) / filtered.length;

  return {
    predicted: avg,
    confidence: Math.max(0, 100 - variance / 1000)
  };
}
