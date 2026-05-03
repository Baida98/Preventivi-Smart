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
  PieChart,
  Pie,
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
  Calendar,
  Truck,
  Zap,
  Activity,
  Target,
  Info,
  ArrowRight,
  Gavel,
  History,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtEUR, fmtPct } from "@/lib/format";
import type { Job, Category, MarketAnalysis } from "@/lib/pricing";
import type { Verdict } from "@/lib/verdict";
import { cn } from "@/lib/utils";

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
  qualityScore?: number;
  confidenceScore?: number;
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
  qualityScore = 85,
  confidenceScore = 92,
}: Props) {
  const VerdictIcon = verdict ? VERDICT_ICON[verdict.key] ?? CheckCircle2 : CheckCircle2;

  const chartData = [
    { name: "Min", fullName: "Minimo Mercato", value: Math.round(analysis.marketMin), kind: "neutral" as const },
    { name: "Media", fullName: "Media Regionale", value: Math.round(analysis.marketMid), kind: "neutral" as const },
    ...(mode === "analizza"
      ? [{ name: "Tuo", fullName: "Prezzo Analizzato", value: Math.round(price), kind: "you" as const }]
      : []),
    { name: "Max", fullName: "Massimo Mercato", value: Math.round(analysis.marketMax), kind: "neutral" as const },
  ];

  const compositionData = [
    { name: "Manodopera", value: analysis.manodopera, color: "hsl(var(--primary))" },
    { name: "Materiali", value: analysis.materiali, color: "hsl(var(--accent))" },
    { name: "Margine", value: analysis.margine, color: "#fbbf24" },
  ];

  const youColor = verdict?.color.chartHsl ?? "200 95% 60%";
  const diff = mode === "analizza" ? price - analysis.marketMid : 0;
  const diffPct = mode === "analizza" ? (diff / analysis.marketMid) * 100 : 0;
  const unitPrice = price / Math.max(quantity, 1);
  const unitMarketMid = analysis.marketMid / Math.max(quantity, 1);

  return (
    <div className="space-y-6 pb-8">
      {/* Header context */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
        <span className="px-2.5 py-1 rounded-full bg-primary/10 ring-1 ring-primary/25 text-primary font-bold uppercase tracking-wider">
          {category.label}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className="font-bold text-foreground">{job.label}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{regionLabel}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground font-medium">{quantity} {job.unitLabel}</span>
      </div>

      {/* Outlier Warning (Solo per Analizza) */}
      {mode === "analizza" && verdict?.outlierWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium shadow-lg shadow-rose-500/5"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{verdict.outlierWarning}</p>
        </motion.div>
      )}

      {/* Main Verdict/Range Card */}
      <div className="grid grid-cols-1 gap-4">
        {mode === "analizza" && verdict ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "relative overflow-hidden rounded-[2.5rem] border p-6 sm:p-8 grain",
              verdict.color.border,
              verdict.color.bg,
              verdict.color.glow
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className={cn(
                  "shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-background/40 ring-1 shadow-inner",
                  verdict.color.border
                )}>
                  <VerdictIcon className={cn("w-7 h-7", verdict.color.text)} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70">Analisi tecnica completata</span>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] font-bold text-emerald-400">ISTAT 2026</span>
                  </div>
                  <h3 className={cn("text-3xl sm:text-4xl font-black tracking-tighter leading-none", verdict.color.text)}>
                    {verdict.label}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base font-medium text-muted-foreground max-w-md">
                    {verdict.short}. {verdict.description}
                  </p>
                </div>
              </div>

              {/* Price comparison bubble */}
              <div className="bg-background/40 backdrop-blur-md rounded-3xl p-4 ring-1 ring-white/5 flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Scostamento</span>
                <div className={cn(
                  "text-2xl font-black tabular-nums tracking-tighter",
                  diff >= 0 ? "text-rose-400" : "text-emerald-400"
                )}>
                  {diff >= 0 ? "+" : ""}{Math.round(diffPct)}%
                </div>
                <div className="text-[10px] font-medium text-muted-foreground mt-1">Vs benchmark regionale</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-accent/30 bg-accent/5 glow-azure p-6 sm:p-8 grain"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-background/40 ring-1 ring-accent/30 shadow-inner">
                  <Target className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70 mb-1">Intervallo di mercato stimato</div>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none text-foreground">
                    {fmtEUR(analysis.marketMin)} <span className="text-muted-foreground/30 mx-1">/</span> {fmtEUR(analysis.marketMax)}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base font-medium text-muted-foreground max-w-md">
                    Prezzo medio calcolato: <span className="text-accent font-bold">{fmtEUR(analysis.marketMid)}</span>. Fascia basata su indici di costo aggiornati al 2026.
                  </p>
                </div>
              </div>
              <div className="bg-background/40 backdrop-blur-md rounded-3xl p-4 ring-1 ring-white/5 flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Prezzo Unitario</span>
                <div className="text-2xl font-black tabular-nums tracking-tighter text-accent">
                  {fmtEUR(analysis.marketMid / Math.max(quantity, 1))}/{job.unit}
                </div>
                <div className="text-[10px] font-medium text-muted-foreground mt-1">Benchmark {regionLabel}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <MetricCard 
            icon={ShieldCheck} 
            label="Affidabilità" 
            value={`${Math.round(analysis.confidence * 100)}%`}
            description="Indice di confidenza"
            color="text-sky-400"
            bg="bg-sky-400/10"
          />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}>
          <MetricCard 
            icon={Activity} 
            label="Analisi Dati" 
            value={`${qualityScore}%`}
            description="Accuratezza stima"
            color="text-emerald-400"
            bg="bg-emerald-400/10"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <MetricCard 
            icon={Zap} 
            label="Volatilità" 
            value={analysis.volatilityClass.toUpperCase()}
            description="Dinamica prezzi"
            color="text-amber-400"
            bg="bg-amber-400/10"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}>
          <MetricCard 
            icon={Calendar} 
            label="Validità" 
            value={analysis.expiryDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}
            description="Aggiornamento dati"
            color="text-violet-400"
            bg="bg-violet-400/10"
          />
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Benchmark Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 rounded-[2rem] border border-border/60 bg-card/40 p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-black tracking-tight">Benchmark di Mercato</h4>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Posizionamento rispetto ai valori regionali</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
              <History className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">ISTAT 2026</span>
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 700 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-2xl border border-white/10 bg-background/90 backdrop-blur-xl p-3 shadow-2xl">
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{data.fullName}</p>
                          <p className="text-lg font-black text-foreground">{fmtEUR(data.value)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.kind === "you" ? `hsl(${youColor})` : "rgba(255,255,255,0.08)"}
                      className={entry.kind === "you" ? "animate-pulse-glow" : ""}
                    />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    formatter={(v: number) => `€${fmtK(v)}`}
                    style={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 900 }}
                    offset={10}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cost Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 rounded-[2rem] border border-border/60 bg-card/40 p-6 sm:p-8 flex flex-col"
        >
          <div className="mb-6">
            <h4 className="text-lg font-black tracking-tight">Scomposizione Costi</h4>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Ripartizione stimata delle voci di spesa</p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[180px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compositionData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-white/10 bg-background/90 backdrop-blur-md p-2 shadow-xl">
                            <p className="text-[10px] font-black text-foreground">{payload[0].name}: {fmtEUR(Number(payload[0].value))}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {compositionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-foreground">{fmtPct(item.value / analysis.marketMid)}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">({fmtEUR(item.value)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Market Drivers Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-[2rem] border border-border/60 bg-card/40 p-6 flex items-center gap-5 card-hover-glow"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Impatto Inflazione 2026</p>
            <p className="text-sm font-black text-foreground mt-0.5">+{fmtEUR(analysis.inflationImpact)} sul totale</p>
            <p className="text-[11px] text-muted-foreground font-medium">Basato su indici PricePedia e volatilità di settore</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-[2rem] border border-border/60 bg-card/40 p-6 flex items-center gap-5 card-hover-glow"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-400/10 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Coefficiente Logistico</p>
            <p className="text-sm font-black text-foreground mt-0.5">Indice Regionale: {regionLabel}</p>
            <p className="text-[11px] text-muted-foreground font-medium">Include costi di trasporto e trasferta regionali</p>
          </div>
        </motion.div>
      </div>

      {/* Recommendations & Warranties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strategia Consigliata */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-[2rem] border border-primary/20 bg-primary/5 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <h4 className="text-lg font-black tracking-tight">Strategia Consigliata</h4>
          </div>
          <div className="space-y-4">
            {verdict?.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <p className="text-sm font-medium text-foreground/90 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tutele Legali */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Gavel className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-lg font-black tracking-tight">Tutele Legali e Normative</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-bold text-foreground">Conformità Obbligatoria</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Verifica sempre che il preventivo includa la dichiarazione di conformità (DM 37/08) ove previsto.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Scale className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-bold text-foreground">Garanzia di Legge</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Tutti i lavori sono coperti da garanzia biennale per difetti di conformità (Art. 1667 C.C.).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-bold text-foreground">Verifica DURC</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Richiedi il Documento Unico di Regolarità Contributiva per tutelarti da responsabilità solidali.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-base font-black uppercase tracking-tight"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Nuova Analisi
        </Button>
        <Button
          onClick={onEdit}
          variant="outline"
          className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-base font-black uppercase tracking-tight"
        >
          <Pencil className="w-5 h-5 mr-2" />
          Modifica Dati
        </Button>
        {!savedThisRun && (
          <Button
            onClick={onSave}
            className="flex-[1.5] h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 text-base font-black uppercase tracking-tight shadow-xl shadow-primary/20"
          >
            <ShieldCheck className="w-5 h-5 mr-2" />
            Salva nell'Archivio
          </Button>
        )}
      </div>
    </div>
  );
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  description, 
  color, 
  bg 
}: { 
  icon: any, 
  label: string, 
  value: string, 
  description: string,
  color: string,
  bg: string
}) {
  return (
    <div className="h-full rounded-2xl border border-border/60 bg-card/40 p-4 card-hover-glow flex flex-col justify-between">
      <div>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", bg)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">{label}</p>
        <p className={cn("text-xl font-black tabular-nums tracking-tighter mt-0.5", color)}>{value}</p>
      </div>
      <p className="text-[10px] font-medium text-muted-foreground mt-2 leading-tight">{description}</p>
    </div>
  );
}
