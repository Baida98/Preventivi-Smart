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
                    <div className="flex-1">
                      <h3 className="font-black tracking-tight text-foreground">{cat.label}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">{cat.jobs.length} lavori</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategoryId(null)}
                    className="text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-[10px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                    Cambia Categoria
                  </Button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                    {category?.label}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {category?.jobs.map((j: any) => (
                    <button
                      key={j.id}
                      onClick={() => pickJob(j.id)}
                      className="group flex items-center justify-between p-6 rounded-[2rem] border border-border/60 bg-card/40 hover:border-primary/40 hover:bg-primary/5 transition-all card-hover-glow"
                    >
                      <div className="flex flex-col text-left">
                        <h4 className="font-black text-foreground tracking-tight">{j.label}</h4>
                        <p className="text-xs text-muted-foreground/60 font-medium mt-1">Benchmark base: {j.base}€/{j.unit}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Details & Parameters */}
        {step === 2 && job && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tightest">Dettagli Tecnici</h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Configura i parametri specifici per ottenere una stima accurata basata sui dati {regionId ? REGIONS.find(r => r.id === regionId)?.label : "regionali"}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-8 rounded-[2.5rem] border border-border/60 bg-card/40 grain">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label>Regione di Intervento</Label>
                  <Select value={regionId} onValueChange={setRegionId}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleziona regione" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label>Quantità Totale ({job.unitLabel})</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="es. 10"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="h-12 pr-16 font-black text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-muted-foreground/40 tracking-widest">
                      {job.unit}
                    </span>
                  </div>
                </div>

                {mode === "analizza" && (
                  <div className="space-y-2.5 pt-4 border-t border-border/40">
                    <Label className="text-primary">Importo Totale Preventivo (€)</Label>
                    <div className="relative group">
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="h-14 pl-12 text-xl font-black text-primary border-primary/20 bg-primary/5 focus:border-primary/50"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-primary/40">€</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setShowPdfUpload(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl text-primary hover:bg-primary/10"
                        title="Estrai da PDF"
                      >
                        <FileUp className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">
                      Inserisci l'importo o caricalo da file
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {job.fields.map((f) => (
                  <div key={f.id} className="space-y-2.5">
                    <Label>{f.label}</Label>
                    <Select
                      value={fieldValues[f.id]}
                      onValueChange={(val) => setFieldValues({ ...fieldValues, [f.id]: val })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
                className="flex-1 h-14 rounded-2xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Indietro
              </Button>
              <Button
                size="lg"
                disabled={!canStep2Next || loading}
                onClick={runAnalysis}
                className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-tight glow-azure"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {mode === "analizza" ? <BarChart3 className="w-5 h-5 mr-2" /> : <Calculator className="w-5 h-5 mr-2" />}
                    {mode === "analizza" ? "Avvia Analisi Tecnica" : "Calcola Stima Mercato"}
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
              regionLabel={REGIONS.find((r) => r.id === regionId)?.label || ""}
              quantity={Number(quantity)}
              price={Number(price)}
              analysis={analysis}
              verdict={verdict}
              savedThisRun={savedThisRun}
              onSave={handleSave}
              onReset={onClose}
              onEdit={() => setStep(2)}
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
              className="relative w-full max-w-xl bg-card border border-border/60 rounded-[3rem] shadow-2xl overflow-hidden shadow-black/60"
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black tracking-tightest">Analisi Documentale AI</h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Estrai automaticamente gli importi dal tuo preventivo.</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowPdfUpload(false)} className="rounded-full h-12 w-12 bg-white/5">
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                <PdfUploadZone 
                  onPriceDetected={(detectedPrice: number) => {
                    setPrice(String(detectedPrice));
                    toast.success(`Importo rilevato: €${detectedPrice.toLocaleString('it-IT')}`);
                    setShowPdfUpload(false);
                  }}
                  onDismiss={() => setShowPdfUpload(false)}
                />
                
                <div className="mt-8 p-5 rounded-[1.5rem] bg-primary/5 border border-primary/10 flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                    Il sistema analizza solo la struttura economica. I documenti non vengono archiviati permanentemente e l'analisi avviene in modo anonimo nel rispetto della privacy.
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
