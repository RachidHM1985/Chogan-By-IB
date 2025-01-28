import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import Slider from 'react-slick'; 
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  // S'assurer que le code ne s'exécute que côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Evite le rendu SSR

  // Liste des images pour le carrousel automatique
  const promoImages = [
    '/images/image0_promo.png',
    '/images/image2_promo.png',
    '/images/image3_promo.png',
    '/images/image4_promo.jpg',
  ];

  // Liste des images pour le carrousel manuel
  const manualImages = [
    '/images/olfazeta.png',
    '/images/hover-cooperativa.png',
    '/images/peptilux.png',
    '/images/aurodhea.png',
    '/images/brilhome.png',
  ];

  // Paramètres du carrousel automatique
  const autoCarouselSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  // Paramètres du carrousel manuel
  const manualCarouselSettings = {
    infinite: true,
    slidesToShow: 4, // Affiche 4 images à la fois
    slidesToScroll: 1,
    focusOnSelect: true,
    dots: true,  // Affiche les points de navigation
    customPaging: function (i) {
      return (
        <div className="custom-dot">
          <span></span>
        </div>
      );
    },
    responsive: [
      {
        breakpoint: 768, // Pour les écrans de taille tablette et en dessous
        settings: {
          slidesToShow: 1, // Afficher une seule image sur petit écran
          centerMode: true, // Centrer l'image
          centerPadding: '20px', // Espacement autour des images
        },
      },
      {
        breakpoint: 480, // Pour les écrans très petits comme les téléphones
        settings: {
          slidesToShow: 1, // Afficher une seule image
          centerMode: true,
          centerPadding: '10px',
        },
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%',  top: '17vh',  position:'relative'}}>
      {/* Affichage du Header */}
      <Header />

      {/* Carrousel automatique pour les images promotionnelles */}
      <Box sx={{ marginBottom: '5px', marginLeft:'5%', marginRight:'5%', }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
            <Box sx={{ justifyContent: 'center', alignItems: 'center', height: 'auto' }}>
              <Slider {...autoCarouselSettings}>              
                  {promoImages.map((image, index) => (
                    <div key={index}>
                      <img
                        src={image}
                        alt={`Promo ${index}`}
                        style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '10px' }}
                      />
                    </div>                 
                ))}
              </Slider>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Carrousel manuel avec titre et phrase */}
      <Box sx={{ marginTop: '20px' }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={10} md={8}>
            {/* Titre "Nos Marques" */}
            <Box sx={{ textAlign: 'center', marginBottom: '5px' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                Nos Marques
              </Typography>
              {/* Phrase sous le titre */}
              <Typography variant="body2" sx={{ fontWeight: 'normal', color: '#555' }}>
                Offrez-vous le meilleur pour votre bien-être et votre maison.
              </Typography>
            </Box>

            {/* Carrousel manuel */}
            <Box sx={{
              justifyContent: 'center',
              alignItems: 'center',
              height: '250px', // Hauteur de la Box ajustée
              overflow: 'hidden', // Masque les excédents
              marginBottom: '5px', // Espacement sous le carrousel manuel
              textAlign: 'center', // Centrer le contenu à l'intérieur de la box
            }}>
              <Slider {...manualCarouselSettings}>
                {manualImages.map((image, index) => (
                  <div key={index}>
                    <img
                      src={image}
                      alt={`Image ${index}`}
                      style={{
                        borderRadius:'30px',
                        width: '100%', // L'image prend toute la largeur du conteneur
                        height: '100%', // Hauteur ajustée
                        objectFit: 'cover', // Maintient l'aspect des images
                        paddingLeft: '11px', // Espacement entre les images
                        paddingRight: '12px',
                      }}
                    />
                  </div>
                ))}
              </Slider>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Affichage du Footer */}
      <Footer />
    </div>
  );
}