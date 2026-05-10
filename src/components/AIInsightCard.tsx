/**
 * AIInsightCard — Analisi AI approfondita del verdetto
 *
 * Mostrato nella schermata Results dopo il verdetto statico.
 * Chiama enhanceVerdictWithAI() e mostra:
 *   - deepAnalysis: paragrafo contestuale
 *   - redFlags: segnali d'allarme (se presenti)
 *   - keyRisks: rischi specifici da valutare
 *   - negotiationTips: consiglio pratico di trattativa
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  enhanceVerdictWithAI,
  type AIVerdictInsight,
} from "@/lib/ai/verdict-enhancer";
import { llmKeys } from "@/lib/ai/llm-provider";
import type { Verdict } from "@/lib/verdict";

interface Props {
  price: number;
  categoryId: string;
  jobLabel: string;
  regionLabel: string;
  quantity: number;
  unitLabel: string;
  verdict: Verdict;
  marketMin: number;
  marketMid: number;
  marketMax: number;
  onNeedSetup?: () => void;
}

export default function AIInsightCard({
  price,
  categoryId,
  jobLabel,
  regionLabel,
  quantity,
  unitLabel,
  verdict,
  marketMin,
  marketMid,
  marketMax,
  onNeedSetup,
}: Props) {
  const [insight, setInsight] = useState<AIVerdictInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [hasToken, setHasToken] = useState(() => llmKeys.hasToken());

  const loadInsight = useCallback(async () => {
    if (!llmKeys.hasToken()) {
      setHasToken(false);
      return;
    }
    setHasToken(true);
    setLoading(true);
    setError(null);
    try {
      const result = await enhanceVerdictWithAI({
        price,
        category: categoryId,
        jobLabel,
        region: regionLabel,
        quantity,
        unitLabel,
        verdict,
        marketMin,
        marketMid,
        marketMax,
      });
      setInsight(result);
    } catch {
      setError("Analisi AI temporaneamente non disponibile.");
    } finally {
      setLoading(false);
    }
  }, [price, categoryId, jobLabel, regionLabel, quantity, unitLabel, verdict, marketMin, marketMid, marketMax]);

  useEffect(() => {
    loadInsight();
  }, [loadInsight]);

  // --- Prompt setup se non c'è token ---
  if (!hasToken) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">Analisi AI Approfondita</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Configura un token HuggingFace gratuito per ottenere analisi
              personalizzata, segnali di rischio e consigli di trattativa
              generati dall'AI.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 gap-2"
              onClick={onNeedSetup}
            >
              <Sparkles className="h-4 w-4" />
              Attiva AI gratuita
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // --- Skeleton loading ---
  if (loading) {
    return (
      <Card className="border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 animate-pulse text-primary" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-3 w-72 animate-pulse rounded bg-muted" />
            <div className="h-3 w-60 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground animate-pulse">
          Analisi AI in corso...
        </p>
      </Card>
    );
  }

  if (error || !insight) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 overflow-hidden">
      <button
        className="flex w-full items-center justify-between p-6"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold">Analisi AI</span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Qwen 72B
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-border/30 px-6 pb-6 pt-4">
              {/* Deep analysis */}
              <p className="text-sm leading-relaxed text-foreground/90">
                {insight.deepAnalysis}
              </p>

              {/* Red flags */}
              {insight.redFlags.length > 0 && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-300">
                    <AlertCircle className="h-4 w-4" />
                    Segnali di attenzione
                  </div>
                  <ul className="space-y-1">
                    {insight.redFlags.map((flag, i) => (
                      <li key={i} className="text-sm text-rose-200/90">
                        • {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key risks */}
              {insight.keyRisks.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Rischi da valutare
                  </p>
                  <ul className="space-y-1">
                    {insight.keyRisks.map((risk, i) => (
                      <li
                        key={i}
                        className="text-sm text-foreground/80"
                      >
                        • {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Negotiation tips */}
              {insight.negotiationTips && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    <TrendingDown className="h-3.5 w-3.5" />
                    Consiglio di trattativa
                  </div>
                  <p className="text-sm leading-relaxed text-emerald-100/90">
                    {insight.negotiationTips}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
