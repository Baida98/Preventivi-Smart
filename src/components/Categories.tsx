import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/pricing";

type Props = {
  onPickCategory: (id: string) => void;
};

export default function Categories({ onPickCategory }: Props) {
  const totalJobs = CATEGORIES.reduce((acc, cat) => acc + cat.jobs.length, 0);

  return (
    <section className="relative mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary/80">
            Ambiti di Analisi
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            {CATEGORIES.length} settori specialistici,{" "}
            <span className="font-serif-display italic text-muted-foreground">
              {totalJobs} tipologie di intervento
            </span>
          </h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm">
          Seleziona un ambito per avviare l'analisi tecnica. Il database viene aggiornato costantemente con nuovi parametri di mercato.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onClick={() => onPickCategory(c.id)}
            className="group relative text-left rounded-2xl border border-border/70 bg-card/50 p-5 hover-elevate-2 transition"
          >
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 ring-1 ring-primary/20">
                <c.Icon className="w-5 h-5 text-primary" strokeWidth={2.2} />
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition" />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold leading-tight">
              {c.label}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {c.blurb}
            </p>
            <div className="mt-3 inline-flex items-center text-[11px] font-medium text-muted-foreground">
              <span className="inline-block w-1 h-1 rounded-full bg-primary/60 mr-1.5" />
              {c.jobs.length} {c.jobs.length === 1 ? "lavoro" : "lavori"}
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
