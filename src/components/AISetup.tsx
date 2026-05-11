/**
 * AISetup — Gestione Multi-Token con Auto-Fallback
 */

import { useState, useEffect } from "react";
import { Key, ExternalLink, Check, X, Shield, Brain, Zap, Sparkles, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { llmKeys, PROVIDERS, type Provider } from "@/lib/ai/llm-provider";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

const PROVIDER_INFO = {
  [PROVIDERS.GEMINI]: { name: "Google Gemini", icon: Star, url: "https://aistudio.google.com/app/apikey", prefix: "AIzaSy" },
  [PROVIDERS.GROQ]: { name: "Groq Cloud", icon: Zap, url: "https://console.groq.com/keys", prefix: "gsk_" },
  [PROVIDERS.OPENROUTER]: { name: "OpenRouter", icon: Sparkles, url: "https://openrouter.ai/keys", prefix: "sk-or-" },
  [PROVIDERS.HF]: { name: "HuggingFace", icon: Brain, url: "https://huggingface.co/settings/tokens", prefix: "hf_" },
};

export default function AISetup({ open, onClose, onConfigured }: Props) {
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (open) setTokens(llmKeys.getAllTokens());
  }, [open]);

  async function saveToken(p: Provider, val: string) {
    const trimmed = val.trim();
    if (!trimmed) return;

    setLoading(p);
    try {
      // Validazione base del prefisso
      const info = PROVIDER_INFO[p];
      if (info.prefix && !trimmed.startsWith(info.prefix)) {
        toast.error(`Il token ${info.name} dovrebbe iniziare con ${info.prefix}`);
      }

      llmKeys.setToken(p, trimmed);
      setTokens(prev => ({ ...prev, [p]: trimmed }));
      toast.success(`${info.name} configurato`);
      onConfigured();
    } finally {
      setLoading(null);
    }
  }

  function removeToken(p: Provider) {
    localStorage.removeItem("preventivi_ai_token_" + p);
    setTokens(prev => {
      const next = { ...prev };
      delete next[p];
      return next;
    });
    toast.info(`Token ${PROVIDER_INFO[p].name} rimosso`);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Key className="h-6 w-6 text-primary" />
            Configurazione AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <p className="text-sm text-muted-foreground">
            L'app proverà i provider in ordine (Gemini → Groq → OpenRouter → HF). 
            Se uno finisce i crediti, passerà automaticamente al successivo.
          </p>

          <div className="space-y-4">
            {(Object.entries(PROVIDER_INFO) as [Provider, any][]).map(([id, info]) => (
              <div key={id} className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    <info.icon className="h-4 w-4 text-primary" />
                    {info.name}
                  </div>
                  <a href={info.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Ottieni chiave <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder={tokens[id] ? "••••••••••••••••" : `Incolla chiave ${info.name}...`}
                    className="h-10 bg-background font-mono text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveToken(id, (e.target as HTMLInputElement).value);
                    }}
                    onBlur={(e) => {
                      if (e.target.value) saveToken(id, e.target.value);
                    }}
                  />
                  {tokens[id] && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-destructive hover:bg-destructive/10"
                      onClick={() => removeToken(id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex gap-3 items-start">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-primary/80 leading-relaxed">
              <strong>Privacy Totale</strong>: Le chiavi sono salvate solo nel tuo browser. 
              Nessun dato viene inviato ai nostri server, la connessione è diretta tra te e il provider AI.
            </p>
          </div>

          <Button onClick={onClose} className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20">
            Chiudi e Inizia
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
