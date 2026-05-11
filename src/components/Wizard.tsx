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
import { withErrorHandler } from "@/lib/async-handler";
import { validateWizardData } from "@/lib/validation";
import { cn } from "@/lib/utils";
import ResultsView from "./Results";
import PdfUploadZone from "./PdfUploadZone";
import AIPriceHint from './AIPriceHint';
import { smartMemory, MEMORY_KEYS } from '@/lib/ai/smart-memory';

export type Mode = "analizza" | "stima";

type Props = {
  mode: Mode;
  onClose: () => void;
  presetCategoryId?: string | null;
};

export default function Wizard({ mode: initialMode, onClose, presetCategoryId }: Props) {
  const [mode, setMode] = useState<"analizza" | "stima">(initialMode);
  const [step, setStep] = useState(presetCategoryId ? 2 : 1);
  const [categoryId, setCategoryId] = useState<string>(presetCategoryId || "");
  const [jobId, setJobId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [price, setPrice] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showPdfUpload, setShowPdfUpload] = useState(false);

  // FIX #3: AUTOSAVE & RECOVERY LOGIC
  useEffect(() => {
    const saved = localStorage.getItem(`wizard_autosave_${mode}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCategoryId(data.categoryId || "");
        setJobId(data.jobId || null);
        setRegionId(data.regionId || "");
        setQuantity(data.quantity || "");
        setFieldValues(data.fieldValues || {});
        setPrice(data.price || "");
        setNotes(data.notes || "");
        if (data.step > 1) setStep(data.step);
        
        toast.info("Abbiamo ripristinato i dati della tua ultima sessione.");
      } catch (e) {
        console.error("Failed to restore wizard data", e);
      }
    }
  }, [mode]);

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
    localStorage.setItem(`wizard_autosave_${mode}`, JSON.stringify(data));
  }, [categoryId, jobId, regionId, quantity, fieldValues, price, notes, step, mode]);

  // Pre-fill last used region and category from smart memory
  useEffect(() => {
    const lastRegion = smartMemory.recall(MEMORY_KEYS.LAST_REGION);
    const lastCategory = smartMemory.recall(MEMORY_KEYS.LAST_CATEGORY);
    if (lastRegion && !regionId) setRegionId(lastRegion as string);
    if (lastCategory && !categoryId && !presetCategoryId) setCategoryId(lastCategory as string);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      validation.errors?.forEach((err) => toast.error(err));
      return;
    }

    const validatedData = validation.data!;

    setLoading(true);
    try {
      const marketAnalysis = computeMarket(
        job,
        validatedData.quantity,
        validatedData.fieldValues,
        validatedData.regionId,
        validatedData.notes
      );
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
      // Pulisci l'autosave al completamento con successo
      localStorage.removeItem(`wizard_autosave_${mode}`);
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

    const result = await withErrorHandler(() => saveQuote(quote));
    if (result.success) {
      setSavedThisRun(true);
      toast.success("Preventivo salvato nell'archivio!");
    } else {
      toast.error("Errore nel salvataggio: " + result.error.message);
    }
  };

  if (step === 4 && analysis && verdict) {
    return (
      <ResultsView
        mode={mode}
        job={job!}
        category={category!}
        categoryId={categoryId}
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
          localStorage.removeItem(`wizard_autosave_${mode}`);
        }}
        onEdit={() => setStep(2)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl my-auto bg-background rounded-[2.5rem] border border-border/60 shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]"
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/30 px-5 sm:px-8 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
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

        <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-6 sm:space-y-8">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Cosa vuoi analizzare?</h2>
                <p className="text-muted-foreground">Seleziona la categoria del lavoro per iniziare.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoryId(cat.id);
                      setJobId(null);
                      setStep(2);
                    }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                      categoryId === cat.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-card border-border/40 hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </div>
                    <div>
                      <div className="font-bold">{cat.label}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{cat.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && category && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-bold">{category.label}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Dettagli del lavoro</h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Tipo di intervento</Label>
                  <Select value={jobId || ""} onValueChange={setJobId}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Seleziona lavoro specifico..." />
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

                {job && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Regione</Label>
                        <Select value={regionId} onValueChange={setRegionId}>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Seleziona regione..." />
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
                      <div className="space-y-2">
                        <Label>Quantità ({job.unitLabel})</Label>
                        <Input
                          type="number"
                          placeholder={`Es: ${job.unitLabel === "mq" ? "50" : "1"}`}
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    {job.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label>{field.label}</Label>
                        <Select
                          value={fieldValues[field.id] || ""}
                          onValueChange={(val) =>
                            setFieldValues((prev) => ({ ...prev, [field.id]: val }))
                          }
                        >
                          <SelectTrigger className="h-12 rounded-xl">
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
                  </>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {mode === "analizza" ? "Prezzo del preventivo" : "Note aggiuntive"}
                </h2>
                <p className="text-muted-foreground">
                  {mode === "analizza" 
                    ? "Inserisci il totale del preventivo ricevuto per confrontarlo con i prezzi di mercato."
                    : "Aggiungi dettagli extra per affinare la stima (es. difficoltà accesso, urgenza)."}
                </p>
              </div>

              <div className="space-y-6">
                {mode === "analizza" && (
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Euro className="w-6 h-6" />
                      </div>
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="h-20 pl-12 text-3xl font-black rounded-3xl border-2 focus:border-primary transition-all"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                      <Lightbulb className="w-5 h-5 text-primary shrink-0" />
                      <p className="text-sm">
                        Puoi anche caricare il PDF per estrarre i dati automaticamente.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-dashed gap-2"
                      onClick={() => setShowPdfUpload(true)}
                    >
                      <FileUp className="w-5 h-5" />
                      Carica PDF Preventivo
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Note o dettagli particolari (opzionale)</Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Esempio: lavori in centro storico, accesso difficile, materiali di pregio..."
                    className="w-full min-h-[120px] p-4 rounded-2xl bg-background border border-input focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-md border-t border-border/30 px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between gap-4 flex-shrink-0">
          {step > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              className="h-12 px-6 rounded-xl gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Indietro
            </Button>
          ) : (
            <div />
          )}

          <Button
            onClick={step === 3 ? runAnalysis : () => setStep(step + 1)}
            disabled={
              (step === 1 && !categoryId) ||
              (step === 2 && !canStep2Next) ||
              (step === 3 && !canStep3Next) ||
              loading
            }
            className="h-12 px-8 rounded-xl font-bold gap-2 min-w-[140px] shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisi in corso...
              </>
            ) : step === 3 ? (
              <>
                {mode === "analizza" ? "Analizza Ora" : "Genera Stima"}
                <Zap className="w-4 h-4 fill-current" />
              </>
            ) : (
              <>
                Avanti
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPdfUpload && (
          <PdfUploadZone
            onClose={() => setShowPdfUpload(false)}
            onPriceDetected={handlePdfPriceDetected}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
