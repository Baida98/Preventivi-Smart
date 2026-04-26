let chartInstance = null;

export function renderChart(ctx, data) {

  if (!ctx) return;
  
  const prices = data.map(d => d.mid);

  // Distruggi il grafico precedente se esiste
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: prices.map((_, i) => i + 1),
      datasets: [{
        label: "Prezzi Preventivi",
        data: prices,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
