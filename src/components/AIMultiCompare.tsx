/**
 * AIMultiCompare — Confronto multiplo di preventivi via AI
 *
 * Componente pannello per Results.tsx — l'utente aggiunge altri preventivi
 * ricevuti per lo stesso lavoro e l'AI li confronta, consigliando il migliore.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Plus,
  Trash2,
  Brain,
  Loader2,
  Trophy,
  AlertTriangle,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compareQuotesWithAI, type QuoteEntry, type MultiQuoteAnalysis } from "@/lib/ai/multi-quote";
import { llmKeys } from "@/lib/ai/llm-provider";
import { fmtEUR } from "@/lib/format";
import { cn } from "@/lib/utils";

const VERDICT_COLORS = {
  ottimo: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  buono: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  accettabile: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  caro: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  sospetto: "text-violet-400 border-violet-500/30 bg-violet-500/10",
};

const VERDICT_LABELS = {
  ottimo: "Ottimo",
  buono: "Buono",
  accettabile: "Accettabile",
  caro: "Caro",
  sospetto: "Sospetto",
};

interface Props {
  currentPrice: number;
  currentLabel?: string;
  jobLabel: string;
  regionLabel: string;
  marketMid: number;
  onNeedSetup?: () => void;
}

export default function AIMultiCompare({
  currentPrice,
  currentLabel = "Preventivo attuale",
  jobLabel,
  regionLabel,
  marketMid,
  onNeedSetup,
}: Props) {
  const [open, setOpen] = useState(false);
  const [quotes, setQuotes] = useState<QuoteEntry[]>([
    { name: currentLabel, price: currentPrice },
    { name: "", price: 0 },
  ]);
  const [analysis, setAnalysis] = useState<MultiQuoteAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!llmKeys.hasToken()) {
    return (
      <Card className="border-dashed p-6 text-center">
        <Scale className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Attiva l'AI gratuita per confrontare più preventivi
        </p>
        <Button size="sm" variant="outline" className="mt-3 gap-2" onClick={onNeedSetup}>
          <Brain className="h-4 w-4" />
          Attiva AI
        </Button>
      </Card>
    );
  }

  const addQuote = () =>
    setQuotes((prev) => [...prev, { name: "", price: 0 }]);

  const removeQuote = (idx: number) => {
    if (quotes.length <= 2) return;
    setQuotes((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuote = (idx: number, field: keyof QuoteEntry, value: string) => {
    setQuotes((prev) =>
      prev.map((q, i) =>
        i === idx
          ? { ...q, [field]: field === "price" ? Number(value) || 0 : value }
          : q
      )
    );
  };

  const canCompare = quotes.filter((q) => q.name && q.price > 0).length >= 2;

  const handleCompare = async () => {
    const validQuotes = quotes.filter((q) => q.name && q.price > 0);
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await compareQuotesWithAI(validQuotes, jobLabel, regionLabel, marketMid);
      if (result) {
        setAnalysis(result);
      } else {
        setError("Impossibile completare il confronto. Riprova.");
      }
    } catch {
      setError("Errore durante il confronto. Riprova tra poco.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Confronta più preventivi</p>
            <p className="text-xs text-muted-foreground">
              Hai ricevuto altri preventivi? L'AI ti dice quale scegliere
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="space-y-4 p-5">
              {/* Input preventivi */}
              {quotes.map((quote, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">
                      {idx === 0 ? "Preventivo corrente" : `Preventivo ${idx + 1}`}
                    </Label>
                    <Input
                      value={quote.name}
                      onChange={(e) => updateQuote(idx, "name", e.target.value)}
                      placeholder="Nome impresa / fornitore"
                      className="h-10"
                      disabled={idx === 0}
                    />
                  </div>
                  <div className="w-36 space-y-1">
                    <Label className="text-xs">Importo (€)</Label>
                    <Input
                      type="number"
                      value={quote.price || ""}
                      onChange={(e) => updateQuote(idx, "price", e.target.value)}
                      placeholder="0"
                      className="h-10"
                      disabled={idx === 0}
                    />
                  </div>
                  {idx > 0 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeQuote(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={addQuote}>
                  <Plus className="h-3.5 w-3.5" />
                  Aggiungi preventivo
                </Button>
                <Button
                  size="sm"
                  disabled={!canCompare || loading}
                  className="ml-auto gap-2 bg-primary/90 hover:bg-primary"
                  onClick={handleCompare}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analisi...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Confronta
                    </>
                  )}
                </Button>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              {/* Risultati */}
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-5"
                >
                  {/* Raccomandazione */}
                  <div className="flex items-start gap-3">
                    <Trophy className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-emerald-300">
                        Consigliato: {analysis.recommended}
                      </p>
                      <p className="mt-1 text-sm text-foreground/80">{analysis.reason}</p>
                    </div>
                  </div>

                  {analysis.warning && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                      <p className="text-sm text-amber-200">{analysis.warning}</p>
                    </div>
                  )}

                  {/* Ranking */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Classifica
                    </p>
                    {analysis.ranking.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/30 p-3"
                      >
                        <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                          {i + 1}
                        </span>
                        <p className="flex-1 text-sm font-medium">{item.name}</p>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-bold",
                            VERDICT_COLORS[item.verdict] || VERDICT_COLORS.accettabile
                          )}
                        >
                          {VERDICT_LABELS[item.verdict] || item.verdict}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tips trattativa */}
                  {analysis.negotiationTips.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Consigli di trattativa
                      </p>
                      <ul className="space-y-1.5">
                        {analysis.negotiationTips.map((tip, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="text-primary">·</span>
                            <span className="text-foreground/80">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
