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
        {result?.steps && result.steps.length > 0 && (
          <div className="w-full max-w-xs space-y-2 mt-2">
            {result.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 text-[10px] text-muted-foreground/70 font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
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
          'rounded-[2.5rem] border p-8 space-y-6 shadow-2xl',
          result.success
            ? 'border-emerald-500/25 bg-emerald-500/5'
            : 'border-rose-500/25 bg-rose-500/5'
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-5">
          <div className={cn(
            'shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl border shadow-inner',
            result.success ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-rose-500/15 border-rose-500/30'
          )}>
            {result.success
              ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              : <AlertCircle className="w-6 h-6 text-rose-400" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground tracking-tight">
              {result.success ? 'Preventivo estratto con successo' : "Errore nell'estrazione"}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Confidenza:</span>
              <span className={cn('text-[10px] font-black uppercase tracking-widest', result.success ? 'text-emerald-400' : 'text-rose-400')}>
                {result.confidence.toFixed(0)}%
              </span>
              {result.classification && (
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground/70 text-[9px] font-black uppercase tracking-tighter">
                  {result.classification}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Extracted Data */}
        {result.quote && (
          <div className="rounded-[1.5rem] border border-white/8 bg-card/30 p-6 grid grid-cols-2 gap-6">
            {result.quote.numero && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Numero</p>
                <p className="text-sm font-black text-foreground mt-1 tracking-tight">{result.quote.numero}</p>
              </div>
            )}
            {result.quote.cliente?.nome && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Cliente</p>
                <p className="text-sm font-black text-foreground mt-1 tracking-tight">{result.quote.cliente.nome}</p>
              </div>
            )}
            {result.quote.ambito && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Ambito</p>
                <p className="text-sm font-black text-foreground mt-1 tracking-tight">{result.quote.ambito}</p>
              </div>
            )}
            {result.quote.totale != null && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Importo Totale</p>
                <p className="text-lg font-black text-primary mt-1 tracking-tighter">€{result.quote.totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
              </div>
            )}
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/5 p-5 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/80">Avvertenze Tecniche</p>
            {result.warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-300/80 font-medium leading-relaxed">· {w}</p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="flex-1 h-12 gap-2 rounded-2xl"
          >
            <RotateCcw className="w-4 h-4" /> Carica altro
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
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-6 text-center">
        {/* Icon */}
        <div className={cn(
          'flex items-center justify-center w-16 h-16 rounded-[1.5rem] transition-all duration-300 border',
          dragActive
            ? 'bg-primary/20 border-primary/40 scale-110 shadow-lg shadow-primary/20'
            : 'bg-white/5 border-white/10 group-hover:bg-primary/10 group-hover:border-primary/25'
        )}>
          <FileUp className={cn(
            'w-8 h-8 transition-colors duration-300',
            dragActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
          )} />
        </div>

        <div className="space-y-1">
          <p className="text-base font-black text-foreground uppercase tracking-tight">
            {dragActive ? 'Rilascia il PDF qui' : 'Carica il preventivo PDF'}
          </p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">
            Trascina il file oppure clicca per selezionarlo
          </p>
        </div>

        {/* Feature Pills */}
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

      {/* Dismiss */}
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
