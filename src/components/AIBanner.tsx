/**
 * AIBanner — Banner promozionale per le funzioni AI di Preventivi-Smart
 *
 * Mostrato nella home screen quando l'utente non ha ancora configurato il token.
 * Si nasconde quando il token è configurato o l'utente lo chiude.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, X, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { llmKeys } from "@/lib/ai/llm-provider";
import { smartMemory, MEMORY_KEYS } from "@/lib/ai/smart-memory";

interface Props {
  onSetupClick: () => void;
}

const AI_FEATURES = [
  { icon: Brain, label: "Analisi AI del preventivo" },
  { icon: Zap, label: "Rilevamento anomalie" },
  { icon: Sparkles, label: "Chat con il consulente AI" },
];

export default function AIBanner({ onSetupClick }: Props) {
  const [visible, setVisible] = useState(() => {
    if (llmKeys.hasToken()) return false;
    return !smartMemory.recall<boolean>(MEMORY_KEYS.AI_SETUP_DISMISSED);
  });

  const handleDismiss = () => {
    smartMemory.remember(MEMORY_KEYS.AI_SETUP_DISMISSED, true);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/5 p-5"
        >
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Icon */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-semibold leading-tight">
                Potenzia l'analisi con l'AI gratuita
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Token HuggingFace gratuito — nessuna carta di credito richiesta.
              </p>

              {/* Feature pills */}
              <div className="mt-2 flex flex-wrap gap-2">
                {AI_FEATURES.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary/90"
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Button
              size="sm"
              className="flex-shrink-0 gap-2"
              onClick={onSetupClick}
            >
              Attiva AI
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
