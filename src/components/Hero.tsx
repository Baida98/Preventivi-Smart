import { motion } from "framer-motion";
import { Search, Calculator, Sparkles, ShieldCheck, FileText, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onAnalizza: () => void;
  onStima: () => void;
};

export default function Hero({ onAnalizza, onStima }: Props) {
  return (
    <section className="relative overflow-hidden pt-12 sm:pt-20">
      {/* Dynamic background elements */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full blur-[140px] bg-primary/20 opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-accent/15 opacity-30"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pb-24 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/40 backdrop-blur-md border border-white/10 text-[11px] font-bold uppercase tracking-widest text-primary/90 shadow-2xl mb-8"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Analisi basata su indici ISTAT 2026
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-[52px] sm:text-[80px] md:text-[96px] leading-[0.9] font-black tracking-tighter"
        >
          Analisi Tecnica{" "}
          <span className="font-serif-display italic text-primary bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
            dei Preventivi
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 mx-auto max-w-3xl text-balance text-lg sm:text-xl text-muted-foreground/80 font-medium leading-relaxed"
        >
          Strumento professionale per la valutazione dei costi nel settore dell'edilizia e dell'impiantistica. Confronta i tuoi preventivi con i benchmark regionali aggiornati e ottieni un'analisi strutturata basata su dati ufficiali.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={onAnalizza}
            className="h-16 px-10 gap-3 text-lg font-black uppercase tracking-tight bg-primary hover:bg-primary/90 text-primary-foreground glow-azure rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileText className="w-6 h-6" />
            Analizza Preventivo
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onStima}
            className="h-16 px-10 gap-3 text-lg font-black uppercase tracking-tight rounded-2xl border-white/10 bg-card/40 backdrop-blur-md hover:bg-card/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calculator className="w-6 h-6" />
            Stima Costi
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          <TrustItem icon={ShieldCheck} label="Riservatezza" sub="Nessun dato personale" />
          <TrustItem icon={TrendingUp} label="Benchmark 2026" sub="Indici ISTAT & Regionali" />
          <TrustItem icon={Search} label="Verifica Tecnica" sub="Analisi delle voci di costo" />
          <TrustItem icon={Sparkles} label="Modello AI" sub="Elaborazione statistica" />
        </motion.div>
      </div>
    </section>
  );
}

function TrustItem({ icon: Icon, label, sub }: { icon: any, label: string, sub: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-2.5 rounded-xl bg-primary/5 ring-1 ring-primary/10">
        <Icon className="w-5 h-5 text-primary/80" />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-foreground">{label}</p>
        <p className="text-[10px] font-medium text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
