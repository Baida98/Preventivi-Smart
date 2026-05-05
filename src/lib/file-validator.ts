export interface FileValidationResult {
  success: boolean;
  error?: string;
}

export function validateFileUpload(file: File): FileValidationResult {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'Solo file PDF o immagini (JPG, PNG) sono consentiti'
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      success: false,
      error: 'File troppo grande. Massimo 10MB'
    };
  }

  return { success: true };
}
