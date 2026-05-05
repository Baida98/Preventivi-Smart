import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 mt-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>
            © {new Date().getFullYear()} Preventivi-Smart · Analisi Tecnica e Benchmark di Mercato · v1.0.2-test-push
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-foreground transition">
            Informativa Privacy
          </a>
          <a href="#" className="hover:text-foreground transition">
            Termini di Utilizzo
          </a>
          <a href="#" className="hover:text-foreground transition">
            Metodologia Statistica
          </a>
        </div>
      </div>
    </footer>
  );
}
