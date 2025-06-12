// ContactSection.js
'use client'

import { Box, Typography, Link, Button } from '@mui/material'

export function ContactSection() {
  return (
    <section 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '10vh',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: { xs: '100%', md: '1200px' },
          gap: { xs: 2, md: 0 },
          padding: { xs: 1, sm: 2 },
          backgroundColor: '#f8f9fa',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            maxWidth: { xs: '100%', md: '600px' },
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <picture>
            <source
              media="(min-width: 1781px)"
              srcSet="https://nutriandco.com/themes/nutriandco/assets/img/homepage/sav-710x474-compressed.webp?v=0238757136"
              type="image/webp"
            />
            <source
              media="(min-width: 1781px)"
              srcSet="https://nutriandco.com/themes/nutriandco/assets/img/homepage/sav-710x474-compressed.jpg?v=0238757136"
              type="image/jpg"
            />
            <source
              media="(min-width: 1581px) and (max-width: 1780px)"
              srcSet="https://nutriandco.com/themes/nutriandco/assets/img/homepage/sav-637x425-compressed.webp?v=0238757136"
              type="image/webp"
            />
            <source
              media="(min-width: 1581px) and (max-width: 1780px)"
              srcSet="https://nutriandco.com/themes/nutriandco/assets/img/homepage/sav-637x425-compressed.jpg?v=0238757136"
              type="image/jpg"
            />
            <source
              media="(min-width: 1281px) and (max-width: 1580px)"
              srcSet="https://nutriandco.com/themes/nutriandco/assets/img/homepage/sav-516x344-compressed.webp?v=0238757136"
              type="image/webp"
            />
            <source
              media="(min-width: 1281px) and (max-width: 1580px)"
              srcSet="https://nutriandco.com/themes/nutriandco/assets/img/homepage/sav-516x344-compressed.jpg?v=0238757136"
              type="image/jpg"
            />
            <source
              media="(max-width: 1024px)"
              srcSet="https://nutriandco.com/themes/nutriandco/assets/img/homepage/sav-315x210-compressed.webp?v=0238757136"
              type="image/webp"
            />
            <source
              media="(max-width: 1024px)"
              srcSet="https://nutriandco.com/themes/nutriandco/assets/img/homepage/sav-315x210-compressed.jpg?v=0238757136"
              type="image/jpg"
            />
            <img
              src="https://nutriandco.com/themes/nutriandco/assets/img/homepage/sav-710x474-compressed.webp?v=0238757136"
              alt="Sonia SAV"
              style={{
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'cover',
                borderRadius: '10px',
              }}
              loading="lazy"
            />
          </picture>
        </Box>

        <Box
          sx={{
            padding: { xs: 2, sm: 3, md: 4 },
            width: { xs: '100%', md: '50%' },
            maxWidth: { xs: '100%', md: '500px' },
            textAlign: { xs: 'center', md: 'left' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-start' },
            boxSizing: 'border-box',
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              lineHeight: 1.5,
              textAlign: { xs: 'center', md: 'left' },
              marginBottom: 2,
            }}
          >
            Nous contacter
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              marginBottom: 2,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Pour toute question concernant nos produits ou votre commande, je suis à votre disposition du lundi au samedi, de 9h à 19h, et je vous répondrai personnellement depuis mon bureau à Montpellier.
          </Typography>

          <Typography 
            variant="body2" 
            sx={{ 
              marginBottom: 3,
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Restez informé(e) des dernières actualités concernant nos produits sur nos réseaux sociaux. Vous y trouverez également un espace pour poser toutes vos questions. Si vous préférez, vous pouvez également nous contacter directement par email.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 2 },
              justifyContent: { xs: 'center', md: 'flex-start' },
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <Button
              component={Link}
              href="https://instagram.com/direct/t/ikram_nahyl_amir/?text=Bonjour,%20j'aimerais%20acheter%20votre%20produit"
              variant="contained"
              sx={{
                textTransform: 'none',
                padding: { xs: '8px 12px', sm: '10px 16px' },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                backgroundColor: "#efe7db",
                color: '#333',
                width: { xs: '100%', sm: 'auto' },
                minWidth: 0,
                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                '&:hover': {
                  backgroundColor: "#e6dcc7",
                },
              }}
            >
              Instagram
            </Button>

            <Button
              component={Link}
              href="mailto:choganbyikram.contact@gmail.com"
              variant="contained"
              sx={{
                textTransform: 'none',
                padding: { xs: '8px 12px', sm: '10px 16px' },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                backgroundColor: "#efe7db",
                color: '#333',
                width: { xs: '100%', sm: 'auto' },
                minWidth: 0,
                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                '&:hover': {
                  backgroundColor: "#e6dcc7",
                },
              }}
            >
              Email
            </Button>
          </Box>
        </Box>
      </Box>
    </section>
  )
}