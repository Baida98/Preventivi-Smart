export function stats(history) {

  const total = history.length;

  const avg = history.reduce((s, x) => s + x.mid, 0) / (total || 1);

  const byType = history.reduce((acc, x) => {
    acc[x.tipo] = (acc[x.tipo] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    avg,
    byType
  };
}
