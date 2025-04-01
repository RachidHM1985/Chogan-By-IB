import React from 'react';

const DiffuseurIcon = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="100 0 200 550"  // Ajustement du viewBox pour réduire l'espacement à droite
      width="40"  // Taille de l'icône
      height="50"
      gap="1"  // Taille de l'icône
    >
      {/* Flacon de diffusion avec un corps plus détaillé */}
      <ellipse cx="125" cy="400" rx="90" ry="120" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 25 }} />
      <rect x="90" y="200" width="80" height="100" rx="15" ry="15" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 25 }} />
  
      {/* Col du flacon déplacé encore plus bas */}
      <rect x="105" y="200" width="50" height="20" rx="10" ry="20" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 25 }} />
  
      {/* Bâtons de diffusion longs et espacés */}
      <line x1="80" y1="400" x2="70" y2="50" style={{ stroke: 'currentColor', strokeWidth: 25 }} />
      <line x1="135" y1="400" x2="125" y2="50" style={{ stroke: 'currentColor', strokeWidth: 25 }} />
      <line x1="190" y1="400" x2="180" y2="50" style={{ stroke: 'currentColor', strokeWidth: 25 }} />
  
      {/* Détail décoratif sur le col du flacon */}
      <circle cx="105" cy="200" r="8" style={{ fill: 'black' }} />
    </svg>
  );
};

export default DiffuseurIcon;
