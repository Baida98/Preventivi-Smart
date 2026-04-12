export const jobs = {
  imbianchitura: {
    label: "Imbiancatura",
    base: 10,
    unit: "€/mq",
    fields: [
      {
        id: "stato",
        label: "Stato Muri",
        type: "select",
        options: [
          { value: "buono", label: "Buono" },
          { value: "medio", label: "Medio" },
          { value: "alto", label: "Rovinato" }
        ]
      },
      {
        id: "pittura",
        label: "Tipo Pittura",
        type: "select",
        options: [
          { value: "base", label: "Base" },
          { value: "lavabile", label: "Lavabile" },
          { value: "premium", label: "Antimuffa" }
        ]
      },
      {
        id: "colori",
        label: "Colori",
        type: "select",
        options: [
          { value: "no", label: "Bianco" },
          { value: "si", label: "Colorato" }
        ]
      }
    ]
  },

  piastrelle: {
    label: "Piastrelle",
    base: 70,
    unit: "€/mq",
    fields: [
      {
        id: "rimozione",
        label: "Rimozione Vecchio",
        type: "select",
        options: [
          { value: "no", label: "No" },
          { value: "si", label: "Si" }
        ]
      },
      {
        id: "schema",
        label: "Tipo Schema",
        type: "select",
        options: [
          { value: "semplice", label: "Semplice" },
          { value: "complesso", label: "Complesso" }
        ]
      }
    ]
  },

  elettrico: {
    label: "Impianto Elettrico",
    base: 60,
    unit: "€/punto",
    fields: [
      {
        id: "cert",
        label: "Certificazione",
        type: "select",
        options: [
          { value: "no", label: "No" },
          { value: "si", label: "Si" }
        ]
      },
      {
        id: "tracce",
        label: "Tracce Muro",
        type: "select",
        options: [
          { value: "no", label: "No" },
          { value: "si", label: "Si" }
        ]
      }
    ]
  },

  bagno: {
    label: "Ristrutturazione Bagno",
    base: 2500,
    unit: "€/bagno",
    fields: [
      {
        id: "impianti",
        label: "Spostamenti Impianti",
        type: "select",
        options: [
          { value: "no", label: "No" },
          { value: "si", label: "Si" }
        ]
      }
    ]
  },

  idraulica: {
    label: "Idraulica",
    base: 80,
    unit: "€/elemento",
    fields: [
      {
        id: "urgenza",
        label: "Urgenza",
        type: "select",
        options: [
          { value: "no", label: "Normale" },
          { value: "si", label: "Urgente" }
        ]
      }
    ]
  },

  cartongesso: {
    label: "Cartongesso",
    base: 35,
    unit: "€/mq",
    fields: [
      {
        id: "isolamento",
        label: "Isolamento",
        type: "select",
        options: [
          { value: "no", label: "No" },
          { value: "si", label: "Si" }
        ]
      }
    ]
  },

  pulizie: {
    label: "Pulizie",
    base: 15,
    unit: "€/mq",
    fields: [
      {
        id: "sporco",
        label: "Livello Sporco",
        type: "select",
        options: [
          { value: "basso", label: "Basso" },
          { value: "medio", label: "Medio" },
          { value: "alto", label: "Molto Sporco" }
        ]
      }
    ]
  },

  giardino: {
    label: "Giardino",
    base: 20,
    unit: "€/mq",
    fields: [
      {
        id: "tipo",
        label: "Tipo Lavoro",
        type: "select",
        options: [
          { value: "manutenzione", label: "Manutenzione" },
          { value: "creazione", label: "Creazione" }
        ]
      }
    ]
  }
};

// Helper function to get extra cost multiplier
export function calcolaExtra(tipo, formData) {
  let extra = 1;

  if (tipo === "imbianchitura") {
    if (formData.stato === "medio") extra += 0.15;
    if (formData.stato === "alto") extra += 0.35;
    if (formData.pittura === "lavabile") extra += 0.1;
    if (formData.pittura === "premium") extra += 0.25;
    if (formData.colori === "si") extra += 0.2;
  }

  if (tipo === "piastrelle") {
    if (formData.rimozione === "si") extra += 0.4;
    if (formData.schema === "complesso") extra += 0.25;
  }

  if (tipo === "elettrico") {
    if (formData.cert === "si") extra += 0.25;
    if (formData.tracce === "si") extra += 0.3;
  }

  if (tipo === "bagno") {
    if (formData.impianti === "si") extra += 0.4;
  }

  if (tipo === "idraulica") {
    if (formData.urgenza === "si") extra += 0.3;
  }

  if (tipo === "cartongesso") {
    if (formData.isolamento === "si") extra += 0.25;
  }

  if (tipo === "pulizie") {
    if (formData.sporco === "medio") extra += 0.2;
    if (formData.sporco === "alto") extra += 0.4;
  }

  return extra;
}