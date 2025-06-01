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
    // {
    //   text: (
    //     // <>
    //     //   🔥 Offre Spéciale :{' '}
    //     //   <strong style={{ color: '#FFD700' }}>-50%</strong> sur le 2ᵉ produit avec le code :{' '}
    //     //   <Box component="span" sx={{ color: '#fff', fontWeight: 'bold', ml: 1 }}>
    //     //     CHOGAN50
    //     //   </Box>
    //     // </>
    //   ),
    // },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        background: 'linear-gradient(90deg, #C59A6B, #E6BE9A)',
        color: '#fff',
        fontWeight: 500,
        py: 1,
        px: 2,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          whiteSpace: 'nowrap',
          animation: 'scrollText 30s linear infinite',
          '&:hover': {
            animationPlayState: 'paused',
          },
        }}
      >
        {messages.map((msg, index) => (
          <Typography
            key={index}
            sx={{
              display: 'inline-block',
              mr: 6,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.6,
            }}
          >
            {msg.text}
          </Typography>
        ))}
      </Box>

      <style jsx>{`
        @keyframes scrollText {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </Box>
  );
};

export default ScrollingBanner;
