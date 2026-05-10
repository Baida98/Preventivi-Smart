/**
 * AISeasonalCard — Card stagionale nell'analisi risultati
 *
 * Mostra se il mese corrente è ottimale per questo tipo di lavoro,
 * con consiglio su quando aspettare e quanto si potrebbe risparmiare.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, TrendingDown, Clock, Zap, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getSeasonalAdvice, type SeasonalAdvice } from "@/lib/ai/seasonal-advisor";
import { llmKeys } from "@/lib/ai/llm-provider";
import { cn } from "@/lib/utils";

const SEASON_CONFIG = {
  ottima: {
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    label: "Stagione Ottimale",
    icon: "🟢",
  },
  buona: {
    color: "text-sky-400",
    border: "border-sky-500/30",
    bg: "bg-sky-500/10",
    label: "Stagione Buona",
    icon: "🔵",
  },
  media: {
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    label: "Stagione Neutra",
    icon: "🟡",
  },
  sfavorevole: {
    color: "text-rose-400",
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
    label: "Stagione Sfavorevole",
    icon: "🔴",
  },
};

const MONTHS = [
  "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
  "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
];

interface Props {
  categoryId: string;
  jobLabel: string;
  price: number;
}

export default function AISeasonalCard({ categoryId, jobLabel, price }: Props) {
  const [advice, setAdvice] = useState<SeasonalAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [tried, setTried] = useState(false);

  const currentMonth = new Date().getMonth();

  useEffect(() => {
    if (!llmKeys.hasToken() || tried) return;
    setTried(true);
    setLoading(true);
    getSeasonalAdvice(categoryId, jobLabel, price)
      .then(r => { if (r) setAdvice(r); })
      .finally(() => setLoading(false));
  }, [categoryId, jobLabel, price, tried]);

  if (!llmKeys.hasToken()) return null;

  const cfg = advice ? SEASON_CONFIG[advice.season] : null;

  return (
    <Card className={cn("overflow-hidden border", cfg?.border || "border-border/50")}>
      <div className="flex items-center gap-4 p-5">
        <div className={cn(
          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border",
          cfg?.border || "border-border/30",
          cfg?.bg || "bg-muted/30"
        )}>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <CalendarDays className={cn("h-6 w-6", cfg?.color || "text-muted-foreground")} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">Timing d'Acquisto</p>
            {advice && (
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold",
                cfg?.border, cfg?.color
              )}>
                {cfg?.icon} {cfg?.label}
              </span>
            )}
          </div>

          {loading && (
            <p className="mt-1 text-xs text-muted-foreground">
              Analisi stagionale in corso…
            </p>
          )}

          {!loading && !advice && tried && (
            <p className="mt-1 text-xs text-muted-foreground">
              Analisi stagionale non disponibile.
            </p>
          )}

          {advice && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 space-y-2"
            >
              <p className="text-sm text-foreground/80">{advice.shortReason}</p>

              {advice.waitSuggestion && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>{advice.waitSuggestion}</span>
                </div>
              )}

              {advice.savingsPotential && (
                <div className="flex items-start gap-2 text-xs text-emerald-400">
                  <TrendingDown className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>{advice.savingsPotential}</span>
                </div>
              )}

              {advice.urgencyIndicator === "urgente" && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <Zap className="h-3.5 w-3.5" />
                  Conviene procedere ora
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Month mini timeline */}
        <div className="hidden sm:flex flex-col items-center gap-0.5 flex-shrink-0">
          {MONTHS.map((m, i) => (
            <div
              key={m}
              className={cn(
                "h-1 w-6 rounded-full transition-all",
                i === currentMonth
                  ? cn("h-2 w-8", cfg?.color?.replace("text", "bg") || "bg-primary")
                  : "bg-muted/30"
              )}
            />
          ))}
          <span className="mt-1 text-[9px] font-black uppercase tracking-wide text-muted-foreground/50">
            {MONTHS[currentMonth]}
          </span>
        </div>
      </div>
    </Card>
  );
}
