/**
 * AIChat — Consulente AI in streaming per il preventivo corrente
 *
 * Pannello chat collassabile che appare nella schermata Results.
 * Il sistema prompt include tutti i dati del preventivo per risposte
 * contestuali. Usa streamLLM (HF Router) con Mistral-Nemo per velocità.
 *
 * Funzionalità:
 *   - Domande predefinite per chi non sa da dove iniziare
 *   - Streaming token-by-token in tempo reale
 *   - Stop generazione a metà
 *   - Storico conversazione (max 10 scambi)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareDashed,
  Send,
  Square,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { streamLLM, llmKeys } from "@/lib/ai/llm-provider";
import type { Verdict } from "@/lib/verdict";
import { fmtEUR } from "@/lib/format";

interface Props {
  price: number;
  categoryId: string;
  jobLabel: string;
  regionLabel: string;
  quantity: number;
  unitLabel: string;
  verdict: Verdict;
  marketMin: number;
  marketMid: number;
  marketMax: number;
  onNeedSetup?: () => void;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const STARTER_QUESTIONS = [
  "Come posso negoziare il prezzo?",
  "Quali clausole di garanzia devo richiedere?",
  "Questo preventivo è completo o mancano voci?",
  "Quali materiali devo verificare prima di accettare?",
];

function buildSystemPrompt(p: Omit<Props, "onNeedSetup">): string {
  const diffPct = Math.round(((p.price - p.marketMid) / p.marketMid) * 100);
  return `Sei un consulente esperto di preventivi italiani per lavori edili e impiantistici.
L'utente ti chiede informazioni sul suo preventivo:

PREVENTIVO IN ESAME:
- Lavoro: ${p.jobLabel}
- Categoria: ${p.categoryId}
- Regione: ${p.regionLabel}
- Quantità: ${p.quantity} ${p.unitLabel}
- Prezzo richiesto: ${fmtEUR(p.price)}
- Benchmark mercato: min ${fmtEUR(p.marketMin)} — medio ${fmtEUR(p.marketMid)} — max ${fmtEUR(p.marketMax)}
- Scostamento: ${diffPct >= 0 ? "+" : ""}${diffPct}%
- Verdetto: ${p.verdict.label} (${p.verdict.key})

REGOLE:
- Rispondi SEMPRE in italiano
- Sii diretto e pratico (max 120 parole per risposta)
- Dai consigli concreti specifici per ${p.categoryId} in ${p.regionLabel}
- Non inventare dati non presenti nel preventivo
- Se non sai qualcosa, dillo chiaramente`;
}

export default function AIChat(props: Props) {
  const { onNeedSetup } = props;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
      if (!llmKeys.hasToken()) {
        onNeedSetup?.();
        return;
      }

      const userMsg: ChatMsg = { role: "user", content: text };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setIsStreaming(true);
      abortRef.current = false;

      // Placeholder streaming message
      setMessages((m) => [...m, { role: "assistant", content: "", streaming: true }]);

      const history = [...messages, userMsg]
        .slice(-10)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      try {
        await streamLLM(
          [{ role: "system", content: buildSystemPrompt(props) }, ...history],
          (chunk) => {
            if (abortRef.current) return;
            setMessages((m) => {
              const last = m[m.length - 1];
              if (!last || last.role !== "assistant") return m;
              return [...m.slice(0, -1), { ...last, content: last.content + chunk }];
            });
          },
          { model: "fast", temperature: 0.5, maxTokens: 350 }
        );
      } catch {
        setMessages((m) => {
          const last = m[m.length - 1];
          if (last?.role === "assistant") {
            return [
              ...m.slice(0, -1),
              { ...last, content: "Errore nella risposta. Riprova tra qualche secondo.", streaming: false },
            ];
          }
          return m;
        });
      } finally {
        setIsStreaming(false);
        setMessages((m) => {
          const last = m[m.length - 1];
          if (last?.role === "assistant") {
            return [...m.slice(0, -1), { ...last, streaming: false }];
          }
          return m;
        });
      }
    },
    [messages, isStreaming, props, onNeedSetup]
  );

  if (!llmKeys.hasToken()) return null;

  return (
    <Card className="border-primary/10 overflow-hidden">
      {/* Header toggle */}
      <button
        className="flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-muted/30"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <MessageSquareDashed className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold">Consulente AI</p>
          <p className="text-xs text-muted-foreground">
            Fai domande sul tuo preventivo
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary/40" />
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-border/50"
          >
            {/* Messages */}
            <div className="max-h-72 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground mb-3">
                    Domande frequenti:
                  </p>
                  {STARTER_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground/80 hover:bg-muted/60 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-foreground"
                    }`}
                  >
                    {m.content || (m.streaming ? <span className="animate-pulse opacity-60">●●●</span> : "")}
                  </div>
                  {m.role === "user" && (
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-border/50 p-3 flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Chiedi qualcosa sul tuo preventivo..."
                className="min-h-0 h-10 resize-none text-sm py-2 leading-normal"
                rows={1}
              />
              <Button
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                onClick={
                  isStreaming
                    ? () => { abortRef.current = true; setIsStreaming(false); }
                    : () => sendMessage(input)
                }
                disabled={!isStreaming && !input.trim()}
              >
                {isStreaming ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
