import React from 'react';
import Image from 'next/image';
import { Box } from '@mui/material';

export default function TrustLogos() {
  const logos = [
    { src: "/logos/cb_visa_mastercard_logo-1.png", alt: "Visa / Mastercard", width: 200, height: 40 },
    { src: "/logos/stripe.png", alt: "Stripe", width: 100, height: 40 },
    { src: "/logos/ssl-secured.png", alt: "SSL Secure", width: 100, height: 40 },
  ];
 
  return (
    <section>
      <Box sx={{
        display: 'flex',
        flexDirection: {
          xs: 'column', // colonne sur petit écran
          md: 'row'     // ligne à partir de medium
        },
        flexWrap: {
          xs: 'wrap', // Enable wrapping on small screens
          md: 'nowrap' // Keep as nowrap on medium screens and above
        },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        '& > div': {
          flex: {
            xs: '0 0 40%', // On small screens, each logo takes ~40% width (2 per row)
            md: '0 0 auto' // On medium screens and up, auto size
          }
        }
      }}>
        {logos.map((logo, index) => (
          <div key={index} className="flex items-center justify-center m-2">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="hover:opacity-80 transition-opacity"
            />
          </div>
        ))}
      </Box>
    </section>
  );
}