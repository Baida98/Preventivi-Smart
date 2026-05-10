/**
 * AIHistoryChart — Grafico tendenza storico analisi
 *
 * Mostra i verdetti passati per categoria con trend evolutivo AI.
 * Usa recharts per un area chart compatto.
 */

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Minus, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getHistoryForCategory, getSummaryStats } from "@/lib/ai/score-history";
import { cn } from "@/lib/utils";

interface Props {
  categoryId: string;
  currentPctFromMid: number;
}

export default function AIHistoryChart({ categoryId, currentPctFromMid }: Props) {
  const history = useMemo(() => getHistoryForCategory(categoryId), [categoryId]);
  const stats = useMemo(() => getSummaryStats(history), [history]);

  if (history.length < 2) return null; // not enough data

  const chartData = history
    .slice(0, 20)
    .reverse()
    .map((e, i) => ({
      label: `${i + 1}`,
      pct: Math.round(e.pctFromMid),
      verdict: e.verdict,
      date: new Date(e.timestamp).toLocaleDateString("it-IT", { day: "2-digit", month: "short" }),
    }));

  // Add current analysis
  chartData.push({
    label: `${chartData.length + 1}`,
    pct: Math.round(currentPctFromMid),
    verdict: "current",
    date: "Oggi",
  });

  const TrendIcon = stats.trend === "improving" ? TrendingUp :
                    stats.trend === "worsening" ? TrendingDown : Minus;
  const trendColor = stats.trend === "improving" ? "text-emerald-400" :
                     stats.trend === "worsening" ? "text-rose-400" : "text-amber-400";
  const trendLabel = stats.trend === "improving" ? "In miglioramento" :
                     stats.trend === "worsening" ? "Prezzi in aumento" : "Stabile";

  return (
    <Card className="overflow-hidden border border-border/50">
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-border/30 bg-muted/30">
          <History className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">Storico Analisi</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{stats.count} analisi in questa categoria</span>
            {stats.trend && (
              <span className={cn("inline-flex items-center gap-1 text-xs font-medium", trendColor)}>
                <TrendIcon className="h-3 w-3" />
                {trendLabel}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold tabular-nums">
            {stats.avgPctFromMid > 0 ? "+" : ""}{Math.round(stats.avgPctFromMid)}%
          </p>
          <p className="text-[10px] text-muted-foreground">media storica</p>
        </div>
      </div>

      <div className="border-t border-border/30 px-4 pb-4 pt-2">
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
            <defs>
              <linearGradient id="pctGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              formatter={(v: number) => [`${v > 0 ? "+" : ""}${v}%`, "Scostamento mercato"]}
              labelFormatter={(l) => `Data: ${l}`}
            />
            <Area type="monotone" dataKey="pct" stroke="hsl(var(--primary))" fill="url(#pctGrad)" strokeWidth={2} dot={{ r: 2.5, fill: "hsl(var(--primary))" }} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
