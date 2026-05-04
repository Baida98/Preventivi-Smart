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
  BarChart3,
  ChevronRight,
  ShieldCheck
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

  useEffect(() => {
    if (job && !quantity) setQuantity(String(job.defaultQty ?? 1));
    if (job) {
      const initial: Record<string, string> = {};
      for (const f of job.fields) {
        // Mantiene i valori esistenti se il campo ha lo stesso ID (es. cambio job stessa categoria)
        initial[f.id] = fieldValues[f.id] || f.options[0]!.value;
      }
      setFieldValues(initial);
    }
  }, [jobId, job]);

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
          toast.error("Inserisci l'importo totale del preventivo");
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
      toast.error("Errore durante l'elaborazione tecnica.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!job || !category || !analysis || !verdict) return;
    if (await isGuestLimitReached()) {
      toast.error(`Limite di archiviazione raggiunto (${GUEST_QUOTE_LIMIT} preventivi)`);
      return;
    }

    const region = REGIONS.find((r: any) => r.id === regionId);
    if (!region) return;

    const nowStr = new Date().toISOString();
    const today = nowStr.split("T")[0];
    const totale = mode === "analizza" ? Number(price) : analysis.marketMid;

    const partialQuote = {
      id: newId(),
      numero: "ANALISI-TEMP",
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
      toast.error("Errore nel salvataggio dei dati tecnici.");
    }
  }

  return (
    <section className="relative mx-auto max-w-3xl px-5 sm:px-8 pt-6 pb-28 sm:pt-8 sm:pb-24">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span
            className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${
              mode === "analizza"
                ? "bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5"
                : "bg-accent/10 border border-accent/20 shadow-lg shadow-accent/5"
            }`}
          >
            {mode === "analizza" ? (
              <Search className="w-6 h-6 text-primary" />
            ) : (
              <Calculator className="w-6 h-6 text-accent" />
            )}
          </span>
          <div className="flex flex-col justify-center">
            <p className="text-[10px] leading-tight uppercase tracking-[0.2em] text-muted-foreground font-black">
              {mode === "analizza" ? "Analisi Tecnica" : "Configurazione Stima"}
            </p>
            <p className="text-sm font-black leading-tight mt-1">
              Fase {progressIndex} di {totalSteps}
            </p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-12">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const active = i + 1 <= progressIndex;
          return (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-700 ease-out ${
                active ? "bg-gradient-to-r from-primary to-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]" : "bg-white/5"
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
            <h2 className="text-3xl font-black tracking-tightest mb-2">Ambito di intervento</h2>
            <p className="text-muted-foreground mb-10 font-medium leading-relaxed">
              Seleziona la categoria e la tipologia di lavoro per avviare l'analisi dei costi regionali.
            </p>

            {!categoryId ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CATEGORIES.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className="group relative flex items-center gap-4 p-6 rounded-[2rem] border border-border/60 bg-card/40 text-left transition-all hover:border-primary/50 hover:bg-primary/5 card-hover-glow"
                  >
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-background/50 border border-border/50 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all">
                      <cat.Icon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-black tracking-tight">{cat.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cat.blurb}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  onClick={() => setCategoryId(null)}
                  className="group -ml-3 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Torna alle categorie
                </Button>
                <div className="grid grid-cols-1 gap-3">
                  {category?.jobs.map((j) => (
                    <button
                      key={j.id}
                      onClick={() => pickJob(j.id)}
                      className={cn(
                        "group flex items-center justify-between p-5 rounded-2xl border transition-all text-left",
                        jobId === j.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border/60 bg-card/40 hover:border-primary/40 hover:bg-primary/5"
                      )}
                    >
                      <div>
                        <h4 className="font-bold">{j.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Benchmark base: €{j.base}/{j.unit}
                        </p>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-full border flex items-center justify-center transition-all",
                        jobId === j.id
                          ? "bg-primary border-primary text-white"
                          : "border-border/60 text-muted-foreground/30 group-hover:border-primary/50 group-hover:text-primary/50"
                      )}>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Technical Configuration */}
        {step === 2 && job && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setStep(1)}
                className="rounded-full -ml-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-3xl font-black tracking-tightest">Configurazione Tecnica</h2>
            </div>
            <p className="text-muted-foreground mb-10 font-medium">
              Dettagli specifici per <span className="text-foreground font-bold">{job.label}</span>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Regione dell'intervento
                  </Label>
                  <Select value={regionId} onValueChange={setRegionId}>
                    <SelectTrigger className="h-14 rounded-2xl bg-card/40 border-border/60 hover:border-primary/50 transition-all text-base font-bold">
                      <SelectValue placeholder="Seleziona regione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/60 bg-popover/95 backdrop-blur-xl">
                      {REGIONS.map((r) => (
                        <SelectItem key={r.id} value={r.id} className="rounded-xl py-3 focus:bg-primary/10">
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Quantità ({job.unitLabel})
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="h-14 rounded-2xl bg-card/40 border-border/60 hover:border-primary/50 transition-all text-base font-bold pr-16"
                      placeholder="0"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground uppercase">
                      {job.unit}
                    </div>
                  </div>
                </div>

                {mode === "analizza" && (
                  <div className="space-y-3 pt-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Importo totale preventivo (€)
                    </Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-14 rounded-2xl bg-primary/5 border-primary/30 focus:border-primary focus:ring-primary/20 transition-all text-lg font-black"
                      placeholder="Inserisci il totale ricevuto..."
                    />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {job.fields.map((f) => (
                  <div key={f.id} className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      {f.label}
                    </Label>
                    <Select
                      value={fieldValues[f.id]}
                      onValueChange={(val) =>
                        setFieldValues((prev) => ({ ...prev, [f.id]: val }))
                      }
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-card/40 border-border/60 hover:border-primary/50 transition-all text-base font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/60 bg-popover/95 backdrop-blur-xl">
                        {f.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="rounded-xl py-3 focus:bg-primary/10">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                
                <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-primary uppercase tracking-wider">Precisione Tecnica</h5>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Queste domande mirate permettono all'AI di calcolare lo scostamento reale basato sui parametri ISTAT 2026 della tua regione.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <Button
                size="lg"
                disabled={!canStep2Next || loading}
                onClick={runAnalysis}
                className={cn(
                  "h-16 px-10 rounded-2xl font-black text-lg shadow-xl transition-all hover:scale-105 active:scale-95",
                  mode === "analizza" 
                    ? "bg-primary hover:bg-primary/90 shadow-primary/20" 
                    : "bg-accent hover:bg-accent/90 shadow-accent/20"
                )}
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {mode === "analizza" ? "Analizza Preventivo" : "Calcola Stima"}
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && analysis && verdict && job && category && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <ResultsView
              mode={mode}
              job={job}
              category={category}
              regionLabel={REGIONS.find(r => r.id === regionId)?.label || regionId}
              quantity={Number(quantity)}
              price={Number(price)}
              analysis={analysis}
              verdict={verdict}
              onSave={handleSave}
              saved={savedThisRun}
              onReset={() => setStep(1)}
              onEdit={() => setStep(2)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
