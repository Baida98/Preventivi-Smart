import React, { useRef, useState } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { runOCRPipeline, type OCRPipelineResult } from '../lib/ocr-pipeline';
  import { validateFileUpload } from '../lib/file-validator';
  import { Button } from './ui/button';
  import { Input } from './ui/input';
  import { Label } from './ui/label';
  import {
    AlertCircle,
    CheckCircle2,
    FileUp,
    Loader2,
    X,
    ShieldCheck,
    FileText,
    Zap,
    RotateCcw,
    PenLine,
  } from 'lucide-react';
  import { toast } from 'sonner';
  import { cn } from '@/lib/utils';

  interface PdfUploadZoneProps {
    onPriceDetected?: (price: number) => void;
    onQuoteExtracted?: (quote: any) => void;
    onDismiss: () => void;
    userId?: string;
  }

  const PdfUploadZone: React.FC<PdfUploadZoneProps> = ({
    onPriceDetected,
    onQuoteExtracted,
    onDismiss,
    userId = 'anonymous',
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<OCRPipelineResult | null>(null);
    const [dragActive, setDragActive] = useState(false);
    /** Prezzo inserito manualmente nel fallback form */
    const [manualPrice, setManualPrice] = useState('');

    const handleFile = async (file: File) => {
      const validation = validateFileUpload(file);
      if (!validation.success) {
        toast.error(validation.error);
        return;
      }

      setIsLoading(true);
      setResult(null);
      try {
        const pipelineResult = await runOCRPipeline(file, userId);
        setResult(pipelineResult);

        if (pipelineResult.success && pipelineResult.quote) {
          toast.success(`Preventivo estratto · Confidenza ${pipelineResult.confidence.toFixed(0)}%`);
          if (pipelineResult.quote.totale && onPriceDetected) {
            onPriceDetected(pipelineResult.quote.totale);
          }
          if (onQuoteExtracted) {
            onQuoteExtracted(pipelineResult.quote);
          }
        } else if (pipelineResult.requiresManualFallback) {
          // Pre-compila il campo manuale se abbiamo un valore parziale
          if (pipelineResult.quote?.totale) {
            setManualPrice(String(pipelineResult.quote.totale));
          }
          toast.error(pipelineResult.fallbackReason || "Lettura automatica non riuscita. Inserisci l'importo manualmente.");
        } else {
          toast.error(pipelineResult.error || 'Impossibile estrarre il preventivo dal PDF');
        }
      } catch (error) {
        console.error('Errore nella pipeline OCR:', error);
        toast.error("Errore durante l'elaborazione del PDF");
        setResult({
          success: false,
          classification: 'error',
          confidence: 0,
          warnings: [],
          steps: [],
          requiresManualFallback: true,
          fallbackReason: "Errore imprevisto. Inserisci l'importo manualmente.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const handleManualSubmit = () => {
      const price = parseFloat(manualPrice.replace(',', '.'));
      if (!price || price <= 0) {
        toast.error("Inserisci un importo valido (es. 1500)");
        return;
      }
      if (onPriceDetected) {
        onPriceDetected(price);
      }
      toast.success(`Importo confermato: €${price.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`);
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
      else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) handleFile(files[0]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFile(files[0]);
    };

    /* ── Loading State ── */
    if (isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/5 to-card/30 p-10 flex flex-col items-center justify-center gap-6 shadow-2xl"
        >
          <div className="relative flex items-center justify-center w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-base font-black text-foreground uppercase tracking-tight">Analisi PDF in corso…</p>
            <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest opacity-60">Estrazione automatica AI</p>
          </div>
        </motion.div>
      );
    }

    /* ── Manual Fallback State ── */
    if (result?.requiresManualFallback) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] border border-amber-500/25 bg-amber-500/5 p-8 space-y-6 shadow-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl border bg-amber-500/15 border-amber-500/30">
              <PenLine className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground tracking-tight">Inserimento Manuale Richiesto</h3>
              <p className="text-xs text-amber-300/80 font-medium mt-1 leading-relaxed">
                {result.fallbackReason ?? "La lettura automatica non è riuscita. Inserisci l'importo del preventivo."}
              </p>
            </div>
          </div>

          {/* Warnings se presenti */}
          {result.warnings.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1.5">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-[11px] text-amber-300/70 font-medium leading-relaxed">· {w}</p>
              ))}
            </div>
          )}

          {/* Manual price input */}
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-amber-400">
              Importo totale del preventivo (€)
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder="Es. 1500"
                className="h-14 rounded-2xl bg-background/40 border-amber-500/40 focus:border-amber-400 text-xl font-black pr-10 text-center"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-black text-amber-400/60">€</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleManualSubmit}
              disabled={!manualPrice || parseFloat(manualPrice.replace(',', '.')) <= 0}
              className="flex-1 h-12 rounded-2xl font-black bg-amber-500 hover:bg-amber-400 text-black"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Conferma Importo
            </Button>
            <Button
              variant="outline"
              onClick={() => { setResult(null); setManualPrice(''); }}
              className="h-12 rounded-2xl"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={onDismiss}
              className="h-12 w-12 p-0 rounded-2xl shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      );
    }

    /* ── Success Result State ── */
    if (result?.success) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] border border-emerald-500/25 bg-emerald-500/5 p-8 space-y-6 shadow-2xl"
        >
          <div className="flex items-start gap-5">
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl border bg-emerald-500/15 border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground tracking-tight">Preventivo estratto con successo</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Confidenza:</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  {result.confidence.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {result.quote && result.quote.totale != null && (
            <div className="rounded-[1.5rem] border border-white/8 bg-card/30 p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Importo Totale</p>
              <p className="text-2xl font-black text-primary mt-1 tracking-tighter">
                €{result.quote.totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/5 p-5 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/80">Avvertenze</p>
              {result.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-300/80 font-medium leading-relaxed">· {w}</p>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => { setResult(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="flex-1 h-12 gap-2 rounded-2xl"
            >
              <RotateCcw className="w-4 h-4" /> Carica altro
            </Button>
            <Button variant="outline" onClick={onDismiss} className="h-12 w-12 p-0 rounded-2xl shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      );
    }

    /* ── Upload State ── */
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative rounded-[2.5rem] border-2 border-dashed p-10 cursor-pointer transition-all duration-300 group',
          dragActive
            ? 'border-primary/60 bg-primary/8 shadow-[0_0_40px_-10px_hsl(200_95%_55%/0.4)]'
            : 'border-white/10 bg-gradient-to-br from-card/40 to-card/20 hover:border-primary/30 hover:bg-primary/5'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/jpeg,image/png"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className={cn(
            'flex items-center justify-center w-16 h-16 rounded-[1.5rem] transition-all duration-300 border',
            dragActive
              ? 'bg-primary/20 border-primary/40 scale-110 shadow-lg shadow-primary/20'
              : 'bg-white/5 border-white/10 group-hover:bg-primary/10 group-hover:border-primary/25'
          )}>
            <FileUp className={cn('w-8 h-8 transition-colors duration-300', dragActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')} />
          </div>

          <div className="space-y-1">
            <p className="text-base font-black text-foreground uppercase tracking-tight">
              {dragActive ? 'Rilascia il PDF qui' : 'Carica il preventivo PDF'}
            </p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">
              Trascina il file oppure clicca per selezionarlo
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {[
              { icon: FileText, label: 'PDF nativo' },
              { icon: Zap, label: 'OCR automatico' },
              { icon: ShieldCheck, label: 'Privacy protetta' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  };

  export default PdfUploadZone;
  