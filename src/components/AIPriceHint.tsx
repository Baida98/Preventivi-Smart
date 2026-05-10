/**
 * AIPriceHint — Validazione AI del prezzo in tempo reale
 *
 * Mostrato in Wizard step 3 sotto il campo prezzo.
 * Con debounce di 1.5s chiama validatePriceWithAI e mostra feedback.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, AlertTriangle, CheckCircle2, TrendingDown, Loader2 } from "lucide-react";
import { validatePriceWithAI, type PriceValidationResult } from "@/lib/ai/price-validator";
import { llmKeys } from "@/lib/ai/llm-provider";
import { cn } from "@/lib/utils";

interface Props {
  price: number;
  jobLabel: string;
  regionLabel: string;
  quantity: number;
  unitLabel: string;
}

export default function AIPriceHint({ price, jobLabel, regionLabel, quantity, unitLabel }: Props) {
  const [result, setResult] = useState<PriceValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPrice = useRef<number>(0);

  useEffect(() => {
    if (!llmKeys.hasToken() || price <= 0 || price === lastPrice.current) return;
    if (!jobLabel || !regionLabel) return;

    // Debounce 1500ms
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      lastPrice.current = price;
      setLoading(true);
      try {
        const r = await validatePriceWithAI(price, jobLabel, regionLabel, quantity, unitLabel);
        setResult(r);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }, 1500);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [price, jobLabel, regionLabel, quantity, unitLabel]);

  if (!llmKeys.hasToken() || price <= 0) return null;

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loading"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>AI verifica il prezzo…</span>
        </motion.div>
      )}

      {!loading && result && (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            "flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm",
            result.suspiciouslyLow
              ? "border-rose-500/30 bg-rose-500/5 text-rose-300"
              : result.plausible
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/5 text-amber-300"
          )}
        >
          {result.suspiciouslyLow ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          ) : result.plausible ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          ) : (
            <TrendingDown className="mt-0.5 h-4 w-4 flex-shrink-0" />
          )}

          <div className="flex-1">
            <span className="font-medium">
              <Brain className="mr-1 inline h-3 w-3" />
              AI:
            </span>{" "}
            {result.feedback}
            {result.suggestedRange && (
              <span className="ml-1 opacity-70">
                (range suggerito: €{result.suggestedRange.min.toLocaleString("it-IT")} –{" "}
                €{result.suggestedRange.max.toLocaleString("it-IT")})
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
