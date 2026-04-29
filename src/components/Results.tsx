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
  Bookmark,
  CheckCircle2,
  RotateCcw,
  Pencil,
  Award,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldQuestion,
  Lightbulb,
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
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                Verdetto
              </p>
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
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                Stima di mercato
              </p>
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
        <div className="mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 24, right: 8, bottom: 4, left: -10 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(215 20% 75%)", fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: "hsl(222 30% 22%)" }}
                tickLine={false}
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
                        : "hsl(222 30% 30%)"
                    }
                    strokeWidth={d.kind === "you" ? 2 : 1}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(v: number) => fmtEUR(v)}
                  style={{
                    fill: "hsl(210 40% 96%)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6">
        <h4 className="text-sm font-semibold tracking-tight">
          Composizione del costo onesto
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Stima media per {job.label.toLowerCase()} su un valore di{" "}
          {fmtEUR(analysis.marketMid)}.
        </p>
        <div className="mt-5 space-y-4">
          <BreakdownRow
            label="Manodopera"
            value={analysis.manodopera}
            pct={55}
            colorClass="bg-primary"
          />
          <BreakdownRow
            label="Materiali"
            value={analysis.materiali}
            pct={35}
            colorClass="bg-accent"
          />
          <BreakdownRow
            label="Margine impresa"
            value={analysis.margine}
            pct={10}
            colorClass="bg-amber-400"
          />
        </div>
      </div>

      {/* Recommendations */}
      {verdict && (
        <div className="rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/15 ring-1 ring-amber-500/30">
              <Lightbulb className="w-4 h-4 text-amber-300" />
            </span>
            <h4 className="text-sm font-semibold tracking-tight">
              Cosa fare adesso
            </h4>
          </div>
          <ul className="mt-4 space-y-2.5">
            {verdict.recommendations.map((r, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-foreground/90 leading-relaxed"
              >
                <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onEdit}
          className="gap-2"
        >
          <Pencil className="w-4 h-4" /> Modifica dati
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Nuova analisi
        </Button>
        <Button
          onClick={onSave}
          disabled={savedThisRun}
          className="ml-auto gap-2 bg-primary text-primary-foreground glow-azure disabled:opacity-60"
        >
          <Bookmark className="w-4 h-4" />
          {savedThisRun ? "Salvato in archivio" : "Salva preventivo"}
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "text-foreground",
  big = false,
}: {
  label: string;
  value: string;
  accent?: string;
  big?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/50 p-4">
      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1.5 font-bold tabular-nums ${accent} ${
          big ? "text-2xl" : "text-xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  pct,
  colorClass,
}: {
  label: string;
  value: number;
  pct: number;
  colorClass: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">
          <span className="font-semibold">{fmtEUR(value)}</span>
          <span className="text-muted-foreground ml-2 text-xs">{pct}%</span>
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-border/50 overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
