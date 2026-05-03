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
        <div className="space-y-2">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-primary">
            Ambiti di Analisi
          </p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tightest">
            {CATEGORIES.length} settori,{" "}
            <span className="font-serif-display italic text-muted-foreground">
              {totalJobs} interventi
            </span>
          </h2>
        </div>
        <p className="text-sm text-muted-foreground/70 max-w-sm font-medium leading-relaxed">
          Seleziona un ambito per avviare l'analisi tecnica. Il database viene aggiornato costantemente con nuovi parametri di mercato.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onClick={() => onPickCategory(c.id)}
            className="group relative text-left rounded-[2rem] border border-border/60 bg-card/40 p-6 card-hover-glow transition-all"
          >
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                <c.Icon className="w-6 h-6 text-primary" strokeWidth={2.5} />
              </span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
            <h3 className="mt-6 text-base font-black leading-tight tracking-tight">
              {c.label}
            </h3>
            <p className="mt-2 text-xs text-muted-foreground/60 line-clamp-2 leading-relaxed font-medium">
              {c.blurb}
            </p>
            <div className="mt-4 inline-flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/40 mr-2" />
              {c.jobs.length} {c.jobs.length === 1 ? "lavoro" : "lavori"}
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
