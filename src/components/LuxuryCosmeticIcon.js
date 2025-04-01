import React from 'react';

const LuxuryCosmeticIcon = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="30 0 440 250"  
      width="40"  
      height="50"
      fill="none"
      stroke="currentColor"
      strokeWidth="25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Flacon de parfum luxueux - plus grand */}
      <rect x="50" y="50" width="100" height="130" rx="15" ry="15" />
      <rect x="75" y="30" width="50" height="20" rx="8" ry="8" />
      <circle cx="100" cy="15" r="10" fill="currentColor" />

      {/* Rouge à lèvres élégant - plus large */}
      <rect x="180" y="80" width="50" height="100" rx="8" ry="8" />
      <polygon points="180,80 230,80 225,40 185,40" />
      <rect x="190" y="30" width="30" height="20" rx="5" ry="5" />

      {/* Pot de crème premium - plus imposant */}
      <rect x="280" y="90" width="130" height="80" rx="20" ry="20" />
      <rect x="270" y="60" width="150" height="45" rx="15" ry="15" />
      <line x1="270" y1="60" x2="420" y2="60" strokeWidth="10" />
    </svg>
  );
};

export default LuxuryCosmeticIcon;
