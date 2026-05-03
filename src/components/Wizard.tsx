import { useState, useEffect } from "react";
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
  FileUp,
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
import { newId, saveQuote, type SavedQuote, isGuestLimitReached, GUEST_QUOTE_LIMIT } from "@/lib/storage";
import { validateQuoteMultiLevel } from "@/lib/validation-rules";
import { validationContext } from "@/lib/validation-context";
import ResultsView from "./Results";
import PdfUploadZone from "./PdfUploadZone";
import { cn } from "@/lib/utils";

export type Mode = "analizza" | "stima";

type Props = {
  mode: Mode;
  initialCategoryId?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

type Step = 1 | 2 | 3;

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
  const [price, setPrice] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [savedThisRun, setSavedThisRun] = useState(false);
  const [showPdfUpload, setShowPdfUpload] = useState(false);

  const job: Job | null = (categoryId && jobId) ? findJob(categoryId, jobId) ?? null : null;
  const category = categoryId ? findCategory(categoryId) ?? null : null;

  // quando viene selezionato il job, imposta i valori di default
  useEffect(() => {
    if (job && !quantity) setQuantity(String(job.defaultQty ?? 1));
    if (job) {
      const initial: Record<string, string> = {};
      for (const f of job.fields) initial[f.id] = f.options[0]!.value;
      setFieldValues(initial);
    }
  }, [jobId, job, quantity]);

  const totalSteps = mode === "analizza" ? 3 : 2;
  const progressIndex = step;

  const canStep2Next = regionId && quantity && Object.values(fieldValues).every((v) => v);

  function pickJob(jid: string) {
    setJobId(jid);
    setStep(2);
  }

  async function runAnalysis() {
    if (!job || !regionId || !quantity) return;

    setLoading(true);
    try {
      const marketAnalysis = computeMarket(
        job,
        Number(quantity),
        fieldValues,
        regionId
      );
      setAnalysis(marketAnalysis);

      if (mode === "analizza") {
        if (!price) {
          toast.error("Inserisci il prezzo del preventivo");
          setLoading(false);
          return;
        }
        const v = judge(Number(price), marketAnalysis, categoryId ?? "edilizia");
        setVerdict(v);
      } else {
        const v = judge(marketAnalysis.marketMid, marketAnalysis, categoryId ?? "edilizia");
        setVerdict(v);
      }

      setStep(3 as Step);
    } catch (error) {
      console.error("Errore nell'analisi:", error);
      toast.error("Errore nel calcolo dell'analisi");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!job || !category || !analysis || !verdict) return;
    if (isGuestLimitReached()) {
      toast.error(`Limite raggiunto (${GUEST_QUOTE_LIMIT} preventivi)`);
      return;
    }

    const region = REGIONS.find((r: any) => r.id === regionId);
    if (!region) return;

    const nowStr = new Date().toISOString();
    const today = nowStr.split("T")[0];
    const totale = mode === "analizza" ? Number(price) : analysis.marketMid;

    const partialQuote = {
      id: newId(),
      numero: "DRAFT",
      uid: "guest",
      data: today,
      createdAt: nowStr,
      updatedAt: nowStr,
      cliente: { nome: "Ospite" },
      ambito: category?.id ?? "",
      sottotipo: job.id,
      servizi: [{
        id: "svc-1",
        descrizione: job.label,
        quantita: Number(quantity),
        unitaMisura: job.unitLabel,
        prezzoUnitario: totale / Math.max(Number(quantity), 1),
        totale,
      }],
      totale,
      stato: "finalizzato" as const,
      source: "manuale" as const,
    };

    const statCtx = validationContext.getContext(category?.id ?? "", job.id);
    const validationResult = validateQuoteMultiLevel(partialQuote, statCtx ?? undefined);

    const quote: SavedQuote = {
      id: partialQuote.id,
      createdAt: Date.now().toString(),
      updatedAt: Date.now().toString(),
      data: today,
      jobId: job.id,
      jobLabel: job.label,
      categoryLabel: category?.label ?? "",
      regionLabel: region.label,
      quantity: Number(quantity),
      unitLabel: job.unitLabel,
      fieldValues,
      fieldLabels: job.fields.map((f: any) => ({
        id: f.id,
        label: f.label,
        valueLabel:
          f.options.find((o: any) => o.value === fieldValues[f.id])?.label ?? "",
      })),
      receivedPrice: mode === "analizza" ? Number(price) : undefined,
      marketMin: analysis.marketMin,
      marketMid: analysis.marketMid,
      marketMax: analysis.marketMax,
      verdict: verdict?.key,
      verdictLabel: verdict?.label,
      mode,
      ambito: category?.id ?? "",
      sottotipo: job.id,
      stato: "finalizzato",
      source: "manuale",
      totale,
      qualityScore: validationResult.qualityScore,
      anomalyScore: validationResult.anomalyScore,
      validated: validationResult.valid,
      outcome: "bozza",
      segmento: `${category.id}:${job.id}`,
      prezzo_suggerito: analysis.marketMid,
      prezzo_finale: totale,
      errore_assoluto: Math.abs(totale - analysis.marketMid),
      errore_percentuale: Math.abs(totale - analysis.marketMid) / analysis.marketMid,
      dentro_range: totale >= analysis.marketMin && totale <= analysis.marketMax,
      confidence: analysis.confidence
    };

    try {
      saveQuote(quote);
      setSavedThisRun(true);
      onSaved();
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      toast.error(error instanceof Error ? error.message : "Errore nel salvataggio del preventivo.");
    }
  }

  return (
    <section className="relative mx-auto max-w-3xl px-5 sm:px-8 pt-6 pb-28 sm:pt-8 sm:pb-24">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
              mode === "analizza"
                ? "bg-primary/15 ring-1 ring-primary/30"
                : "bg-accent/15 ring-1 ring-accent/30"
            }`}
          >
            {mode === "analizza" ? (
              <Search className="w-5 h-5 text-primary" />
            ) : (
              <Calculator className="w-5 h-5 text-accent" />
            )}
          </span>
          <div className="flex flex-col justify-center">
            <p className="text-[10px] leading-tight uppercase tracking-[0.2em] text-muted-foreground font-bold">
              {mode === "analizza" ? "Analisi Preventivo" : "Stima Rapida"}
            </p>
            <p className="text-sm font-black leading-tight mt-0.5">
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
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1.5 mb-10">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const active = i + 1 <= progressIndex;
          return (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                active ? "bg-gradient-to-r from-primary to-sky-400" : "bg-white/5"
              }`}
            />
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Category & Job Selection */}
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-black tracking-tighter mb-2">Cosa vuoi analizzare?</h2>
            <p className="text-muted-foreground mb-8 font-medium">
              Scegli la categoria e il tipo di lavoro per una stima precisa.
            </p>

            {/* Category selection if not pre-selected */}
            {!categoryId ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className="group relative flex items-center gap-4 p-5 rounded-[1.5rem] border border-border/60 bg-card/40 text-left transition-all hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-background/50 ring-1 ring-border/50 group-hover:ring-primary/30 group-hover:bg-primary/10 transition-all">
                      <cat.Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground leading-tight">{cat.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{cat.blurb}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setCategoryId(null); setJobId(null); }}
                    className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground font-bold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Torna alle categorie
                  </Button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                    {category?.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {category?.jobs.map((j: any) => (
                    <button
                      key={j.id}
                      onClick={() => pickJob(j.id)}
                      className={cn(
                        "group flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                        jobId === j.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border/60 bg-card/40 hover:border-primary/30 hover:bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-all" />
                        <span className="font-bold text-foreground">{j.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === 2 && job && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="w-9 h-9 p-0 rounded-xl bg-white/5 hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-2xl font-black tracking-tighter">Dettagli del lavoro</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Regione */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Regione</Label>
                <Select value={regionId} onValueChange={setRegionId}>
                  <SelectTrigger className="h-12 rounded-2xl bg-card/40 border-border/60 card-hover-glow">
                    <SelectValue placeholder="Seleziona regione" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/60 backdrop-blur-xl">
                    {REGIONS.map((r: any) => (
                      <SelectItem key={r.id} value={r.id} className="rounded-xl focus:bg-primary/10">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantità */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Quantità ({job.unit})
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="h-12 rounded-2xl bg-card/40 border-border/60 pl-4 pr-12 font-bold card-hover-glow"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase">
                    {job.unit}
                  </span>
                </div>
              </div>

              {/* Dynamic Fields */}
              {job.fields.map((f: any) => (
                <div key={f.id} className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{f.label}</Label>
                  <Select
                    value={fieldValues[f.id]}
                    onValueChange={(val) => setFieldValues({ ...fieldValues, [f.id]: val })}
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-card/40 border-border/60 card-hover-glow">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/60 backdrop-blur-xl">
                      {f.options.map((opt: any) => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-xl focus:bg-primary/10">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {/* Prezzo (solo in Analizza) */}
              {mode === "analizza" && (
                <div className="space-y-2 sm:col-span-2 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-black text-primary">Prezzo del Preventivo</Label>
                    <Button
                      variant="link"
                      onClick={() => setShowPdfUpload(true)}
                      className="h-auto p-0 text-xs font-bold text-sky-400 hover:text-sky-300"
                    >
                      <FileUp className="w-3 h-3 mr-1.5" />
                      Estrai da PDF
                    </Button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <span className="text-lg font-black text-muted-foreground group-focus-within:text-primary transition-colors">€</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-16 pl-10 rounded-[1.5rem] bg-primary/5 border-primary/20 text-2xl font-black tracking-tighter shadow-2xl shadow-primary/5 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              disabled={!canStep2Next || (mode === "analizza" && !price) || loading}
              onClick={runAnalysis}
              className="w-full h-14 rounded-[1.25rem] bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-black uppercase tracking-tight shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {mode === "analizza" ? "Analizza Preventivo" : "Calcola Stima"}
                  <Sparkles className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && analysis && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <ResultsView
              mode={mode}
              job={job!}
              category={category!}
              regionLabel={REGIONS.find((r: any) => r.id === regionId)?.label ?? ""}
              quantity={Number(quantity)}
              price={Number(price)}
              analysis={analysis}
              verdict={verdict}
              savedThisRun={savedThisRun}
              onSave={handleSave}
              onReset={() => {
                setStep(1);
                setJobId(null);
                setCategoryId(null);
                setPrice("");
                setSavedThisRun(false);
              }}
              onEdit={() => setStep(2)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Upload Modal */}
      {showPdfUpload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl bg-card border border-border/60 rounded-[2.5rem] p-8 shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPdfUpload(false)}
              className="absolute right-6 top-6 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="mb-8">
              <h3 className="text-2xl font-black tracking-tighter mb-2">Estrai da PDF</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Carica il file del preventivo per estrarre automaticamente il prezzo totale.
              </p>
            </div>
            <PdfUploadZone
              onPriceDetected={(p) => {
                setPrice(String(p));
                setShowPdfUpload(false);
                toast.success("Prezzo estratto con successo!");
              }}
              onDismiss={() => setShowPdfUpload(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
