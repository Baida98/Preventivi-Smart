import type { Quote } from "./quote-model";
import { ServiceManager } from "./service-manager";

/**
 * Opzioni per la generazione del PDF
 */
export interface PDFOptions {
  includeVAT?: boolean;
  vatPercent?: number;
  discountPercent?: number;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyVAT?: string;
  logo?: string; // URL o data URL
}

/**
 * Genera un PDF professionale per un preventivo
 * Utilizza html2pdf o una libreria simile
 */
export class PDFGenerator {
  /**
   * Genera l'HTML per il PDF
   */
  static generateHTML(quote: Quote, options: PDFOptions = {}): string {
    const {
      includeVAT = true,
      vatPercent = 22,
      discountPercent = 0,
      companyName = "La Tua Azienda",
      companyAddress = "Via Esempio, 123 - 00100 Roma",
      companyPhone = "+39 06 1234567",
      companyEmail = "info@example.com",
      companyVAT = "IT12345678901",
    } = options;

    const calculations = ServiceManager.calculateTotalWithDiscountAndVAT(
      quote.servizi || [],
      discountPercent,
      includeVAT ? vatPercent : 0
    );

    const clienteNomeCompleto = quote.cliente.cognome
      ? `${quote.cliente.nome} ${quote.cliente.cognome}`
      : quote.cliente.nome;

    const servizesHTML = (quote.servizi || [])
      .map(
        (service) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left;">
          ${service.descrizione}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">
          ${service.quantita}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">
          ${service.unitaMisura}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">
          €${service.prezzoUnitario.toFixed(2)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">
          €${service.totale.toFixed(2)}
        </td>
      </tr>
    `
      )
      .join("");

    const totalsHTML = `
      <tr>
        <td colspan="4" style="padding: 12px; text-align: right; font-weight: bold;">Subtotale:</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">€${calculations.subtotal.toFixed(2)}</td>
      </tr>
      ${
        discountPercent > 0
          ? `
      <tr>
        <td colspan="4" style="padding: 12px; text-align: right; font-weight: bold;">Sconto (${discountPercent}%):</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; color: #27ae60;">-€${calculations.discount.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="4" style="padding: 12px; text-align: right; font-weight: bold;">Totale scontato:</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">€${calculations.discountedSubtotal.toFixed(2)}</td>
      </tr>
      `
          : ""
      }
      ${
        includeVAT
          ? `
      <tr>
        <td colspan="4" style="padding: 12px; text-align: right; font-weight: bold;">IVA (${vatPercent}%):</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">€${calculations.vat.toFixed(2)}</td>
      </tr>
      `
          : ""
      }
      <tr style="background-color: #f8f9fa;">
        <td colspan="4" style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">TOTALE:</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px; color: #2c3e50;">€${calculations.total.toFixed(2)}</td>
      </tr>
    `;

    const notesHTML = quote.note
      ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #3498db;">
        <h3 style="margin-top: 0; color: #2c3e50;">Note:</h3>
        <p style="margin: 0; white-space: pre-wrap;">${quote.note}</p>
      </div>
    `
      : "";

    return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preventivo ${quote.numero}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #2c3e50;
          background-color: #ecf0f1;
          padding: 20px;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 3px solid #3498db;
          padding-bottom: 20px;
        }
        .company-info h1 {
          font-size: 28px;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .company-info p {
          font-size: 13px;
          color: #7f8c8d;
          margin: 5px 0;
        }
        .quote-info {
          text-align: right;
        }
        .quote-info h2 {
          font-size: 24px;
          color: #3498db;
          margin-bottom: 10px;
        }
        .quote-info p {
          font-size: 13px;
          color: #7f8c8d;
          margin: 5px 0;
        }
        .client-section {
          margin-bottom: 30px;
          display: flex;
          gap: 40px;
        }
        .client-info {
          flex: 1;
        }
        .client-info h3 {
          font-size: 14px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .client-info p {
          font-size: 13px;
          color: #34495e;
          margin: 5px 0;
        }
        .services-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        .services-table thead {
          background-color: #3498db;
          color: white;
        }
        .services-table th {
          padding: 12px;
          text-align: left;
          font-weight: bold;
          font-size: 13px;
        }
        .services-table td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
          font-size: 13px;
        }
        .services-table tbody tr:hover {
          background-color: #f8f9fa;
        }
        .totals-section {
          margin-top: 20px;
          text-align: right;
        }
        .totals-section table {
          width: 100%;
          border-collapse: collapse;
        }
        .totals-section tr {
          border-bottom: 1px solid #ddd;
        }
        .totals-section td {
          padding: 12px;
          font-size: 13px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #7f8c8d;
        }
        .footer p {
          margin: 5px 0;
        }
        @media print {
          body {
            background-color: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-info">
            <h1>${companyName}</h1>
            <p>${companyAddress}</p>
            <p>${companyPhone}</p>
            <p>${companyEmail}</p>
            <p>P.IVA: ${companyVAT}</p>
          </div>
          <div class="quote-info">
            <h2>PREVENTIVO</h2>
            <p><strong>Numero:</strong> ${quote.numero}</p>
            <p><strong>Data:</strong> ${this.formatDate(quote.data)}</p>
          </div>
        </div>

        <div class="client-section">
          <div class="client-info">
            <h3>Cliente</h3>
            <p><strong>${clienteNomeCompleto}</strong></p>
            ${quote.cliente.email ? `<p>${quote.cliente.email}</p>` : ""}
            ${quote.cliente.telefono ? `<p>${quote.cliente.telefono}</p>` : ""}
            ${
              quote.cliente.indirizzo
                ? `<p>${quote.cliente.indirizzo}</p>`
                : ""
            }
            ${
              quote.cliente.cap || quote.cliente.citta
                ? `<p>${quote.cliente.cap || ""} ${quote.cliente.citta || ""}</p>`
                : ""
            }
            ${quote.cliente.provincia ? `<p>${quote.cliente.provincia}</p>` : ""}
          </div>
        </div>

        <table class="services-table">
          <thead>
            <tr>
              <th>Descrizione</th>
              <th style="text-align: center;">Quantità</th>
              <th style="text-align: center;">Unità</th>
              <th style="text-align: right;">Prezzo Unitario</th>
              <th style="text-align: right;">Totale</th>
            </tr>
          </thead>
          <tbody>
            ${servizesHTML}
          </tbody>
        </table>

        <div class="totals-section">
          <table>
            ${totalsHTML}
          </table>
        </div>

        ${notesHTML}

        <div class="footer">
          <p>Questo preventivo è valido per 30 giorni dalla data di emissione.</p>
          <p>Generato da Preventivi Smart - ${new Date().toLocaleDateString("it-IT")}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Scarica il PDF nel browser
   */
  static downloadPDF(quote: Quote, options: PDFOptions = {}): void {
    const html = this.generateHTML(quote, options);

    // Crea un elemento iframe nascosto per stampare
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeDoc =
      iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.write(html);
      iframeDoc.close();

      // Attendi che il contenuto sia caricato
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Rimuovi l'iframe dopo la stampa
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  }

  /**
   * Apre il PDF in una nuova finestra
   */
  static openPDFInNewWindow(quote: Quote, options: PDFOptions = {}): void {
    const html = this.generateHTML(quote, options);
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  }

  /**
   * Formatta la data nel formato italiano
   */
  private static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Genera il nome del file PDF
   */
  static generateFileName(quote: Quote): string {
    const sanitizedNumber = quote.numero.replace(/\//g, "-");
    return `Preventivo_${sanitizedNumber}_${new Date().getTime()}.pdf`;
  }
}
