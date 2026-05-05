/**
   * LegalDisclaimer — banner di disclaimer legale per i risultati.
   *
   * Mostra la fonte dei dati (ISTAT/DEI/CRESME) e la limitazione di responsabilità.
   * Deve essere visibile in tutte le schermate che mostrano prezzi di riferimento.
   */

  import { ShieldCheck, ExternalLink } from "lucide-react";
  import { ISTAT_DISCLAIMER } from "@/lib/pricing";

  interface Props {
    /** Se true, mostra i link alle fonti esterne */
    showSources?: boolean;
    className?: string;
  }

  export default function LegalDisclaimer({ showSources = false, className = "" }: Props) {
    return (
      <div className={`rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 flex items-start gap-3 ${className}`}>
        <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-sky-300/80 leading-relaxed">
            {ISTAT_DISCLAIMER}
          </p>
          {showSources && (
            <div className="flex flex-wrap gap-3 mt-2">
              <a
                href="https://www.istat.it/it/archivio/prezzi+delle+opere+pubbliche"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold text-sky-400/70 hover:text-sky-300 transition-colors uppercase tracking-wider"
              >
                <ExternalLink className="w-3 h-3" />
                ISTAT
              </a>
              <a
                href="https://www.deicodice.it"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold text-sky-400/70 hover:text-sky-300 transition-colors uppercase tracking-wider"
              >
                <ExternalLink className="w-3 h-3" />
                DEI Prezzario
              </a>
              <a
                href="https://www.cresme.it"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold text-sky-400/70 hover:text-sky-300 transition-colors uppercase tracking-wider"
              >
                <ExternalLink className="w-3 h-3" />
                CRESME
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }
  