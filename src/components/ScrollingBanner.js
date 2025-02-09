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
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'scrollText1 19s linear infinite',
          animationDelay: '0s',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            overflow: 'hidden',
            display: 'inline-block',
            marginRight: '400px',
          }}
        >
          🚚 Livraison offerte à partir de 80€ d'achat ! 🎉
        </Typography>
       
          <Typography
            variant="body1"
            sx={{
              overflow: 'hidden',
              display: 'inline-block',
              cursor: 'pointer', // Modifier le curseur pour indiquer que le texte est cliquable
            }}
          >
        🚀 Prêt à gagner plus et à prendre le contrôle de ton avenir ?   
            <Link href="/BecomeConsultant" passHref>
              <span 
                style={{ color:'black', textDecoration: 'underline' }}
              >Deviens Consultant !💼</span>
            </Link>         
          </Typography>        
      </Box>
      <style>
        {`
          @keyframes scrollText1 {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default ScrollingBanner;
