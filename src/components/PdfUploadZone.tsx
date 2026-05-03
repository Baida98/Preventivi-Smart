import React from 'react';

interface PdfUploadZoneProps {
  onPriceDetected: (price: number) => void;
  onDismiss: () => void;
}

const PdfUploadZone: React.FC<PdfUploadZoneProps> = ({ onDismiss }) => {
  return (
    <div className="p-4 border-2 border-dashed rounded-lg">
      <p>PDF Upload Placeholder</p>
      <button onClick={onDismiss} className="mt-2 text-sm text-gray-500">Chiudi</button>
    </div>
  );
};

export default PdfUploadZone;
