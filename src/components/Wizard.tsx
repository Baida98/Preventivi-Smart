import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Calculator,
  X,
  Loader2,
  FileUp,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Euro,
  AlertCircle,
  Zap,
  Lightbulb,
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
import { validateWizardData } from "@/lib/validation";
import { cn } from "@/lib/utils";
import ResultsView from "./Results";
import PdfUploadZone from "./PdfUploadZone";

export type Mode = "analizza" | "stima";

type Props = {
  mode: Mode;
  onClose: () => void;
};

export default function Wizard({ mode: initialMode, onClose }: Props) {
  const [mode, setMode] = useState<"analizza" | "stima">(initialMode);
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState<string>("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [price, setPrice] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showPdfUpload, setShowPdfUpload] = useState(false);

  // Session persistence (only for internal navigation)
  // We remove the initial load from localStorage to ensure we always start from step 1
  useEffect(() => {
    const data = {
      categoryId,
      jobId,
      regionId,
      quantity,
      fieldValues,
      price,
      notes,
      step,
    };
    localStorage.setItem(`wizard_data_${mode}`, JSON.stringify(data));
  }, [categoryId, jobId, regionId, quantity, fieldValues, price, notes, step, mode]);

  // Clean up storage on unmount (when closing the wizard)
  useEffect(() => {
    return () => {
      localStorage.removeItem(`wizard_data_${mode}`);
    };
  }, [mode]);

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [savedThisRun, setSavedThisRun] = useState(false);

  const category = categoryId ? findCategory(categoryId) : null;
  const job = jobId && categoryId ? findJob(categoryId, jobId) : null;
  const regionLabel = regionId ? REGIONS.find((r) => r.id === regionId)?.label || "" : "";

  const progressIndex = step;

  // Step 2 validation: region, quantity, field values
  const quantityNum = Number(quantity);
  const isValidQuantity = quantityNum > 0 && 
    !(jobId && ["muratura", "imbiancatura-standard", "posa-piastrelle"].includes(jobId) && quantityNum < 2);
  const canStep2Next = regionId && quantity && isValidQuantity && Object.values(fieldValues).every((v) => v);

  // Step 3 validation: price (for analizza mode)
  const canStep3Next = mode !== "analizza" || (price && Number(price) > 0);

  const handlePdfPriceDetected = (detectedPrice: number) => {
    setPrice(String(detectedPrice));
    setShowPdfUpload(false);
    toast.success(`Prezzo estratto: €${detectedPrice.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`);
  };

  const runAnalysis = async () => {
    if (!job || !regionId || !quantity) return;

    setLoading(true);
    try {
      const marketAnalysis = computeMarket(job, Number(quantity), fieldValues, regionId, notes);
      setAnalysis(marketAnalysis);

      if (mode === "analizza" && price) {
        const priceNum = Number(price);
        const v = judge(priceNum, marketAnalysis, categoryId);
        setVerdict(v);
      } else if (mode === "stima") {
        const v = judge(marketAnalysis.marketMid, marketAnalysis, categoryId);
        setVerdict(v);
      }

      setStep(4);
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Errore durante l'analisi");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!job || !analysis || !verdict) return;

    if (await isGuestLimitReached()) {
      toast.error("Limite di preventivi raggiunto. Accedi per salvare illimitatamente.");
      return;
    }

    const category = findCategory(categoryId);
    const jobData = findJob(categoryId, jobId || "");
    const region = REGIONS.find((r) => r.id === regionId);
    
    const quote: SavedQuote = {
      id: newId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: new Date().toLocaleDateString("it-IT"),
      jobId: jobId || "",
      jobLabel: jobData?.label || "",
      categoryLabel: category?.label || "",
      regionLabel: region?.label || "",
      quantity: Number(quantity),
      unitLabel: jobData?.unitLabel || "",
      fieldValues,
      fieldLabels: jobData?.fields.map((f) => ({
        id: f.id,
        label: f.label,
        valueLabel: f.options.find((o) => o.value === fieldValues[f.id])?.label || "",
      })) || [],
      notes,
      receivedPrice: mode === "analizza" ? Number(price) : undefined,
      marketMin: analysis.marketMin,
      marketMid: analysis.marketMid,
      marketMax: analysis.marketMax,
      verdict: verdict.key,
      verdictLabel: verdict.label,
      mode,
      ambito: category?.label || "",
      sottotipo: jobData?.label || "",
      stato: "bozza" as const,
      source: "manuale" as const,
    };

    try {
      await saveQuote(quote);
      setSavedThisRun(true);
      toast.success("Preventivo salvato nell'archivio!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Errore nel salvataggio");
    }
  };

  if (step === 4 && analysis && verdict) {
    return (
      <ResultsView
        mode={mode}
        job={job!}
        category={category!}
        regionLabel={regionLabel}
        quantity={Number(quantity)}
        price={mode === "analizza" ? Number(price) : analysis.marketMid}
        analysis={analysis}
        verdict={verdict}
        saved={savedThisRun}
        onSave={handleSave}
        onReset={() => {
          setStep(1);
          setJobId(null);
          setRegionId("");
          setQuantity("");
          setFieldValues({});
          setPrice("");
          setNotes("");
          setAnalysis(null);
          setVerdict(null);
          setSavedThisRun(false);
          localStorage.removeItem(`wizard_data_${mode}`);
        }}
        onEdit={() => setStep(2)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-[2.5rem] border border-border/60 shadow-2xl"
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/30 px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    s <= progressIndex ? "bg-primary w-6" : "bg-border/30 w-2"
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Passo {progressIndex} di 3
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-black tracking-tightest">Seleziona Categoria</h2>
                <p className="text-muted-foreground mt-2 font-medium">
                  Scegli il tipo di lavoro che desideri analizzare.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.Icon;
                  return (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setCategoryId(cat.id);
                        setJobId(null);
                        setFieldValues({});
                        setStep(2);
                      }}
                      className={cn(
                        "p-4 rounded-[1.5rem] border-2 transition-all text-center space-y-2",
                        categoryId === cat.id
                          ? "border-primary bg-primary/10"
                          : "border-border/30 bg-card/40 hover:border-primary/50"
                      )}
                    >
                      <Icon className="w-6 h-6 mx-auto text-primary" />
                      <div className="text-xs font-black uppercase tracking-widest">{cat.label}</div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Job & Region Selection */}
          {step === 2 && category && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setStep(1)}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-2xl font-black tracking-tightest">Configurazione Tecnica</h2>
              </div>
              <p className="text-muted-foreground mb-8 font-medium">
                Parametri tecnici per il calcolo del benchmark di <span className="text-foreground font-bold">{category.label}</span>.
              </p>

              {/* Job Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-primary">
                  <Search className="w-4 h-4 inline mr-2" />
                  Tipo di Lavoro
                </Label>
                <Select value={jobId || ""} onValueChange={setJobId}>
                  <SelectTrigger className="h-12 rounded-2xl bg-primary/5 border-primary/30 focus:border-primary">
                    <SelectValue placeholder="Seleziona un lavoro..." />
                  </SelectTrigger>
                  <SelectContent>
                    {category.jobs.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Region Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-primary">
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Regione
                </Label>
                <Select value={regionId} onValueChange={setRegionId}>
                  <SelectTrigger className="h-12 rounded-2xl bg-primary/5 border-primary/30 focus:border-primary">
                    <SelectValue placeholder="Seleziona una regione..." />
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

              {/* Quantity Input */}
              {job && (
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-primary">
                    Quantità ({job.unitLabel})
                  </Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="h-12 rounded-2xl bg-primary/5 border-primary/30 focus:border-primary"
                    placeholder={`Es. ${job.defaultQty}`}
                    min="0"
                    step="0.1"
                  />
                </div>
              )}



              {/* Field Options */}
              {job && (
                <div className="space-y-4">
                  {job.fields.map((field) => (
                    <div key={field.id} className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-primary">
                        {field.label}
                      </Label>
                      <Select
                        value={fieldValues[field.id] || ""}
                        onValueChange={(val) =>
                          setFieldValues((prev) => ({ ...prev, [field.id]: val }))
                        }
                      >
                        <SelectTrigger className="h-12 rounded-2xl bg-primary/5 border-primary/30 focus:border-primary">
                          <SelectValue placeholder={`Seleziona ${field.label.toLowerCase()}...`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  <Lightbulb className="w-4 h-4 inline mr-2" />
                  Note Aggiuntive (Opzionale)
                </Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-20 p-4 rounded-2xl bg-white/5 border border-border/30 focus:border-primary focus:ring-primary/20 transition-all resize-none text-sm font-medium placeholder:text-muted-foreground/30"
                  placeholder="Es. Urgente, Rame, Rifacimento..."
                />
              </div>

              {jobId && ["muratura", "imbiancatura-standard", "posa-piastrelle"].includes(jobId) && quantityNum > 0 && quantityNum < 2 && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 mt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive font-medium">La quantità minima per questo lavoro è 2 {job?.unitLabel}.</p>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border/30 flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Indietro
                </Button>
                <Button
                  size="lg"
                  disabled={!canStep2Next}
                  onClick={() => setStep(3)}
                  className="h-14 px-10 rounded-2xl font-black text-base shadow-lg transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 shadow-primary/20"
                >
                  Continua
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Price Input */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setStep(2)}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-2xl font-black tracking-tightest">Dati Economici</h2>
              </div>
              <p className="text-muted-foreground mb-8 font-medium">
                {mode === "analizza" 
                  ? "Inserisci l'importo del preventivo ricevuto tramite PDF o manualmente."
                  : "Conferma i parametri per il calcolo della stima."}
              </p>

              {mode === "analizza" ? (
                <div className="space-y-6 flex flex-col items-center w-full">
                  {/* Manual Price Input Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md rounded-[2.5rem] border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-8 space-y-6 shadow-lg shadow-primary/10"
                  >
                    <div className="text-center space-y-2">
                      <div className="flex justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                          <Euro className="w-7 h-7 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-foreground">Importo del Preventivo</h3>
                      <p className="text-xs text-muted-foreground font-medium">Inserisci l'importo ricevuto</p>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="h-16 rounded-2xl bg-background/40 border-primary/50 focus:border-primary focus:ring-primary/30 transition-all text-2xl font-black text-center pr-12 placeholder:text-muted-foreground/30"
                        placeholder="0,00"
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-black text-primary/60">
                        €
                      </div>
                    </div>
                  </motion.div>

                  {/* Divider */}
                  <div className="w-full max-w-md flex items-center gap-4">
                    <div className="flex-1 h-px bg-border/30" />
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 px-2">Oppure</span>
                    <div className="flex-1 h-px bg-border/30" />
                  </div>

                  {/* PDF Upload Section */}
                  <div className="w-full max-w-md space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center justify-center gap-2">
                      <FileUp className="w-4 h-4" />
                      Estrai da PDF o Scansione
                    </Label>
                    <AnimatePresence mode="wait">
                      {!showPdfUpload ? (
                        <motion.div
                          key="upload-trigger"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPdfUpload(true)}
                            className="w-full h-14 rounded-2xl border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all gap-2 text-sm font-black uppercase tracking-widest text-primary"
                          >
                            <FileUp className="w-5 h-5" />
                            Carica PDF o Scansione
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="upload-zone"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        >
                          <PdfUploadZone
                            onPriceDetected={handlePdfPriceDetected}
                            onDismiss={() => setShowPdfUpload(false)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <Calculator className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-black text-foreground mb-1">Modalità Stima</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Il sistema calcolerà automaticamente la stima di prezzo in base ai parametri tecnici inseriti e ai dati di mercato ISTAT 2026.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border/30 flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Indietro
                </Button>
                <Button
                  size="lg"
                  disabled={!canStep3Next || loading}
                  onClick={runAnalysis}
                  className={cn(
                    "h-14 px-10 rounded-2xl font-black text-base shadow-lg transition-all hover:scale-105 active:scale-95",
                    mode === "analizza" 
                      ? "bg-primary hover:bg-primary/90 shadow-primary/20" 
                      : "bg-accent hover:bg-accent/90 shadow-accent/20"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analizzando...
                    </>
                  ) : (
                    <>
                      Analizza
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
