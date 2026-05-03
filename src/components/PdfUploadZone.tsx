import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { runOCRPipeline, type OCRPipelineResult } from '../lib/ocr-pipeline';
import { Button } from './ui/button';
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

  const handleFile = async (file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('Per favore carica un file PDF');
      return;
    }

    setIsLoading(true);
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
      } else {
        toast.error(pipelineResult.error || 'Impossibile estrarre il preventivo dal PDF');
      }
    } catch (error) {
      console.error('Errore nella pipeline OCR:', error);
      toast.error("Errore durante l'elaborazione del PDF");
    } finally {
      setIsLoading(false);
    }
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
        className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/30 p-8 flex flex-col items-center justify-center gap-5 shadow-xl"
      >
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-primary/15 ring-1 ring-primary/30">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-foreground">Analisi PDF in corso…</p>
          <p className="text-xs text-muted-foreground mt-1">Estrazione e classificazione automatica</p>
        </div>
        {result?.steps && result.steps.length > 0 && (
          <div className="w-full max-w-xs space-y-1.5">
            {result.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
                <div className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  /* ── Result State ── */
  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'rounded-3xl border p-6 space-y-4 shadow-xl',
          result.success
            ? 'border-emerald-500/25 bg-emerald-500/5'
            : 'border-rose-500/25 bg-rose-500/5'
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn(
            'shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl',
            result.success ? 'bg-emerald-500/15 ring-1 ring-emerald-500/30' : 'bg-rose-500/15 ring-1 ring-rose-500/30'
          )}>
            {result.success
              ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              : <AlertCircle className="w-5 h-5 text-rose-400" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">
              {result.success ? 'Preventivo estratto con successo' : "Errore nell'estrazione"}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Confidenza: <span className={cn('font-bold', result.success ? 'text-emerald-400' : 'text-rose-400')}>
                {result.confidence.toFixed(0)}%
              </span>
              {result.classification && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground/70 text-[10px] font-medium">
                  {result.classification}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Extracted Data */}
        {result.quote && (
          <div className="rounded-2xl border border-white/8 bg-card/30 p-4 grid grid-cols-2 gap-3">
            {result.quote.numero && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Numero</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{result.quote.numero}</p>
              </div>
            )}
            {result.quote.cliente?.nome && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Cliente</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{result.quote.cliente.nome}</p>
              </div>
            )}
            {result.quote.ambito && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Ambito</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{result.quote.ambito}</p>
              </div>
            )}
            {result.quote.totale != null && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Totale</p>
                <p className="text-sm font-black text-primary mt-0.5">€{result.quote.totale.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Avvertenze</p>
            {result.warnings.map((w, i) => (
              <p key={i} className="text-[11px] text-amber-300/80 font-medium">· {w}</p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="flex-1 h-10 gap-2 rounded-2xl text-xs font-bold border-white/10 bg-white/5 hover:bg-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Carica altro
          </Button>
          <Button
            variant="outline"
            onClick={onDismiss}
            className="h-10 w-10 p-0 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 shrink-0"
          >
            <X className="w-4 h-4" />
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
        'relative rounded-3xl border-2 border-dashed p-8 cursor-pointer transition-all duration-300 group',
        dragActive
          ? 'border-primary/60 bg-primary/8 shadow-[0_0_30px_-10px_hsl(200_95%_55%/0.3)]'
          : 'border-white/10 bg-gradient-to-br from-card/40 to-card/20 hover:border-primary/30 hover:bg-primary/5'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-4 text-center">
        {/* Icon */}
        <div className={cn(
          'flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300',
          dragActive
            ? 'bg-primary/20 ring-1 ring-primary/40 scale-110'
            : 'bg-white/5 ring-1 ring-white/10 group-hover:bg-primary/10 group-hover:ring-primary/25'
        )}>
          <FileUp className={cn(
            'w-7 h-7 transition-colors duration-300',
            dragActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
          )} />
        </div>

        <div>
          <p className="text-sm font-black text-foreground">
            {dragActive ? 'Rilascia il PDF qui' : 'Carica il preventivo PDF'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Trascina il file oppure clicca per selezionarlo
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {[
            { icon: FileText, label: 'PDF nativo' },
            { icon: Zap, label: 'OCR automatico' },
            { icon: ShieldCheck, label: 'Estrazione sicura' },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
              <Icon className="w-3 h-3" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export default PdfUploadZone;
