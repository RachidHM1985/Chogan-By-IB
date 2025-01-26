import '../styles/about.module.css';
import 'slick-carousel/slick/slick.css'; 
import 'slick-carousel/slick/slick-theme.css';
import React, { useEffect, useState } from 'react';
import { CssBaseline } from '@mui/material'; // Optionnel : réinitialiser les styles de Material-UI
import { CartProvider } from './CartContext';

function MyApp({ Component, pageProps }) {
  // Etat pour s'assurer que nous sommes en mode client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // On définit isClient à true une fois que nous sommes côté client
  }, []);

  // Empêcher le rendu du Router côté serveur
  if (!isClient) return null;

  return (
    <>
      <CssBaseline /> {/* Assure que le CSS de Material-UI est réinitialisé pour un rendu cohérent */}
      
      <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
    </>
  );
}

export default MyApp;
