import { useEffect, useMemo, useState, useRef } from "react";
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
import RegionSelector from "./RegionSelector";
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

  const containerRef = useRef<HTMLElement>(null);

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

  // Risoluzione definitiva scroll: forziamo il reset istantaneo
  // e disabilitiamo temporaneamente lo smooth scroll se presente
  useEffect(() => {
    const originalStyle = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    
    window.scrollTo(0, 0);
    if (document.body) document.body.scrollTop = 0;
    if (document.documentElement) document.documentElement.scrollTop = 0;
    
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = originalStyle;
    }, 50);

    return () => {
      clearTimeout(timer);
      document.documentElement.style.scrollBehavior = originalStyle;
    };
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
    <section ref={containerRef} className="relative mx-auto max-w-3xl px-5 sm:px-8 pt-6 pb-28 sm:pt-8 sm:pb-24 min-h-[100vh]">
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

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
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
                    <p className="mt-4 font-bold text-sm leading-tight">
                      {c.label}
                    </p>
                    <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-muted-foreground/0 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}

            {categoryId && (
              <div className="mt-8 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCategoryId(null)}
                  className="-ml-2 mb-2 text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Cambia categoria
                </Button>
                <div className="grid grid-cols-1 gap-2">
                  {category?.jobs.map((j) => (
                    <button
                      key={j.id}
                      onClick={() => pickJob(j.id)}
                      className="group flex items-center justify-between p-4 rounded-2xl border border-border/70 bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-[15px]">{j.label}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          Unità: {j.unit}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && job && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Dettagli del lavoro
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fornisci i dati per una stima precisa.
              </p>
            </div>

            <div className="space-y-6">
              <RegionSelector value={regionId} onChange={setRegionId} />

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  Quantità ({job.unit})
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder={`Es: ${job.defaultQty}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-11 rounded-xl bg-card/50"
                />
              </div>

              {job.fields.map((f) => (
                <div key={f.id} className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                    {f.label}
                  </Label>
                  <Select
                    value={fieldValues[f.id]}
                    onValueChange={(v) =>
                      setFieldValues((prev) => ({ ...prev, [f.id]: v }))
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-card/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {f.options.map((o) => (
                        <SelectItem
                          key={o.value}
                          value={o.value}
                          className="rounded-lg"
                        >
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  Note aggiuntive (opzionale)
                </Label>
                <Textarea
                  placeholder="Es: piano alto senza ascensore, materiali particolari..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] rounded-xl bg-card/50 resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-12 px-6 rounded-2xl font-semibold border-border/80 bg-card/50"
              >
                Indietro
              </Button>
              <Button
                disabled={!canStep2Next}
                onClick={() => setStep(mode === "analizza" ? 3 : 4)}
                className="h-12 flex-1 rounded-2xl font-bold bg-primary hover:bg-primary text-primary-foreground glow-azure"
              >
                {mode === "analizza" ? "Continua" : "Vedi stima"}
                <ArrowRight className="w-4 h-4 ml-2" />
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
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Il preventivo ricevuto
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Inserisci il prezzo totale che ti è stato proposto.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  Prezzo Totale (€)
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    €
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-14 pl-9 text-xl font-bold rounded-2xl bg-card/50"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-muted-foreground px-1">
                  Inserisci l'importo totale IVA inclusa.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex gap-4">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Analizzeremo questo prezzo confrontandolo con i listini regionali 
                  e i prezzari ISTAT 2025 per darti un riscontro oggettivo.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="h-12 px-6 rounded-2xl font-semibold border-border/80 bg-card/50"
              >
                Indietro
              </Button>
              <Button
                disabled={!canStep3Next}
                onClick={runAnalysis}
                className="h-12 flex-1 rounded-2xl font-bold bg-primary hover:bg-primary text-primary-foreground glow-azure"
              >
                Analizza ora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="s4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                </div>
                <h3 className="mt-6 text-xl font-bold">Analisi in corso...</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Stiamo interrogando i listini regionali 2025.
                </p>
              </div>
            ) : (
              analysis && job && category && (
                <ResultsView
                  mode={mode}
                  job={job}
                  category={category}
                  regionLabel={REGIONS.find(r => r.id === regionId)?.label ?? ""}
                  quantity={Number(quantity)}
                  price={Number(price)}
                  analysis={analysis}
                  verdict={verdict}
                  savedThisRun={savedThisRun}
                  onSave={handleSave}
                  onReset={() => reset(1)}
                  onEdit={() => setStep(2)}
                />
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
