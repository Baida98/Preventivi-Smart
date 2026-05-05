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
import { onAuthChange, getCurrentUser, signInWithGoogle, signOutUser } from "./lib/firebase-service";
import type { User } from "firebase/auth";

export default function App() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archive, setArchive] = useState<SavedQuote[]>([]);
  const [archiveTotal, setArchiveTotal] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [presetCategoryId, setPresetCategoryId] = useState<string | null>(null);
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
      const loaded = await loadArchive();
      setArchive(loaded);
      const total = await calculateTotalArchive();
      setArchiveTotal(total);
    })();
  }, []);

  function refreshArchive() {
    (async () => {
      const updated = await loadArchive();
      setArchive(updated);
      const total = await calculateTotalArchive();
      setArchiveTotal(total);
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
      await deleteQuote(id);
      refreshArchive();
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

      <Toaster richColors theme="dark" position="bottom-right" />
    </div>
  );
}
