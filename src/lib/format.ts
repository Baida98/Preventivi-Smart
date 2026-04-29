export const fmtEUR = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  "€ " +
  Math.round(n).toLocaleString("it-IT", {
    maximumFractionDigits: 0,
    ...opts,
  });

export const fmtEURRange = (min: number, max: number) =>
  `${fmtEUR(min)} – ${fmtEUR(max)}`;

export const fmtPct = (n: number, digits = 0) =>
  `${(n * 100).toFixed(digits)}%`.replace(".", ",");

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
