import { fmtEUR } from "@/lib/format";

type Example = {
  job: string;
  region: string;
  price: number;
  market: number;
  verdict: "Equo" | "Alto" | "Troppo alto" | "Ottimo" | "Sospetto";
  badgeClass: string;
};

const EX: Example[] = [
  {
    job: "Imbiancatura 80 mq",
    region: "Lombardia",
    price: 980,
    market: 944,
    verdict: "Equo",
    badgeClass: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  {
    job: "6 punti elettrici",
    region: "Campania",
    price: 720,
    market: 396,
    verdict: "Troppo alto",
    badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  {
    job: "Caldaia condensazione",
    region: "Lazio",
    price: 1900,
    market: 2484,
    verdict: "Ottimo",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
];

export default function Examples() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary/80">
          Esempi reali
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
          Cosa vedrai{" "}
          <span className="font-serif-display italic text-muted-foreground">
            alla fine
          </span>
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3">
        {EX.map((e) => (
          <div
            key={e.job}
            className="rounded-2xl border border-border/70 bg-card/50 p-5 hover-elevate"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold leading-tight">
                  {e.job}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {e.region}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full border ${e.badgeClass}`}
              >
                {e.verdict}
              </span>
            </div>

            <div className="mt-5 space-y-2.5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Preventivo ricevuto</span>
                <span className="font-semibold tabular-nums">
                  {fmtEUR(e.price)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Media di mercato</span>
                <span className="font-semibold tabular-nums">
                  {fmtEUR(e.market)}
                </span>
              </div>
              <div className="h-px bg-border/60 my-2" />
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Differenza</span>
                <span
                  className={`font-bold tabular-nums ${
                    e.price > e.market ? "text-rose-300" : "text-emerald-300"
                  }`}
                >
                  {e.price > e.market ? "+" : "−"}
                  {fmtEUR(Math.abs(e.price - e.market))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
