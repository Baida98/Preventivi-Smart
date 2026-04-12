export function drawChart(canvas, data) {

  const ctx = canvas.getContext("2d");

  const keys = Object.keys(data.byType);
  const values = Object.values(data.byType);

  ctx.clearRect(0,0,canvas.width,canvas.height);

  values.forEach((v, i) => {
    ctx.fillRect(i * 50, 200 - v * 10, 30, v * 10);
  });
}
