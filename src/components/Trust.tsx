import { Lock, Database, BadgeEuro, UserX } from "lucide-react";

const ITEMS = [
  {
    Icon: Database,
    title: "Dati ISTAT 2026",
    body: "Indici aggiornati e prezzari delle Camere di Commercio regionali.",
  },
  {
    Icon: BadgeEuro,
    title: "Multipli regionali reali",
    body: "Differenze tra Lombardia, Sicilia, Lazio: applicate alla cifra finale.",
  },
  {
    Icon: UserX,
    title: "Anonimo & senza account",
    body: "Nessun login, nessun tracciamento. I tuoi dati restano sul tuo browser.",
  },
  {
    Icon: Lock,
    title: "Privacy GDPR",
    body: "Niente dati personali raccolti. L'archivio è solo locale, sul tuo device.",
  },
];

export default function Trust() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary/80">
          Perché fidarsi
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
          Numeri verificabili.{" "}
          <span className="font-serif-display italic text-muted-foreground">
            Niente magia.
          </span>
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ITEMS.map((it) => (
          <div
            key={it.title}
            className="rounded-2xl border border-border/70 bg-card/40 p-5 hover-elevate"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <it.Icon className="w-4 h-4 text-emerald-300" />
            </span>
            <h3 className="mt-4 text-[15px] font-semibold leading-tight">
              {it.title}
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {it.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
