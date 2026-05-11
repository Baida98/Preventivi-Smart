/**
 * AIReport — Pannello per generare e scaricare report AI del preventivo
 *
 * Mostra un bottone "Genera Report AI" nella schermata Results.
 * Quando premuto, chiama generateAIReport() e mostra il risultato.
 * L'utente può copiare il testo o scaricarlo come file .txt
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Brain,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  generateAIReport,
  formatReportAsText,
  type AIReport,
} from "@/lib/ai/report-generator";
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

export default function AIReportPanel({
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
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    if (!llmKeys.hasToken()) {
      onNeedSetup?.();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateAIReport({
        price, categoryId, jobLabel, regionLabel,
        quantity, unitLabel, verdict, marketMin, marketMid, marketMax,
      });
      if (result) {
        setReport(result);
        setExpanded(true);
      } else {
        setError("Impossibile generare il report. Riprova.");
      }
    } catch {
      setError("Errore nella generazione. Riprova tra poco.");
    } finally {
      setLoading(false);
    }
  }, [price, categoryId, jobLabel, regionLabel, quantity, unitLabel, verdict, marketMin, marketMid, marketMax, onNeedSetup]);

  const reportText = report
    ? formatReportAsText(report, { jobLabel, regionLabel, price, verdict })
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-preventivo-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!llmKeys.hasToken()) {
    return null; // AIInsightCard already promotes setup
  }

  return (
    <Card className="border-violet-500/20 overflow-hidden">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
            <FileText className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p className="font-semibold">Report AI Completo</p>
            <p className="text-xs text-muted-foreground">
              Analisi + clausole contrattuali + consigli
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report && (
            <>
              <Button size="sm" variant="ghost" onClick={handleCopy} className="h-8 gap-1.5">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copiato" : "Copia"}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDownload} className="h-8 gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Scarica
              </Button>
              <button onClick={() => setExpanded(v => !v)} className="p-1 text-muted-foreground">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </>
          )}
          {!report && (
            <Button
              size="sm"
              onClick={generate}
              disabled={loading}
              className="gap-2 bg-violet-600 hover:bg-violet-500"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generazione...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Genera Report
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="border-t border-border/30 px-5 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <AnimatePresence initial={false}>
        {report && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="space-y-4 p-5">
              {/* Summary */}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-400">
                  Sintesi Esecutiva
                </p>
                <p className="text-sm leading-relaxed">{report.summary}</p>
              </div>

              {/* Market Analysis */}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Analisi di Mercato
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">{report.marketAnalysis}</p>
              </div>

              {/* Risks */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-amber-400">
                  Valutazione Rischi
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">{report.riskAssessment}</p>
              </div>

              {/* Negotiation */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  Consigli di Trattativa
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">{report.negotiationAdvice}</p>
              </div>

              {/* Contract Clauses */}
              {report.contractClauses.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Clausole Contrattuali Suggerite
                  </p>
                  <ol className="space-y-2">
                    {report.contractClauses.map((clause, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="flex-shrink-0 font-mono text-xs font-bold text-violet-400 mt-0.5">
                          {i + 1}.
                        </span>
                        <span className="text-foreground/80 leading-relaxed">{clause}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Final recommendation */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  Raccomandazione Finale
                </p>
                <p className="text-sm font-medium leading-relaxed">{report.finalRecommendation}</p>
              </div>

              <p className="text-xs text-muted-foreground/50">
                Report generato il {report.generatedAt} • Preventivi Smart AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
