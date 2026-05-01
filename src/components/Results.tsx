import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
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
    { name: "Min mercato", value: analysis.marketMin, kind: "neutral" as const },
    { name: "Media", value: analysis.marketMid, kind: "neutral" as const },
    ...(mode === "analizza"
      ? [{ name: "Tuo prezzo", value: price, kind: "you" as const }]
      : []),
    { name: "Max mercato", value: analysis.marketMax, kind: "neutral" as const },
  ];

  const youColor = verdict?.color.chartHsl ?? "200 95% 60%";
  const diff = mode === "analizza" ? price - analysis.marketMid : 0;
  const diffPct = mode === "analizza" ? (diff / analysis.marketMid) * 100 : 0;

  return (
    <div className="space-y-6">
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
        <span>
          {quantity} {job.unitLabel}
        </span>
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
          className={`relative overflow-hidden rounded-3xl border ${verdict.color.border} ${verdict.color.bg} ${verdict.color.glow} p-6 sm:p-8 grain`}
        >
          <div className="flex items-start gap-4">
            <span
              className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-background/40 ring-1 ${verdict.color.border}`}
            >
              <VerdictIcon className={`w-6 h-6 ${verdict.color.text}`} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                  Verdetto
                </p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/30 ring-1 ring-white/10 text-[10px] font-bold text-muted-foreground">
                  <ShieldCheck className="w-3 h-3" />
                  CONFIDENZA: {Math.round(verdict.confidence * 100)}%
                </div>
              </div>
              <h3 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
                <span className={verdict.color.text}>{verdict.label}</span>
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {verdict.short}.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm sm:text-[15px] leading-relaxed">
            {verdict.description}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-accent/40 bg-accent/10 glow-emerald p-6 sm:p-8 grain"
        >
          <div className="flex items-start gap-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-background/40 ring-1 ring-accent/40">
              <Award className="w-6 h-6 text-accent" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                  Stima di mercato
                </p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/30 ring-1 ring-white/10 text-[10px] font-bold text-muted-foreground">
                  <ShieldCheck className="w-3 h-3" />
                  CONFIDENZA: {Math.round(analysis.confidence * 100)}%
                </div>
              </div>
              <h3 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
                Tra{" "}
                <span className="text-accent">{fmtEUR(analysis.marketMin)}</span>{" "}
                e{" "}
                <span className="text-accent">{fmtEUR(analysis.marketMax)}</span>
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Valore medio onesto:{" "}
                <span className="font-semibold text-foreground">
                  {fmtEUR(analysis.marketMid)}
                </span>
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed">
            Questa è la fascia di prezzo onesta in {regionLabel} per{" "}
            <span className="font-semibold">{job.label.toLowerCase()}</span> in
            base ai dati ISTAT 2025 e ai listini regionali. Usa questi numeri
            per chiedere preventivi senza farti sorprendere.
          </p>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {mode === "analizza" && (
          <StatCard
            label="Tuo prezzo"
            value={fmtEUR(price)}
            accent="text-foreground"
            big
          />
        )}
        <StatCard
          label="Media mercato"
          value={fmtEUR(analysis.marketMid)}
          accent="text-primary"
        />
        <StatCard
          label="Min onesto"
          value={fmtEUR(analysis.marketMin)}
          accent="text-emerald-300"
        />
        <StatCard
          label="Max onesto"
          value={fmtEUR(analysis.marketMax)}
          accent="text-amber-300"
        />
      </div>

      {mode === "analizza" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/70 bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                Differenza con la media
              </p>
              {diff >= 0 ? (
                <TrendingUp className="w-4 h-4 text-rose-300" />
              ) : (
                <TrendingDown className="w-4 h-4 text-emerald-300" />
              )}
            </div>
            <p
              className={`mt-2 text-2xl font-bold tabular-nums ${
                diff >= 0 ? "text-rose-300" : "text-emerald-300"
              }`}
            >
              {diff >= 0 ? "+" : "−"}
              {fmtEUR(Math.abs(diff))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {diff >= 0 ? "+" : "−"}
              {Math.abs(diffPct).toFixed(1).replace(".", ",")}% rispetto al prezzo medio
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/50 p-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              Prezzo unitario stimato
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {fmtEUR(analysis.pricePerUnit)}
              <span className="text-sm text-muted-foreground font-normal ml-1">
                /{job.unit}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Calcolato sulla regione {regionLabel}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6">
        <h4 className="text-sm font-semibold tracking-tight">
          Confronto col mercato
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {mode === "analizza"
            ? "La tua barra colorata, le altre rappresentano la fascia onesta."
            : "Fascia di prezzo onesta calcolata per la tua regione."}
        </p>
        <div className="mt-8 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 48, right: 8, bottom: 8, left: -10 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(215 20% 75%)", fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: "hsl(222 30% 22%)" }}
                tickLine={false}
                dy={12}
              />
              <YAxis
                tick={{ fill: "hsl(215 20% 70%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`
                }
              />
              <Tooltip
                cursor={{ fill: "hsl(222 30% 14%)" }}
                contentStyle={{
                  background: "hsl(222 47% 8%)",
                  border: "1px solid hsl(222 30% 22%)",
                  borderRadius: 12,
                  fontSize: 12,
                  padding: "8px 12px",
                }}
                labelStyle={{
                  color: "hsl(215 20% 80%)",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
                formatter={(v: number) => [fmtEUR(v), "Prezzo"]}
              />
              <Bar
                dataKey="value"
                radius={[8, 8, 4, 4]}
                maxBarSize={64}
              >
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.kind === "you"
                        ? `hsl(${youColor})`
                        : "hsl(222 30% 22%)"
                    }
                    stroke={
                      d.kind === "you"
                        ? `hsl(${youColor})`
                        : "transparent"
                    }
                    strokeWidth={2}
                    fillOpacity={d.kind === "you" ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Composition */}
      <div className="rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6">
        <h4 className="text-sm font-semibold tracking-tight">
          Analisi costi stimata
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Ripartizione indicativa basata sulla categoria {category.label}.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            color="bg-emerald-500"
          />
        </div>
      </div>

      {/* Recommendations */}
      {verdict && (
        <div className="rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold tracking-tight">
              Cosa fare ora
            </h4>
          </div>
          <ul className="space-y-3">
            {verdict.recommendations.map((r, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                <span className="text-muted-foreground">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onSave}
          disabled={savedThisRun}
          className="flex-1 h-12 gap-2 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          {savedThisRun ? "Salvato in archivio" : "Salva nell'archivio"}
        </Button>
        <div className="flex gap-2 flex-1">
          <Button
            variant="outline"
            onClick={onEdit}
            className="flex-1 h-12 gap-2 rounded-2xl border-border/80 bg-card/50"
          >
            <TrendingDown className="w-4 h-4" /> Modifica dati
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="h-12 w-12 p-0 rounded-2xl border-border/80 bg-card/50"
            title="Nuova analisi"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  big,
}: {
  label: string;
  value: string;
  accent: string;
  big?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/50 p-4">
      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1.5 font-bold tabular-nums tracking-tight ${
          big ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
        } ${accent}`}
      >
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
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-bold">{pct}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-full ${color}`}
        />
      </div>
      <p className="text-xs font-semibold tabular-nums">{value}</p>
    </div>
  );
}
