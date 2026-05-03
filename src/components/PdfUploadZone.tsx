import React, { useRef, useState } from 'react';
import { runOCRPipeline, type OCRPipelineResult } from '../lib/ocr-pipeline';
import { Spinner } from './ui/spinner';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle2, FileUp, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

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
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.includes('pdf')) {
      toast({
        title: 'Errore',
        description: 'Per favore carica un file PDF',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const pipelineResult = await runOCRPipeline(file, userId);
      setResult(pipelineResult);

      if (pipelineResult.success && pipelineResult.quote) {
        toast({
          title: 'Successo',
          description: `Quote estratto con confidenza ${pipelineResult.confidence.toFixed(0)}%`,
        });

        if (pipelineResult.quote.total && onPriceDetected) {
          onPriceDetected(pipelineResult.quote.total);
        }

        if (onQuoteExtracted) {
          onQuoteExtracted(pipelineResult.quote);
        }
      } else {
        toast({
          title: 'Avvertenza',
          description: pipelineResult.error || 'Impossibile estrarre il quote dal PDF',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Errore nella pipeline OCR:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'elaborazione del PDF',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-gray-700">Elaborazione PDF in corso...</p>
        <div className="w-full max-w-md space-y-2">
          {result?.steps.map((step, idx) => (
            <div key={idx} className="text-xs text-gray-600 flex items-start gap-2">
              <span className="flex-shrink-0">{step.split(' ')[0]}</span>
              <span>{step.substring(step.indexOf(' ') + 1)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="p-6 border-2 rounded-lg bg-white space-y-4">
        <div className="flex items-start gap-3">
          {result.success ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {result.success ? 'Quote estratto con successo' : 'Errore nell\'estrazione'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Confidenza: {result.confidence.toFixed(0)}% ({result.classification})
            </p>
          </div>
        </div>

        {result.steps.length > 0 && (
          <div className="bg-gray-50 p-4 rounded space-y-2">
            <p className="text-xs font-semibold text-gray-700">Passaggi eseguiti:</p>
            {result.steps.map((step, idx) => (
              <div key={idx} className="text-xs text-gray-600">
                {step}
              </div>
            ))}
          </div>
        )}

        {result.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded space-y-2">
            <p className="text-xs font-semibold text-yellow-800">Avvertenze:</p>
            {result.warnings.map((warning, idx) => (
              <div key={idx} className="text-xs text-yellow-700">
                • {warning}
              </div>
            ))}
          </div>
        )}

        {result.quote && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded space-y-2">
            <p className="text-xs font-semibold text-blue-900">Dati estratti:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Quote:</span>
                <p className="font-medium">{result.quote.quoteNumber}</p>
              </div>
              <div>
                <span className="text-gray-600">Cliente:</span>
                <p className="font-medium">{result.quote.clientName}</p>
              </div>
              <div>
                <span className="text-gray-600">Settore:</span>
                <p className="font-medium">{result.quote.sector}</p>
              </div>
              <div>
                <span className="text-gray-600">Totale:</span>
                <p className="font-medium">€{result.quote.total?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setResult(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            variant="outline"
            className="flex-1"
          >
            Carica un altro PDF
          </Button>
          <Button onClick={onDismiss} variant="outline" className="flex-1">
            Chiudi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
        dragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-3">
        <FileUp className="w-12 h-12 text-gray-400" />
        <div className="text-center">
          <p className="font-semibold text-gray-900">Carica un preventivo PDF</p>
          <p className="text-sm text-gray-600 mt-1">
            Trascina il file qui o clicca per selezionarlo
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supportati: PDF nativi e scansionati (con OCR)
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-300 space-y-2">
        <p className="text-xs font-semibold text-gray-700">Cosa faremo:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>✓ Classificazione del PDF (nativo vs scansionato)</li>
          <li>✓ Estrazione testo con OCR se necessario</li>
          <li>✓ Parsing strutturato dei dati</li>
          <li>✓ Validazione qualità e confidenza</li>
          <li>✓ Estrazione prezzi e servizi</li>
        </ul>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={onDismiss} variant="outline" className="w-full">
          Chiudi
        </Button>
      </div>
    </div>
  );
};

export default PdfUploadZone;
