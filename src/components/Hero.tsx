import { motion } from "framer-motion";
import { Search, Calculator, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onAnalizza: () => void;
  onStima: () => void;
};

export default function Hero({ onAnalizza, onStima }: Props) {
  return (
    <section className="relative overflow-hidden">
      {/* glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[120px] bg-primary/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-20 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] bg-accent/10"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/70 border border-border/80 text-xs text-muted-foreground"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Aggiornato con prezzari ISTAT 2025 e listini regionali
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 text-balance text-[44px] sm:text-[68px] md:text-[84px] leading-[0.95] font-bold tracking-tight"
        >
          Analisi Prezzi{" "}
          <span className="font-serif-display italic text-primary inline-block">
            Intelligente
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 mx-auto max-w-2xl text-balance text-base sm:text-lg text-muted-foreground"
        >
          Verifica in pochi secondi se il preventivo dell'artigiano è onesto.
          Dati di mercato regionali, verdetto chiaro e consigli pratici per
          trattare con sicurezza.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            size="lg"
            onClick={onAnalizza}
            className="h-13 px-7 gap-2.5 text-base font-semibold bg-primary hover:bg-primary text-primary-foreground glow-azure rounded-2xl"
          >
            <Search className="w-5 h-5" />
            Analizza un preventivo
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onStima}
            className="h-13 px-7 gap-2.5 text-base font-semibold rounded-2xl border-border/80 bg-card/50 hover-elevate"
          >
            <Calculator className="w-5 h-5" />
            Stima rapida
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Anonimo & gratuito
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span>Nessuna registrazione richiesta</span>
          <span className="hidden sm:inline text-border">·</span>
          <span>20 regioni · 8 macro-categorie</span>
        </motion.div>
      </div>
    </section>
  );
}
