// components/Footer.js
import React from 'react';
import { Typography, Container, Box, IconButton, Link } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import { FaTiktok } from 'react-icons/fa'; // TikTok avec react-icons
import { FaSnapchatSquare } from 'react-icons/fa'; // Snapchat avec react-icons


const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#F8F8F8', // Rose poudré
        padding: '5px 0', // Réduction de l'espacement pour un footer encore plus petit
        position: 'fixed', // Fixer le footer en bas
        bottom: 0, // Le placer en bas de la page
        left: 0, // S'assurer qu'il couvre toute la largeur
        width: '100%', // Couvre toute la largeur de la page
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)', // Ombre pour le footer
      }}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2, // Réduction de l'espacement entre les sections
          maxWidth: 'lg',
        }}
      >
        {/* Section Contact */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" color="textPrimary" sx={{ marginBottom: 0.5, fontSize: '0.75rem' }}>
            Contact
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
            Adresse : Chogan Group s.p.a., Montpellier
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
            Email : ikram.bakmou@outlook.fr
          </Typography>
        </Box>

        {/* Section Liens utiles (À propos, Conditions, etc.) */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" color="textPrimary" sx={{ marginBottom: 0.5, fontSize: '0.75rem' }}>
            Liens utiles
          </Typography>
          <Link href="/about" color="textSecondary" sx={{ fontSize: '0.65rem', marginBottom: 0.5 }}>
            À propos
          </Link>
          <Link href="/privacy-policy" color="textSecondary" sx={{ fontSize: '0.65rem', marginBottom: 0.5 }}>
            Politique de confidentialité
          </Link>
          <Link href="/terms" color="textSecondary" sx={{ fontSize: '0.65rem', marginBottom: 0.5 }}>
            Conditions d'utilisation
          </Link>
        </Box>

        {/* Section Suivez-nous (réseaux sociaux) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" color="textPrimary" sx={{ marginBottom: 0.5, fontSize: '0.75rem' }}>
            Suivez-nous
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton href="https://www.snapchat.com/add/ikramou-anass" target="_blank" aria-label="SnapChat">
              <FaSnapchatSquare style={{ fontSize: '1.2rem', color: 'black' }} />
            </IconButton>
            <IconButton href="https://www.instagram.com/ikram_nahyl_amir" target="_blank" aria-label="Instagram">
              <InstagramIcon sx={{ fontSize: '1.2rem', color: 'black' }} />
            </IconButton>
            <IconButton href="https://www.tiktok.com/@ikrams.chogan" target="_blank" aria-label="TikTok">
              <FaTiktok style={{ fontSize: '1.2rem', color: 'black' }} />
            </IconButton>
          </Box>
        </Box>
      </Container>

      {/* Footer Bottom */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 1, // Réduction de l'espacement du bas
          padding: '3px 0', // Réduction du padding du bas
          borderTop: '1px solid #ddd',
          width: '100%',
        }}
      >
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.6rem' }}>
          © 2025 Chogan - Tous droits réservés
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
