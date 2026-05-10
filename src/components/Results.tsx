"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ShieldQuestion,
  Lightbulb,
  Save,
  RotateCcw,
  Edit3,
  ArrowRight,
  Printer,
  MessageSquare,
  SlidersHorizontal,
  Copy,
  Check,
  type LucideIcon,
} from "lucide-react";

import { useState, useMemo, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { fmtEUR } from "@/lib/format";
import type { Verdict } from "@/lib/verdict";
import type { Category, Job } from "@/lib/pricing";
import { cn } from "@/lib/utils";

import LegalDisclaimer from "@/components/LegalDisclaimer";

type Props = {
  mode: "analizza" | "stima";
  job?: Pick<Job, "label" | "unitLabel">;
  category?: Pick<Category, "label">;
  jobLabel?: string;
  categoryLabel?: string;
  regionLabel: string;
  quantity: number;
  unitLabel?: string;
  price: number;
  analysis: {
    marketMin: number;
    marketMid: number;
    marketMax: number;
  };
  verdict: Verdict | null;
  saved: boolean;
  onSave: () => void;
  onReset: () => void;
  onEdit: () => void;

  showBreakdown?: boolean;
  onExportPDF?: () => void;
  sampleCount?: number;
  similarQuotes?: Array<{
    region: string;
    price: number;
    date: string;
  }>;
};

type VerdictConfigItem = {
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  tooltip: string;
};

const VerdictConfig: Record<string, VerdictConfigItem> = {
  OTTIMO: {
    icon: Award,
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    tooltip:
      "Prezzo inferiore alla media regionale. Ottima opportunità.",
  },

  EQUO: {
    icon: CheckCircle2,
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    tooltip: "Prezzo in linea con il mercato locale.",
  },

  ALTO: {
    icon: TrendingUp,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    tooltip: "Prezzo superiore alla media, ma non eccessivo.",
  },

  "TROPPO-ALTO": {
    icon: AlertTriangle,
    colorClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/30",
    tooltip:
      "Prezzo significativamente sopra la media. Consigliata trattativa.",
  },

  SOSPETTO: {
    icon: ShieldQuestion,
    colorClass: "text-fuchsia-500",
    bgClass: "bg-fuchsia-500/10",
    borderClass: "border-fuchsia-500/30",
    tooltip: "Anomalia rilevata. Verificare dettagli.",
  },
};

const fallbackConfig: VerdictConfigItem = {
  icon: BarChart3,
  colorClass: "text-slate-500",
  bgClass: "bg-slate-500/10",
  borderClass: "border-slate-500/30",
  tooltip: "Analisi completata",
};

export default function ResultsView({
  mode,
  job,
  category,
  jobLabel,
  categoryLabel,
  regionLabel,
  quantity,
  unitLabel,
  price,
  analysis,
  verdict,
  saved,
  onSave,
  onReset,
  onEdit,
  showBreakdown = false,
  onExportPDF,
  sampleCount = 42,
  similarQuotes = [],
}: Props) {
  const [breakdown, setBreakdown] = useState({
    materials: 40,
    labor: 50,
    other: 10,
  });

  const [copied, setCopied] = useState(false);

  const resolvedJobLabel = jobLabel ?? job?.label ?? "Preventivo";
  const resolvedCategoryLabel = categoryLabel ?? category?.label ?? "Categoria";
  const resolvedUnitLabel = unitLabel ?? job?.unitLabel ?? "unità";

  const diff = price - analysis.marketMid;

  const diffPct =
    analysis.marketMid > 0
      ? Math.round((diff / analysis.marketMid) * 100)
      : 0;

  const isOverpriced = diff > 0;

  const percentile = useMemo(() => {
    const range = analysis.marketMax - analysis.marketMin;

    if (range === 0) return 50;

    let pos =
      ((price - analysis.marketMin) / range) * 100;

    pos = Math.min(100, Math.max(0, pos));

    return Math.round(pos);
  }, [price, analysis]);

  const indicatorPosition = useMemo(() => {
    const range = analysis.marketMax - analysis.marketMin;

    if (range === 0) return 50;

    let pos =
      ((price - analysis.marketMin) / range) * 100;

    return Math.min(100, Math.max(0, pos));
  }, [price, analysis]);

  const verdictKey = verdict?.key?.toUpperCase?.();

  const config =
    (verdictKey && VerdictConfig[verdictKey]) ||
    fallbackConfig;

  const VerdictIcon = config.icon;
  const primaryRecommendation = verdict?.recommendations?.[0] ?? verdict?.description ?? "Analisi completata.";

  const negotiationScript = useMemo(() => {
    if (!verdict) return "";

    const priceFormatted = fmtEUR(price);
    const midFormatted = fmtEUR(analysis.marketMid);

    if (verdictKey === "TROPPO-ALTO") {
      return `Gentile professionista, il suo preventivo di ${priceFormatted} per ${resolvedJobLabel} (${quantity} ${resolvedUnitLabel}) risulta superiore rispetto alla media di mercato della mia zona (${midFormatted}). È possibile rivedere il prezzo?`;
    }

    if (verdictKey === "ALTO") {
      return `Buongiorno, ho ricevuto il suo preventivo di ${priceFormatted}. Ho notato che è leggermente sopra la media locale (${midFormatted}). È possibile applicare uno sconto?`;
    }

    if (verdictKey === "EQUO") {
      return `Il preventivo di ${priceFormatted} risulta in linea con il mercato. È previsto uno sconto per pagamento immediato?`;
    }

    return `Buongiorno, può fornirmi maggiori dettagli sul preventivo ricevuto per ${resolvedJobLabel}?`;
  }, [
    verdict,
    verdictKey,
    price,
    analysis.marketMid,
    resolvedJobLabel,
    quantity,
    resolvedUnitLabel,
  ]);

  const copyNegotiationScript = useCallback(() => {
    navigator.clipboard.writeText(negotiationScript);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [negotiationScript]);

  if (!verdict) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-64 rounded-3xl bg-muted animate-pulse" />
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        className="max-w-4xl mx-auto space-y-10 pb-16"
        aria-live="polite"
      >
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/80 px-4 py-1.5 text-sm font-medium">
            {resolvedCategoryLabel} • {regionLabel}
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            {resolvedJobLabel}
          </h1>

          <p className="text-lg text-muted-foreground">
            {quantity} {resolvedUnitLabel} •{" "}
            <span className="font-semibold text-foreground">
              {fmtEUR(price)}
            </span>
          </p>
        </div>

        {/* VERDETTO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border bg-card p-10 text-center"
        >
          <div className="mx-auto mb-8 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex h-28 w-28 cursor-help items-center justify-center rounded-3xl border-4",
                    config.borderClass,
                    config.bgClass
                  )}
                >
                  <VerdictIcon
                    className={cn(
                      "h-16 w-16",
                      config.colorClass
                    )}
                  />
                </div>
              </TooltipTrigger>

              <TooltipContent>
                {config.tooltip}
              </TooltipContent>
            </Tooltip>
          </div>

          <h2 className="mb-4 text-5xl font-black tracking-tighter">
            {verdict.label}
          </h2>

          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground">
            {verdict.description}
          </p>

          {verdict.outlierWarning && (
            <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-100">
              {verdict.outlierWarning}
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {mode === "analizza" && (
              <div className="inline-flex items-center gap-3 rounded-2xl border bg-background/80 px-6 py-3">
                <span className="text-sm font-medium">
                  SCOSTAMENTO DALLA MEDIA
                </span>

                <span
                  className={cn(
                    "text-3xl font-bold tabular-nums",
                    isOverpriced
                      ? "text-rose-500"
                      : "text-emerald-500"
                  )}
                >
                  {isOverpriced ? "+" : ""}
                  {diffPct}%
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-3">
              <span className="text-sm font-medium">
                PERCENTILE
              </span>

              <span className="text-3xl font-bold tabular-nums text-primary">
                {percentile}°
              </span>
            </div>
          </div>
        </motion.div>

        {/* GRAFICO */}
        <Card className="p-8">
          <div className="mb-6 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />

            <h3 className="text-xl font-semibold">
              Benchmark di Mercato
            </h3>

            <span className="ml-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              Dati Verificati
            </span>

            <span className="text-xs text-muted-foreground">
              Basato su {sampleCount} preventivi recenti
            </span>
          </div>

          <div className="space-y-6">
            <div className="relative h-4 overflow-hidden rounded-full bg-muted">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />

              <motion.div
                initial={false}
                animate={{
                  left: `${indicatorPosition}%`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                className="absolute top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-primary bg-white shadow-xl"
                style={{
                  left: `${indicatorPosition}%`,
                }}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              </motion.div>
            </div>

            <div className="flex justify-between text-sm font-medium text-muted-foreground">
              <div>{fmtEUR(analysis.marketMin)}</div>

              <div className="text-base font-semibold text-primary">
                {fmtEUR(analysis.marketMid)}
              </div>

              <div>{fmtEUR(analysis.marketMax)}</div>
            </div>
          </div>
        </Card>

        {/* BREAKDOWN */}
        {showBreakdown && (
          <Card className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5" />

              <h3 className="text-xl font-semibold">
                Simula la composizione del preventivo
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Materiali</span>

                  <span className="font-mono">
                    {breakdown.materials}%
                  </span>
                </div>

                <Slider
                  value={[breakdown.materials]}
                  onValueChange={(val) =>
                    setBreakdown((prev) => ({
                      ...prev,
                      materials: val[0],
                      labor:
                        100 - val[0] - prev.other,
                    }))
                  }
                  max={100 - breakdown.other}
                  step={1}
                />
              </div>
            </div>
          </Card>
        )}

        {/* MESSAGGIO */}
        <Card className="border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <MessageSquare className="mt-1 h-6 w-6 text-primary" />

            <div className="flex-1">
              <h4 className="font-semibold">
                Parla con il professionista
              </h4>

              <pre className="mt-3 whitespace-pre-wrap rounded-lg border bg-background p-3 text-sm">
                {negotiationScript}
              </pre>

              <Button
                size="sm"
                variant="outline"
                className="mt-3 gap-2"
                onClick={copyNegotiationScript}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}

                {copied
                  ? "Copiato!"
                  : "Copia messaggio"}
              </Button>
            </div>
          </div>
        </Card>

        {/* SIMILI */}
        {similarQuotes.length > 0 && (
          <Card className="p-6">
            <h4 className="mb-3 font-semibold">
              Preventivi simili
            </h4>

            <div className="space-y-2">
              {similarQuotes.map((q, idx) => (
                <div
                  key={idx}
                  className="flex justify-between border-b pb-2 text-sm"
                >
                  <span>{q.region}</span>

                  <span className="font-mono">
                    {fmtEUR(q.price)}
                  </span>

                  <span className="text-muted-foreground">
                    {q.date}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CONSIGLI */}
        <Card className="border-amber-500/20 bg-amber-950/30 p-8">
          <div className="flex items-start gap-4">
            <Lightbulb className="mt-1 h-8 w-8 flex-shrink-0 text-amber-500" />

            <div>
              <h3 className="mb-3 text-xl font-semibold">
                Cosa ti consigliamo
              </h3>

              <p className="text-lg leading-relaxed text-foreground/90">
                {primaryRecommendation}
              </p>
            </div>
          </div>
        </Card>

        {/* BUTTONS */}
        <div className="flex flex-col gap-4 pt-6 sm:flex-row">
          {!saved ? (
            <Button
              onClick={onSave}
              size="lg"
              className="h-14 flex-1 text-base font-medium"
            >
              <Save className="mr-3 h-5 w-5" />
              Salva nell’Archivio
            </Button>
          ) : (
            <div className="flex h-14 flex-1 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 text-base font-semibold text-emerald-200">
              <CheckCircle2 className="mr-3 h-5 w-5" />
              Analisi Salvata
            </div>
          )}

          {onExportPDF && (
            <Button
              variant="outline"
              onClick={onExportPDF}
              size="lg"
              className="h-14 text-base font-medium"
            >
              <Printer className="mr-3 h-5 w-5" />
              Esporta PDF
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onEdit}
            size="lg"
            className="h-14 flex-1 text-base font-medium"
          >
            <Edit3 className="mr-3 h-5 w-5" />
            Modifica Dati
          </Button>

          <Button
            variant="secondary"
            onClick={onReset}
            size="lg"
            className="h-14 flex-1 text-base font-medium"
          >
            <RotateCcw className="mr-3 h-5 w-5" />
            Nuovo Preventivo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <LegalDisclaimer />
      </div>
    </TooltipProvider>
  );
}
