// TrustLogos.js
import Image from 'next/image';
import { Box } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material'; // Ajout pour un meilleur contrôle du responsive

export function TrustLogos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Les dimensions seront mieux gérées par la propriété 'sizes' de Next/Image
  // mais nous gardons 'width' et 'height' pour satisfaire le composant <Image>
  const logos = [
    { src: "/logos/cb_visa_mastercard_logo-1.png", alt: "Visa / Mastercard", width: 200, height: 40, size: isMobile ? 120 : 200 },
    { src: "/logos/stripe.png", alt: "Stripe", width: 100, height: 40, size: isMobile ? 80 : 100 },
    { src: "/logos/ssl-secured.png", alt: "SSL Secure", width: 100, height: 40, size: isMobile ? 80 : 100 },
  ];
 
  return (
    <Box 
      component="section"
      sx={{
        // Utilisation directe de Box pour le conteneur section
        width: '100%',
        maxWidth: '100vw', 
        py: { xs: 2, sm: 3 }, // Ajout d'un padding vertical
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'row' }, // Garder 'row' sur mobile aussi pour les logos
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 3, sm: 5 }, // Augmenter le gap pour la lisibilité
        width: '100%',
        maxWidth: '100%',
        px: { xs: 1, sm: 2 },
        boxSizing: 'border-box',
      }}>
        {logos.map((logo, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // Contrôle de la taille des conteneurs pour garantir l'alignement
              width: { xs: 'auto' }, 
              height: { xs: '30px', sm: '40px' }, // Fixer la hauteur du conteneur
            }}
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              style={{
                width: 'auto', // Permet à l'image de s'ajuster en largeur
                height: '100%', // S'adapte à la hauteur du conteneur (30px/40px)
                objectFit: 'contain',
              }}
              className="hover:opacity-80 transition-opacity"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
