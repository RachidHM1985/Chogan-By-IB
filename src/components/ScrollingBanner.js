// components/ScrollingBanner.js

import React from 'react';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';

const ScrollingBanner = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '25px',
        width: '100%',
        backgroundColor: '#C59A6B',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '10px 0',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        width: '100%',
        backgroundColor: '#C59A6B',
        color: '#fff',
        padding: '10px 0',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'scrollText 25s linear infinite',
          animationDelay: '0s',
        }}
      >
        {[
          "🚚 Livraison offerte à partir de 80€ d'achat ! 🎉",
          "🚀 Prêt à gagner plus et à prendre le contrôle de ton avenir ? ",
          "⚡ Offre Flash : -50% sur le 2ème produit avec le code : CHOGAN50 🔥"
        ].map((message, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              display: 'inline-block',
              marginRight: '80px',
              fontWeight: 500,
              fontSize: '15px',
            }}
          >
            {index === 1 ? (
              <>
                🚀 Prêt à gagner plus et à prendre le contrôle de ton avenir ?{' '}
                <Link href="/BecomeConsultant" passHref>
                  <Box
                    component="span"
                    sx={{ color: 'black', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    💼 Deviens Consultant !
                  </Box>
                </Link>
              </>
            ) : index === 3 ? (
              <>
                ⚡ Offre Flash : -50% sur le 2ème produit avec le code :{' '}
                <Box component="span" sx={{ color: 'black', fontWeight: 600 }}>
                  CHOGAN50
                </Box>{' '}
                🔥
              </>
            ) : (
              message
            )}
          </Typography>
        ))}
      </Box>

      <style>{`
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
