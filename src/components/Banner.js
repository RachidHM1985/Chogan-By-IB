import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export default function Banner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Si le localStorage a une clé spécifique (indiquant un autre site d'origine)
    const isExternalVisit = localStorage.getItem('externalVisit');

    // Si un visiteur arrive d'un autre site et que nous n'avons pas déjà enregistré cette information
    if (isExternalVisit) {
      console.log('Affichage de la bannière car l\'utilisateur vient d\'un site extérieur.');
      setShowBanner(true);

      // Cacher la bannière après 5 secondes
      const timer = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(timer);
    }

    // Sinon, on marque l'entrée comme venant d'un autre site en utilisant localStorage
    if (document.referrer && !document.referrer.includes(window.location.hostname)) {
      localStorage.setItem('externalVisit', 'true'); // Marque l'origine externe
      console.log('L\'utilisateur vient d\'un autre site. Marquage effectué.');
    } else {
      console.log('L\'utilisateur ne vient pas d\'un site extérieur.');
    }
  }, []);

  if (!showBanner) return null;

  return (
    <Box
      className="banner"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        animation: 'fadeIn 1s ease-in-out', // Animation d'apparition
      }}
      onClick={() => setShowBanner(false)} // Fermer la bannière au clic
    >
      <img
        src="/images/Banniere_Chogan_by_Ikram.jpg"
        alt="Bienvenue sur Chogan-by-Ikram"
        style={{
          maxWidth: '100%',
          maxHeight: '100vh',
          borderRadius: '10px',
          boxShadow: '0px 0px 20px rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
        }}
      />
    </Box>
  );
}
