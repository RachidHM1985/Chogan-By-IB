import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export default function Banner() {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    // Fonction pour vérifier les conditions d'affichage de la bannière
    const verifierConditionsAffichage = () => {
      console.log('Début de la vérification des conditions d\'affichage');
      
      // 1. Vérification du paramètre d'URL
      let sourceParam = null;
      console.log('URL complète:', window.location.href);
      console.log('Chaîne de recherche:', window.location.search);
      
      if (window.location.search) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          sourceParam = urlParams.get('source');
          console.log('Paramètre source trouvé:', sourceParam);
        } catch (err) {
          console.error('Erreur URLSearchParams:', err);
          // Méthode alternative pour récupérer le paramètre
          const match = window.location.search.match(/[?&]source=([^&]*)/);
          sourceParam = match ? match[1] : null;
          console.log('Paramètre source récupéré manuellement:', sourceParam);
        }
      } else {
        console.log('Aucun paramètre URL trouvé');
      }
      
      // 2. Vérification du referrer
      const referrer = document.referrer || '';
      const currentHost = window.location.hostname || '';
      console.log('Referrer:', referrer);
      console.log('Domaine actuel:', currentHost);
      
      let isExternalReferrer = false;
      if (referrer && currentHost && !referrer.includes(currentHost)) {
        isExternalReferrer = true;
        console.log('L\'utilisateur vient d\'un site externe');
      } else {
        console.log('L\'utilisateur ne vient pas d\'un site externe ou référent non disponible');
      }
      
      // 3. Vérification de l'affichage précédent
      const dejaAffiche = sessionStorage.getItem('banniereAffichee');
      console.log('Bannière déjà affichée ?', dejaAffiche ? 'Oui' : 'Non');
      
      // 4. Décision finale
      const doitAfficher = (isExternalReferrer || sourceParam === 'external') && !dejaAffiche;
      console.log('Décision finale - Afficher la bannière ?', doitAfficher ? 'Oui' : 'Non');
      
      if (doitAfficher) {
        sessionStorage.setItem('banniereAffichee', 'true');
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);
      }
      
      // 5. Option pour forcer l'affichage (à décommenter pour tester)
      /*
      if (!dejaAffiche) {
        console.log('FORÇAGE de l\'affichage pour test');
        sessionStorage.setItem('banniereAffichee', 'true');
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);
      }
      */
    };
    
    // Exécuter la vérification
    verifierConditionsAffichage();
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
      onClick={() => setShowBanner(false)}
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