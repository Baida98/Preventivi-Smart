/**
 * AIAlertPanel — Mostra bandiere rosse e trust score del preventivo
 *
 * Si attiva quando è disponibile il testo estratto dal PDF.
 * Usa analyzeAlerts() per scansionare il testo alla ricerca di problemi.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  AlertTriangle,
  Info,
  Loader2,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { analyzeAlerts, type AlertAnalysis, type AlertEntry } from "@/lib/ai/alert-engine";
import { llmKeys } from "@/lib/ai/llm-provider";
import { cn } from "@/lib/utils";

interface Props {
  extractedText?: string;
  price: number;
  autoScan?: boolean;
}

const LEVEL_CONFIG = {
  info: {
    icon: Info,
    color: "text-sky-400",
    border: "border-sky-500/30 bg-sky-500/5",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    border: "border-amber-500/30 bg-amber-500/5",
    label: "Attenzione",
  },
  danger: {
    icon: ShieldAlert,
    color: "text-rose-400",
    border: "border-rose-500/30 bg-rose-500/5",
    label: "Pericolo",
  },
};

function TrustMeter({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-emerald-500" : score >= 45 ? "bg-amber-500" : "bg-rose-500";
  const label =
    score >= 70 ? "Affidabile" : score >= 45 ? "Verificare" : "Rischioso";
  const Icon = score >= 70 ? ShieldCheck : score >= 45 ? ShieldQuestion : ShieldAlert;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <Icon className={cn("h-4 w-4", score >= 70 ? "text-emerald-400" : score >= 45 ? "text-amber-400" : "text-rose-400")} />
        <span>{score}/100</span>
        <span className="text-muted-foreground">· {label}</span>
      </div>
    </div>
  );
}

function AlertItem({ alert }: { alert: AlertEntry }) {
  const cfg = LEVEL_CONFIG[alert.level];
  const Icon = cfg.icon;
  return (
    <div className={cn("rounded-xl border p-3 space-y-1", cfg.border)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 flex-shrink-0", cfg.color)} />
        <p className={cn("text-xs font-bold uppercase tracking-wide", cfg.color)}>{cfg.label}</p>
      </div>
      <p className="text-sm leading-snug text-foreground/90">{alert.message}</p>
      <p className="text-xs text-muted-foreground leading-snug">
        💡 {alert.suggestion}
      </p>
    </div>
  );
}

export default function AIAlertPanel({ extractedText, price, autoScan = false }: Props) {
  const [analysis, setAnalysis] = useState<AlertAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (autoScan && extractedText && llmKeys.hasToken() && !scanned) {
      setScanned(true);
      setLoading(true);
      analyzeAlerts(extractedText, price).then(r => {
        if (r) setAnalysis(r);
      }).finally(() => setLoading(false));
    }
  }, [autoScan, extractedText, price, scanned]);

  if (!llmKeys.hasToken() || !extractedText) return null;

  const dangerCount = analysis?.alerts.filter(a => a.level === "danger").length ?? 0;
  const warningCount = analysis?.alerts.filter(a => a.level === "warning").length ?? 0;

  return (
    <Card className={cn(
      "border overflow-hidden",
      dangerCount > 0 ? "border-rose-500/30" : warningCount > 0 ? "border-amber-500/30" : "border-border/50"
    )}>
      <button
        onClick={() => {
          if (!scanned) {
            setScanned(true);
            setLoading(true);
            analyzeAlerts(extractedText, price).then(r => {
              if (r) { setAnalysis(r); setExpanded(true); }
            }).finally(() => setLoading(false));
          } else {
            setExpanded(v => !v);
          }
        }}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            dangerCount > 0 ? "bg-rose-500/10" : warningCount > 0 ? "bg-amber-500/10" : "bg-primary/10"
          )}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : dangerCount > 0 ? (
              <ShieldAlert className="h-5 w-5 text-rose-400" />
            ) : warningCount > 0 ? (
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-semibold">Scansione Contrattuale AI</p>
            <p className="text-xs text-muted-foreground">
              {!scanned
                ? "Analizza il testo del preventivo per bandiere rosse"
                : loading
                ? "Scansione in corso..."
                : analysis
                ? `${analysis.alerts.length} segnalazioni · Trust ${analysis.trustScore}/100`
                : "Nessun problema rilevato"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!scanned && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              <Zap className="mr-1 inline h-3 w-3" />
              Scansiona
            </span>
          )}
          {scanned && !loading && (
            expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && analysis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="space-y-4 p-5">
              <TrustMeter score={analysis.trustScore} />
              {analysis.alerts.length === 0 ? (
                <p className="text-sm text-emerald-400">
                  Nessuna bandiera rossa rilevata nel testo del preventivo.
                </p>
              ) : (
                <div className="space-y-3">
                  {analysis.alerts.map((alert, i) => (
                    <AlertItem key={i} alert={alert} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
