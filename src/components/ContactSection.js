'use client'

import { Box, Grid, Typography, Link, Button } from '@mui/material'

export default function ContactSection() {
  return (
    <section style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '10vh' }}>
       
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // Stack on small screens, row on medium and up
          alignItems: 'center', // Center elements vertically
          justifyContent: 'center', // Center elements horizontally
          width: '100%',
          maxWidth: '1200px', // Max width for larger screens
          gap: { xs: '20px', md: '0' }, // Gap between elements on small screens
          padding: '10px',
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
              maxHeight: '474px',
              objectFit: 'cover',
              borderRadius: '10px',
            }}
            loading="lazy"
          />
        </picture>

        <Box
          sx={{
            padding: { xs: '20px', md: '30px' }, // Padding adapts to screen size
            maxWidth: { xs: '100%', md: '500px' },
            textAlign: 'center', // Center text for all screen sizes
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
            <Typography
                variant="h6" // Utilisation d'un titre plus grand pour une meilleure hiérarchisation
                fontWeight="bold"
                sx={{
                    position:'relative',
                    fontSize: '1.25rem', // Taille légèrement plus grande
                    lineHeight: 1.5, // Ajout d'un interligne pour plus de lisibilité
                    textAlign: 'left', // Aligner à gauche
                }}
                >
            Nous contacter
            </Typography>

          <Typography variant="body1" sx={{ marginTop: '10px' }}>
          Pour toute question concernant nos produits ou votre commande, je suis à votre disposition du lundi au samedi, de 9h à 19h, et je vous répondrai personnellement depuis mon bureau à Montpellier.
          </Typography>
          <Typography variant="body2" sx={{ marginTop: '20px' }}>
          Restez informé(e) des dernières actualités concernant nos produits sur nos réseaux sociaux. Vous y trouverez également un espace pour poser toutes vos questions. Si vous préférez, vous pouvez également nous contacter directement par email.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center', // Center buttons horizontally
              marginTop: '20px',
            }}
          >
            <Button
              component={Link}
              href="https://instagram.com/direct/t/ikram_nahyl_amir/?text=Bonjour,%20j'aimerais%20acheter%20votre%20produit"
              variant="contained"
              color="primary"
              sx={{
                textTransform: 'none',
                padding: '10px 20px',
                fontSize: '1rem',
              }}
            >
              Contactez-nous sur Instagram
            </Button>

            <Button
              component={Link}
              href="mailto:choganbyikram.contact@gmail.com"
              variant="contained"
              color="secondary"
              sx={{
                textTransform: 'none',
                padding: '10px 20px',
                fontSize: '1rem',
              }}
            >
              Écrivez-nous par email
            </Button>
          </Box>          
        </Box>
      </Box>
    </section>
  )
}
