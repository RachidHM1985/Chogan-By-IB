import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import ReviewsSection from '../components/ReviewsSection';
import Link from 'next/link';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  // S'assurer que le code ne s'exécute que côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Evite le rendu SSR

  // Liste des images pour le carrousel automatique
// Liste des images avec leurs liens respectifs
const promoImages = [
  { src: '/images/image0_promo.jpg', href: '/perfumes' },
  { src: '/images/image2_promo.png', href: '/perfumes' },
  { src: '/images/image3_promo.png', href: '/beauty' },
  { src: '/images/image4_promo.jpg', href: '/beauty' },
];


  // Liste des images pour le carrousel manuel
  const manualImages = [
    { src: '/images/olfazeta.png', link: '/perfumes' },
    {src:'/images/hover-cooperativa.png',link: ''},
    {src:'/images/peptilux.png', link: '/peptilux'},
    {src:'/images/aurodhea.png', link: '/beauty'},
    {src:'/images/brilhome.png', link: '/brilhome'},
  ];

  // Paramètres du carrousel automatique
  const autoCarouselSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
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
    <>
      <Header />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          top:'15vh', 
          position: 'relative',
        }}
      >
        {/* Carrousel automatique pour les images promotionnelles */}
        <Box sx={{
          marginLeft: '5%', 
          marginRight: '5%',  
          top: '2vh',
          position: 'relative', 
          marginBottom: '5px',
        }}>
          <Grid container justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
            <Slider {...autoCarouselSettings}>
              {promoImages.map((item, index) => (
                <div key={index}>
                  <a href={item.href} style={{ display: 'block' }}>
                    <img
                      src={item.src}
                      alt={`Promo ${index}`}
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                        borderRadius: '10px',
                      }}
                    />
                  </a>
                </div>
              ))}
            </Slider>
          </Grid>
        </Grid>
        </Box>
        {/* Carrousel manuel avec titre et phrase */}
        <Box sx={{ position: 'relative', top: '5vh' }}>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={10} md={8}>
              <Box sx={{ textAlign: 'center', marginBottom: '5px' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                  Nos Marques
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'normal', color: '#555' }}>
                  Offrez-vous le meilleur pour votre bien-être et votre maison.
                </Typography>
              </Box>

              {/* Carrousel manuel */}
              <Box
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  overflow: 'hidden',
                  marginBottom: '30px',
                  textAlign: 'center',
                }}
              >
                <Slider {...manualCarouselSettings}>
                  {manualImages.map((image, index) => (
                    <div key={index}>
                      {/* Envelopper l'image avec un <Link> pour la redirection */}
                      <Link href={image.link} passHref>
                        <img
                          src={image.src}
                          alt={`Image ${index}`}
                          style={{
                            borderRadius: '30px',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            paddingLeft: '11px',
                            paddingRight: '12px',
                          }}
                        />
                      </Link>
                    </div>
                  ))}
                </Slider>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Section des Avis Clients */}
        <Box sx={{ marginTop: '40px', backgroundColor: '#f8f8f8', padding: '5px 5px' }}>
          <ReviewsSection productId={'*'} isInsertComment={false} />
        </Box>
        {/* Footer */}
        <Footer />      
      </Box>  
    </>
  );
}