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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider"; // assicurati di avere questo componente shadcn
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fmtEUR } from "@/lib/format";
import type { VerdictResult } from "@/lib/verdict";
import { cn } from "@/lib/utils";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { useState, useMemo, useCallback } from "react";

type Props = {
  mode: "analizza" | "stima";
  jobLabel: string;
  categoryLabel: string;
  regionLabel: string;
  quantity: number;
  unitLabel: string;
  price: number;
  analysis: {
    marketMin: number;
    marketMid: number;
    marketMax: number;
  };
  verdict: VerdictResult | null;
  saved: boolean;
  onSave: () => void;
  onReset: () => void;
  onEdit: () => void;
  // Nuove prop opzionali per funzionalità avanzate
  showBreakdown?: boolean;
  onExportPDF?: () => void;
  sampleCount?: number; // numero di preventivi analizzati
  similarQuotes?: Array<{ region: string; price: number; date: string }>;
};

const VerdictConfig: Record<string, { icon: React.ElementType; color: string; bg: string; tooltip: string }> = {
  Ottimo: { icon: Award, color: "emerald", bg: "emerald", tooltip: "Prezzo inferiore alla media regionale. Ottima opportunità." },
  Equo: { icon: CheckCircle2, color: "emerald", bg: "emerald", tooltip: "Prezzo in linea con il mercato locale." },
  Alto: { icon: TrendingUp, color: "amber", bg: "amber", tooltip: "Prezzo superiore alla media, ma non eccessivo." },
  "Troppo Alto": { icon: AlertTriangle, color: "rose", bg: "rose", tooltip: "Prezzo significativamente sopra la media. Consigliata trattativa." },
  Sospetto: { icon: ShieldQuestion, color: "rose", bg: "rose", tooltip: "Anomalia rilevata. Verificare dettagli." },
};

export default function ResultsView({
  mode,
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
  // Stato per breakdown interattivo
  const [breakdown, setBreakdown] = useState({ materials: 40, labor: 50, other: 10 });
  const [copied, setCopied] = useState(false);

  const diff = price - analysis.marketMid;
  const diffPct = analysis.marketMid > 0 ? Math.round((diff / analysis.marketMid) * 100) : 0;
  const isOverpriced = diff > 0;

  // Calcolo percentile sicuro
  const percentile = useMemo(() => {
    const range = analysis.marketMax - analysis.marketMin;
    if (range === 0) return 50;
    let pos = ((price - analysis.marketMin) / range) * 100;
    pos = Math.min(100, Math.max(0, pos));
    return Math.round(100 - pos); // più alto è il prezzo, più alto il percentile
  }, [price, analysis]);

  // Posizione indicatore sicura
  const indicatorPosition = useMemo(() => {
    const range = analysis.marketMax - analysis.marketMin;
    if (range === 0) return 50;
    let pos = ((price - analysis.marketMin) / range) * 100;
    return Math.min(100, Math.max(0, pos));
  }, [price, analysis]);

  const config = verdict ? VerdictConfig[verdict.verdict] : { icon: BarChart3, color: "slate", bg: "slate", tooltip: "Analisi completata" };
  const VerdictIcon = config.icon;

  // Copione negoziazione intelligente
  const negotiationScript = useMemo(() => {
    if (!verdict) return "";
    const priceFormatted = fmtEUR(price);
    const midFormatted = fmtEUR(analysis.marketMid);
    const minFormatted = fmtEUR(analysis.marketMin);
    if (verdict.verdict === "Troppo Alto") {
      return `Gentile professionista, il suo preventivo di ${priceFormatted} per ${jobLabel} (${quantity} ${unitLabel}) è superiore del ${diffPct}% rispetto alla media della mia zona (${midFormatted}). Può offrirmi un prezzo più in linea, ad esempio ${midFormatted}? Grazie.`;
    } else if (verdict.verdict === "Alto") {
      return `Buongiorno, ho ricevuto il suo preventivo di ${priceFormatted}. Volevo chiederle se è possibile applicare uno sconto del 5-10% visto che la media di zona è ${midFormatted}. Attendo un suo cortese riscontro.`;
    } else if (verdict.verdict === "Equo") {
      return `Il suo preventivo di ${priceFormatted} è in linea con il mercato. Se accetta un pagamento immediato, può offrirmi un piccolo sconto? La ringrazio.`;
    } else {
      return `Buongiorno, ho visto il suo preventivo per ${jobLabel}. Può dettagliarmi meglio i costi? La media nella nostra zona è ${midFormatted}. Resto in attesa.`;
    }
  }, [verdict, price, analysis, diffPct, jobLabel, quantity, unitLabel]);

  const copyNegotiationScript = useCallback(() => {
    navigator.clipboard.writeText(negotiationScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [negotiationScript]);

  // Se non c'è verdetto (es. loading), mostra skeleton base
  if (!verdict) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-64 bg-muted animate-pulse rounded-3xl" />
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto space-y-10 pb-16" aria-live="polite">
        {/* Context Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/80 text-sm font-medium border">
            {categoryLabel} • {regionLabel}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">{jobLabel}</h1>
          <p className="text-muted-foreground text-lg">
            {quantity} {unitLabel} • <span className="font-semibold text-foreground">{fmtEUR(price)}</span>
          </p>
        </div>

        {/* VERDETTO PRINCIPALE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "rounded-3xl border p-10 text-center relative overflow-hidden",
            verdict?.color === "green" && "border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-background",
            verdict?.color === "red" && "border-rose-500/40 bg-gradient-to-b from-rose-950/40 to-background",
            "border-border bg-card"
          )}
        >
          <div className="mx-auto mb-8 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "w-28 h-28 rounded-3xl flex items-center justify-center border-4 cursor-help",
                  `border-${config.color}-500/30 bg-${config.bg}-500/10`
                )}>
                  <VerdictIcon className={cn("w-16 h-16", `text-${config.color}-500`)} />
                </div>
              </TooltipTrigger>
              <TooltipContent>{config.tooltip}</TooltipContent>
            </Tooltip>
          </div>

          <h2 className="text-5xl font-black tracking-tighter mb-4">
            {verdict.verdict}
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {verdict.recommendation}
          </p>

          {/* Percentile e scostamento */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {mode === "analizza" && (
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-background/80 border">
                <span className="text-sm font-medium">SCOSTAMENTO DALLA MEDIA</span>
                <span className={cn(
                  "text-3xl font-bold tabular-nums",
                  isOverpriced ? "text-rose-500" : "text-emerald-500"
                )}>
                  {isOverpriced ? "+" : ""}{diffPct}%
                </span>
              </div>
            )}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/5 border border-primary/20">
              <span className="text-sm font-medium">PERCENTILE</span>
              <span className="text-3xl font-bold tabular-nums text-primary">
                {percentile}°
              </span>
              <span className="text-xs text-muted-foreground">
                (più alto del {percentile}% dei preventivi)
              </span>
            </div>
          </div>
        </motion.div>

        {/* GRAFICO 1 - Comparazione Prezzo con indicatore sicuro */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">Confronto con il Mercato</h3>
            <span className="text-xs text-muted-foreground ml-auto">
              Basato su {sampleCount} preventivi recenti
            </span>
          </div>

          <div className="mt-4 space-y-6">
            <div className="h-4 bg-muted rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
              <motion.div
                initial={false}
                animate={{ left: `${indicatorPosition}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-[5px] border-primary rounded-full shadow-xl flex items-center justify-center"
                style={{ left: `${indicatorPosition}%` }}
              >
                <div className="w-2.5 h-2.5 bg-primary rounded-full" />
              </motion.div>
            </div>
            <div className="flex justify-between text-sm font-medium text-muted-foreground">
              <div>{fmtEUR(analysis.marketMin)}</div>
              <div className="text-primary font-semibold text-base">{fmtEUR(analysis.marketMid)}</div>
              <div>{fmtEUR(analysis.marketMax)}</div>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Il tuo prezzo ({fmtEUR(price)}) si posiziona al {percentile}° percentile.
          </p>
        </Card>

        {/* GRAFICO 2 - Distribuzione */}
        <Card className="p-8">
          <h3 className="text-xl font-semibold mb-8">Distribuzione Prezzi di Mercato</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="text-emerald-500 text-sm font-semibold tracking-widest">MINIMO</div>
              <div className="text-4xl font-bold tabular-nums">{fmtEUR(analysis.marketMin)}</div>
              <div className="h-2.5 bg-emerald-500/30 rounded-full" />
            </div>
            <div className="text-center space-y-3 border-t md:border-t-0 md:border-l md:border-r border-border pt-6 md:pt-0 md:px-6">
              <div className="text-primary text-sm font-semibold tracking-widest">MEDIA REGIONALE</div>
              <div className="text-5xl font-bold text-primary tabular-nums tracking-tighter">
                {fmtEUR(analysis.marketMid)}
              </div>
              <div className="h-2.5 bg-primary rounded-full" />
            </div>
            <div className="text-center space-y-3">
              <div className="text-rose-500 text-sm font-semibold tracking-widest">MASSIMO</div>
              <div className="text-4xl font-bold tabular-nums">{fmtEUR(analysis.marketMax)}</div>
              <div className="h-2.5 bg-rose-500/30 rounded-full" />
            </div>
          </div>
        </Card>

        {/* Breakdown interattivo (opzionale) */}
        {showBreakdown && (
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <SlidersHorizontal className="w-5 h-5" />
              <h3 className="text-xl font-semibold">Simula la composizione del preventivo</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Materiali</span>
                  <span className="font-mono">{breakdown.materials}%</span>
                </div>
                <Slider
                  value={[breakdown.materials]}
                  onValueChange={(val) => setBreakdown(prev => ({ ...prev, materials: val[0], labor: 100 - val[0] - prev.other }))}
                  max={100 - breakdown.other}
                  step={1}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Manodopera</span>
                  <span className="font-mono">{breakdown.labor}%</span>
                </div>
                <Slider
                  value={[breakdown.labor]}
                  onValueChange={(val) => setBreakdown(prev => ({ ...prev, labor: val[0], materials: 100 - val[0] - prev.other }))}
                  max={100 - breakdown.other}
                  step={1}
                />
              </div>
              <div className="p-4 bg-muted/40 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Stima basata sulla tua regione</p>
                <p className="text-lg font-semibold mt-1">
                  Materiali: {fmtEUR(price * breakdown.materials / 100)} • Manodopera: {fmtEUR(price * breakdown.labor / 100)} • Altro: {fmtEUR(price * breakdown.other / 100)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Copione negoziazione */}
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-4">
            <MessageSquare className="w-6 h-6 text-primary mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold">Parla con il professionista</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Usa questo messaggio già pronto per negoziare:
              </p>
              <pre className="mt-3 p-3 bg-background rounded-lg text-sm whitespace-pre-wrap border">
                {negotiationScript}
              </pre>
              <Button size="sm" variant="outline" className="mt-3 gap-2" onClick={copyNegotiationScript}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiato!" : "Copia messaggio"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Preventivi simili salvati (opzionale) */}
        {similarQuotes.length > 0 && (
          <Card className="p-6">
            <h4 className="font-semibold mb-3">I tuoi preventivi passati simili</h4>
            <div className="space-y-2">
              {similarQuotes.map((q, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b pb-2">
                  <span>📍 {q.region}</span>
                  <span className="font-mono">{fmtEUR(q.price)}</span>
                  <span className="text-muted-foreground">{q.date}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Consigli Operativi */}
        <Card className="p-8 border-amber-500/20 bg-amber-950/30">
          <div className="flex items-start gap-4">
            <Lightbulb className="w-8 h-8 text-amber-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-xl mb-3">Cosa ti consigliamo di fare</h3>
              <p className="text-lg leading-relaxed text-foreground/90">
                {verdict.recommendation}
              </p>
            </div>
          </div>
        </Card>

        {/* Azioni Principali */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          {!saved && (
            <Button onClick={onSave} size="lg" className="flex-1 h-14 text-base font-medium">
              <Save className="mr-3 w-5 h-5" />
              Salva nell’Archivio
            </Button>
          )}
          {onExportPDF && (
            <Button variant="outline" onClick={onExportPDF} size="lg" className="h-14 text-base font-medium">
              <Printer className="mr-3 w-5 h-5" />
              Esporta PDF
            </Button>
          )}
          <Button variant="outline" onClick={onEdit} size="lg" className="flex-1 h-14 text-base font-medium">
            <Edit3 className="mr-3 w-5 h-5" />
            Modifica Preventivo
          </Button>
          <Button variant="secondary" onClick={onReset} size="lg" className="flex-1 h-14 text-base font-medium">
            <RotateCcw className="mr-3 w-5 h-5" />
            Nuovo Preventivo
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <LegalDisclaimer />
      </div>
    </TooltipProvider>
  );
}
