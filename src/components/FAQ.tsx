import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Come fate a sapere il prezzo giusto?",
    a: "Combiniamo gli indici ISTAT 2026 dei costi di costruzione, i prezzari delle Camere di Commercio regionali e una banca dati interna di preventivi reali aggregati. Il risultato è una fascia di prezzo onesta — non un singolo valore — perché il mercato non è mai un numero secco.",
  },
  {
    q: "I miei dati vengono salvati o trasmessi?",
    a: "No. L'analisi avviene interamente nel tuo browser. L'archivio dei preventivi che salvi resta in locale (localStorage) sul tuo device. Non c'è registrazione, non c'è tracciamento personale, non condividiamo niente con terze parti.",
  },
  {
    q: "Cosa significa il verdetto \"Sospetto\"?",
    a: "Quando un preventivo è molto sotto la media di mercato (oltre il 30%), spesso indica materiali scadenti, lavoro in nero o competenze improvvisate. Diffida sempre dei preventivi anomali al ribasso e pretendi capitolato dettagliato, fattura e garanzia.",
  },
  {
    q: "Posso usarlo per chiedere uno sconto al mio artigiano?",
    a: "Sì, è uno dei suoi scopi. Mostragli la fascia di mercato della tua regione e chiedi che giustifichi gli scostamenti voce per voce. Un professionista serio non avrà problemi a farlo.",
  },
  {
    q: "Funziona per tutti i lavori di casa?",
    a: "Copriamo le 8 categorie più richieste in Italia: edilizia, imbiancatura, idraulica, elettrico, pavimenti, climatizzazione, serramenti, pulizie e giardino. Aggiungiamo nuovi mestieri ogni mese — se ti manca qualcosa, scrivici.",
  },
];

export default function FAQ() {
  return (
    <section className="relative mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary/80">
          Domande frequenti
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
          Tutto quello che ti chiedi{" "}
          <span className="font-serif-display italic text-muted-foreground">
            la prima volta
          </span>
        </h2>
      </div>

      <Accordion
        type="single"
        collapsible
        className="mt-10 rounded-2xl border border-border/70 bg-card/40 divide-y divide-border/60"
      >
        {FAQS.map((f, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="border-b-0 px-5"
          >
            <AccordionTrigger className="text-left font-semibold hover:no-underline py-5 text-[15px]">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
