import type { Service } from "./quote-model";

/**
 * Gestisce le operazioni sui servizi di un preventivo
 */
export class ServiceManager {
  /**
   * Crea un nuovo servizio vuoto
   */
  static createEmptyService(): Service {
    return {
      id: this.generateServiceId(),
      descrizione: "",
      quantita: 1,
      unitaMisura: "pz",
      prezzoUnitario: 0,
      totale: 0,
    };
  }

  /**
   * Aggiunge un nuovo servizio alla lista
   */
  static addService(services: Service[]): Service[] {
    const newService = this.createEmptyService();
    return [...services, newService];
  }

  /**
   * Rimuove un servizio dalla lista
   */
  static removeService(services: Service[], serviceId: string): Service[] {
    return services.filter((s) => s.id !== serviceId);
  }

  /**
   * Aggiorna un servizio specifico
   */
  static updateService(
    services: Service[],
    serviceId: string,
    updates: Partial<Service>
  ): Service[] {
    return services.map((s) => {
      if (s.id === serviceId) {
        const updated = { ...s, ...updates };
        // Ricalcola il totale se quantità o prezzo sono stati modificati
        if (
          updates.quantita !== undefined ||
          updates.prezzoUnitario !== undefined
        ) {
          updated.totale = updated.quantita * updated.prezzoUnitario;
        }
        return updated;
      }
      return s;
    });
  }

  /**
   * Calcola il totale di tutti i servizi
   */
  static calculateTotal(services: Service[]): number {
    return services.reduce((sum, service) => sum + (service.totale || 0), 0);
  }

  /**
   * Calcola il totale con sconto percentuale
   */
  static calculateTotalWithDiscount(
    services: Service[],
    discountPercent: number
  ): number {
    const subtotal = this.calculateTotal(services);
    const discount = (subtotal * discountPercent) / 100;
    return subtotal - discount;
  }

  /**
   * Calcola il totale con IVA
   */
  static calculateTotalWithVAT(
    services: Service[],
    vatPercent: number = 22
  ): number {
    const subtotal = this.calculateTotal(services);
    const vat = (subtotal * vatPercent) / 100;
    return subtotal + vat;
  }

  /**
   * Calcola il totale con sconto e IVA
   */
  static calculateTotalWithDiscountAndVAT(
    services: Service[],
    discountPercent: number = 0,
    vatPercent: number = 22
  ): {
    subtotal: number;
    discount: number;
    discountedSubtotal: number;
    vat: number;
    total: number;
  } {
    const subtotal = this.calculateTotal(services);
    const discount = (subtotal * discountPercent) / 100;
    const discountedSubtotal = subtotal - discount;
    const vat = (discountedSubtotal * vatPercent) / 100;
    const total = discountedSubtotal + vat;

    return {
      subtotal,
      discount,
      discountedSubtotal,
      vat,
      total,
    };
  }

  /**
   * Duplica un servizio
   */
  static duplicateService(services: Service[], serviceId: string): Service[] {
    const serviceIndex = services.findIndex((s) => s.id === serviceId);
    if (serviceIndex === -1) {
      return services;
    }

    const serviceToDuplicate = services[serviceIndex];
    const duplicatedService: Service = {
      ...serviceToDuplicate,
      id: this.generateServiceId(),
    };

    // Inserisci il servizio duplicato subito dopo l'originale
    const newServices = [...services];
    newServices.splice(serviceIndex + 1, 0, duplicatedService);
    return newServices;
  }

  /**
   * Sposta un servizio verso l'alto
   */
  static moveServiceUp(services: Service[], serviceId: string): Service[] {
    const index = services.findIndex((s) => s.id === serviceId);
    if (index <= 0) {
      return services;
    }

    const newServices = [...services];
    [newServices[index - 1], newServices[index]] = [
      newServices[index],
      newServices[index - 1],
    ];
    return newServices;
  }

  /**
   * Sposta un servizio verso il basso
   */
  static moveServiceDown(services: Service[], serviceId: string): Service[] {
    const index = services.findIndex((s) => s.id === serviceId);
    if (index === -1 || index >= services.length - 1) {
      return services;
    }

    const newServices = [...services];
    [newServices[index], newServices[index + 1]] = [
      newServices[index + 1],
      newServices[index],
    ];
    return newServices;
  }

  /**
   * Valida un servizio
   */
  static isValidService(service: Service): boolean {
    if (!service.id || !service.id.trim()) {
      return false;
    }
    if (!service.descrizione || !service.descrizione.trim()) {
      return false;
    }
    if (service.quantita <= 0) {
      return false;
    }
    if (service.prezzoUnitario < 0) {
      return false;
    }
    if (!service.unitaMisura || !service.unitaMisura.trim()) {
      return false;
    }
    return true;
  }

  /**
   * Valida tutti i servizi
   */
  static areAllServicesValid(services: Service[]): boolean {
    if (services.length === 0) {
      return false;
    }
    return services.every((s) => this.isValidService(s));
  }

  /**
   * Genera un ID univoco per il servizio
   */
  private static generateServiceId(): string {
    return (
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  /**
   * Formatta il prezzo in valuta EUR
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  }

  /**
   * Formatta il prezzo senza simbolo (solo numero)
   */
  static formatPriceNumber(price: number, decimals: number = 2): string {
    return price.toFixed(decimals).replace(".", ",");
  }

  /**
   * Esporta i servizi in formato CSV
   */
  static exportToCSV(services: Service[]): string {
    const headers = [
      "Descrizione",
      "Quantità",
      "Unità",
      "Prezzo Unitario",
      "Totale",
    ];
    const rows = services.map((s) => [
      `"${s.descrizione}"`,
      s.quantita,
      s.unitaMisura,
      s.prezzoUnitario.toFixed(2),
      s.totale.toFixed(2),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return csv;
  }

  /**
   * Crea una copia profonda dei servizi
   */
  static deepCopy(services: Service[]): Service[] {
    return services.map((s) => ({ ...s }));
  }
}
