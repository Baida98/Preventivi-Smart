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
import { MARKET_INDICATORS } from "@/lib/market-config";
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
  const [zoneId, setZoneId] = useState<string>("urbana");
  const [propertyTypeId, setPropertyTypeId] = useState<string>("appartamento-standard");

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [savedThisRun, setSavedThisRun] = useState(false);
  const [showPdfUpload, setShowPdfUpload] = useState(false);

  const job: Job | null = jobId ? findJob(jobId) ?? null : null;
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
      const logisticsData = { zoneId, propertyTypeId };
      const marketAnalysis = computeMarket(
        job,
        regionId,
        Number(quantity),
        fieldValues,
        logisticsData
      );
      setAnalysis(marketAnalysis);

      if (mode === "analizza") {
        if (!price) {
          toast.error("Inserisci il prezzo del preventivo");
          setLoading(false);
          return;
        }
        const v = judge(Number(price), marketAnalysis);
        setVerdict(v);
      } else {
        const v = judge(marketAnalysis.marketMid, marketAnalysis);
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

    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return;

    const now = new Date().toISOString();
    const today = now.split("T")[0];
    const totale = mode === "analizza" ? Number(price) : analysis.marketMid;

    const partialQuote = {
      id: newId(),
      numero: "DRAFT",
      uid: "guest",
      data: today,
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
      data: today,
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
    };

    try {
      saveQuote(quote);
      setSavedThisRun(true);
      const qScore = validationResult.qualityScore;
      if (qScore >= 80) {
        toast.success(`✅ Preventivo salvato · Qualità ${qScore}/100`);
      } else if (qScore >= 50) {
        toast.success(`✅ Preventivo salvato · Qualità ${qScore}/100`);
      } else {
        toast.success(`✅ Preventivo salvato`);
      }
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
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {categoryId ? `Quale ${category?.label.toLowerCase()}?` : "Cosa analizziamo?"}
            </h2>
            <p className="mt-3 text-base text-muted-foreground/80 font-medium">
              {categoryId
                ? "Scegli il lavoro più simile al tuo."
                : "Seleziona la categoria del lavoro."}
            </p>

            {!categoryId && (
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {CATEGORIES.map((c) => (
                  <motion.button
                    key={c.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCategoryId(c.id)}
                    className="group relative text-left rounded-3xl border border-white/10 bg-gradient-to-br from-card/60 to-card/30 p-6 hover:border-primary/30 transition-all shadow-lg hover:shadow-xl hover:shadow-primary/10"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/15 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      <c.Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" strokeWidth={2} />
                    </div>
                    <h3 className="mt-4 text-base font-black leading-tight text-foreground">
                      {c.label}
                    </h3>
                    <p className="mt-1.5 text-[12px] text-muted-foreground/70 font-medium">
                      {c.jobs.length} opzioni
                    </p>
                  </motion.button>
                ))}
              </div>
            )}

            {categoryId && category && (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {category.jobs.map((j) => (
                  <motion.button
                    key={j.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => pickJob(j.id)}
                    className="group flex items-center justify-between text-left rounded-3xl border border-white/10 bg-gradient-to-br from-card/60 to-card/30 px-6 py-5 hover:border-primary/30 transition-all shadow-lg hover:shadow-xl hover:shadow-primary/10"
                  >
                    <div className="min-w-0">
                      <h3 className="text-base font-black leading-tight text-foreground">
                        {j.label}
                      </h3>
                      <p className="mt-1.5 text-[12px] text-muted-foreground/70 font-medium">
                        Da € {j.base}/{j.unit}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}

            <div className="mt-12 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => (categoryId ? setCategoryId(null) : onClose())}
                className="gap-2 h-12 px-6 font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                {categoryId ? "Indietro" : "Annulla"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && job && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Configura i dettagli
            </h2>
            <p className="mt-3 text-base text-muted-foreground/80 font-medium">
              Pochi dati essenziali per una stima accurata.
            </p>

            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 ring-1 ring-primary/30 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{category?.label}</span>
              <span className="text-muted-foreground">·</span>
              <span>{job.label}</span>
            </div>

            {/* Essentials: Region, Quantity, Fields */}
            <div className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  La tua Regione *
                </Label>
                <Select value={regionId} onValueChange={setRegionId}>
                  <SelectTrigger className="h-12 bg-card/60 border-white/10 rounded-2xl font-medium">
                    <SelectValue placeholder="Seleziona regione" />
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

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Quantità ({job.unitLabel}) *
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`Es. ${job.defaultQty ?? 1}`}
                  className="h-12 bg-card/60 border-white/10 rounded-2xl font-medium"
                />
              </div>

              {/* Job-specific fields */}
              {job.fields.map((f) => (
                <div key={f.id} className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    {f.label} *
                  </Label>
                  <Select
                    value={fieldValues[f.id] ?? ""}
                    onValueChange={(v) =>
                      setFieldValues((s) => ({ ...s, [f.id]: v }))
                    }
                  >
                    <SelectTrigger className="h-12 bg-card/60 border-white/10 rounded-2xl font-medium">
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

              {/* Logistics - Collapsible Advanced */}
              <details className="group">
                <summary className="cursor-pointer text-xs font-black uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors py-2">
                  ⚙️ Dettagli Logistica (opzionale)
                </summary>
                <div className="mt-4 space-y-4 pl-2 border-l border-white/5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground/70">Zona</Label>
                    <Select value={zoneId} onValueChange={setZoneId}>
                      <SelectTrigger className="h-10 bg-card/40 border-white/5 rounded-xl text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={8}>
                        {Object.entries(MARKET_INDICATORS.logistics.zones).map(([id, zone]) => (
                          <SelectItem key={id} value={id}>
                            {zone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground/70">Tipo Immobile</Label>
                    <Select value={propertyTypeId} onValueChange={setPropertyTypeId}>
                      <SelectTrigger className="h-10 bg-card/40 border-white/5 rounded-xl text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={8}>
                        {Object.entries(MARKET_INDICATORS.logistics.propertyType).map(([id, type]) => (
                          <SelectItem key={id} value={id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </details>
            </div>

            <div className="mt-10 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setJobId(null);
                  setStep(1);
                }}
                className="gap-2 h-12 px-6 font-bold"
              >
                <ArrowLeft className="w-4 h-4" /> Indietro
              </Button>
              <Button
                disabled={!canStep2Next || loading}
                onClick={() => {
                  if (mode === "analizza") setStep(3 as Step);
                  else runAnalysis();
                }}
                className="gap-2 ml-auto h-12 px-8 bg-primary text-primary-foreground glow-azure font-black"
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
                    Calcola <Sparkles className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Price Input (analizza) or Results (stima) */}
        {step === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {mode === "analizza" && !analysis ? (
              <>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Quanto ti hanno chiesto?
                </h2>
                <p className="mt-3 text-base text-muted-foreground/80 font-medium">
                  Inserisci il totale del preventivo oppure carica il PDF.
                </p>

                {/* PDF Upload */}
                <div className="mt-8">
                  <AnimatePresence mode="wait">
                    {showPdfUpload ? (
                      <motion.div
                        key="pdf"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                      >
                        <PdfUploadZone
                          onPriceDetected={(p) => {
                            setPrice(String(p));
                            setShowPdfUpload(false);
                          }}
                          onDismiss={() => setShowPdfUpload(false)}
                        />
                      </motion.div>
                    ) : (
                      <motion.button
                        key="pdf-toggle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPdfUpload(true)}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all"
                      >
                        <FileUp className="w-5 h-5 text-primary shrink-0" />
                        <div className="text-left">
                          <p className="text-sm font-bold text-primary">Carica PDF Preventivo</p>
                          <p className="text-[12px] text-muted-foreground">Estraiamo il prezzo automaticamente</p>
                        </div>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Price Input */}
                <div className="mt-8 mx-auto max-w-sm">
                  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-card/60 to-card/30 p-8 shadow-xl">
                    <Label className="text-[11px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                      Prezzo Ricevuto *
                    </Label>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-5xl sm:text-6xl font-black text-primary">€</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0"
                        className="text-4xl sm:text-5xl font-black bg-transparent border-none p-0 focus:outline-none text-primary placeholder:text-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="gap-2 h-12 px-6 font-bold"
                  >
                    <ArrowLeft className="w-4 h-4" /> Indietro
                  </Button>
                  <Button
                    disabled={!price || loading}
                    onClick={runAnalysis}
                    className="gap-2 ml-auto h-12 px-8 bg-primary text-primary-foreground glow-azure font-black"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Analisi…
                      </>
                    ) : (
                      <>
                        Analizza <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : analysis && verdict ? (
              <>
                <ResultsView
                  mode={mode}
                  job={job!}
                  category={category!}
                  regionLabel={REGIONS.find((r) => r.id === regionId)?.label ?? ""}
                  quantity={Number(quantity)}
                  price={Number(price) || analysis.marketMid}
                  analysis={analysis}
                  verdict={verdict}
                  savedThisRun={savedThisRun}
                  onSave={handleSave}
                  onReset={() => {
                    setStep(1);
                    setCategoryId(null);
                    setJobId(null);
                    setRegionId("");
                    setQuantity("");
                    setFieldValues({});
                    setPrice("");
                    setAnalysis(null);
                    setVerdict(null);
                    setSavedThisRun(false);
                  }}
                  onEdit={() => setStep(2)}
                />
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
