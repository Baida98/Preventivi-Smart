/**
 * AIScoreBoard — Dashboard storico analisi con statistiche aggregate
 *
 * Mostra un riepilogo delle ultime analisi salvate per categoria.
 * Si attiva solo se ci sono almeno 2 analisi in memoria.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Minus, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getHistoryForCategory, getSummaryStats } from "@/lib/ai/score-history";
import { cn } from "@/lib/utils";

const VERDICT_LABELS: Record<string, { label: string; color: string }> = {
  ottimo: { label: "Vantaggioso", color: "text-emerald-400" },
  equo: { label: "In Linea", color: "text-sky-400" },
  alto: { label: "Premium", color: "text-amber-400" },
  "troppo-alto": { label: "Fuori Range", color: "text-rose-400" },
  sospetto: { label: "Da Verificare", color: "text-violet-400" },
};

interface Props {
  categoryId: string;
}

export default function AIScoreBoard({ categoryId }: Props) {
  const history = useMemo(() => getHistoryForCategory(categoryId), [categoryId]);
  const stats = useMemo(() => getSummaryStats(history), [history]);

  if (stats.count < 2) return null;

  const TrendIcon = stats.trend === "improving" ? TrendingUp :
                    stats.trend === "worsening" ? TrendingDown : Minus;
  const trendColor = stats.trend === "improving" ? "text-emerald-400" :
                     stats.trend === "worsening" ? "text-rose-400" : "text-amber-400";

  const sortedVerdicts = Object.entries(stats.verdictCounts)
    .sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...sortedVerdicts.map(v => v[1]));

  return (
    <Card className="overflow-hidden border border-border/50">
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-border/30 bg-muted/30">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">Storico Categorie</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stats.count} analisi salvate in questa categoria
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className={cn("flex items-center gap-1 text-sm font-bold", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            {stats.trend === "improving" ? "In Miglioramento" :
             stats.trend === "worsening" ? "In Peggioramento" : "Stabile"}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Media: {stats.avgPctFromMid > 0 ? "+" : ""}{Math.round(stats.avgPctFromMid)}% dal mercato
          </p>
        </div>
      </div>

      <div className="border-t border-border/30 p-4">
        <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Distribuzione Verdetti
        </p>
        <div className="space-y-2">
          {sortedVerdicts.map(([verdict, count]) => {
            const cfg = VERDICT_LABELS[verdict] || { label: verdict, color: "text-muted-foreground" };
            const pct = Math.round((count / stats.count) * 100);
            const barWidth = Math.round((count / maxCount) * 100);
            return (
              <div key={verdict} className="flex items-center gap-3">
                <span className={cn("w-24 text-xs font-medium flex-shrink-0", cfg.color)}>
                  {cfg.label}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={cn("h-full rounded-full", cfg.color.replace("text-", "bg-"))}
                  />
                </div>
                <span className="w-10 text-xs text-right text-muted-foreground flex-shrink-0">
                  {count}×  ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/30 bg-muted/10 p-3 flex items-center gap-2">
        <Award className="h-4 w-4 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground/60">
          Storico locale — resettabile dalle impostazioni
        </p>
      </div>
    </Card>
  );
}
