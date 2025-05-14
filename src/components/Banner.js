import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export default function Banner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    console.log('🔍 Vérification des conditions d\'affichage');

    const referrer = document.referrer || ''; // URL du site précédent
    const currentHost = window.location.hostname || ''; // Domaine actuel

    console.log('🔗 Referrer:', referrer);
    console.log('🏠 Domaine actuel:', currentHost);

    const isFirstEntry = !sessionStorage.getItem('banniereAffichee'); // Première entrée de la session ?
    const isExternalReferrer = referrer && !referrer.includes(currentHost); // Vient-il d'un site externe ?

    console.log('👀 Première entrée de la session ?', isFirstEntry ? '✅ Oui' : '❌ Non');
    console.log('🌍 L\'utilisateur vient-il d\'un site externe ?', isExternalReferrer ? '✅ Oui' : '❌ Non');

    // Affichage de la bannière si c'est la première entrée et pas un rafraîchissement
    if (isFirstEntry && (isExternalReferrer || referrer === '')) {
      console.log('🎉 Affichage de la bannière');
      sessionStorage.setItem('banniereAffichee', 'true');
      setShowBanner(true);

      // Cacher la bannière après 5 secondes
      setTimeout(() => setShowBanner(false), 10000);
    } else {
      console.log('🚫 Pas d\'affichage de la bannière');
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
        src="/images/promo-presentation.png"
        alt="Bienvenue sur Chogan-by-Ikram"
        style={{
          maxWidth: '55%',
          maxHeight: '100vh',
          borderRadius: '10px',
          boxShadow: '0px 0px 20px rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
        }}
      />
    </Box>
  );
}
