import { motion } from "framer-motion";
import { ListChecks, Scale, Gavel } from "lucide-react";

const STEPS = [
  {
    Icon: ListChecks,
    title: "Inserisci i dati",
    body: "Categoria, regione, quantità e qualche dettaglio. Pochi secondi, niente registrazione.",
  },
  {
    Icon: Scale,
    title: "Confronto col mercato",
    body: "Calcoliamo la fascia di prezzo onesta usando prezzari ISTAT 2025 e i listini della tua regione.",
  },
  {
    Icon: Gavel,
    title: "Verdetto chiaro",
    body: "Ricevi un verdetto netto, una tabella dei costi e i consigli pratici per trattare bene.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary/80">
          Come funziona
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
          Tre passi.{" "}
          <span className="font-serif-display italic text-muted-foreground">
            Niente formule strane.
          </span>
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative rounded-2xl border border-border/70 bg-card/50 p-6 hover-elevate"
          >
            <div className="absolute bottom-4 right-5 text-[72px] leading-none font-bold text-primary/8 select-none pointer-events-none">
              {i + 1}
            </div>
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 ring-1 ring-primary/25">
              <s.Icon className="w-5 h-5 text-primary" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {s.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
