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
    { name: "Media", fullName: "Media onesta", value: Math.round(analysis.marketMid), kind: "neutral" as const },
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
                  Verdetto
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
            Fascia onesta in <span className="font-semibold">{regionLabel}</span> per{" "}
            <span className="font-semibold">{job.label.toLowerCase()}</span> secondo i prezzari ISTAT 2025.
          </p>
        </motion.div>
      )}

      {/* Stats grid */}
      {mode === "analizza" ? (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Tuo prezzo" value={fmtEUR(price)} accent="text-foreground" />
          <StatCard label="Media mercato" value={fmtEUR(analysis.marketMid)} accent="text-primary" />
          <StatCard label="Min onesto" value={fmtEUR(analysis.marketMin)} accent="text-emerald-300" />
          <StatCard label="Max onesto" value={fmtEUR(analysis.marketMax)} accent="text-amber-300" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card/50 grid grid-cols-1 sm:grid-cols-3 overflow-hidden [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:sm:border-b-0 [&>*:not(:last-child)]:sm:border-r [&>*:not(:last-child)]:border-border/40">
          <MiniStat label="Min onesto" value={fmtEUR(analysis.marketMin)} accent="text-emerald-300" />
          <MiniStat label="Media mercato" value={fmtEUR(analysis.marketMid)} accent="text-primary" highlight />
          <MiniStat label="Max onesto" value={fmtEUR(analysis.marketMax)} accent="text-amber-300" />
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

      {/* Inflation Impact Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-blue-200/80 text-[11px] leading-relaxed"
      >
        <TrendingUp className="w-4 h-4 shrink-0 text-blue-400" />
        <div>
          <p className="font-semibold text-blue-300 mb-0.5">Aggiornamento Inflazione & Mercato 2026</p>
          <p>
            Il calcolo include un adeguamento di <span className="text-blue-300 font-bold">+{fmtEUR(analysis.inflationImpact)}</span> dovuto all'inflazione ISTAT e alla volatilità del settore <span className="italic">{category.label}</span>. I prezzi sono allineati agli indici di costo correnti.
          </p>
        </div>
      </motion.div>

      {/* ── CHART ── */}
      <div className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold">Confronto col mercato</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {mode === "analizza"
            ? "Barra colorata = tuo prezzo · barre grigie = fascia onesta"
            : "Fascia di prezzo onesta per la tua regione"}
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
                style={{ background: `hsl(${youColor})` }}
              />
              Il tuo prezzo
            </div>
          )}
        </div>

        <div className="h-52 sm:h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 28, right: 8, bottom: 4, left: 4 }}
              barCategoryGap="28%"
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(215 20% 72%)", fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: "hsl(222 30% 20%)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(215 20% 62%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={fmtK}
              />
              <Tooltip
                cursor={{ fill: "hsl(222 40% 13%)", radius: 6 }}
                contentStyle={{
                  background: "hsl(222 47% 9%)",
                  border: "1px solid hsl(222 30% 24%)",
                  borderRadius: 10,
                  fontSize: 13,
                  padding: "8px 14px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
                labelFormatter={(_label, payload) =>
                  payload?.[0]?.payload?.fullName ?? _label
                }
                formatter={(v: number) => [fmtEUR(v), "Prezzo"]}
                labelStyle={{ color: "hsl(215 20% 85%)", fontWeight: 700, marginBottom: 2 }}
                itemStyle={{ color: "hsl(215 20% 75%)" }}
              />
              <Bar dataKey="value" radius={[6, 6, 3, 3]} maxBarSize={72}>
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={fmtK}
                  style={{ fontSize: 11, fontWeight: 700, fill: "hsl(215 20% 80%)" }}
                />
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.kind === "you" ? `hsl(${youColor})` : "hsl(215 25% 35%)"}
                    fillOpacity={d.kind === "you" ? 1 : 0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Composition */}
      <div className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5">
        <h4 className="text-sm font-semibold">Analisi costi stimata</h4>
        <p className="mt-1 text-xs text-muted-foreground mb-5">
          Ripartizione indicativa · categoria {category.label}
        </p>
        <div className="space-y-4">
          <CompositionItem
            label="Manodopera"
            value={fmtEUR(analysis.manodopera)}
            pct={Math.round((analysis.manodopera / analysis.expected) * 100)}
            color="bg-primary"
          />
          <CompositionItem
            label="Materiali & Mezzi"
            value={fmtEUR(analysis.materiali)}
            pct={Math.round((analysis.materiali / analysis.expected) * 100)}
            color="bg-accent"
          />
          <CompositionItem
            label="Margine & Oneri"
            value={fmtEUR(analysis.margine)}
            pct={Math.round((analysis.margine / analysis.expected) * 100)}
            color="bg-amber-400"
          />
        </div>
      </div>

      {/* Recommendations */}
      {verdict && (
        <div className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-primary shrink-0" />
            <h4 className="text-sm font-semibold">Cosa fare ora</h4>
          </div>
          <ul className="space-y-2.5">
            {verdict.recommendations.map((r, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                <span className="text-muted-foreground">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onSave}
          disabled={savedThisRun}
          className="flex-1 h-12 gap-2 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          {savedThisRun ? "Salvato in archivio" : "Salva nell'archivio"}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onEdit}
            className="flex-1 sm:flex-none h-12 px-5 gap-2 rounded-2xl border-border/80 bg-card/50"
          >
            <Pencil className="w-4 h-4" />
            Modifica
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="h-12 w-12 p-0 rounded-2xl border-border/80 bg-card/50 shrink-0"
            title="Nuova analisi"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div className={`px-4 py-3 sm:py-4 ${highlight ? "sm:bg-white/[0.03]" : ""}`}>
      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground leading-none">
        {label}
      </p>
      <p className={`mt-1.5 text-lg font-bold tabular-nums tracking-tight leading-none ${accent}`}>
        {value}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/50 p-3 sm:p-4 min-w-0 overflow-hidden">
      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground leading-none truncate">
        {label}
      </p>
      <p className={`mt-2 text-sm sm:text-base font-bold tabular-nums tracking-tight leading-none truncate ${accent}`}>
        {value}
      </p>
    </div>
  );
}

function CompositionItem({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tabular-nums">{value}</span>
          <span className="text-[11px] font-semibold text-muted-foreground w-8 text-right">{pct}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}
