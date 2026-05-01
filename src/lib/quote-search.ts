import type { Quote } from "./quote-model";

/**
 * Tipi di ordinamento disponibili
 */
export type SortBy = "data-desc" | "data-asc" | "numero-desc" | "numero-asc" | "totale-desc" | "totale-asc" | "cliente-asc";

/**
 * Opzioni di filtro
 */
export interface FilterOptions {
  searchQuery?: string; // Ricerca in cliente, numero, note
  minTotal?: number;
  maxTotal?: number;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  verdictFilter?: string; // Filtra per verdetto
}

/**
 * Risultato della ricerca
 */
export interface SearchResult {
  quotes: Quote[];
  total: number;
  filtered: number;
}

/**
 * Gestisce la ricerca, il filtro e l'ordinamento dei preventivi
 */
export class QuoteSearch {
  /**
   * Filtra i preventivi in base ai criteri specificati
   */
  static filter(quotes: Quote[], options: FilterOptions): Quote[] {
    let filtered = [...quotes];

    // Filtro per query di ricerca
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((quote) => {
        const clienteName = `${quote.cliente.nome} ${quote.cliente.cognome || ""}`.toLowerCase();
        const numero = quote.numero.toLowerCase();
        const note = (quote.note || "").toLowerCase();

        return (
          clienteName.includes(query) ||
          numero.includes(query) ||
          note.includes(query)
        );
      });
    }

    // Filtro per totale minimo
    if (options.minTotal !== undefined) {
      filtered = filtered.filter((quote) => quote.totale >= options.minTotal!);
    }

    // Filtro per totale massimo
    if (options.maxTotal !== undefined) {
      filtered = filtered.filter((quote) => quote.totale <= options.maxTotal!);
    }

    // Filtro per data di inizio
    if (options.startDate) {
      filtered = filtered.filter((quote) => quote.data >= options.startDate!);
    }

    // Filtro per data di fine
    if (options.endDate) {
      filtered = filtered.filter((quote) => quote.data <= options.endDate!);
    }

    // Filtro per verdetto
    if (options.verdictFilter) {
      filtered = filtered.filter((quote) => quote.verdict === options.verdictFilter);
    }

    return filtered;
  }

  /**
   * Ordina i preventivi in base al criterio specificato
   */
  static sort(quotes: Quote[], sortBy: SortBy): Quote[] {
    const sorted = [...quotes];

    switch (sortBy) {
      case "data-desc":
        sorted.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        break;
      case "data-asc":
        sorted.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
        break;
      case "numero-desc":
        sorted.sort((a, b) => this.compareNumbers(b.numero, a.numero));
        break;
      case "numero-asc":
        sorted.sort((a, b) => this.compareNumbers(a.numero, b.numero));
        break;
      case "totale-desc":
        sorted.sort((a, b) => b.totale - a.totale);
        break;
      case "totale-asc":
        sorted.sort((a, b) => a.totale - b.totale);
        break;
      case "cliente-asc":
        sorted.sort((a, b) => {
          const nameA = `${a.cliente.nome} ${a.cliente.cognome || ""}`.toLowerCase();
          const nameB = `${b.cliente.nome} ${b.cliente.cognome || ""}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
    }

    return sorted;
  }

  /**
   * Ricerca e filtra i preventivi
   */
  static search(
    quotes: Quote[],
    options: FilterOptions,
    sortBy: SortBy = "data-desc"
  ): SearchResult {
    const total = quotes.length;
    const filtered = this.filter(quotes, options);
    const sorted = this.sort(filtered, sortBy);

    return {
      quotes: sorted,
      total,
      filtered: filtered.length,
    };
  }

  /**
   * Ricerca per cliente (case-insensitive)
   */
  static searchByClient(quotes: Quote[], clienteName: string): Quote[] {
    const query = clienteName.toLowerCase().trim();
    return quotes.filter((quote) => {
      const fullName = `${quote.cliente.nome} ${quote.cliente.cognome || ""}`.toLowerCase();
      return fullName.includes(query);
    });
  }

  /**
   * Ricerca per numero preventivo
   */
  static searchByNumber(quotes: Quote[], numero: string): Quote | undefined {
    return quotes.find((quote) => quote.numero === numero);
  }

  /**
   * Ricerca per intervallo di date
   */
  static searchByDateRange(
    quotes: Quote[],
    startDate: string,
    endDate: string
  ): Quote[] {
    return quotes.filter((quote) => quote.data >= startDate && quote.data <= endDate);
  }

  /**
   * Ricerca per intervallo di totale
   */
  static searchByTotalRange(
    quotes: Quote[],
    minTotal: number,
    maxTotal: number
  ): Quote[] {
    return quotes.filter((quote) => quote.totale >= minTotal && quote.totale <= maxTotal);
  }

  /**
   * Ottiene i preventivi recenti (ultimi N giorni)
   */
  static getRecentQuotes(quotes: Quote[], days: number = 30): Quote[] {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return quotes.filter((quote) => {
      const quoteDate = new Date(quote.data);
      return quoteDate >= startDate;
    });
  }

  /**
   * Ottiene i preventivi di questo mese
   */
  static getThisMonthQuotes(quotes: Quote[]): Quote[] {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return quotes.filter((quote) => {
      const quoteDate = new Date(quote.data);
      return quoteDate >= startDate && quoteDate <= endDate;
    });
  }

  /**
   * Ottiene i preventivi di questo anno
   */
  static getThisYearQuotes(quotes: Quote[]): Quote[] {
    const now = new Date();
    const year = now.getFullYear();

    return quotes.filter((quote) => {
      const quoteDate = new Date(quote.data);
      return quoteDate.getFullYear() === year;
    });
  }

  /**
   * Raggruppa i preventivi per mese
   */
  static groupByMonth(quotes: Quote[]): Map<string, Quote[]> {
    const grouped = new Map<string, Quote[]>();

    quotes.forEach((quote) => {
      const date = new Date(quote.data);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(quote);
    });

    return grouped;
  }

  /**
   * Raggruppa i preventivi per cliente
   */
  static groupByClient(quotes: Quote[]): Map<string, Quote[]> {
    const grouped = new Map<string, Quote[]>();

    quotes.forEach((quote) => {
      const key = `${quote.cliente.nome} ${quote.cliente.cognome || ""}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(quote);
    });

    return grouped;
  }

  /**
   * Calcola statistiche sui preventivi
   */
  static calculateStats(quotes: Quote[]): {
    count: number;
    totalAmount: number;
    averageAmount: number;
    minAmount: number;
    maxAmount: number;
  } {
    if (quotes.length === 0) {
      return {
        count: 0,
        totalAmount: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0,
      };
    }

    const totalAmount = quotes.reduce((sum, q) => sum + q.totale, 0);
    const amounts = quotes.map((q) => q.totale);

    return {
      count: quotes.length,
      totalAmount,
      averageAmount: totalAmount / quotes.length,
      minAmount: Math.min(...amounts),
      maxAmount: Math.max(...amounts),
    };
  }

  /**
   * Compara due numeri di preventivo (formato YYYY-NNNN)
   */
  private static compareNumbers(a: string, b: string): number {
    const [yearA, seqA] = a.split("-").map(Number);
    const [yearB, seqB] = b.split("-").map(Number);

    if (yearA !== yearB) {
      return yearA - yearB;
    }
    return seqA - seqB;
  }

  /**
   * Esporta i risultati della ricerca in CSV
   */
  static exportToCSV(quotes: Quote[]): string {
    const headers = [
      "Numero",
      "Data",
      "Cliente",
      "Email",
      "Telefono",
      "Totale",
      "Note",
    ];

    const rows = quotes.map((q) => [
      q.numero,
      q.data,
      `${q.cliente.nome} ${q.cliente.cognome || ""}`,
      q.cliente.email || "",
      q.cliente.telefono || "",
      q.totale.toFixed(2),
      `"${(q.note || "").replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return csv;
  }
}
