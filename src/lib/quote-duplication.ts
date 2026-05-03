import type { Quote, Service } from "./quote-model";
import { generateQuoteId } from "./quote-model";
import { ServiceManager } from "./service-manager";

/**
 * Opzioni per la duplicazione del preventivo
 */
export interface DuplicationOptions {
  resetNumber?: boolean; // Se true, genera un nuovo numero
  resetDate?: boolean; // Se true, usa la data odierna
  resetClient?: boolean; // Se true, svuota i dati del cliente
  keepNotes?: boolean; // Se true, mantiene le note
  suffix?: string; // Suffisso da aggiungere al numero (es: "-COPIA")
}

/**
 * Gestisce la duplicazione completa dei preventivi
 */
export class QuoteDuplication {
  /**
   * Duplica un preventivo completo con tutti i servizi e i dettagli
   */
  static duplicateQuote(
    quote: Quote,
    options: DuplicationOptions = {}
  ): Omit<Quote, "numero" | "createdAt"> {
    const {
      resetNumber = true,
      resetDate = true,
      resetClient = false,
      keepNotes = true,
      suffix = "",
    } = options;

    // Duplica i servizi
    const duplicatedServices = ServiceManager.deepCopy(quote.servizi || []);

    // Crea il nuovo preventivo
    const duplicatedQuote: Omit<Quote, "numero" | "createdAt"> = {
      id: generateQuoteId(),
      uid: quote.uid,
      data: resetDate ? new Date().toISOString().split("T")[0] : quote.data,
      cliente: resetClient
        ? {
            nome: "",
          }
        : {
            ...quote.cliente,
          },
      ambito: quote.ambito,
      sottotipo: quote.sottotipo,
      mq: quote.mq,
      servizi: duplicatedServices,
      totale: ServiceManager.calculateTotal(duplicatedServices),
      stato: "bozza",
      source: quote.source,
      note: keepNotes ? quote.note : undefined,
      jobId: quote.jobId,
      regionLabel: quote.regionLabel,
      verdict: quote.verdict,
      verdictLabel: quote.verdictLabel,
      mode: quote.mode,
      marketMin: quote.marketMin,
      marketMid: quote.marketMid,
      marketMax: quote.marketMax,
      receivedPrice: quote.receivedPrice,
      qualityScore: quote.qualityScore,
      anomalyScore: quote.anomalyScore,
      validated: quote.validated,
      fieldValues: quote.fieldValues ? { ...quote.fieldValues } : undefined,
      fieldLabels: quote.fieldLabels
        ? quote.fieldLabels.map((f) => ({ ...f }))
        : undefined,
      quantity: quote.quantity,
      unitLabel: quote.unitLabel,
      updatedAt: new Date().toISOString(),
    };

    return duplicatedQuote;
  }

  /**
   * Duplica un preventivo con un nuovo numero
   * Utile quando si vuole creare una versione modificata
   */
  static duplicateWithNewNumber(
    quote: Quote,
    newNumber: string,
    options: DuplicationOptions = {}
  ): Quote {
    const duplicated = this.duplicateQuote(quote, options);
    return {
      ...duplicated,
      numero: newNumber,
      createdAt: new Date().toISOString(),
    } as Quote;
  }

  /**
   * Duplica un preventivo con numero progressivo
   * Es: 2026-0001 -> 2026-0002-COPIA
   */
  static duplicateWithProgressiveNumber(
    quote: Quote,
    options: DuplicationOptions = {}
  ): Omit<Quote, "numero" | "createdAt"> {
    const duplicated = this.duplicateQuote(quote, {
      ...options,
      suffix: options.suffix || "-COPIA",
    });

    return duplicated;
  }

  /**
   * Duplica un preventivo come template
   * Mantiene solo i servizi e le note, svuota cliente e numero
   */
  static duplicateAsTemplate(quote: Quote): Omit<Quote, "numero" | "createdAt"> {
    return this.duplicateQuote(quote, {
      resetNumber: true,
      resetDate: true,
      resetClient: true,
      keepNotes: true,
    });
  }

  /**
   * Duplica un preventivo per lo stesso cliente
   * Mantiene i dati del cliente, resetta numero e data
   */
  static duplicateForSameClient(quote: Quote): Omit<Quote, "numero" | "createdAt"> {
    return this.duplicateQuote(quote, {
      resetNumber: true,
      resetDate: true,
      resetClient: false,
      keepNotes: false,
    });
  }

  /**
   * Duplica un preventivo con servizi modificati
   */
  static duplicateWithModifiedServices(
    quote: Quote,
    serviceModifier: (services: Service[]) => Service[]
  ): Omit<Quote, "numero" | "createdAt"> {
    const duplicated = this.duplicateQuote(quote);
    const modifiedServices = serviceModifier(duplicated.servizi || []);

    return {
      ...duplicated,
      servizi: modifiedServices,
      totale: ServiceManager.calculateTotal(modifiedServices),
    };
  }

  /**
   * Duplica un preventivo e applica uno sconto
   */
  static duplicateWithDiscount(
    quote: Quote,
    discountPercent: number
  ): Omit<Quote, "numero" | "createdAt"> {
    const duplicated = this.duplicateQuote(quote);
    const modifiedServices = (duplicated.servizi || []).map((service) => ({
      ...service,
      prezzoUnitario: service.prezzoUnitario * (1 - discountPercent / 100),
      totale: service.totale * (1 - discountPercent / 100),
    }));

    return {
      ...duplicated,
      servizi: modifiedServices,
      totale: ServiceManager.calculateTotal(modifiedServices),
      note: duplicated.note
        ? `${duplicated.note}\n\nSconto applicato: ${discountPercent}%`
        : `Sconto applicato: ${discountPercent}%`,
    };
  }

  /**
   * Duplica un preventivo e aumenta i prezzi
   */
  static duplicateWithPriceIncrease(
    quote: Quote,
    increasePercent: number
  ): Omit<Quote, "numero" | "createdAt"> {
    const duplicated = this.duplicateQuote(quote);
    const modifiedServices = (duplicated.servizi || []).map((service) => ({
      ...service,
      prezzoUnitario: service.prezzoUnitario * (1 + increasePercent / 100),
      totale: service.totale * (1 + increasePercent / 100),
    }));

    return {
      ...duplicated,
      servizi: modifiedServices,
      totale: ServiceManager.calculateTotal(modifiedServices),
      note: duplicated.note
        ? `${duplicated.note}\n\nAumento prezzi: +${increasePercent}%`
        : `Aumento prezzi: +${increasePercent}%`,
    };
  }

  /**
   * Duplica un preventivo mantenendo solo alcuni servizi
   */
  static duplicateWithSelectedServices(
    quote: Quote,
    serviceIds: string[]
  ): Omit<Quote, "numero" | "createdAt"> {
    const duplicated = this.duplicateQuote(quote);
    const selectedServices = (duplicated.servizi || []).filter((s) =>
      serviceIds.includes(s.id)
    );

    return {
      ...duplicated,
      servizi: selectedServices,
      totale: ServiceManager.calculateTotal(selectedServices),
    };
  }

  /**
   * Merge di due preventivi (combina i servizi)
   */
  static mergeQuotes(
    quote1: Quote,
    quote2: Quote,
    options: { clienteFromFirst?: boolean } = {}
  ): Omit<Quote, "numero" | "createdAt"> {
    const { clienteFromFirst = true } = options;

    const mergedServices = [
      ...(quote1.servizi || []),
      ...(quote2.servizi || []),
    ].map((service) => ({
      ...service,
      id: generateQuoteId(), // Genera nuovi ID per evitare duplicati
    }));

    return {
      id: generateQuoteId(),
      uid: quote1.uid,
      data: new Date().toISOString().split("T")[0],
      cliente: clienteFromFirst ? quote1.cliente : quote2.cliente,
      ambito: quote1.ambito,
      sottotipo: quote1.sottotipo,
      mq: clienteFromFirst ? quote1.mq : quote2.mq,
      servizi: mergedServices,
      totale: ServiceManager.calculateTotal(mergedServices),
      stato: "bozza",
      source: "manuale",
      note: `Merge di preventivo ${quote1.numero} e ${quote2.numero}`,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Crea una copia per revisione
   * Mantiene tutto ma aggiunge un suffisso alle note
   */
  static createRevision(
    quote: Quote,
    revisionNumber: number = 1
  ): Omit<Quote, "numero" | "createdAt"> {
    const duplicated = this.duplicateQuote(quote, {
      resetNumber: true,
      resetDate: true,
      keepNotes: true,
    });

    return {
      ...duplicated,
      note: duplicated.note
        ? `${duplicated.note}\n\n--- REVISIONE ${revisionNumber} ---`
        : `--- REVISIONE ${revisionNumber} ---`,
    };
  }

  /**
   * Valida se due preventivi sono identici
   */
  static areIdentical(quote1: Quote, quote2: Quote): boolean {
    // Confronta i dati principali
    if (
      quote1.cliente.nome !== quote2.cliente.nome ||
      quote1.totale !== quote2.totale ||
      (quote1.servizi?.length || 0) !== (quote2.servizi?.length || 0)
    ) {
      return false;
    }

    // Confronta i servizi
    const services1 = quote1.servizi || [];
    const services2 = quote2.servizi || [];

    for (let i = 0; i < services1.length; i++) {
      const s1 = services1[i];
      const s2 = services2[i];

      if (
        s1.descrizione !== s2.descrizione ||
        s1.quantita !== s2.quantita ||
        s1.prezzoUnitario !== s2.prezzoUnitario ||
        s1.totale !== s2.totale
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calcola le differenze tra due preventivi
   */
  static calculateDifferences(
    quote1: Quote,
    quote2: Quote
  ): {
    clienteDifferent: boolean;
    totaleDifferent: boolean;
    serviceCountDifferent: boolean;
    differences: string[];
  } {
    const differences: string[] = [];

    const clienteDifferent =
      quote1.cliente.nome !== quote2.cliente.nome ||
      quote1.cliente.cognome !== quote2.cliente.cognome;
    if (clienteDifferent) {
      differences.push("Dati cliente diversi");
    }

    const totaleDifferent = quote1.totale !== quote2.totale;
    if (totaleDifferent) {
      differences.push(
        `Totale diverso: ${quote1.totale} vs ${quote2.totale}`
      );
    }

    const serviceCountDifferent =
      (quote1.servizi?.length || 0) !== (quote2.servizi?.length || 0);
    if (serviceCountDifferent) {
      differences.push(
        `Numero servizi diverso: ${quote1.servizi?.length || 0} vs ${quote2.servizi?.length || 0}`
      );
    }

    return {
      clienteDifferent,
      totaleDifferent,
      serviceCountDifferent,
      differences,
    };
  }
}
