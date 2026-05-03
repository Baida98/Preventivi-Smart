import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Search,
  Calculator,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
// import RegionSelector from "./RegionSelector";
import {
  CATEGORIES,
  REGIONS,
  computeMarket,
  findCategory,
  findJob,
  type Job,
  type MarketAnalysis,
} from "@/lib/pricing";
import { judge, type Verdict } from "@/lib/verdict";
import { newId, saveQuote, type SavedQuote, isGuestLimitReached, GUEST_QUOTE_LIMIT, getClientSuggestions } from "@/lib/storage";
import { validateWizardData } from "@/lib/validation";
import ResultsView from "./Results";
import { cn } from "@/lib/utils";

export type Mode = "analizza" | "stima";

type Props = {
  mode: Mode;
  initialCategoryId?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

type Step = 1 | 2 | 3 | 4;

export default function Wizard({
  mode,
  initialCategoryId = null,
  onClose,
  onSaved,
}: Props) {
  const [step, setStep] = useState<Step>(1);
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId);
  const [jobId, setJobId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [savedThisRun, setSavedThisRun] = useState(false);

  const job: Job | null = jobId ? findJob(jobId) ?? null : null;
  const category = categoryId ? findCategory(categoryId) ?? null : null;

  // when job selected, set defaults
  useEffect(() => {
    if (job && !quantity) setQuantity(String(job.defaultQty ?? 1));
    if (job) {
      const initial: Record<string, string> = {};
      for (const f of job.fields) initial[f.id] = f.options[0]!.value;
      setFieldValues(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const totalSteps = mode === "analizza" ? 4 : 3;
  // map step to displayed progress: in stima mode, the price step is skipped
  const progressIndex = step === 4 ? totalSteps : step;

  // scroll to top on every step change — use requestAnimationFrame to ensure
  // the DOM has rendered before resetting scroll, preventing the "dip" caused
  // by focus-induced auto-scroll on newly mounted inputs
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const canStep2Next = useMemo(() => {
    if (!regionId) return false;
    const q = Number(quantity);
    if (!q || q <= 0) return false;
    return true;
  }, [regionId, quantity]);

  const canStep3Next = useMemo(() => {
    const p = Number(price);
    return Number.isFinite(p) && p > 0;
  }, [price]);

  function pickJob(id: string) {
    setJobId(id);
    setStep(2);
  }

  function reset(toStep: Step = 1) {
    setStep(toStep);
    if (toStep === 1) {
      setCategoryId(null);
      setJobId(null);
      setRegionId("");
      setQuantity("");
      setFieldValues({});
      setNotes("");
      setClientName("");
      setClientEmail("");
      setPrice("");
      setAnalysis(null);
      setVerdict(null);
      setSavedThisRun(false);
    }
  }

  function runAnalysis() {
    if (!job) return;
    
    // Validazione multi-livello
    const validation = validateWizardData({
      categoryId,
      jobId,
      regionId,
      quantity,
      fieldValues,
      notes,
      price: mode === "analizza" ? price : undefined,
    });

    if (!validation.success) {
      validation.errors?.forEach(err => toast.error(err, {
        icon: <AlertCircle className="w-4 h-4 text-destructive" />
      }));
      return;
    }

    setLoading(true);
    try {
      const m = computeMarket(job, regionId, Number(quantity), fieldValues);
      let v: Verdict | null = null;
      if (mode === "analizza") {
        v = judge(Number(price), m);
      }
      setTimeout(() => {
        setAnalysis(m);
        setVerdict(v);
        setLoading(false);
        setStep(4);
        setSavedThisRun(false);
      }, 700);
    } catch (error) {
      console.error("Errore nell'analisi:", error);
      setLoading(false);
      toast.error("Errore nell'analisi del preventivo. Riprova.");
    }
  }

  function handleSave() {
    if (!job || !analysis) return;
    
    // Verifica limite preventivi ospiti
    if (isGuestLimitReached()) {
      toast.error(`Limite raggiunto: massimo ${GUEST_QUOTE_LIMIT} preventivi per ospiti. Accedi per salvarne di più.`);
      return;
    }
    
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return;
    const quote: SavedQuote = {
      id: newId(),
      createdAt: new Date().toISOString(),
      jobId: job.id,
      jobLabel: job.label,
      categoryLabel: category?.label ?? "",
      regionLabel: region.label,
      quantity: Number(quantity),
      unitLabel: job.unitLabel,
      fieldValues,
      fieldLabels: job.fields.map((f) => ({
        id: f.id,
        label: f.label,
        valueLabel:
          f.options.find((o) => o.value === fieldValues[f.id])?.label ?? "",
      })),
      notes: notes || undefined,
      cliente: clientName ? {
        nome: clientName,
        email: clientEmail || undefined,
      } : undefined,
      receivedPrice: mode === "analizza" ? Number(price) : undefined,
      marketMin: analysis.marketMin,
      marketMid: analysis.marketMid,
      marketMax: analysis.marketMax,
      verdict: verdict?.key,
      verdictLabel: verdict?.label,
      mode,
    };
    try {
      saveQuote(quote);
      setSavedThisRun(true);
      toast.success("✅ Preventivo salvato in archivio.");
      onSaved();
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      toast.error(error instanceof Error ? error.message : "Errore nel salvataggio del preventivo.");
    }
  }

  return (
    <section className="relative mx-auto max-w-3xl px-5 sm:px-8 pt-6 pb-28 sm:pt-8 sm:pb-24">
      {/* progress */}
      <div className="flex items-center justify-between mb-8 wizard-header-container">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${
              mode === "analizza"
                ? "bg-primary/15 ring-1 ring-primary/30"
                : "bg-accent/15 ring-1 ring-accent/30"
            }`}
          >
            {mode === "analizza" ? (
              <Search className="w-4 h-4 text-primary" />
            ) : (
              <Calculator className="w-4 h-4 text-accent" />
            )}
          </span>
          <div className="flex flex-col justify-center">
            <p className="text-[11px] leading-tight uppercase tracking-[0.18em] text-muted-foreground">
              {mode === "analizza" ? "Analisi preventivo" : "Stima rapida"}
            </p>
            <p className="text-sm font-semibold leading-tight mt-0.5">
              Passo {progressIndex} di {totalSteps}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-1" /> Esci
        </Button>
      </div>

      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const active = i + 1 <= progressIndex;
          return (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                active ? "bg-primary" : "bg-border"
              }`}
            />
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {categoryId
                ? `Quale lavoro di ${category?.label.toLowerCase()}?`
                : "Cosa vogliamo analizzare?"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {categoryId
                ? "Scegli il lavoro più simile al tuo."
                : "Tocca la categoria del lavoro."}
            </p>

            {!categoryId && (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    className="group relative text-left rounded-2xl border border-border/70 bg-card/50 p-5 hover-elevate-2 transition"
                  >
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 ring-1 ring-primary/20">
                      <c.Icon
                        className="w-5 h-5 text-primary"
                        strokeWidth={2.2}
                      />
                    </span>
                    <h3 className="mt-4 text-[14px] font-semibold leading-tight">
                      {c.label}
                    </h3>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {c.jobs.length} lavori
                    </p>
                  </button>
                ))}
              </div>
            )}

            {categoryId && category && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.jobs.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => pickJob(j.id)}
                    className="group flex items-center justify-between text-left rounded-2xl border border-border/70 bg-card/50 px-5 py-4 hover-elevate-2 transition"
                  >
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold leading-tight">
                        {j.label}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Da € {j.base}/{j.unit}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-10 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => (categoryId ? setCategoryId(null) : onClose())}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {categoryId ? "Cambia categoria" : "Annulla"}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && job && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Configura i dettagli
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Calcoliamo la fascia di prezzo onesta con questi dati.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 ring-1 ring-primary/30 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">{category?.label}</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-semibold">{job.label}</span>
            </div>

            <div className="mt-6 space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground tracking-wide">
                Regione
              </Label>
              <Select value={regionId} onValueChange={setRegionId}>
                <SelectTrigger className="h-11 bg-card/60">
                  <SelectValue placeholder="Seleziona la tua regione" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={8}>
                  <div className="max-h-[300px] overflow-y-auto">
                    {REGIONS.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground tracking-wide">
                  Quantità ({job.unitLabel})
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`Es. ${job.defaultQty ?? 1}`}
                  className="h-11 bg-card/60"
                />
              </div>

              {job.fields.map((f) => (
                <div key={f.id} className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground tracking-wide">
                    {f.label}
                  </Label>
                  <Select
                    value={fieldValues[f.id] ?? ""}
                    onValueChange={(v) =>
                      setFieldValues((s) => ({ ...s, [f.id]: v }))
                    }
                  >
                    <SelectTrigger className="h-11 bg-card/60">
                      <SelectValue placeholder="Scegli" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={8}>
                      {f.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground tracking-wide">
                  Nome Cliente (facoltativo)
                </Label>
                <div className="relative">
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Es: Mario Rossi"
                    className="h-11 bg-card/60"
                    list="client-suggestions"
                  />
                  <datalist id="client-suggestions">
                    {getClientSuggestions().map((c, i) => (
                      <option key={i} value={`${c.nome}${c.cognome ? ' ' + c.cognome : ''}`} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground tracking-wide">
                  Email Cliente (facoltativo)
                </Label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="mario@esempio.it"
                  className="h-11 bg-card/60"
                />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground tracking-wide">
                Note aggiuntive (facoltativo)
              </Label>
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Es: materiali di pregio, urgenza, accesso difficile..."
                className="bg-card/60 resize-none"
              />
            </div>

            <div className="mt-8 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setJobId(null);
                  setStep(1);
                }}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Indietro
              </Button>
              <Button
                disabled={!canStep2Next || loading}
                onClick={() => {
                  if (mode === "analizza") setStep(3);
                  else runAnalysis();
                }}
                className="gap-2 ml-auto bg-primary text-primary-foreground glow-azure"
              >
                {loading && mode === "stima" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Calcolo…
                  </>
                ) : mode === "analizza" ? (
                  <>
                    Continua <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Calcola stima <Sparkles className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && mode === "analizza" && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Quanto ti hanno chiesto?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Scrivi il totale del preventivo che hai ricevuto, IVA inclusa.
            </p>

            <div className="mt-12 mx-auto max-w-md">
              <div className="relative rounded-3xl border border-border/80 bg-card/40 p-8 grain glow-azure">
                <Label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                  Prezzo ricevuto
                </Label>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-bold text-primary">
                    €
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className="flex-1 min-w-0 bg-transparent border-0 outline-none text-5xl sm:text-6xl font-bold tabular-nums tracking-tight placeholder:text-border focus:placeholder:text-transparent"
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Inserisci la cifra finale, comprensiva di IVA e materiali.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Indietro
              </Button>
              <Button
                disabled={!canStep3Next || loading}
                onClick={runAnalysis}
                className="gap-2 ml-auto bg-primary text-primary-foreground glow-azure"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Calcolo…
                  </>
                ) : (
                  <>
                    Avvia analisi <Sparkles className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="s4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {loading || !analysis ? (
              <div className="py-20 text-center">
                <div className="mx-auto w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <p className="mt-6 text-sm text-muted-foreground">
                  Confronto con i prezzari regionali in corso…
                </p>
              </div>
            ) : (
              <ResultsView
                mode={mode}
                job={job!}
                category={category!}
                regionLabel={
                  REGIONS.find((r) => r.id === regionId)?.label ?? ""
                }
                quantity={Number(quantity)}
                price={Number(price)}
                analysis={analysis}
                verdict={verdict}
                savedThisRun={savedThisRun}
                onSave={handleSave}
                onReset={() => reset(1)}
                onEdit={() => setStep(mode === "analizza" ? 3 : 2)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
