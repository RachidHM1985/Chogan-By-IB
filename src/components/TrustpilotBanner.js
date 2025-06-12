// TrustLogos.js
import Image from 'next/image';
import { Box } from '@mui/material';

export function TrustLogos() {
  const logos = [
    { src: "/logos/cb_visa_mastercard_logo-1.png", alt: "Visa / Mastercard", width: 200, height: 40 },
    { src: "/logos/stripe.png", alt: "Stripe", width: 100, height: 40 },
    { src: "/logos/ssl-secured.png", alt: "SSL Secure", width: 100, height: 40 },
  ];
 
  return (
    <section
      style={{
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
        padding: '0 16px',
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 1, sm: 2 },
        width: '100%',
        maxWidth: '100%',
        padding: { xs: 1, sm: 2 },
        boxSizing: 'border-box',
      }}>
        {logos.map((logo, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: '45%', sm: 'auto' },
              maxWidth: { xs: '150px', sm: '200px' },
              minWidth: 0,
            }}
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
              className="hover:opacity-80 transition-opacity"
            />
          </Box>
        ))}
      </Box>
    </section>
  );
}

// TrustpilotBanner.js
import React from 'react';

export function TrustpilotBanner() {
  return (
    <section 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '5vh',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
        padding: '0 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: '#002244',
          padding: '10px',
          borderRadius: '1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '600px',
        }}
      >
        <a
          className="trustpilot-widget"
          href="https://fr.trustpilot.com/review/chogan-by-ikram.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: '#000',
            fontWeight: 'bold',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: '100%',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ 
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}>
            Excellent
          </span>
          <img
            src="https://nutriandco.com/themes/nutriandco/assets/img/homepage/trustpilot-stars.svg"
            alt="Note Trustpilot"
            width={100}
            height={20}
            loading="lazy"
            style={{ 
              maxWidth: '100px',
              width: 'auto',
              height: 'auto',
              flexShrink: 0,
            }}
          />
          <span style={{ 
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}>
            Trustpilot
          </span>
        </a>
      </div>
    </section>
  );
}

export default TrustpilotBanner;