import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export default function Banner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkExternalVisit = () => {
      const referrer = document.referrer; // Document referrer
      const currentHost = window.location.hostname; // Le domaine actuel

      // Log du referrer pour débogage
      console.log('Referrer:', referrer);
      console.log('Current Host:', currentHost);

      // Si le referrer existe et n'est pas vide, et qu'il ne correspond pas à votre domaine
      if (referrer && !referrer.includes(currentHost)) {
        // Vérifier si l'utilisateur est un visiteur extérieur
        if (!localStorage.getItem('externalVisit')) {
          // Marquer la visite comme extérieure dans le localStorage
          localStorage.setItem('externalVisit', 'true');
          console.log('Utilisateur vient d\'un autre site, affichage de la bannière');
          setShowBanner(true);

          // Cacher la bannière après 5 secondes
          setTimeout(() => setShowBanner(false), 5000);
        }
      } else {
        console.log('L\'utilisateur ne vient pas d\'un site extérieur.');
      }
    };

    // Exécuter la vérification lors du chargement du composant
    checkExternalVisit();
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
