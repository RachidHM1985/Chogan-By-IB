import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export default function Banner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Run once on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
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
      // Cacher la bannière après 10 secondes
      setTimeout(() => setShowBanner(false), 10000);
    } else {
      console.log('🚫 Pas d\'affichage de la bannière');
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
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
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        animation: 'fadeIn 1s ease-in-out',
        padding: isMobile ? '16px' : '32px',
      }}
      onClick={() => setShowBanner(false)} // Fermer la bannière au clic
    >
      <img
        src="/images/promo-presentation.png"
        alt="Bienvenue sur Chogan-by-Ikram"
        style={{
          maxWidth: isMobile ? '95%' : '60%',
          maxHeight: '85%',
          borderRadius: '10px',
          boxShadow: '0px 0px 20px rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          objectFit: 'contain',
        }}
      />
      
      {/* Close button */}
      <Box
        sx={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowBanner(false);
        }}
      >
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>×</span>
      </Box>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </Box>
  );
}