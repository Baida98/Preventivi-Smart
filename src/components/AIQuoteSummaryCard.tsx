/**
 * AIQuoteSummaryCard — Riepilogo esecutivo del preventivo in linguaggio semplice
 *
 * Mostra un sommario AI con headline, pro/contro e azioni concrete.
 * Appare in cima ai risultati come prima card AI visibile.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { generateQuoteSummary, type QuoteSummary } from "@/lib/ai/quote-summary";
import { llmKeys } from "@/lib/ai/llm-provider";
import { cn } from "@/lib/utils";

interface Props {
  verdict: string;
  price: number;
  marketMin: number;
  marketMid: number;
  marketMax: number;
  jobLabel: string;
  categoryId: string;
  regionLabel: string;
}

export default function AIQuoteSummaryCard({
  verdict, price, marketMin, marketMid, marketMax, jobLabel, categoryId, regionLabel,
}: Props) {
  const [summary, setSummary] = useState<QuoteSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [tried, setTried] = useState(false);

  const hasToken = llmKeys.hasToken();

  useEffect(() => {
    if (!hasToken || tried) return;
    setTried(true);
    setLoading(true);
    generateQuoteSummary({ verdict, price, marketMin, marketMid, marketMax, jobLabel, categoryId, regionLabel })
      .then(r => { if (r) setSummary(r); })
      .finally(() => setLoading(false));
  }, [verdict, price, marketMin, marketMid, marketMax, jobLabel, categoryId, regionLabel, hasToken, tried]);

  if (!hasToken) return null;

  return (
    <Card className="overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Sparkles className="h-6 w-6 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">Analisi AI del Preventivo</p>
          {loading && <p className="mt-1 text-xs text-muted-foreground">Elaborazione sommario…</p>}
          {summary && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 space-y-3">
              <p className={cn("text-base font-bold leading-tight")}>{summary.headline}</p>
              <p className="text-xs text-muted-foreground italic">{summary.tldr}</p>
            </motion.div>
          )}
        </div>
      </div>

      {summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-2 gap-4 border-t border-border/30 p-4">
            {summary.pros.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Punti a favore
                </p>
                <ul className="space-y-1">
                  {summary.pros.map((p, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {summary.cons.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-rose-400 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Punti critici
                </p>
                <ul className="space-y-1">
                  {summary.cons.map((c, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {summary.actionItems.length > 0 && (
            <div className="border-t border-border/30 p-4">
              <p className="mb-2 text-xs font-semibold text-primary flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Azioni consigliate
              </p>
              <ol className="space-y-1">
                {summary.actionItems.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-[9px] font-black text-primary">
                      {i + 1}
                    </span>
                    {a}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
}
