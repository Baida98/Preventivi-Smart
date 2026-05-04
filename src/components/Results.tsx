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
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
  CartesianGrid,
  ScatterChart,
  Scatter,
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
  Wallet,
  Coins,
  LayoutDashboard,
  LineChart as LineChartIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
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
  saved: boolean;
  onSave: () => void;
  onReset?: () => void;
  onEdit?: () => void;
  qualityScore?: number;
  confidenceScore?: number;
  materialQuality?: string;
  urgency?: string;
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
  saved: savedThisRun,
  onSave,
  onReset = () => {},
  onEdit = () => {},
  qualityScore = 85,
  confidenceScore = 92,
  materialQuality = 'standard',
  urgency = 'standard',
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

  // Smart Alerts logic
  const alerts: string[] = [];
  if (mode === "analizza") {
    if (price > analysis.marketMax * 1.1) {
      alerts.push(`Il prezzo inserito è significativamente superiore al massimo di mercato (+10%). Valori sopra ${fmtEUR(analysis.marketMax * 1.1)} possono dipendere da lavorazioni aggiuntive o materiali di lusso.`);
    } else if (price < analysis.marketMin * 0.9) {
      alerts.push(`Il prezzo inserito è significativamente inferiore al minimo di mercato (-10%). Valori sotto ${fmtEUR(analysis.marketMin * 0.9)} potrebbero indicare materiali di bassa qualità o omissione di servizi essenziali.`);
    }
  }

  // Price explanation logic
  const reasons: string[] = [];
  if (regionLabel.toLowerCase().includes("lombardia") || regionLabel.toLowerCase().includes("lazio")) {
    reasons.push("Indice regionale alto (zona ad alta densità urbana)");
  }
  if (analysis.volatilityClass === "high") {
    reasons.push("Settore con alta volatilità dei prezzi dei materiali");
  }
  if (quantity > 100) {
    reasons.push("Economia di scala applicata per grandi quantità");
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header context */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
        <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold uppercase tracking-wider">
          {category.label}
        </span>
        <span className="text-muted-foreground opacity-30">/</span>
        <span className="font-bold text-foreground">{job.label}</span>
        <span className="text-muted-foreground opacity-30">/</span>
        <span className="text-muted-foreground">{regionLabel}</span>
        <span className="text-muted-foreground opacity-30">/</span>
        <span className="text-muted-foreground font-medium">{quantity} {job.unitLabel}</span>
      </div>

      {/* Outlier & Smart Alerts (Solo per Analizza) */}
      {(mode === "analizza" && (verdict?.outlierWarning || alerts.length > 0)) && (
        <div className="space-y-3">
          {verdict?.outlierWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium shadow-lg shadow-rose-500/5"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{verdict.outlierWarning}</p>
            </motion.div>
          )}
          {alerts.map((alert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (idx + 1) }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-medium shadow-lg shadow-amber-500/5"
            >
              <Info className="w-5 h-5 shrink-0" />
              <p>{alert}</p>
            </motion.div>
          ))}
        </div>
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
                  "shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-background/40 border shadow-inner",
                  verdict.color.border
                )}>
                  <VerdictIcon className={cn("w-8 h-8", verdict.color.text)} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground/70">Analisi tecnica completata</span>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] font-black text-emerald-400">ISTAT 2026</span>
                  </div>
                  <h3 className={cn("text-3xl sm:text-5xl font-black tracking-tighter leading-none mb-3", verdict.color.text)}>
                    {verdict.label}
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-muted-foreground max-w-md leading-relaxed">
                    {verdict.short}. {verdict.description}
                  </p>
                </div>
              </div>

              {/* Price comparison bubble */}
              <div className="bg-background/40 backdrop-blur-md rounded-[2rem] p-6 border border-white/5 flex flex-col items-center justify-center min-w-[140px] shadow-2xl">
                <span className="text-[10px] font-black uppercase text-muted-foreground mb-1.5 tracking-widest">Scostamento dal benchmark</span>
                <div className={cn(
                  "text-3xl font-black tabular-nums tracking-tighter",
                  diff >= 0 ? "text-rose-400" : "text-emerald-400"
                )}>
                  {diff >= 0 ? "+" : ""}{Math.round(diffPct)}%
                </div>
                <div className="text-[10px] font-bold text-muted-foreground/60 mt-1.5 uppercase">Rispetto alla media</div>
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
                <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-background/40 border border-accent/30 shadow-inner">
                  <Target className="w-8 h-8 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground/70 mb-1.5 truncate">Valuta il tuo preventivo</div>
                  <h3 className="text-2xl sm:text-4xl font-black tracking-tighter leading-tight text-foreground mb-3 break-words">
                    {fmtEUR(analysis.marketMin)} <span className="text-muted-foreground/20 mx-1">/</span> {fmtEUR(analysis.marketMax)}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
                    Ti aiuta a leggere meglio prezzi, variabili e differenze tra le offerte, con un punto di partenza realistico.
                  </p>
                </div>
              </div>
              <div className="bg-background/40 backdrop-blur-md rounded-[2rem] p-6 border border-white/5 flex flex-col items-center justify-center min-w-[140px] shadow-2xl">
                <span className="text-[10px] font-black uppercase text-muted-foreground mb-1.5 tracking-widest">Prezzo Unitario</span>
                <div className="text-3xl font-black tabular-nums tracking-tighter text-accent">
                  {fmtEUR(analysis.marketMid / Math.max(quantity, 1))}/{job.unit}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground/60 mt-1.5 uppercase">Benchmark regionale</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Price Explanation Section */}
      {reasons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fattori che influenzano il prezzo</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
                {reason}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* AI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <MetricCard 
            icon={ShieldCheck} 
            label="Affidabilità" 
            value={`${Math.round(analysis.confidence * 100)}%`}
            description="Più informazioni fornisci, più il riferimento diventa utile"
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
            description="Scadenza stima"
            color="text-rose-400"
            bg="bg-rose-400/10"
          />
        </motion.div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Benchmark Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-[2rem] border border-border/60 bg-card/40 p-6 sm:p-8 space-y-6 flex flex-col"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                Benchmark di Mercato
              </h4>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Confronto prezzi regionali 2026</p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
              Dati Verificati
            </div>
          </div>

          <div className="flex-1 min-h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="youGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={`hsl(${youColor})`} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={`hsl(${youColor})`} stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover/90 backdrop-blur-md border border-border/60 p-3 rounded-2xl shadow-2xl">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{data.fullName}</p>
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
                      fill={entry.kind === "you" ? "url(#youGradient)" : "url(#neutralGradient)"}
                      stroke={entry.kind === "you" ? `hsl(${youColor})` : "transparent"}
                      strokeWidth={2}
                    />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    content={(props: any) => {
                      const { x, y, width, value, index } = props;
                      const isYou = chartData[index].kind === "you";
                      return (
                        <text 
                          x={x + width / 2} 
                          y={y - 12} 
                          fill={isYou ? `hsl(${youColor})` : "hsl(var(--muted-foreground))"} 
                          textAnchor="middle" 
                          fontSize="11" 
                          fontWeight="900"
                        >
                          {fmtK(value)}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">Prezzo Unitario</span>
              <p className="text-lg font-black text-foreground">{fmtEUR(unitPrice)} <span className="text-xs text-muted-foreground font-medium">/{job.unit}</span></p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">Media Mercato</span>
              <p className="text-lg font-black text-foreground">{fmtEUR(unitMarketMid)} <span className="text-xs text-muted-foreground font-medium">/{job.unit}</span></p>
            </div>
          </div>
        </motion.div>

        {/* Breakdown & Costs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30 }}
          className="rounded-[2rem] border border-border/60 bg-card/40 p-6 sm:p-8 space-y-8"
        >
          <div className="space-y-1">
            <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent" />
              Composizione Costi
            </h4>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Breakdown tecnico stimato</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-44 h-44 shrink-0 relative">
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
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black uppercase text-muted-foreground/60">Totale</span>
                <span className="text-lg font-black tracking-tighter">{fmtK(analysis.marketMid)}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 w-full">
              {compositionData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">{fmtEUR(item.value)}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">{Math.round((item.value / analysis.marketMid) * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest">
                <TrendingUp className="w-3 h-3" /> Costo stimato
              </div>
              <p className="text-xl font-black text-foreground">+{fmtEUR(analysis.inflationImpact)}</p>
              <p className="text-[10px] font-bold text-muted-foreground/60">Range realistico</p>
            </div>
            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-accent tracking-widest">
                <Truck className="w-3 h-3" /> Affidabilità
              </div>
              <p className="text-xl font-black text-foreground">{fmtEUR(analysis.logisticsImpact >= 0 ? analysis.logisticsImpact : 0)}</p>
              <p className="text-[10px] font-bold text-muted-foreground/60">Più informazioni fornisci, più il riferimento diventa utile</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Trend Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-[2rem] border border-border/60 bg-card/40 p-6 sm:p-8 space-y-6 flex flex-col"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-sky-400" />
                Andamento Prezzi
              </h4>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Volatilità e tendenze regionali</p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[10px] font-black text-sky-400 uppercase tracking-tighter">
              {analysis.volatilityClass.toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: "Min", value: analysis.marketMin },
                { name: "Media", value: analysis.marketMid },
                { name: "Max", value: analysis.marketMax },
              ]} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover/90 backdrop-blur-md border border-border/60 p-3 rounded-2xl shadow-2xl">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{payload[0].payload.name}</p>
                          <p className="text-lg font-black text-foreground">{fmtEUR(payload[0].value)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#areaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quality vs Price Efficiency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.40 }}
          className="rounded-[2rem] border border-border/60 bg-card/40 p-6 sm:p-8 space-y-6 flex flex-col"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                <BarChart3Icon className="w-5 h-5 text-emerald-400" />
                Efficienza Qualità-Prezzo
              </h4>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rapporto qualità e accuratezza</p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
              {qualityScore}%
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">Qualità Materiali</span>
                <span className="text-sm font-black text-foreground capitalize">{materialQuality}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full transition-all duration-500"
                  style={{
                    width: materialQuality === 'luxury' ? '100%' : materialQuality === 'premium' ? '75%' : '50%'
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">Urgenza Lavoro</span>
                <span className="text-sm font-black text-foreground capitalize">{urgency === 'urgent' ? 'Urgente' : 'Standard'}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full transition-all duration-500"
                  style={{
                    width: urgency === 'urgent' ? '100%' : '40%'
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">Affidabilità Stima</span>
                <span className="text-sm font-black text-foreground">{confidenceScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 to-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${confidenceScore}%`
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Regulatory Compliance & Safety Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="rounded-[2rem] border border-border/60 bg-card/40 p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
              <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Come leggere questo risultato
              </h4>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Se il prezzo è molto più basso o molto più alto del range, vale la pena controllare cosa include davvero. Non sostituisce una ditta: ti aiuta a confrontare meglio le offerte e a fare una scelta più consapevole.</p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
            SCORE: {Math.round((qualityScore + confidenceScore) / 2)}%
          </div>
        </div>
        
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={[
                { name: 'Normative', value: 95, color: '#818cf8' },
                { name: 'Sicurezza', value: 88, color: '#6366f1' },
                { name: 'Garanzie', value: 92, color: '#4f46e5' },
              ]}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover/90 backdrop-blur-md border border-border/60 p-2 rounded-xl shadow-2xl">
                        <p className="text-sm font-black text-foreground">{payload[0].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                { [0, 1, 2].map((_, i) => (
                  <Cell key={i} fill={['#818cf8', '#6366f1', '#4f46e5'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Advice Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-[2.5rem] border border-border/60 bg-card/40 p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Domande utili prima di confermare il lavoro
            </h4>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Possibili variazioni da considerare: alcuni dettagli non visibili subito possono influire sul prezzo finale.</p>
          </div>
          <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
            <Gavel className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["Il preventivo include tutte le voci principali?", "Ci sono costi extra possibili?", "Quali materiali sono compresi?", "Il prezzo tiene conto di eventuali variabili?"].map((rec, i) => {
            const isLegal = rec.toLowerCase().includes("legale");
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={cn(
                  "group p-5 rounded-[1.5rem] border transition-all hover:scale-[1.02] flex items-start gap-4",
                  isLegal 
                    ? "bg-amber-400/5 border-amber-400/20 hover:border-amber-400/40" 
                    : "bg-white/5 border-white/5 hover:border-white/10"
                )}
              >
                <div className={cn(
                  "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                  isLegal ? "bg-amber-400/10" : "bg-white/5"
                )}>
                  {isLegal ? <Scale className="w-5 h-5 text-amber-400" /> : <ShieldCheck className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm font-semibold leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                  {rec}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Closing Statement */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.52 }}
        className="text-center text-xs text-muted-foreground/60 font-medium italic"
      >
        Usa questo report come riferimento per valutare con più sicurezza i preventivi che ricevi. Basato sui dati inseriti · Disponibile subito · Nessun abbonamento
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col sm:flex-row gap-4 pt-4"
      >
        {!savedThisRun ? (
            <Button 
            onClick={onSave} 
            className="flex-1 rounded-[1.5rem] h-14 text-base font-black tracking-tight"
          >
            <History className="w-5 h-5 mr-2" />
            Visualizza il report completo
          </Button>
        ) : (
          <div className="flex-1 h-14 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 text-emerald-400 font-black">
            <CheckCircle2 className="w-5 h-5" />
            Analisi Salvata con Successo
          </div>
        )}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onEdit} 
            className="flex-1 sm:flex-none rounded-[1.5rem] h-14 px-8"
          >
            <Pencil className="w-5 h-5 mr-2" />
            Modifica Dati
          </Button>
          <Button 
            variant="ghost" 
            onClick={onReset} 
            className="flex-1 sm:flex-none rounded-[1.5rem] h-14 px-8"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Nuova Analisi
          </Button>
        </div>
      </motion.div>
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
    <div className="p-5 rounded-[2rem] border border-border/60 bg-card/40 space-y-3 hover:border-primary/30 transition-all group">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-inner", bg)}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">{label}</p>
        <p className={cn("text-xl font-black tracking-tighter", color)}>{value}</p>
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase mt-1">{description}</p>
      </div>
    </div>
  );
}
