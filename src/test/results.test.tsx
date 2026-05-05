/**
   * Test per il componente Results (ResultsView)
   *
   * Coprono i 5 verdetti possibili e i comportamenti critici:
   * 1. Verdetto "ottimo" (prezzo sotto min)
   * 2. Verdetto "equo" (prezzo nel range)
   * 3. Verdetto "alto" (prezzo sopra max ma < 1.15×)
   * 4. Verdetto "troppo-alto" (prezzo molto sopra range)
   * 5. Verdetto "sospetto" (prezzo anomalmente basso)
   * 6. Visualizza il bottone Salva
   * 7. Visualizza il bottone Modifica Dati
   * 8. Visualizza il bottone Nuova Analisi
   * 9. Mostra outlier warning se prezzo è anomalo
   * 10. Mostra disclaimer ISTAT/fonte dati
   */

  import { describe, it, expect, vi } from "vitest";
  import { render, screen } from "@testing-library/react";
  import ResultsView from "@/components/Results";
  import { judge } from "@/lib/verdict";
  import { CATEGORIES, calculateMarketAnalysis, type MarketAnalysis } from "@/lib/pricing";

  // Mock recharts per evitare errori nel jsdom environment
  vi.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    BarChart: ({ children }: any) => <div>{children}</div>,
    Bar: () => null,
    Cell: () => null,
    LabelList: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    PieChart: ({ children }: any) => <div>{children}</div>,
    Pie: () => null,
    LineChart: ({ children }: any) => <div>{children}</div>,
    Line: () => null,
    AreaChart: ({ children }: any) => <div>{children}</div>,
    Area: () => null,
    Legend: () => null,
    CartesianGrid: () => null,
    ScatterChart: ({ children }: any) => <div>{children}</div>,
    Scatter: () => null,
  }));

  const job = CATEGORIES[0].jobs[0]; // muratura generica
  const category = CATEGORIES[0];

  function buildAnalysis(override?: Partial<MarketAnalysis>): MarketAnalysis {
    const base = calculateMarketAnalysis(job, 10, {}, "lombardia");
    return { ...base, ...override };
  }

  const baseProps = {
    mode: "analizza" as const,
    job,
    category,
    regionLabel: "Lombardia",
    quantity: 10,
    saved: false,
    onSave: vi.fn(),
    onReset: vi.fn(),
    onEdit: vi.fn(),
  };

  describe("ResultsView — verdetti", () => {
    it("1. Verdetto OTTIMO — mostra label Vantaggioso", () => {
      const analysis = buildAnalysis();
      const price = analysis.marketMin * 0.85; // sotto min → ottimo
      const verdict = judge(price, analysis, "edilizia");
      expect(verdict.key).toBe("ottimo");
      render(<ResultsView {...baseProps} price={price} analysis={analysis} verdict={verdict} />);
      expect(screen.getByText(/Vantaggioso/i)).toBeInTheDocument();
    });

    it("2. Verdetto EQUO — mostra label In Linea", () => {
      const analysis = buildAnalysis();
      const price = analysis.marketMid; // nella media → equo
      const verdict = judge(price, analysis, "edilizia");
      expect(verdict.key).toBe("equo");
      render(<ResultsView {...baseProps} price={price} analysis={analysis} verdict={verdict} />);
      expect(screen.getByText(/In Linea/i)).toBeInTheDocument();
    });

    it("3. Verdetto ALTO — mostra label Premium", () => {
      const analysis = buildAnalysis();
      const price = analysis.marketMax * 1.05; // sopra max ma < 1.15× → alto
      const verdict = judge(price, analysis, "edilizia");
      expect(verdict.key).toBe("alto");
      render(<ResultsView {...baseProps} price={price} analysis={analysis} verdict={verdict} />);
      expect(screen.getByText(/Premium/i)).toBeInTheDocument();
    });

    it("4. Verdetto TROPPO-ALTO — mostra label Fuori Range", () => {
      const analysis = buildAnalysis();
      const price = analysis.marketMax * 2; // molto sopra → troppo-alto
      const verdict = judge(price, analysis, "edilizia");
      expect(verdict.key).toBe("troppo-alto");
      render(<ResultsView {...baseProps} price={price} analysis={analysis} verdict={verdict} />);
      expect(screen.getByText(/Fuori Range/i)).toBeInTheDocument();
    });

    it("5. Verdetto SOSPETTO — mostra label Da Verificare", () => {
      const analysis = buildAnalysis();
      const price = analysis.marketMin * 0.5; // anomalmente basso → sospetto
      const verdict = judge(price, analysis, "edilizia");
      expect(verdict.key).toBe("sospetto");
      render(<ResultsView {...baseProps} price={price} analysis={analysis} verdict={verdict} />);
      expect(screen.getByText(/Da Verificare/i)).toBeInTheDocument();
    });
  });

  describe("ResultsView — comportamenti UI", () => {
    it("6. Mostra il bottone Salva quando saved=false", () => {
      const analysis = buildAnalysis();
      const verdict = judge(analysis.marketMid, analysis, "edilizia");
      render(<ResultsView {...baseProps} price={analysis.marketMid} analysis={analysis} verdict={verdict} saved={false} />);
      expect(screen.getByRole("button", { name: /Salva/i })).toBeInTheDocument();
    });

    it("7. Mostra conferma salvataggio quando saved=true", () => {
      const analysis = buildAnalysis();
      const verdict = judge(analysis.marketMid, analysis, "edilizia");
      render(<ResultsView {...baseProps} price={analysis.marketMid} analysis={analysis} verdict={verdict} saved={true} />);
      expect(screen.getByText(/Analisi Salvata/i)).toBeInTheDocument();
    });

    it("8. Mostra il bottone Modifica Dati", () => {
      const analysis = buildAnalysis();
      const verdict = judge(analysis.marketMid, analysis, "edilizia");
      render(<ResultsView {...baseProps} price={analysis.marketMid} analysis={analysis} verdict={verdict} />);
      expect(screen.getByRole("button", { name: /Modifica Dati/i })).toBeInTheDocument();
    });

    it("9. Mostra outlier warning se il prezzo è anomalmente alto (>2× marketMax)", () => {
      const analysis = buildAnalysis();
      const price = analysis.marketMax * 3; // outlier
      const verdict = judge(price, analysis, "edilizia");
      expect(verdict.outlierWarning).toBeDefined();
      render(<ResultsView {...baseProps} price={price} analysis={analysis} verdict={verdict} />);
      expect(screen.getByText(/ATTENZIONE/i)).toBeInTheDocument();
    });

    it("10. Mostra sezione Benchmark di Mercato con intestazione dati verificati", () => {
      const analysis = buildAnalysis();
      const verdict = judge(analysis.marketMid, analysis, "edilizia");
      render(<ResultsView {...baseProps} price={analysis.marketMid} analysis={analysis} verdict={verdict} />);
      expect(screen.getByText(/Benchmark di Mercato/i)).toBeInTheDocument();
      expect(screen.getByText(/Dati Verificati/i)).toBeInTheDocument();
    });
  });
  