import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Qual è la metodologia di calcolo dei prezzi?",
    a: "Il sistema integra gli indici ISTAT 2026 relativi ai costi di costruzione con i prezzari ufficiali delle Camere di Commercio regionali. L'algoritmo definisce una fascia di mercato probabilistica, considerando che i costi possono variare in base alla logistica e alla complessità specifica dell'intervento.",
  },
  {
    q: "Come vengono gestiti i miei dati?",
    a: "La piattaforma adotta un approccio 'Privacy First'. L'analisi tecnica viene eseguita localmente nel browser e i dati non vengono trasmessi a server esterni. L'archivio dei preventivi è memorizzato esclusivamente nella memoria locale (localStorage) del tuo dispositivo.",
  },
  {
    q: "Cosa implica un verdetto di tipo 'Sospetto'?",
    a: "Un preventivo classificato come 'Sospetto' presenta un costo significativamente inferiore alla soglia minima di sostenibilità del mercato (scostamento >30%). Questo può indicare l'utilizzo di materiali non certificati, l'assenza di tutele assicurative o l'impiego di manodopera non regolare.",
  },
  {
    q: "Il report può essere utilizzato in fase di negoziazione?",
    a: "Certamente. Il report fornisce una base tecnica oggettiva per discutere le voci di costo con il professionista. Un preventivo trasparente dovrebbe sempre permettere di giustificare eventuali scostamenti rispetto ai benchmark regionali di riferimento.",
  },
  {
    q: "Quali categorie di intervento sono supportate?",
    a: "Attualmente il sistema copre i settori principali: edilizia, imbiancatura, idraulica, elettrico, climatizzazione, serramenti ed energia solare. Il database dei costi viene aggiornato periodicamente per includere nuove lavorazioni e parametri tecnici.",
  },
];

export default function FAQ() {
  return (
    <section className="relative mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary/80">
          Supporto Tecnico
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
          Approfondimenti sulla{" "}
          <span className="font-serif-display italic text-muted-foreground">
            metodologia
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
