/**
 * AIPaymentPlan — Piano pagamenti AI con protezione cliente
 *
 * Genera e visualizza un piano rate personalizzato con timeline
 * e consigli pratici per ogni tranche.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Loader2, ChevronDown, ChevronUp, Lock, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generatePaymentSchedule } from "@/lib/ai/payment-schedule";
import { llmKeys } from "@/lib/ai/llm-provider";
import { cn } from "@/lib/utils";

interface Props {
  price: number;
  jobLabel: string;
  categoryId: string;
  onNeedSetup: () => void;
}

const PHASE_COLORS = ["bg-sky-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500"];

export default function AIPaymentPlan({ price, jobLabel, categoryId, onNeedSetup }: Props) {
  const [schedule, setSchedule] = useState<Awaited<ReturnType<typeof generatePaymentSchedule>>>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [generated, setGenerated] = useState(false);
  const hasToken = llmKeys.hasToken();

  const fmtEUR = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  const handleGenerate = async () => {
    if (!hasToken) { onNeedSetup(); return; }
    setLoading(true);
    const s = await generatePaymentSchedule({ price, jobLabel, categoryId });
    if (s) { setSchedule(s); setGenerated(true); setExpanded(true); }
    setLoading(false);
  };

  return (
    <Card className="overflow-hidden border border-sky-500/30">
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10">
          <CreditCard className="h-6 w-6 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">Piano Pagamenti AI</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rate consigliate con protezione cliente integrata
          </p>
        </div>
        <div className="flex items-center gap-2">
          {generated && (
            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          <Button
            size="sm"
            onClick={generated ? () => setExpanded(!expanded) : handleGenerate}
            disabled={loading}
            className={cn("gap-1.5 text-xs", generated ? "border-sky-500/50 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20" : "")}
            variant={generated ? "outline" : "default"}
          >
            {loading ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />Calcolo…</>
            ) : !hasToken ? (
              <><Lock className="h-3.5 w-3.5" />AI richiesto</>
            ) : generated ? (
              "Piano generato ✓"
            ) : (
              <><CreditCard className="h-3.5 w-3.5" />Genera Piano</>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && schedule && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-border/30">
              {/* Timeline bar */}
              <div className="flex h-3 w-full overflow-hidden">
                {schedule.entries.map((e, i) => (
                  <motion.div
                    key={i}
                    initial={{ width: 0 }}
                    animate={{ width: `${e.percentage}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={cn(PHASE_COLORS[i % PHASE_COLORS.length])}
                  />
                ))}
              </div>

              {/* Entries */}
              <div className="divide-y divide-border/20">
                {schedule.entries.map((e, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className={cn("h-3 w-3 flex-shrink-0 rounded-full", PHASE_COLORS[i % PHASE_COLORS.length])} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{e.phase}</p>
                        <span className="text-xs text-muted-foreground">— {e.timing}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{e.tip}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold tabular-nums">{fmtEUR(e.amount)}</p>
                      <p className="text-xs text-muted-foreground">{e.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-border/30 bg-muted/10 p-4 space-y-2">
                {schedule.totalProtection && (
                  <div className="flex items-start gap-1.5 text-xs text-emerald-400">
                    <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    {schedule.totalProtection}
                  </div>
                )}
                {schedule.keyAdvice && (
                  <p className="text-xs text-muted-foreground">{schedule.keyAdvice}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
