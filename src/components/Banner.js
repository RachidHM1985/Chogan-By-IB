import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export default function Banner() {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source'); // Vérifie si ?source=external est dans l'URL
    const referrer = document.referrer;
    const currentHost = window.location.hostname;
    
    console.log('Referrer:', referrer);
    console.log('Current Host:', currentHost);
    
    // Option: Utiliser sessionStorage pour montrer la bannière une fois par session
    // ou utiliser une date d'expiration pour montrer une fois par jour
    const hasSeenBanner = sessionStorage.getItem('bannerShown'); // Change to sessionStorage
    
    // Vérifie si l'utilisateur vient d'un site externe ou si l'URL contient ?source=external
    if ((referrer && !referrer.includes(currentHost)) || source === 'external') {
      if (!hasSeenBanner) {
        // Marquer comme vu pour cette session
        sessionStorage.setItem('bannerShown', 'true');
        console.log('Affichage de la bannière car visite externe détectée');
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);
      }
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
        animation: 'fadeIn 1s ease-in-out',
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