/**
 * AISetup — Dialog per configurare il token HuggingFace gratuito
 *
 * Permette all'utente di inserire il proprio HF token per attivare
 * tutte le funzioni AI (analisi PDF, verdict enhancement, chat).
 * Il token viene salvato in localStorage e non viene mai trasmesso
 * ai nostri server — va direttamente a HuggingFace.
 */

import { useState } from "react";
import { Key, ExternalLink, Check, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { llmKeys } from "@/lib/ai/llm-provider";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

export default function AISetup({ open, onClose, onConfigured }: Props) {
  const [token, setToken] = useState("");
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const trimmed = token.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith("hf_")) {
      setError("Il token deve iniziare con 'hf_' — controlla di aver copiato il token corretto.");
      return;
    }

    setTesting(true);
    setError("");

    try {
      // Salva e verifica con una chiamata leggera
      llmKeys.setToken(trimmed);
      const resp = await fetch("https://huggingface.co/api/whoami", {
        headers: { Authorization: `Bearer ${trimmed}` },
      });
      if (!resp.ok) throw new Error(`Errore ${resp.status}`);
      onConfigured();
      onClose();
      setToken("");
    } catch {
      setError("Token non valido o errore di rete. Verifica il token e riprova.");
      llmKeys.clearToken();
    } finally {
      setTesting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Attiva AI Gratuita
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <p className="text-sm text-muted-foreground leading-relaxed">
            L'AI analizza i tuoi preventivi in profondità: rileva anomalie,
            suggerisce come trattare e risponde alle tue domande. Usa modelli
            top-tier (Qwen 72B, Llama 70B) tramite HuggingFace — <strong>gratuito</strong>.
          </p>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Come ottenere il token (2 minuti)
            </p>
            <ol className="text-sm space-y-1 text-foreground/80 list-decimal list-inside">
              <li>Crea account gratuito su HuggingFace</li>
              <li>Vai su Settings → Access Tokens</li>
              <li>Crea un token con permesso "Read"</li>
              <li>Incollalo qui sotto</li>
            </ol>
            <a
              href="https://huggingface.co/settings/tokens/new?tokenType=read"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-1 text-sm text-primary underline underline-offset-4"
            >
              <ExternalLink className="h-4 w-4" />
              Crea token gratuito →
            </a>
          </div>

          <div className="space-y-2">
            <Input
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
              type="password"
              className="font-mono text-sm"
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 flex-shrink-0" />
            Il token è salvato solo nel tuo browser — non raggiunge mai i nostri server.
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={!token.trim() || testing}
              className="flex-1"
            >
              {testing ? (
                <span className="animate-pulse">Verifica in corso...</span>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Salva e attiva AI
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} className="h-10 w-10 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
