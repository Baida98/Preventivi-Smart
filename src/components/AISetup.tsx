/**
 * AISetup — Dialog per configurare il token AI
 * Supporta HuggingFace, Groq e OpenRouter.
 */

import { useState } from "react";
import { Key, ExternalLink, Check, X, Shield, Brain, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { llmKeys, PROVIDERS, type Provider } from "@/lib/ai/llm-provider";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

const PROVIDER_CONFIG = {
  [PROVIDERS.HF]: {
    name: "HuggingFace",
    icon: Brain,
    url: "https://huggingface.co/settings/tokens/new?tokenType=read",
    placeholder: "hf_xxxxxxxxxxxxxxxxxxxx",
    prefix: "hf_",
    description: "Modelli Qwen 2.5 & Llama 3.3 gratuiti."
  },
  [PROVIDERS.GROQ]: {
    name: "Groq",
    icon: Zap,
    url: "https://console.groq.com/keys",
    placeholder: "gsk_xxxxxxxxxxxxxxxxxxxx",
    prefix: "gsk_",
    description: "L'AI più veloce al mondo (Llama 3.3)."
  },
  [PROVIDERS.OPENROUTER]: {
    name: "OpenRouter",
    icon: Sparkles,
    url: "https://openrouter.ai/keys",
    placeholder: "sk-or-xxxxxxxxxxxxxxxxxxxx",
    prefix: "sk-or-",
    description: "Accesso a tutti i modelli (Gemini, DeepSeek)."
  }
};

export default function AISetup({ open, onClose, onConfigured }: Props) {
  const [provider, setProvider] = useState<Provider>(llmKeys.getProvider());
  const [token, setToken] = useState(llmKeys.getToken());
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const trimmed = token.trim();
    if (!trimmed) return;

    const config = PROVIDER_CONFIG[provider];
    if (config.prefix && !trimmed.startsWith(config.prefix)) {
      setError(`Il token per ${config.name} deve iniziare con '${config.prefix}'.`);
      return;
    }

    setTesting(true);
    setError("");

    try {
      // Verifica con una chiamata leggera al provider scelto
      let isValid = false;
      
      if (provider === PROVIDERS.HF) {
        const resp = await fetch("https://huggingface.co/api/whoami", {
          headers: { Authorization: `Bearer ${trimmed}` },
        });
        isValid = resp.ok;
      } else if (provider === PROVIDERS.GROQ) {
        const resp = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { Authorization: `Bearer ${trimmed}` },
        });
        isValid = resp.ok;
      } else if (provider === PROVIDERS.OPENROUTER) {
        const resp = await fetch("https://openrouter.ai/api/v1/auth/key", {
          headers: { Authorization: `Bearer ${trimmed}` },
        });
        isValid = resp.ok;
      }

      if (!isValid) throw new Error("Invalid token");

      llmKeys.setCredentials(trimmed, provider);
      onConfigured();
      onClose();
    } catch {
      setError("Token non valido o errore di rete. Verifica la chiave API.");
    } finally {
      setTesting(false);
    }
  }

  const currentConfig = PROVIDER_CONFIG[provider];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Configura AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Scegli Provider</label>
            <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDER_CONFIG).map(([id, cfg]) => (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center gap-2">
                      <cfg.icon className="h-4 w-4 text-primary" />
                      <span>{cfg.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{currentConfig.description}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Chiave API</label>
            <Input
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              placeholder={currentConfig.placeholder}
              type="password"
              className="h-12 font-mono text-sm rounded-xl"
            />
            {error && (
              <p className="text-xs text-destructive font-medium">{error}</p>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Come ottenere la chiave
            </p>
            <a
              href={currentConfig.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              Ottieni chiave per {currentConfig.name} →
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
            <Shield className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
            <span>La chiave è salvata <strong>solo localmente</strong> nel tuo browser.</span>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={!token.trim() || testing}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              {testing ? (
                <span className="animate-pulse">Verifica in corso...</span>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Salva e Attiva
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} className="h-12 w-12 p-0 rounded-xl">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
