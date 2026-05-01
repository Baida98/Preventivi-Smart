import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { Trash2, Inbox } from "lucide-react";
import { fmtEUR, fmtDate } from "@/lib/format";
import type { SavedQuote } from "@/lib/storage";

const VERDICT_BADGE: Record<string, string> = {
  ottimo: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  equo: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  alto: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "troppo-alto": "bg-rose-500/15 text-rose-300 border-rose-500/30",
  sospetto: "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

type Props = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  quotes: SavedQuote[];
  onDelete: (id: string) => void;
};

export default function Archive({ open, onOpenChange, quotes, onDelete }: Props) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-card/95 backdrop-blur border-l border-border/80 p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <SheetTitle className="text-lg">Archivio preventivi</SheetTitle>
          <SheetDescription className="text-xs">
            Salvati in locale, sul tuo browser. {quotes.length}{" "}
            {quotes.length === 1 ? "elemento" : "elementi"}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
          {quotes.length === 0 && (
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

          {quotes.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-border/70 bg-background/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold truncate">
                    {q.jobLabel}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {q.regionLabel} · {q.quantity} {q.unitLabel} ·{" "}
                    {fmtDate(q.createdAt)}
                  </p>
                </div>
                {q.verdict && q.verdictLabel && (
                  <span
                    className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${VERDICT_BADGE[q.verdict] || ""}`}
                  >
                    {q.verdictLabel}
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                {q.mode === "analizza" && q.receivedPrice ? (
                  <div>
                    <p className="text-muted-foreground">Tuo prezzo</p>
                    <p className="font-semibold tabular-nums">
                      {fmtEUR(q.receivedPrice)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted-foreground">Stima</p>
                    <p className="font-semibold tabular-nums">
                      {fmtEUR(q.marketMid)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Mercato</p>
                  <p className="font-semibold tabular-nums">
                    {fmtEUR(q.marketMin)}–{fmtEUR(q.marketMax)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
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
              Questa azione non puo essere annullata. Il preventivo sara rimosso dall'archivio.
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
