import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  Award,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldQuestion,
  Lightbulb,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtEUR } from "@/lib/format";
import type { Job, Category, MarketAnalysis } from "@/lib/pricing";
import type { Verdict } from "@/lib/verdict";

type Props = {
  mode: "analizza" | "stima";
  job: Job;
  category: Category;
  regionLabel: string;
  quantity: number;
  price: number;
  analysis: MarketAnalysis;
  verdict: Verdict | null;
  savedThisRun: boolean;
  onSave: () => void;
  onReset: () => void;
  onEdit: () => void;
};

const VERDICT_ICON: Record<string, React.ElementType> = {
  ottimo: Award,
  equo: CheckCircle2,
  alto: TrendingUp,
  "troppo-alto": AlertTriangle,
  sospetto: ShieldQuestion,
};

function fmtK(v: number): string {
  if (v >= 1000) {
    const k = v / 1000;
    return (Number.isInteger(k) ? k.toFixed(0) : k.toFixed(1)).replace(".", ",") + "k";
  }
  return String(Math.round(v));
}

export default function ResultsView({
  mode,
  job,
  category,
  regionLabel,
  quantity,
  price,
  analysis,
  verdict,
  savedThisRun,
  onSave,
  onReset,
  onEdit,
}: Props) {
  const VerdictIcon = verdict ? VERDICT_ICON[verdict.key] ?? CheckCircle2 : CheckCircle2;

  const chartData = [
    { name: "Min", fullName: "Min mercato", value: Math.round(analysis.marketMin), kind: "neutral" as const },
    { name: "Media", fullName: "Media mercato", value: Math.round(analysis.marketMid), kind: "neutral" as const },
    ...(mode === "analizza"
      ? [{ name: "Tuo", fullName: "Tuo prezzo", value: Math.round(price), kind: "you" as const }]
      : []),
    { name: "Max", fullName: "Max mercato", value: Math.round(analysis.marketMax), kind: "neutral" as const },
  ];

  const youColor = verdict?.color.chartHsl ?? "200 95% 60%";
  const diff = mode === "analizza" ? price - analysis.marketMid : 0;
  const diffPct = mode === "analizza" ? (diff / analysis.marketMid) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Header context */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-full bg-primary/10 ring-1 ring-primary/25 text-primary font-medium">
          {category.label}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="font-semibold">{job.label}</span>
        <span className="text-muted-foreground">·</span>
        <span>{regionLabel}</span>
        <span className="text-muted-foreground">·</span>
        <span>{quantity} {job.unitLabel}</span>
      </div>

      {/* Outlier Warning */}
      {verdict?.outlierWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{verdict.outlierWarning}</p>
        </motion.div>
      )}

      {/* Verdict card */}
      {mode === "analizza" && verdict ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`relative overflow-hidden rounded-3xl border ${verdict.color.border} ${verdict.color.bg} ${verdict.color.glow} p-5 sm:p-7 grain`}
        >
          <div className="flex items-start gap-4">
            <span className={`shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-background/40 ring-1 ${verdict.color.border}`}>
              <VerdictIcon className={`w-5 h-5 ${verdict.color.text}`} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                  Analisi
                </p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/30 ring-1 ring-white/10 text-[10px] font-bold text-muted-foreground">
                  <ShieldCheck className="w-3 h-3" />
                  CONFIDENZA {Math.round(verdict.confidence * 100)}%
                </div>
              </div>
              <h3 className={`mt-1 text-2xl sm:text-3xl font-bold tracking-tight ${verdict.color.text}`}>
                {verdict.label}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{verdict.short}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed">{verdict.description}</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-accent/40 bg-accent/10 glow-emerald p-5 sm:p-7 grain"
        >
          <div className="flex items-start gap-4">
            <span className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-background/40 ring-1 ring-accent/40">
              <Award className="w-5 h-5 text-accent" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                  Stima di mercato
                </p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/30 ring-1 ring-white/10 text-[10px] font-bold text-muted-foreground">
                  <ShieldCheck className="w-3 h-3" />
                  CONFIDENZA {Math.round(analysis.confidence * 100)}%
                </div>
              </div>
              <h3 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
                <span className="text-accent">{fmtEUR(analysis.marketMin)}</span>
                <span className="text-muted-foreground mx-2 font-normal">→</span>
                <span className="text-accent">{fmtEUR(analysis.marketMax)}</span>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Valore medio:{" "}
                <span className="font-semibold text-foreground">{fmtEUR(analysis.marketMid)}</span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            Fascia di mercato in <span className="font-semibold">{regionLabel}</span> per{" "}
            <span className="font-semibold">{job.label.toLowerCase()}</span> secondo i prezzari ISTAT 2025.
          </p>
        </motion.div>
      )}

      {/* Stats grid */}
      {mode === "analizza" ? (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Tuo prezzo" value={fmtEUR(price)} accent="text-foreground" />
          <StatCard label="Media mercato" value={fmtEUR(analysis.marketMid)} accent="text-primary" />
          <StatCard label="Minimo mercato" value={fmtEUR(analysis.marketMin)} accent="text-emerald-300" />
          <StatCard label="Massimo mercato" value={fmtEUR(analysis.marketMax)} accent="text-amber-300" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card/50 grid grid-cols-1 sm:grid-cols-3 overflow-hidden [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:sm:border-b-0 [&>*:not(:last-child)]:sm:border-r [&>*:not(:last-child)]:border-border/40">
          <MiniStat label="Minimo mercato" value={fmtEUR(analysis.marketMin)} accent="text-emerald-300" />
          <MiniStat label="Media mercato" value={fmtEUR(analysis.marketMid)} accent="text-primary" highlight />
          <MiniStat label="Massimo mercato" value={fmtEUR(analysis.marketMax)} accent="text-amber-300" />
        </div>
      )}

      {/* Diff + unit price — only analizza */}
      {mode === "analizza" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/70 bg-card/50 p-4 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                Vs media
              </p>
              {diff >= 0
                ? <TrendingUp className="w-3.5 h-3.5 text-rose-300" />
                : <TrendingDown className="w-3.5 h-3.5 text-emerald-300" />}
            </div>
            <p className={`text-base font-bold tabular-nums truncate ${diff >= 0 ? "text-rose-300" : "text-emerald-300"}`}>
              {diff >= 0 ? "+" : "−"}{fmtEUR(Math.abs(diff))}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {diff >= 0 ? "+" : "−"}{Math.abs(diffPct).toFixed(1).replace(".", ",")}%
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/50 p-4 min-w-0 overflow-hidden">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
              Prezzo unitario
            </p>
            <p className="text-base font-bold tabular-nums truncate">
              {fmtEUR(analysis.pricePerUnit)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">per {job.unit}</p>
          </div>
        </div>
      )}

      {/* ── CHART ── */}
      <div className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold">Confronto col mercato</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {mode === "analizza"
            ? "Barra colorata = tuo prezzo · barre grigie = fascia di mercato"
            : "Fascia di prezzo media per la tua regione"}
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-3 h-3 rounded-sm bg-[hsl(215_25%_35%)] inline-block" />
            Fascia mercato
          </div>
          {mode === "analizza" && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ backgroundColor: `hsl(${youColor})` }}
              />
              Tuo prezzo
            </div>
          )}
        </div>

        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 35, left: -25, bottom: 5 }}
              barGap={0}
            >
              <XAxis type="number" hide domain={[0, 'dataMax + 100']} />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={false}
                width={0}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border bg-popover p-2.5 shadow-xl">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                          {d.fullName}
                        </p>
                        <p className="text-sm font-bold">{fmtEUR(d.value)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.kind === "you" ? `hsl(${youColor})` : "hsl(215 25% 35%)"}
                    fillOpacity={entry.kind === "you" ? 1 : 0.6}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: number) => `€${fmtK(v)}`}
                  style={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: "11px",
                    fontWeight: 600,
                    fontFamily: "var(--app-font-sans)",
                  }}
                  offset={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Consigli pratici</h4>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {(verdict?.recommendations ?? [
            "Verifica sempre i materiali e le certificazioni.",
            "Chiedi un secondo preventivo per confronto.",
            "Definisci i tempi di consegna nel contratto.",
            "Controlla il DURC del professionista."
          ]).map((r, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5 rounded-2xl border border-border/50 bg-card/30"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {r}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex flex-col gap-3">
        {!savedThisRun && (
          <Button
            onClick={onSave}
            className="w-full h-12 rounded-2xl font-bold bg-primary hover:bg-primary text-primary-foreground glow-azure"
          >
            <ShieldCheck className="w-4 h-4 mr-2" /> Salva in archivio
          </Button>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onEdit}
            className="h-12 rounded-2xl font-semibold border-border/80 bg-card/50"
          >
            <Pencil className="w-4 h-4 mr-2" /> Modifica dati
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="h-12 rounded-2xl font-semibold border-border/80 bg-card/50"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Nuovo calcolo
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/50 p-4 min-w-0 overflow-hidden">
      <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
        {label}
      </p>
      <p className={`text-lg sm:text-xl font-bold tabular-nums truncate ${accent}`}>
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value, accent, highlight }: { label: string; value: string; accent: string; highlight?: boolean }) {
  return (
    <div className={`p-4 flex flex-col items-center text-center ${highlight ? 'bg-primary/5' : ''}`}>
      <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1">
        {label}
      </p>
      <p className={`text-base font-bold tabular-nums ${accent}`}>
        {value}
      </p>
    </div>
  );
}
