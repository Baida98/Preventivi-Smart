import { motion } from "framer-motion";
import { Search, Calculator, Sparkles, ShieldCheck, FileText, TrendingUp, BarChart3 } from "lucide-react";
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/40 backdrop-blur-md border border-white/10 text-[11px] font-black uppercase tracking-widest text-primary/90 shadow-2xl mb-10"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Analisi basata su indici ISTAT 2026
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-[40px] sm:text-[56px] md:text-[72px] leading-[1.1] font-black tracking-tighter max-w-5xl mx-auto"
        >
          <span className="block text-foreground/90">Un riferimento chiaro</span>
          <span className="block bg-gradient-to-r from-primary via-sky-400 to-accent bg-clip-text text-transparent font-serif italic">per valutare un preventivo</span>
          <span className="block text-foreground/80">prima di scegliere</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 mx-auto max-w-3xl text-balance text-lg sm:text-xl text-muted-foreground/80 font-medium leading-relaxed"
        >
          Ti aiuta a leggere meglio prezzi, variabili e differenze tra le offerte, con un punto di partenza realistico.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <Button
            size="lg"
            onClick={onAnalizza}
            className="h-16 px-12 gap-4 text-lg font-black uppercase tracking-tight glow-azure rounded-[1.5rem]"
          >
            <FileText className="w-6 h-6" />
            Analizza Preventivo
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onStima}
            className="h-16 px-12 gap-4 text-lg font-black uppercase tracking-tight rounded-[1.5rem] bg-card/40 backdrop-blur-md"
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
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          <TrustItem icon={ShieldCheck} label="Riservatezza" sub="Dati protetti" />
          <TrustItem icon={BarChart3} label="Benchmark" sub="Dati Regionali" />
          <TrustItem icon={Search} label="Verifica" sub="Voci di costo" />
          <TrustItem icon={Sparkles} label="Modello AI" sub="Auto-apprendimento" />
        </motion.div>
      </div>
    </section>
  );
}

function TrustItem({ icon: Icon, label, sub }: { icon: any, label: string, sub: string }) {
  return (
    <div className="flex flex-col items-center gap-3 group cursor-default">
      <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-foreground">{label}</p>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
