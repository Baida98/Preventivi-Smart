export interface PDFExtractionResult {
  text: string;
  prices: number[];
}

export const extractPricesFromPDF = async (file: File): Promise<PDFExtractionResult> => {
  console.log("Mock PDF extraction for:", file.name);
  return {
    text: "",
    prices: []
  };
};
