import { Lock, Database, BadgeEuro, UserX } from "lucide-react";

const ITEMS = [
  {
    Icon: Database,
    title: "Fonti ISTAT 2026",
    body: "Analisi basata su indici di costo aggiornati e prezzari delle Camere di Commercio.",
  },
  {
    Icon: BadgeEuro,
    title: "Variabili Regionali",
    body: "I calcoli integrano i coefficienti di costo specifici per ogni regione italiana.",
  },
  {
    Icon: UserX,
    title: "Privacy by Design",
    body: "Nessun tracciamento personale. L'elaborazione dei dati avviene localmente nel browser.",
  },
  {
    Icon: Lock,
    title: "Conformità GDPR",
    body: "Sistema progettato per la massima riservatezza: nessun dato viene archiviato esternamente.",
  },
];

export default function Trust() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary/80">
          Affidabilità
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
          Dati certificati.{" "}
          <span className="font-serif-display italic text-muted-foreground">
            Analisi statistica.
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
