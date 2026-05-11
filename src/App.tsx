import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { applySecurityHeaders } from "./lib/security";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Categories from "./components/Categories";
import Trust from "./components/Trust";
import Examples from "./components/Examples";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import Wizard, { type Mode } from "./components/Wizard";
import Archive from "./components/Archive";
import { deleteQuote, loadArchive, calculateTotalArchive, type SavedQuote } from "./lib/storage";
import { withErrorHandler } from "./lib/async-handler";
import { toast } from "sonner";
import { onAuthChange, getCurrentUser, signInWithGoogle, signOutUser } from "./lib/firebase-service";
import type { User } from "firebase/auth";

// IMPORT AI COMPONENTS
import AIBanner from "./components/AIBanner";
import AISetup from "./components/AISetup";
import { llmKeys } from "./lib/ai/llm-provider";

export default function App() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archive, setArchive] = useState<SavedQuote[]>([]);
  const [archiveTotal, setArchiveTotal] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [presetCategoryId, setPresetCategoryId] = useState<string | null>(null);
  const [aiSetupOpen, setAiSetupOpen] = useState(false);
  const [hasAIToken, setHasAIToken] = useState(() => llmKeys.hasToken());
  const wizardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Gestione autenticazione
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Applica gli header di sicurezza al caricamento
    applySecurityHeaders();
    
    // Carica archivio in modo asincrono
    (async () => {
      const result = await withErrorHandler(() => loadArchive());
      if (result.success) {
        setArchive(result.data);
        const totalResult = await withErrorHandler(() => calculateTotalArchive());
        if (totalResult.success) setArchiveTotal(totalResult.data);
      } else {
        toast.error("Errore nel caricamento dell'archivio: " + result.error.message);
      }
    })();
  }, []);

  function refreshArchive() {
    (async () => {
      const result = await withErrorHandler(() => loadArchive());
      if (result.success) {
        setArchive(result.data);
        const totalResult = await withErrorHandler(() => calculateTotalArchive());
        if (totalResult.success) setArchiveTotal(totalResult.data);
      }
    })();
  }

  useEffect(() => {
    if (mode !== null) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [mode]);

  function startMode(m: Mode, categoryId: string | null = null) {
    setPresetCategoryId(categoryId);
    setMode(m);
  }

  function handleDelete(id: string) {
    (async () => {
      const result = await withErrorHandler(() => deleteQuote(id));
      if (result.success) {
        toast.success("Preventivo eliminato");
        refreshArchive();
      } else {
        toast.error("Errore durante l'eliminazione: " + result.error.message);
      }
    })();
  }

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <Header
        user={user}
        onLogin={signInWithGoogle}
        onLogout={signOutUser}
        archiveCount={archive.length}
        archiveTotal={archiveTotal}
        onOpenArchive={() => setArchiveOpen(true)}
        onHome={() => {
          setMode(null);
          setPresetCategoryId(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {mode === null && (
        <>
          <Hero
            onAnalizza={() => startMode("analizza")}
            onStima={() => startMode("stima")}
          />
          
          {/* AI PROMO BANNER */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <AIBanner onSetupClick={() => setAiSetupOpen(true)} />
          </div>

          <HowItWorks />
          <Categories
            onPickCategory={(id) => startMode("analizza", id)}
          />
          <Trust />
          <Examples />
          <FAQ />
        </>
      )}

      {mode !== null && (
        <div ref={wizardRef}>
          <Wizard
            key={`${mode}-${presetCategoryId ?? "none"}`}
            mode={mode}
            presetCategoryId={presetCategoryId}
            onClose={() => {
              setMode(null);
              setPresetCategoryId(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      <Footer />

      <Archive
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        quotes={archive}
        onDelete={handleDelete}
      />

      {/* AI SETUP DIALOG */}
      <AISetup
        open={aiSetupOpen}
        onClose={() => setAiSetupOpen(false)}
        onConfigured={() => {
          setHasAIToken(true);
          setAiSetupOpen(false);
          toast.success("AI configurata con successo!");
        }}
      />

      <Toaster richColors theme="dark" position="bottom-right" />
    </div>
  );
}
