export function renderChart(ctx, data) {

  const prices = data.map(d => d.mid);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: prices.map((_, i) => i + 1),
      datasets: [{
        data: prices
      }]
    }
  });
}
