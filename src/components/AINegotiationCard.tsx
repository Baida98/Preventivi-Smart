/**
 * AINegotiationCard — Tattiche di negoziazione per il preventivo
 *
 * Fornisce 3 tattiche pratiche di negoziazione specifiche per
 * il verdetto, il prezzo e la regione italiana.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Handshake, Target, ChevronRight, Loader2, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getNegotiationAdvice, type NegotiationTip } from "@/lib/ai/negotiation-tips";
import { llmKeys } from "@/lib/ai/llm-provider";
import { cn } from "@/lib/utils";

const DIFFICULTY_CONFIG = {
  facile: { color: "text-emerald-400", label: "Facile" },
  media: { color: "text-amber-400", label: "Media" },
  difficile: { color: "text-rose-400", label: "Difficile" },
};

interface Props {
  verdict: string;
  price: number;
  marketMid: number;
  jobLabel: string;
  categoryId: string;
  regionLabel: string;
  onNeedSetup: () => void;
}

export default function AINegotiationCard({
  verdict, price, marketMid, jobLabel, categoryId, regionLabel, onNeedSetup,
}: Props) {
  const [tips, setTips] = useState<NegotiationTip[]>([]);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [keyPhrase, setKeyPhrase] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasToken = llmKeys.hasToken();
  // Only show for non-optimal verdicts
  const relevant = ["alto", "troppo-alto"].includes(verdict);

  useEffect(() => {
    if (!hasToken || !relevant || loaded) return;
    setLoading(true);
    getNegotiationAdvice({ verdict, price, marketMid, jobLabel, categoryId, regionLabel })
      .then(r => {
        if (r) {
          setTips(r.tips);
          setStrategy(r.overallStrategy);
          setKeyPhrase(r.keyPhrase);
          setLoaded(true);
        }
      })
      .finally(() => setLoading(false));
  }, [verdict, price, marketMid, jobLabel, categoryId, regionLabel, hasToken, relevant, loaded]);

  if (!hasToken || !relevant) return null;

  const copyPhrase = () => {
    if (!keyPhrase) return;
    navigator.clipboard.writeText(keyPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden border border-violet-500/30">
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
          ) : (
            <Handshake className="h-6 w-6 text-violet-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">Tattiche di Negoziazione AI</p>
          {loading && <p className="mt-1 text-xs text-muted-foreground">Elaborazione strategia…</p>}
          {strategy && <p className="mt-1 text-xs text-muted-foreground">{strategy}</p>}
        </div>
      </div>

      {tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border/30 bg-muted/10"
        >
          <div className="divide-y divide-border/20">
            {tips.map((tip, i) => {
              const diff = DIFFICULTY_CONFIG[tip.difficulty] || DIFFICULTY_CONFIG.media;
              return (
                <div key={i} className="flex items-start gap-3 p-4">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-400">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{tip.tactic}</p>
                      <span className={cn("text-xs font-medium", diff.color)}>
                        {diff.label}
                      </span>
                      {tip.savingRange && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400">
                          -{tip.savingRange}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{tip.effect}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                </div>
              );
            })}
          </div>

          {keyPhrase && (
            <div className="border-t border-border/30 p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-400">
                  <Quote className="h-3.5 w-3.5" />
                  Frase chiave da usare col fornitore
                </div>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={copyPhrase}>
                  {copied ? "Copiata! ✓" : "Copia"}
                </Button>
              </div>
              <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
                <p className="text-sm italic text-foreground/90">"{keyPhrase}"</p>
              </div>
            </div>
          )}

          <div className="px-4 pb-3">
            <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Tattiche generate da AI in base al mercato locale. Adatta al tuo stile negoziale.
            </p>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
