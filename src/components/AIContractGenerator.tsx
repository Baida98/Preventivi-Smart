/**
 * AIContractGenerator — Genera template contrattuale scaricabile
 *
 * Permette all'utente di generare un contratto professionale personalizzato
 * per il tipo di lavoro specifico, scaricabile come file .txt.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Loader2, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateContractTemplate, formatContractAsText } from "@/lib/ai/contract-template";
import { llmKeys } from "@/lib/ai/llm-provider";
import { cn } from "@/lib/utils";

interface Props {
  categoryId: string;
  jobLabel: string;
  price: number;
  regionLabel: string;
  quantity: number;
  unitLabel: string;
  onNeedSetup: () => void;
}

export default function AIContractGenerator({
  categoryId, jobLabel, price, regionLabel, quantity, unitLabel, onNeedSetup,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const hasToken = llmKeys.hasToken();

  const handleGenerate = async () => {
    if (!hasToken) { onNeedSetup(); return; }
    setLoading(true);
    const template = await generateContractTemplate({
      jobLabel, categoryId, price, regionLabel, quantity, unitLabel,
    });
    if (template) {
      const text = formatContractAsText(template, { jobLabel, regionLabel, price });
      setPreview(text);
      setGenerated(true);
      setExpanded(true);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (!preview) return;
    const blob = new Blob([preview], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contratto-${jobLabel.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="overflow-hidden border border-border/50">
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
          <FileText className="h-6 w-6 text-indigo-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold">Template Contrattuale AI</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Genera un contratto professionale personalizzato per questo lavoro
          </p>
        </div>

        <div className="flex items-center gap-2">
          {generated && (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              Scarica
            </Button>
          )}
          <Button
            size="sm"
            onClick={generated ? () => setExpanded(!expanded) : handleGenerate}
            disabled={loading}
            className={cn("gap-1.5 text-xs", generated ? "border-indigo-500/50 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20" : "")}
            variant={generated ? "outline" : "default"}
          >
            {loading ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generazione…</>
            ) : !hasToken ? (
              <><Lock className="h-3.5 w-3.5" />Configura AI</>
            ) : generated ? (
              expanded ? <><ChevronUp className="h-3.5 w-3.5" />Nascondi</> : <><ChevronDown className="h-3.5 w-3.5" />Mostra</>
            ) : (
              <><FileText className="h-3.5 w-3.5" />Genera Contratto</>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && preview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-border/30 bg-muted/20 p-4">
              <pre className="whitespace-pre-wrap text-xs font-mono text-foreground/80 leading-relaxed max-h-72 overflow-y-auto">
                {preview}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
