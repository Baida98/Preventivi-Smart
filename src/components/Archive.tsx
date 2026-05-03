import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Inbox, FileText, FileDown, BarChart3, TrendingDown, ShieldCheck, AlertTriangle, Star, User } from "lucide-react";
import { fmtEUR, fmtDate } from "@/lib/format";
import type { SavedQuote } from "@/lib/storage";
import { PDFGenerator } from "@/lib/pdf-generator";

const VERDICT_BADGE: Record<string, string> = {
  ottimo: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  equo: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  alto: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "troppo-alto": "bg-rose-500/15 text-rose-300 border-rose-500/30",
  sospetto: "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

const VERDICT_LABEL: Record<string, string> = {
  ottimo: "Ottimo",
  equo: "Equo",
  alto: "Alto",
  "troppo-alto": "Troppo Alto",
  sospetto: "Sospetto",
};

const FILTER_OPTIONS = ["tutti", "ottimo", "equo", "alto", "troppo-alto", "sospetto", "stima"] as const;
type Filter = (typeof FILTER_OPTIONS)[number];

type Props = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  quotes: SavedQuote[];
  onDelete: (id: string) => void;
};

export default function Archive({ open, onOpenChange, quotes, onDelete }: Props) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("tutti");

  const stats = useMemo(() => {
    const analyzed = quotes.filter((q) => q.mode === "analizza");
    const overpriced = analyzed.filter(
      (q) => q.verdict === "alto" || q.verdict === "troppo-alto"
    );
    const totalTracked = quotes.reduce((sum, q) => {
      return sum + (q.receivedPrice || q.marketMid);
    }, 0);
    const savingsPotential = overpriced.reduce((sum, q) => {
      const over = (q.receivedPrice ?? 0) - q.marketMid;
      return sum + Math.max(0, over);
    }, 0);
    const verdictCounts: Record<string, number> = {};
    for (const q of analyzed) {
      if (q.verdict) verdictCounts[q.verdict] = (verdictCounts[q.verdict] ?? 0) + 1;
    }
    return { analyzed: analyzed.length, overpriced: overpriced.length, totalTracked, savingsPotential, verdictCounts };
  }, [quotes]);

  const filtered = useMemo(() => {
    if (filter === "tutti") return quotes;
    if (filter === "stima") return quotes.filter((q) => q.mode === "stima");
    return quotes.filter((q) => q.verdict === filter);
  }, [quotes, filter]);

  const handleDeleteClick = (id: string) => setDeleteConfirm(id);
  const confirmDelete = () => {
    if (deleteConfirm) { onDelete(deleteConfirm); setDeleteConfirm(null); }
  };
  const handleExportPDF = (q: SavedQuote) => {
    const fullQuote = PDFGenerator.fromSavedQuote(q);
    PDFGenerator.downloadPDF(fullQuote);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-card/95 backdrop-blur border-l border-border/80 p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/60">
          <SheetTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Archivio preventivi
          </SheetTitle>
        </SheetHeader>

        {/* Stats dashboard */}
        {quotes.length > 0 && (
          <div className="px-4 py-4 border-b border-border/50 space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard
                label="Totale analizzati"
                value={String(quotes.length)}
                sub={`${stats.analyzed} vs mercato`}
                icon={<BarChart3 className="w-3.5 h-3.5 text-primary" />}
                accent="text-primary"
              />
              <StatCard
                label="Valore tracciato"
                value={fmtEUR(stats.totalTracked)}
                sub="importi monitorati"
                icon={<ShieldCheck className="w-3.5 h-3.5 text-accent" />}
                accent="text-accent"
              />
            </div>
            {stats.savingsPotential > 50 && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
                <TrendingDown className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-amber-300">
                    Risparmio potenziale: {fmtEUR(stats.savingsPotential)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {stats.overpriced} {stats.overpriced === 1 ? "preventivo è" : "preventivi sono"} sopra il mercato
                  </p>
                </div>
              </div>
            )}
            {/* Verdict distribution bar */}
            {stats.analyzed > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Distribuzione verdetti</p>
                <div className="flex h-2 rounded-full overflow-hidden gap-px">
                  {Object.entries(stats.verdictCounts).map(([v, count]) => {
                    const pct = (count / stats.analyzed) * 100;
                    const colors: Record<string, string> = {
                      ottimo: "bg-emerald-500",
                      equo: "bg-sky-500",
                      alto: "bg-amber-500",
                      "troppo-alto": "bg-rose-500",
                      sospetto: "bg-violet-500",
                    };
                    return (
                      <div
                        key={v}
                        style={{ width: `${pct}%` }}
                        className={`h-full ${colors[v] ?? "bg-muted"} transition-all`}
                        title={`${VERDICT_LABEL[v] ?? v}: ${count}`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {Object.entries(stats.verdictCounts).map(([v, count]) => (
                    <span key={v} className="text-[10px] text-muted-foreground">
                      {VERDICT_LABEL[v] ?? v}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter chips */}
        {quotes.length > 0 && (
          <div className="px-4 py-2.5 border-b border-border/40 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {FILTER_OPTIONS.map((f) => {
              const count =
                f === "tutti"
                  ? quotes.length
                  : f === "stima"
                  ? quotes.filter((q) => q.mode === "stima").length
                  : quotes.filter((q) => q.verdict === f).length;
              if (count === 0 && f !== "tutti") return null;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "tutti" ? `Tutti (${count})` :
                   f === "stima" ? `Stime (${count})` :
                   `${VERDICT_LABEL[f]} (${count})`}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
          {filtered.length === 0 && quotes.length === 0 && (
            <div className="text-center py-16 px-6">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-muted/50 mx-auto">
                <Inbox className="w-5 h-5 text-muted-foreground" />
              </span>
              <p className="mt-4 text-sm text-muted-foreground">
                Ancora nessun preventivo salvato.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Completa un'analisi e salvala per vederla qui.
              </p>
            </div>
          )}
          {filtered.length === 0 && quotes.length > 0 && (
            <div className="text-center py-10 px-6">
              <p className="text-sm text-muted-foreground">Nessun preventivo per questo filtro.</p>
            </div>
          )}

          {filtered.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-border/70 bg-background/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold truncate">{q.jobLabel}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {q.regionLabel} · {q.quantity} {q.unitLabel} · {fmtDate(q.createdAt)}
                  </p>
                </div>
                {q.verdict && q.verdictLabel && (
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${VERDICT_BADGE[q.verdict] || ""}`}>
                    {q.verdictLabel}
                  </span>
                )}
                {q.mode === "stima" && !q.verdict && (
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border bg-muted/20 text-muted-foreground border-border/40">
                    Stima
                  </span>
                )}
              </div>

              {q.notes && (
                <div className="mt-3 border-t border-border/40 pt-3">
                  <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                    <p className="italic line-clamp-2">{q.notes}</p>
                  </div>
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                {q.mode === "analizza" && q.receivedPrice ? (
                  <div>
                    <p className="text-muted-foreground">Tuo prezzo</p>
                    <p className="font-semibold tabular-nums">{fmtEUR(q.receivedPrice)}</p>
                    {q.verdict === "alto" || q.verdict === "troppo-alto" ? (
                      <p className="text-[10px] text-amber-300 mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        +{fmtEUR(Math.max(0, q.receivedPrice - q.marketMid))} sopra media
                      </p>
                    ) : q.verdict === "ottimo" ? (
                      <p className="text-[10px] text-emerald-300 mt-0.5">
                        -{fmtEUR(Math.max(0, q.marketMid - q.receivedPrice))} sotto media
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div>
                    <p className="text-muted-foreground">Stima</p>
                    <p className="font-semibold tabular-nums">{fmtEUR(q.marketMid)}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Fascia onesta</p>
                  <p className="font-semibold tabular-nums">
                    {fmtEUR(q.marketMin)} – {fmtEUR(q.marketMax)}
                  </p>
                </div>
              </div>

              {/* Phase 5: Quality score + cliente */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {q.qualityScore !== undefined && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    q.qualityScore >= 80
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : q.qualityScore >= 50
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  }`}>
                    <Star className="w-2.5 h-2.5" />
                    Qualità {q.qualityScore}/100
                  </span>
                )}
                {q.validated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-sky-500/10 text-sky-300 border-sky-500/20">
                    <ShieldCheck className="w-2.5 h-2.5" /> Validato
                  </span>
                )}
                {q.cliente?.nome && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-muted/20 text-muted-foreground border-border/40">
                    <User className="w-2.5 h-2.5" /> {q.cliente.nome}
                  </span>
                )}
              </div>

              <div className="mt-2 flex justify-between items-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleExportPDF(q)}
                  className="h-7 px-2 text-xs text-primary hover:text-primary/80"
                >
                  <FileDown className="w-3.5 h-3.5 mr-1" /> PDF
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteClick(q.id)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Elimina
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>

      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina preventivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Il preventivo sarà rimosso dall'archivio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

function StatCard({
  label, value, sub, icon, accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-card/50 border border-border/60 px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className={`text-base font-bold tabular-nums ${accent}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
