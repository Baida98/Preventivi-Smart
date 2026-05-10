/**
 * AIVendorScore — Punteggio qualità del fornitore/documento
 *
 * Analizza il testo estratto dal PDF e valuta la qualità
 * professionale del preventivo (0-100 su 4 dimensioni).
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ShieldCheck, AlertOctagon, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { scoreVendor, type VendorScore } from "@/lib/ai/vendor-scorer";
import { llmKeys } from "@/lib/ai/llm-provider";
import { cn } from "@/lib/utils";

const VERDICT_CONFIG = {
  eccellente: { color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: "⭐" },
  buono:      { color: "text-sky-400",     border: "border-sky-500/30",     bg: "bg-sky-500/10",     icon: "✅" },
  sufficiente:{ color: "text-amber-400",   border: "border-amber-500/30",   bg: "bg-amber-500/10",   icon: "⚠️" },
  scarso:     { color: "text-rose-400",    border: "border-rose-500/30",    bg: "bg-rose-500/10",    icon: "❌" },
};

const CAT_LABELS = {
  professionalism: "Professionalità",
  clarity: "Chiarezza",
  pricing: "Trasparenza Prezzi",
  terms: "Condizioni",
};

interface Props {
  documentText?: string;
  jobLabel: string;
}

export default function AIVendorScore({ documentText, jobLabel }: Props) {
  const [score, setScore] = useState<VendorScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [tried, setTried] = useState(false);

  const hasToken = llmKeys.hasToken();
  const hasDoc = documentText && documentText.length > 50;

  useEffect(() => {
    if (!hasToken || !hasDoc || tried) return;
    setTried(true);
    setLoading(true);
    scoreVendor(documentText!, jobLabel)
      .then(r => { if (r) setScore(r); })
      .finally(() => setLoading(false));
  }, [documentText, jobLabel, hasToken, hasDoc, tried]);

  if (!hasToken || !hasDoc) return null;

  const cfg = score ? VERDICT_CONFIG[score.verdict] : null;

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
            <Star className={cn("h-6 w-6", cfg?.color || "text-muted-foreground")} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">Qualità Preventivo</p>
            {score && (
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold",
                cfg?.border, cfg?.color
              )}>
                {cfg?.icon} {score.verdict.charAt(0).toUpperCase() + score.verdict.slice(1)}
              </span>
            )}
          </div>
          {loading && <p className="mt-1 text-xs text-muted-foreground">Analisi qualità documento…</p>}
          {score && <p className="mt-1 text-xs text-muted-foreground">{score.recommendation}</p>}
        </div>
        {score && (
          <div className="flex-shrink-0 text-right">
            <p className={cn("text-3xl font-black tabular-nums", cfg?.color)}>{score.overall}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">/ 100</p>
          </div>
        )}
      </div>

      {score && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-border/30">
          {/* Dimension bars */}
          <div className="grid grid-cols-2 gap-3 p-4">
            {(Object.entries(score.categories) as [string, number][]).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{CAT_LABELS[key as keyof typeof CAT_LABELS]}</span>
                  <span className="text-xs font-bold tabular-nums">{val}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn("h-full rounded-full", 
                      val >= 80 ? "bg-emerald-500" :
                      val >= 60 ? "bg-sky-500" :
                      val >= 40 ? "bg-amber-500" : "bg-rose-500"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Badges + Red flags */}
          {(score.badges.length > 0 || score.redFlags.length > 0) && (
            <div className="grid grid-cols-2 gap-3 border-t border-border/30 p-4">
              {score.badges.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <ThumbsUp className="h-3 w-3" /> Punti positivi
                  </div>
                  <ul className="space-y-0.5">
                    {score.badges.map((b, i) => (
                      <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                        <ShieldCheck className="h-3 w-3 mt-0.5 flex-shrink-0 text-emerald-500" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {score.redFlags.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-rose-400">
                    <ThumbsDown className="h-3 w-3" /> Da migliorare
                  </div>
                  <ul className="space-y-0.5">
                    {score.redFlags.map((f, i) => (
                      <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                        <AlertOctagon className="h-3 w-3 mt-0.5 flex-shrink-0 text-rose-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
}
