/**
 * AIBidComparator — Confronto interattivo tra più preventivi
 *
 * L'utente inserisce i prezzi di N preventivi ricevuti.
 * L'AI analizza e classifica, indicando il migliore e le bandiere rosse.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Plus, Trash2, Zap, Loader2, Trophy, AlertTriangle, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compareBids, type BidEntry, type BidComparison } from "@/lib/ai/bid-comparator";
import { llmKeys } from "@/lib/ai/llm-provider";
import { cn } from "@/lib/utils";

interface Props {
  jobLabel: string;
  marketMid: number;
  marketMin: number;
  marketMax: number;
  regionLabel: string;
  currentPrice: number;
  onNeedSetup: () => void;
}

export default function AIBidComparator({
  jobLabel, marketMid, marketMin, marketMax, regionLabel, currentPrice, onNeedSetup,
}: Props) {
  const [bids, setBids] = useState<BidEntry[]>([
    { name: "Preventivo attuale", price: currentPrice },
    { name: "Preventivo B", price: 0 },
  ]);
  const [result, setResult] = useState<BidComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const hasToken = llmKeys.hasToken();

  const updateBid = (idx: number, field: keyof BidEntry, value: string | number) => {
    setBids(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  };
  const addBid = () => {
    if (bids.length >= 5) return;
    setBids(prev => [...prev, { name: `Preventivo ${String.fromCharCode(65 + prev.length)}`, price: 0 }]);
  };
  const removeBid = (idx: number) => {
    if (bids.length <= 2) return;
    setBids(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCompare = async () => {
    if (!hasToken) { onNeedSetup(); return; }
    const validBids = bids.filter(b => b.price > 0 && b.name.trim());
    if (validBids.length < 2) return;
    setLoading(true);
    setResult(null);
    const r = await compareBids({ bids: validBids, jobLabel, marketMid, marketMin, marketMax, regionLabel });
    if (r) { setResult(r); setExpanded(true); }
    setLoading(false);
  };

  const fmtEUR = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  return (
    <Card className="overflow-hidden border border-cyan-500/30">
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
          <Scale className="h-6 w-6 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">Confronto Preventivi AI</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inserisci più preventivi ricevuti — l'AI suggerisce il migliore
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setExpanded(!expanded)} className="text-xs">
          {expanded ? "Riduci" : "Apri"}
        </Button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-border/30 p-4 space-y-3">
              {/* Bid inputs */}
              <div className="space-y-2">
                {bids.map((bid, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      className="flex-1 text-sm h-8"
                      placeholder="Nome fornitore"
                      value={bid.name}
                      onChange={e => updateBid(i, "name", e.target.value)}
                    />
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                      <Input
                        className="pl-6 text-sm h-8"
                        type="number"
                        placeholder="0"
                        value={bid.price || ""}
                        onChange={e => updateBid(i, "price", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    {bids.length > 2 && (
                      <button onClick={() => removeBid(i)} className="text-muted-foreground/50 hover:text-rose-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {bids.length < 5 && (
                  <Button size="sm" variant="ghost" onClick={addBid} className="gap-1.5 text-xs h-7">
                    <Plus className="h-3.5 w-3.5" /> Aggiungi preventivo
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleCompare}
                  disabled={loading}
                  className="ml-auto gap-1.5 text-xs h-7"
                >
                  {loading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" />Analisi…</>
                  ) : !hasToken ? (
                    <><Lock className="h-3.5 w-3.5" />Configura AI</>
                  ) : (
                    <><Zap className="h-3.5 w-3.5" />Confronta con AI</>
                  )}
                </Button>
              </div>

              {/* Result */}
              {result && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2 border-t border-border/30">
                  <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3">
                    <Trophy className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-sm font-bold text-emerald-400">{result.winner}</p>
                      <p className="text-xs text-foreground/70 mt-0.5">{result.winnerReason}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {result.rankings.map((r, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-2 rounded-lg border p-2.5 text-sm",
                        r.flagged ? "border-rose-500/30 bg-rose-500/5" : "border-border/30"
                      )}>
                        <span className="w-5 text-center text-xs font-black text-muted-foreground">{r.rank}</span>
                        <span className="flex-1 font-medium">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.assessment}</span>
                        {r.flagged && <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">{result.recommendation}</p>
                  {result.warningIfAny && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      {result.warningIfAny}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground/40">
                    Range mercato verificato: {fmtEUR(marketMin)} – {fmtEUR(marketMax)}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
