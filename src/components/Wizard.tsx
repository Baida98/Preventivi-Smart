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
      toast.error("Si è verificato un errore durante l'elaborazione dell'analisi tecnica.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!job || !category || !analysis || !verdict) return;
    if (isGuestLimitReached()) {
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
      toast.error(error instanceof Error ? error.message : "Errore nel salvataggio dei dati tecnici.");
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
              {mode === "analizza" ? "Analisi Preventivo" : "Configurazione Stima"}
            </p>
            <p className="text-sm font-black leading-tight mt-0.5">
              Fase {progressIndex} di {totalSteps}
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
            <h2 className="text-3xl font-black tracking-tighter mb-2">Ambito di intervento</h2>
            <p className="text-muted-foreground mb-8 font-medium">
              Seleziona la categoria e la tipologia di lavoro per avviare l'analisi tecnica dei costi.
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
                      <h4 className="font-bold text-foreground leading-tight">{cat.label}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{cat.blurb}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <Button 
                    variant="link" 
                    onClick={() => setCategoryId(null)}
                    className="h-auto p-0 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1.5" /> Torna alle categorie
                  </Button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-1 rounded-lg ring-1 ring-primary/10">
                    {category?.label}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {category?.jobs.map((j: any) => (
                    <button
                      key={j.id}
                      onClick={() => pickJob(j.id)}
                      className="group flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-card/30 hover:bg-primary/5 hover:border-primary/40 transition-all text-left"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{j.label}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Analisi su base {j.unitLabel}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && job && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-black tracking-tighter mb-2">Parametri Tecnici</h2>
              <p className="text-muted-foreground font-medium">
                Configura le specifiche del lavoro per allineare la stima al contesto locale e tecnico.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 sm:p-8 rounded-[2rem] border border-border/60 bg-card/40 backdrop-blur-md">
              {/* Region */}
              <div className="space-y-2.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Regione di Intervento</Label>
                <Select value={regionId} onValueChange={setRegionId}>
                  <SelectTrigger className="h-12 rounded-2xl bg-background/50 border-border/50 focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Seleziona regione" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
                    {REGIONS.map((r: any) => (
                      <SelectItem key={r.id} value={r.id} className="rounded-xl focus:bg-primary/10 focus:text-primary transition-colors">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Quantità ({job.unitLabel})</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`Es. ${job.defaultQty}`}
                  className="h-12 rounded-2xl bg-background/50 border-border/50 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Dynamic Fields */}
              {job.fields.map((f: any) => (
                <div key={f.id} className="space-y-2.5">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">{f.label}</Label>
                  <Select
                    value={fieldValues[f.id]}
                    onValueChange={(val) => setFieldValues({ ...fieldValues, [f.id]: val })}
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-background/50 border-border/50 focus:ring-primary/20 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
                      {f.options.map((opt: any) => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-xl focus:bg-primary/10 focus:text-primary transition-colors">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {/* Price (Solo per Analizza) */}
              {mode === "analizza" && (
                <div className="space-y-2.5 sm:col-span-2 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-primary/80">Importo Preventivo Ricevuto (€)</Label>
                    <button 
                      onClick={() => setShowPdfUpload(true)}
                      className="text-[10px] font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      <FileUp className="w-3 h-3" /> Estrai da PDF
                    </button>
                  </div>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0,00"
                    className="h-14 text-lg font-black rounded-2xl bg-primary/5 border-primary/20 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/30"
                  />
                  <p className="text-[10px] text-muted-foreground/60 italic px-1">Inserisci il totale imponibile indicato nel preventivo che hai ricevuto.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="h-14 px-6 rounded-2xl font-bold text-muted-foreground hover:text-foreground"
              >
                Indietro
              </Button>
              <Button
                onClick={runAnalysis}
                disabled={!canStep2Next || (mode === "analizza" && !price) || loading}
                className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-black uppercase tracking-tight glow-azure shadow-xl shadow-primary/20"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Elabora Analisi Tecnica
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && analysis && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
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
                setCategoryId(null);
                setJobId(null);
                setQuantity("");
                setPrice("");
                setSavedThisRun(false);
              }}
              onEdit={() => {
                setStep(2);
                setSavedThisRun(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Upload Modal */}
      <AnimatePresence>
        {showPdfUpload && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPdfUpload(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-card border border-border/60 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Estrazione Dati PDF</h3>
                    <p className="text-sm text-muted-foreground font-medium">L'AI analizzerà il documento per estrarre l'importo totale.</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowPdfUpload(false)} className="rounded-full">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <PdfUploadZone 
                  onPriceDetected={(detectedPrice: number) => {
                    setPrice(String(detectedPrice));
                    toast.success(`Importo estratto: €${detectedPrice}`);
                    setShowPdfUpload(false);
                  }}
                  onDismiss={() => setShowPdfUpload(false)}
                />
                
                <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
                    Il sistema analizza solo la struttura economica del documento. Nessun dato sensibile viene archiviato o trasmesso a server esterni per l'elaborazione.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
