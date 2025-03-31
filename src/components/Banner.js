import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export default function Banner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const referrer = document.referrer;
        console.log('Referrer:', referrer);

    // Vérification si l'utilisateur vient d'un site extérieur
    if (referrer && !referrer.includes(window.location.hostname)) {
      console.log('Affichage de la bannière car l\'utilisateur vient d\'un site extérieur.');
      setShowBanner(true);

      // Cacher la bannière après 5 secondes
      const timer = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(timer);
    } else {
      console.log('L\'utilisateur ne vient pas d\'un site extérieur.');
    }
  }, []);

  if (!showBanner) return null;

  return (
    <Box className="banner"
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
