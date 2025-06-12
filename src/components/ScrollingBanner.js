// components/ScrollingBanner.js
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Link from 'next/link';

const ScrollingBanner = () => {
  const theme = useTheme();
  
  const messages = [
    {
      text: "🚚 Livraison offerte dès 80€ d'achat !",
    },
    {
      text: (
        <>
          🚀 Marre de la routine ?{' '}
          <Link href="/BecomeConsultant" passHref legacyBehavior>
            <a style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'underline' }}>
              Deviens Consultant Chogan 💼
            </a>
          </Link>
        </>
      ),
    },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100vw', // Limite importante
        background: 'linear-gradient(90deg, #C59A6B, #E6BE9A)',
        color: '#fff',
        fontWeight: 500,
        py: 1,
        px: { xs: 1, sm: 2 }, // Padding responsive
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0, // Ajout pour contraindre la largeur
        zIndex: 9999,
        overflow: 'hidden', // Crucial pour empêcher le débordement
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        boxSizing: 'border-box', // Inclut padding dans la largeur
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          whiteSpace: 'nowrap',
          animation: 'scrollText 30s linear infinite',
          willChange: 'transform', // Optimisation performance
          '&:hover': {
            animationPlayState: 'paused',
          },
          // Animation CSS-in-JS au lieu de style jsx
          '@keyframes scrollText': {
            '0%': {
              transform: 'translateX(100vw)', // Utilise viewport width
            },
            '100%': {
              transform: 'translateX(-100%)',
            },
          },
        }}
      >
        {messages.map((msg, index) => (
          <Typography
            key={index}
            sx={{
              display: 'inline-block',
              mr: { xs: 4, sm: 6 }, // Marge responsive
              fontSize: { xs: '0.85rem', sm: '1rem' }, // Taille responsive
              lineHeight: 1.6,
              minWidth: 'max-content', // Empêche la compression du texte
            }}
          >
            {msg.text}
          </Typography>
        ))}
        
        {/* Duplication des messages pour un défilement continu */}
        {messages.map((msg, index) => (
          <Typography
            key={`duplicate-${index}`}
            sx={{
              display: 'inline-block',
              mr: { xs: 4, sm: 6 },
              fontSize: { xs: '0.85rem', sm: '1rem' },
              lineHeight: 1.6,
              minWidth: 'max-content',
            }}
          >
            {msg.text}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default ScrollingBanner;