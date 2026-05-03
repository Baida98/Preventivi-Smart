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
    { name: "Min", fullName: "Min mercato", value: Math.round(analysis.marketMin), kind: "neutral" as const },
    { name: "Media", fullName: "Media onesta", value: Math.round(analysis.marketMid), kind: "neutral" as const },
    ...(mode === "analizza"
      ? [{ name: "Tuo", fullName: "Tuo prezzo", value: Math.round(price), kind: "you" as const }]
      : []),
    { name: "Max", fullName: "Max mercato", value: Math.round(analysis.marketMax), kind: "neutral" as const },
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
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70">Analisi AI completata</span>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] font-bold text-emerald-400">LIVE</span>
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
                <div className="text-[10px] font-medium text-muted-foreground mt-1">Vs media locale</div>
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
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70 mb-1">Range di mercato stimato</div>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none text-foreground">
                    {fmtEUR(analysis.marketMin)} <span className="text-muted-foreground/30 mx-1">/</span> {fmtEUR(analysis.marketMax)}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base font-medium text-muted-foreground max-w-md">
                    Prezzo medio suggerito: <span className="text-accent font-bold">{fmtEUR(analysis.marketMid)}</span>. Fascia onesta basata su prezzari aggiornati al 2026.
                  </p>
                </div>
              </div>
              <div className="bg-background/40 backdrop-blur-md rounded-3xl p-4 ring-1 ring-white/5 flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Media Unitiva</span>
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
            description="Precisione prezzari"
            color="text-sky-400"
            bg="bg-sky-400/10"
          />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}>
          <MetricCard 
            icon={Activity} 
            label="Qualità AI" 
            value={`${qualityScore}%`}
            description="Completezza dati"
            color="text-emerald-400"
            bg="bg-emerald-400/10"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <MetricCard 
            icon={Zap} 
            label="Volatilità" 
            value={analysis.volatilityClass.toUpperCase()}
            description="Rischio mercato"
            color="text-amber-400"
            bg="bg-amber-400/10"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}>
          <MetricCard 
            icon={Calendar} 
            label="Validità" 
            value={analysis.expiryDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}
            description="Scadenza stima"
            color="text-indigo-400"
            bg="bg-indigo-400/10"
          />
        </motion.div>
      </div>

      {/* Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Main Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-4 rounded-[2rem] border border-border/60 bg-card/30 p-6 shadow-xl card-hover-glow"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Analisi di Confronto</h4>
              <p className="text-xs text-muted-foreground mt-1">Benchmark locale basato su ISTAT 2026</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
               <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground">UNITARIO: {fmtEUR(unitPrice)}/{job.unit}</span>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)", radius: 12 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{payload[0].payload.fullName}</p>
                          <p className="text-sm font-black text-foreground">{fmtEUR(payload[0].value as number)}</p>
                          <p className="text-[9px] text-muted-foreground mt-1">{(payload[0].value as number / quantity).toFixed(2)} €/{job.unit}</p>
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
                      fill={entry.kind === "you" ? `hsl(${youColor})` : "rgba(255,255,255,0.15)"}
                    />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    content={(props: any) => {
                      const { x, y, width, value } = props;
                      return (
                        <text x={x + width / 2} y={y - 10} fill="white" textAnchor="middle" fontSize="10" fontWeight="900">
                          {fmtK(value)}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cost Structure breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30 }}
          className="lg:col-span-2 rounded-[2rem] border border-border/60 bg-card/30 p-6 shadow-xl flex flex-col card-hover-glow"
        >
          <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 mb-1">Struttura Costi</h4>
          <p className="text-xs text-muted-foreground mb-4">Breakdown tecnico stimato</p>
          
          <div className="flex-1 flex items-center justify-center relative min-h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-[10px] font-bold uppercase text-muted-foreground">Media</span>
               <span className="text-sm font-black tracking-tighter">{fmtK(analysis.marketMid)}</span>
            </div>
          </div>

          <div className="space-y-2.5 mt-4">
            {compositionData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground leading-none">{Math.round((item.value / analysis.expected) * 100)}%</p>
                  <p className="text-[9px] text-muted-foreground/60">{fmtEUR(item.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Deep Insights & Legal Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Market Analysis Context */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl border border-border/40 bg-card/20 p-5 card-hover-glow"
        >
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-bold uppercase tracking-wider">Dinamiche di Mercato</h4>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Inflazione Materiali</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-300">+{fmtEUR(analysis.inflationImpact)}</span>
                <TrendingUp className="w-3.5 h-3.5 text-sky-400/50" />
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Difficoltà Logistica</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300">{analysis.logisticsImpact >= 0 ? "+" : ""}{fmtEUR(analysis.logisticsImpact)}</span>
                <Truck className="w-3.5 h-3.5 text-amber-400/50" />
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Indice Domanda</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300">Alta</span>
                <Activity className="w-3.5 h-3.5 text-emerald-400/50" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Legal Protections - THE "HIDDEN" DATA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.40 }}
          className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-5 card-hover-glow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Gavel className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-300">Tutele Legali</h4>
          </div>
          <div className="space-y-3">
            {verdict?.recommendations.filter(r => r.includes("Garanzia") || r.includes("DURC") || r.includes("Certificazione") || r.includes("Art.")).map((r, i) => (
              <div key={i} className="flex gap-3 items-start p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/10">
                <Scale className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-tight text-indigo-200/90 font-semibold">{r}</p>
              </div>
            ))}
            {(!verdict || verdict.recommendations.length === 0) && (
               <p className="text-[11px] text-muted-foreground italic">Seleziona una categoria per vedere le tutele legali applicabili.</p>
            )}
          </div>
        </motion.div>

        {/* Action Strategy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-3xl border border-primary/20 bg-primary/5 p-5 card-hover-glow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary-foreground/80">Strategia</h4>
          </div>
          <div className="space-y-2.5">
            {(mode === "analizza" ? verdict?.recommendations.filter(r => !r.includes("Garanzia") && !r.includes("Art.")) : [
              "Usa questa stima come base per negoziare con il professionista.",
              "Richiedi sempre un capitolato dettagliato dei materiali.",
              "Verifica la validità dei prezzi per almeno 30 giorni.",
              "Assicurati che il preventivo includa oneri di sicurezza."
            ])?.slice(0, 4).map((r, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-1" />
                <p className="text-[11px] leading-snug text-muted-foreground font-medium">{r}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Action Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onSave}
          disabled={savedThisRun}
          className={cn(
            "flex-1 h-14 gap-3 rounded-[1.25rem] text-base font-black uppercase tracking-tight shadow-2xl transition-all active:scale-95",
            savedThisRun 
              ? "bg-muted text-muted-foreground" 
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
          )}
        >
          {savedThisRun ? <ShieldCheck className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          {savedThisRun ? "Archiviato con Successo" : "Salva nell'Archivio"}
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onEdit}
            className="flex-1 sm:flex-none h-14 px-6 gap-2 rounded-[1.25rem] border-border/60 bg-card/40 font-bold hover:bg-card/60"
          >
            <Pencil className="w-4 h-4" />
            Modifica
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="h-14 w-14 p-0 rounded-[1.25rem] border-border/60 bg-card/40 shrink-0 hover:bg-card/60"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
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
    <div className="rounded-3xl border border-border/50 bg-card/30 p-4 flex flex-col gap-1 shadow-lg h-full">
      <div className="flex items-center gap-2 mb-1">
        <div className={cn("p-1.5 rounded-lg", bg)}>
          <Icon className={cn("w-3.5 h-3.5", color)} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{label}</span>
      </div>
      <div className={cn("text-xl font-black tracking-tighter", color)}>{value}</div>
      <p className="text-[9px] font-medium text-muted-foreground leading-none">{description}</p>
    </div>
  );
}
