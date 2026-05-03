import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import { getModelPerformanceBySegment, generateModelFeedback } from "@/lib/tracking";
import { fmtEUR } from "@/lib/format";

export default function AnalyticsDashboard() {
  const performance = useMemo(() => getModelPerformanceBySegment(), []);

  if (performance.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-background/40 p-8 text-center">
        <Activity className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Nessun dato di tracking disponibile. Completa alcuni preventivi per visualizzare le metriche.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-black">Performance del Modello</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {performance.map((seg, idx) => {
          const feedback = generateModelFeedback(seg.segmento);
          const accuracyPct = Math.round(seg.accuracy * 100);
          const acceptancePct = Math.round(seg.acceptance_rate * 100);
          const errorPct = Math.round(seg.avg_error_pct * 100);

          const statusColor =
            accuracyPct >= 80
              ? "text-emerald-300"
              : accuracyPct >= 60
              ? "text-sky-300"
              : "text-amber-300";

          const statusBg =
            accuracyPct >= 80
              ? "bg-emerald-500/10 border-emerald-500/30"
              : accuracyPct >= 60
              ? "bg-sky-500/10 border-sky-500/30"
              : "bg-amber-500/10 border-amber-500/30";

          return (
            <motion.div
              key={seg.segmento}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl border ${statusBg} p-4 space-y-3`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {seg.segmento}
                  </p>
                  <p className={`text-2xl font-black mt-1 ${statusColor}`}>
                    {accuracyPct}%
                  </p>
                </div>
                {accuracyPct >= 80 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                ) : accuracyPct >= 60 ? (
                  <Target className="w-5 h-5 text-sky-300 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-300 shrink-0" />
                )}
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Accettazione</span>
                  <span className="font-semibold text-foreground">{acceptancePct}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Errore medio</span>
                  <span className="font-semibold text-foreground">{errorPct}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dati</span>
                  <span className="font-semibold text-foreground">{seg.data_points}</span>
                </div>
              </div>

              {feedback && feedback.confidence_level === "high" && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[10px] font-bold text-primary/80 mb-1">Suggerimenti:</p>
                  {feedback.suggested_price_adjustment !== 0 && (
                    <p className="text-[9px] text-muted-foreground">
                      Prezzo: {feedback.suggested_price_adjustment > 0 ? "+" : ""}
                      {Math.round(feedback.suggested_price_adjustment * 100)}%
                    </p>
                  )}
                  {feedback.suggested_range_expansion > 0 && (
                    <p className="text-[9px] text-muted-foreground">
                      Range: +{Math.round(feedback.suggested_range_expansion * 100)}%
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox
          label="Segmenti tracciati"
          value={String(performance.length)}
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <StatBox
          label="Accuracy media"
          value={`${Math.round(
            (performance.reduce((a, p) => a + p.accuracy, 0) / performance.length) * 100
          )}%`}
          icon={<Target className="w-4 h-4" />}
        />
        <StatBox
          label="Accettazione media"
          value={`${Math.round(
            (performance.reduce((a, p) => a + p.acceptance_rate, 0) / performance.length) * 100
          )}%`}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatBox
          label="Errore medio"
          value={`${Math.round(
            (performance.reduce((a, p) => a + p.avg_error_pct, 0) / performance.length) * 100
          )}%`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/30 p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-primary/60">{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="text-lg font-black text-foreground">{value}</p>
    </div>
  );
}
