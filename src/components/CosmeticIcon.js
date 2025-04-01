import React from 'react';

const CosmeticIcon = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="40 0 370 250"  // Ajustement pour mieux centrer les éléments
      width="40"  
      height="50"
      fill="none"
      stroke="currentColor"
      strokeWidth="25"
    >
      {/* Flacon cosmétique (agrandi) */}
      <rect x="50" y="40" width="80" height="140" rx="12" ry="12" />
      <rect x="70" y="20" width="40" height="20" rx="5" ry="5" />
      <circle cx="90" cy="12" r="6" fill="currentColor" />

      {/* Tube de crème (agrandi) */}
      <rect x="160" y="40" width="60" height="140" rx="10" ry="10" />
      <polygon points="160,40 220,40 210,10 170,10" />

      {/* Pot de crème (agrandi) */}
      <rect x="260" y="90" width="100" height="90" rx="12" ry="12" />
      <rect x="250" y="60" width="120" height="40" rx="12" ry="12" />
    </svg>
  );
};

export default CosmeticIcon;
