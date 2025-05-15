import React, { useState, useEffect } from 'react';

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
    
    // Banner display logic
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
    <div
      className="banner fixed top-0 left-0 w-full h-screen bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={() => setShowBanner(false)} // Fermer la bannière au clic
      style={{
        animation: 'fadeIn 1s ease-in-out',
      }}
    >
      <img
        src="/images/promo-presentation.png"
        alt="Bienvenue sur Chogan-by-Ikram"
        className={`rounded-lg cursor-pointer shadow-lg ${
          isMobile ? 'w-full max-w-full mx-4' : 'max-w-1/2'
        }`}
        style={{
          boxShadow: '0px 0px 20px rgba(255, 255, 255, 0.8)',
          maxHeight: isMobile ? '80vh' : '90vh',
        }}
      />

      {/* Close button for better UX */}
      <button 
        className="absolute top-4 right-4 bg-white bg-opacity-70 rounded-full w-8 h-8 flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation();
          setShowBanner(false);
        }}
      >
        <span className="text-black text-lg font-bold">×</span>
      </button>
      
      {/* Add keyframe animation in style tag */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}