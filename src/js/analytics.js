export function buildAnalytics(quotes) {

  if (!quotes || quotes.length === 0) {
    return {
      total: 0,
      avg: 0,
      max: 0,
      min: 0
    };
  }

  const prices = quotes.map(q => q.mid);

  const total = prices.reduce((a, b) => a + b, 0);

  return {
    total,
    avg: total / prices.length,
    max: Math.max(...prices),
    min: Math.min(...prices)
  };
}
