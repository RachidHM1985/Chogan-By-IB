import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Container, Button, Card, CardContent, Chip } from '@mui/material';
import Image from 'next/image';
import Head from 'next/head';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import ReviewsSection from '../components/ReviewsSection';
import Link from 'next/link';
import TopProducts from '../components/TopProducts';
import ContactSection from '../components/ContactSection';
import { TrustpilotBanner } from '../components/TrustpilotBanner';
import TrustLogos from '../components/TrustLogos';
import { ArrowForward, LocalShipping, Security, Support, Star } from '@mui/icons-material';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // Hero carousel optimisé avec données structurées
  const heroSlides = [
    { 
      src: '/images/promo-parfum.png', 
      href: '/perfumes',
      title: "Collection Parfums Premium",
      subtitle: "Parfums authentiques inspirés par les plus grandes marques",
      cta: "Découvrir",
      badge: "Parfums premium",
      alt: "Collection de parfums premium - Fragrances d'exception et parfums de luxe"
    },
    { 
      src: '/images/image0_promo.png', 
      href: '/perfumes/Luxe',
      title: "Parfums de Luxe",
      subtitle: "L'élégance à votre portée - Grandes marques disponibles",
      cta: "Découvrir",
      badge: "Parfums de Luxe",
      alt: "Parfums de luxe pour homme et femme - Élégance et raffinement"
    },
    { 
      src: '/images/image4_promo.png', 
      href: '/beauty',
      title: "Soins & Beauté",
      subtitle: "Révélez votre beauté naturelle avec nos produits certifiés",
      cta: "Découvrir",
      badge: "Skincare",
      alt: "Produits de beauté et soins cosmétiques - Révélez votre beauté naturelle"
    },
  ];

  // Marques partenaires avec SEO optimisé
  const brandImages = [
    { 
      src: '/images/olfazeta.png', 
      link: '/perfumes',
      name: "Olfazeta",
      description: "Parfums d'exception",
      alt: "Marque Olfazeta - Parfums d'exception et fragrances premium"
    },
    {
      src: '/images/hover-cooperativa.png',
      link: '/parfumerieInterieur',
      name: "Cooperativa",
      description: "Parfumerie d'intérieur",
      alt: "Marque Cooperativa - Parfumerie d'intérieur et bougies parfumées"
    },
    {
      src: '/images/peptilux.png', 
      link: '/peptilux',
      name: "Peptilux",
      description: "Soins anti-âge",
      alt: "Marque Peptilux - Soins anti-âge et cosmétiques avancés"
    },
    {
      src: '/images/aurodhea.png', 
      link: '/beauty',
      name: "Aurodhea",
      description: "Cosmétiques premium",
      alt: "Marque Aurodhea - Cosmétiques premium et produits de beauté"
    },
    {
      src: '/images/brilhome.png', 
      link: '/brilhome',
      name: "Brilhome",
      description: "Maison & lifestyle",
      alt: "Marque Brilhome - Produits maison et lifestyle premium"
    },
  ];

  // Avantages clients avec détails SEO
  const benefits = [
    {
      icon: <LocalShipping sx={{ fontSize: { xs: 28, sm: 32, md: 36 }, color: '#2196F3' }} />,
      title: "Livraison gratuite",
      subtitle: "Dès 80€ d'achat",
      description: "Profitez de la livraison gratuite pour toute commande supérieure à 80€"
    },
    {
      icon: <Security sx={{ fontSize: { xs: 28, sm: 32, md: 36 }, color: '#4CAF50' }} />,
      title: "Paiement sécurisé",
      subtitle: "100% protégé",
      description: "Vos transactions sont sécurisées avec notre système de paiement SSL"
    },
    {
      icon: <Support sx={{ fontSize: { xs: 28, sm: 32, md: 36 }, color: '#FF9800' }} />,
      title: "Support 24/7",
      subtitle: "Assistance dédiée",
      description: "Notre équipe de support client est disponible 24h/24 et 7j/7"
    },
    {
      icon: <Star sx={{ fontSize: { xs: 28, sm: 32, md: 36 }, color: '#FFD700' }} />,
      title: "Qualité premium",
      subtitle: "Produits certifiés",
      description: "Tous nos produits sont certifiés et testés pour garantir la qualité"
    }
  ];

  const heroSettings = {
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    fade: true,
    arrows: false,
    dots: true,
    dotsClass: "slick-dots custom-hero-dots",
    accessibility: true,
    pauseOnHover: true,
    lazyLoad: 'ondemand'
  };

  const brandSettings = {
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    dots: false,
    centerMode: false,
    variableWidth: false,
    accessibility: true,
    pauseOnHover: true,
    lazyLoad: 'ondemand',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          arrows: false
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
          arrows: false
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '40px',
          arrows: false
        }
      }
    ]
  };

  // Données structurées JSON-LD pour le SEO
  const structuredData = {
    "@context": "https://chogan-by-ikram.vercel.app/",
    "@type": "WebSite",
    "name": "Boutique Parfums & Beauté Premium",
    "description": "Découvrez notre collection de parfums premium, produits de beauté et cosmétiques de luxe. Livraison gratuite dès 80€.",
    "url": "https://chogan-by-ikram.vercel.app/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://chogan-by-ikram.vercel.app/perfumes",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Head>
        {/* SEO Meta Tags */}
        <title>Parfums Premium & Cosmétiques de Luxe | Boutique en Ligne</title>
        <meta name="description" content="Découvrez notre collection exclusive de parfums premium, cosmétiques de luxe et produits de beauté. Marques Olfazeta, Peptilux, Aurodhea. Livraison gratuite dès 80€." />
        <meta name="keywords" content="parfums premium, cosmétiques luxe, beauté, Olfazeta, Peptilux, Aurodhea, parfumerie en ligne, soins anti-âge" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://chogan-by-ikram.vercel.app/" />
        
        {/* Données structurées */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <Header />
      
      <Box 
        component="main"
        sx={{ 
          width: '100%',
          maxWidth: '100vw', // Empêche le dépassement horizontal
          position: 'relative',
          top: { xs: '56px', sm: '64px', md: '10vh' },
          overflow: 'hidden',
          minHeight: 'calc(100vh - 56px)',
          '@media (max-width: 600px)': {
            top: '56px'
          }
        }}
      >

        {/* Hero Section Responsive Optimisée */}
        <section aria-label="Promotions et collections en vedette">
          <Box sx={{ 
            position: 'relative',
            paddingTop: { xs: 7, sm: 6, md: 8, lg: 5 },
            marginBottom: { xs: 2, sm: 3, md: 4, lg: 5 },
            width: '100%',
            maxWidth: '100vw',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '& .custom-hero-dots': {
              bottom: { xs: '12px', sm: '16px', md: '20px', lg: '24px' },
              textAlign: 'center',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'auto',
              zIndex: 10,
              '& li': {
                margin: { xs: '0 3px', sm: '0 4px', md: '0 5px' }
              },
              '& li button:before': {
                fontSize: { xs: '10px', sm: '12px', md: '14px' },
                color: 'white',
                opacity: 0.6,
                transition: 'all 0.3s ease'
              },
              '& li.slick-active button:before': {
                opacity: 1,
                color: 'white',
                transform: 'scale(1.2)'
              },
              '& li button:hover:before': {
                opacity: 0.8
              }
            }
          }}>
            <Container 
              maxWidth="xl" 
              disableGutters
              sx={{ 
                paddingX: { xs: 1, sm: 2, md: 3, lg: 4 }
              }}
            >
              <Slider {...heroSettings}>
                {heroSlides.map((slide, index) => (
                  <Box key={index} sx={{ 
                    position: 'relative',
                    paddingX: { xs: 0.5, sm: 1, md: 1.5 }
                  }}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: { 
                          xs: '100%', 
                          sm: '98%', 
                          md: '95%', 
                          lg: '90%', 
                          xl: '85%' 
                        },
                        height: { 
                          xs: '220px', 
                          sm: '280px', 
                          md: '360px', 
                          lg: '480px',
                          xl: '560px'
                        },
                        borderRadius: { xs: '12px', sm: '16px', md: '20px', lg: '24px' },
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        margin: '0 auto',
                        boxShadow: { 
                          xs: '0 4px 20px rgba(0,0,0,0.15)', 
                          sm: '0 8px 32px rgba(0,0,0,0.18)', 
                          md: '0 12px 48px rgba(0,0,0,0.2)' 
                        },
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: { xs: 'none', sm: 'translateY(-4px)' },
                          boxShadow: { 
                            xs: '0 4px 20px rgba(0,0,0,0.15)', 
                            sm: '0 12px 40px rgba(0,0,0,0.25)' 
                          }
                        }
                      }}
                    >
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center',
                          zIndex: 1,
                        }}
                        sizes="(max-width: 600px) 100vw, (max-width: 900px) 98vw, (max-width: 1200px) 95vw, 90vw"
                        priority={index === 0}
                        quality={90}
                      />
                      
                      {/* Overlay gradient responsive et amélioré */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: {
                            xs: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.8) 100%)',
                            sm: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.4) 100%)',
                            md: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0.2) 100%)'
                          },
                          zIndex: 2
                        }}
                      />
                      
                      {/* Contenu responsive avec alignement à gauche */}
                      <Box sx={{ 
                        position: 'relative',
                        zIndex: 3,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: { xs: 'flex-end', sm: 'center' },
                        padding: { 
                          xs: '16px 20px 24px 20px', 
                          sm: '20px 32px', 
                          md: '24px 40px', 
                          lg: '32px 56px' 
                        },
                        height: '100%'
                      }}>
                        <Box sx={{ 
                          color: 'white', 
                          maxWidth: { 
                            xs: '100%', 
                            sm: '85%', 
                            md: '75%', 
                            lg: '65%', 
                            xl: '55%' 
                          },
                          textAlign: 'left',
                          width: '100%'
                        }}>
                          {/* Badge amélioré */}
                          <Chip 
                            label={slide.badge}
                            sx={{ 
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              marginBottom: { xs: 1, sm: 1.5, md: 2, lg: 2.5 },
                              backdropFilter: 'blur(12px)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              fontSize: { 
                                xs: '0.6rem', 
                                sm: '0.7rem', 
                                md: '0.75rem', 
                                lg: '0.8rem' 
                              },
                              height: { xs: '22px', sm: '26px', md: '30px', lg: '32px' },
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              '& .MuiChip-label': {
                                padding: { xs: '0 8px', sm: '0 12px' }
                              },
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                transform: 'translateY(-1px)'
                              }
                            }}
                          />
                          
                          {/* Titre principal amélioré */}
                          <Typography 
                            component="h1"
                            variant="h2" 
                            sx={{ 
                              fontWeight: { xs: 700, sm: 800, md: 900 },
                              marginBottom: { xs: 1, sm: 1.5, md: 2, lg: 2.5 },
                              fontSize: { 
                                xs: '1.4rem', 
                                sm: '1.8rem', 
                                md: '2.4rem', 
                                lg: '3rem',
                                xl: '3.5rem'
                              },
                              textShadow: '2px 2px 16px rgba(0,0,0,0.8)',
                              lineHeight: { xs: 1.1, sm: 1.15, md: 1.2 },
                              textAlign: 'left',
                              letterSpacing: { xs: '-0.5px', sm: '-0.8px', md: '-1px' },
                              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            {slide.title}
                          </Typography>
                          
                          {/* Sous-titre amélioré avec la même couleur que le titre */}
                          <Typography 
                            component="p"
                            variant="body1" 
                            sx={{ 
                              marginBottom: { xs: 2, sm: 2.5, md: 3, lg: 3.5 },
                              opacity: 0.9,
                              fontSize: { 
                                xs: '0.85rem', 
                                sm: '1rem', 
                                md: '1.1rem', 
                                lg: '1.2rem',
                                xl: '1.3rem'
                              },
                              lineHeight: { xs: 1.3, sm: 1.4, md: 1.5 },
                              textShadow: '1px 1px 8px rgba(0,0,0,0.7)',
                              textAlign: 'left',
                              maxWidth: { xs: '100%', sm: '90%', md: '85%' },
                              fontWeight: 400,
                              // Même style de couleur que le titre
                              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            {slide.subtitle}
                          </Typography>
                          
                          {/* Bouton CTA Moderne et Ergonomique */}
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            width: '100%',
                            paddingTop: { xs: 0.5, sm: 1 }
                          }}>
                            <Button
                              component="a"
                              href={slide.href}
                              variant="contained"
                              size="medium"
                              endIcon={
                                <ArrowForward sx={{
                                  fontSize: { xs: '14px', sm: '16px', md: '18px' },
                                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} />
                              }
                              aria-label={`${slide.cta} - ${slide.title}`}
                              sx={{
                                // Design de base
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                color: '#1a1a1a',
                                fontWeight: { xs: 600, sm: 700 },
                                
                                // Taille ergonomique mobile-first
                                padding: {
                                  xs: '8px 16px',    // Compact sur mobile
                                  sm: '10px 20px',   // Légèrement plus grand sur tablette
                                  md: '12px 24px'    // Taille standard desktop
                                },
                                
                                // Hauteur optimisée pour le touch
                                minHeight: { xs: '36px', sm: '40px', md: '44px' },
                                
                                // Border radius moderne
                                borderRadius: { xs: '18px', sm: '20px', md: '22px' },
                                
                                // Typographie responsive
                                fontSize: {
                                  xs: '0.75rem',  // Plus petit sur mobile
                                  sm: '0.85rem',  // Taille intermédiaire
                                  md: '0.9rem'    // Taille standard
                                },
                                
                                // Largeur adaptative
                                minWidth: { xs: '100px', sm: '110px', md: '120px' },
                                maxWidth: { xs: '140px', sm: '160px', md: '180px' },
                                
                                // Effets visuels
                                textTransform: 'none',
                                letterSpacing: '0.25px',
                                boxShadow: {
                                  xs: '0 4px 16px rgba(0,0,0,0.25)',  // Ombre plus subtile mobile
                                  sm: '0 6px 24px rgba(0,0,0,0.3)'    // Ombre plus prononcée desktop
                                },
                                
                                // Bordure subtile
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(8px)',
                                
                                // États interactifs optimisés mobile
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 1)',
                                  transform: {
                                    xs: 'scale(1.03)',           // Scale simple sur mobile
                                    sm: 'translateY(-2px) scale(1.02)'  // Mouvement + scale sur desktop
                                  },
                                  boxShadow: {
                                    xs: '0 6px 20px rgba(0,0,0,0.35)',
                                    sm: '0 8px 32px rgba(0,0,0,0.4)'
                                  },
                                  '& .MuiSvgIcon-root': {
                                    transform: 'translateX(3px)'
                                  }
                                },
                                
                                // État actif/pressed
                                '&:active': {
                                  transform: {
                                    xs: 'scale(0.97)',           // Feedback tactile mobile
                                    sm: 'translateY(0) scale(0.98)'
                                  },
                                  boxShadow: {
                                    xs: '0 2px 8px rgba(0,0,0,0.3)',
                                    sm: '0 4px 16px rgba(0,0,0,0.35)'
                                  },
                                  transition: 'all 0.1s ease'  // Transition rapide pour le feedback
                                },
                                
                                // Focus pour accessibilité
                                '&:focus-visible': {
                                  outline: '2px solid rgba(255,255,255,0.8)',
                                  outlineOffset: '2px'
                                },
                                
                                // Transition fluide
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                
                                // Amélioration du contraste
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                  borderRadius: 'inherit',
                                  pointerEvents: 'none'
                                },
                                
                                // Position relative pour le pseudo-élément
                                position: 'relative',
                                overflow: 'hidden',
                                
                                // Optimisation touch sur mobile
                                '@media (hover: none)': {
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    transform: 'none'
                                  }
                                },
                                
                                // Amélioration de la zone de touch
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: '-8px',
                                  left: '-8px',
                                  right: '-8px',
                                  bottom: '-8px',
                                  display: { xs: 'block', sm: 'none' }  // Seulement sur mobile
                                }
                              }}
                            >
                              {slide.cta}
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Slider>
            </Container>
          </Box>
        </section>
      
        {/* Section Avantages Centrée */}
        <section aria-label="Nos avantages clients">
          <Container 
            maxWidth="lg" 
            sx={{ 
              marginBottom: { xs: 5, sm: 6, md: 7 }, 
              padding: { xs: '0 16px', sm: '0 24px', md: '0 32px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography 
              component="h2" 
              variant="h3" 
              sx={{ 
                textAlign: 'center', 
                marginBottom: { xs: 3, sm: 4, md: 5 }, 
                fontWeight: 'bold',
                color: '#333',
                fontSize: { 
                  xs: '1.6rem', 
                  sm: '2rem', 
                  md: '2.4rem',
                  lg: '2.8rem'
                },
                lineHeight: 1.2,
                maxWidth: '100%'
              }}
            >
              Pourquoi nous choisir ?
            </Typography>
            <Grid 
              container 
              spacing={{ xs: 2, sm: 3, md: 4 }}
              sx={{ 
                maxWidth: '100%',
                width: '100%',
                margin: 0,
                justifyContent: 'center'
              }}
            >
              {benefits.map((benefit, index) => (
                <Grid 
                  item 
                  xs={6} 
                  sm={6} 
                  md={3} 
                  key={index}
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    padding: { xs: '8px', sm: '12px', md: '16px' }
                  }}
                >
                  <Card sx={{ 
                    textAlign: 'center',
                    padding: { xs: 2, sm: 2.5, md: 3 },
                    width: '100%',
                    maxWidth: { xs: '160px', sm: '180px', md: '220px' },
                    border: 'none',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                    borderRadius: { xs: '16px', sm: '20px', md: '24px' },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 36px rgba(0,0,0,0.18)'
                    },
                    minHeight: { xs: '160px', sm: '180px', md: '200px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Box 
                      sx={{ 
                        marginBottom: { xs: 1, sm: 1.5, md: 2 },
                        display: 'flex',
                        justifyContent: 'center'
                      }} 
                      aria-hidden="true"
                    >
                      {benefit.icon}
                    </Box>
                    <Typography 
                      component="h3"
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold', 
                        marginBottom: { xs: 0.5, sm: 0.5, md: 1 },
                        fontSize: { 
                          xs: '0.85rem', 
                          sm: '0.95rem', 
                          md: '1.05rem',
                          lg: '1.15rem'
                        },
                        lineHeight: 1.2,
                        textAlign: 'center'
                      }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { 
                          xs: '0.7rem', 
                          sm: '0.75rem', 
                          md: '0.8rem',
                          lg: '0.85rem'
                        },
                        lineHeight: 1.3,
                        textAlign: 'center'
                      }}
                    >
                      {benefit.subtitle}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </section>

        {/* Section Produits Populaires Centrée */}
        <section aria-label="Nos produits populaires">
          <Box sx={{ 
            backgroundColor: '#fafafa', 
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Container 
              maxWidth="lg" 
              sx={{ 
                padding: { xs: '0 16px', sm: '0 24px', md: '0 32px' },
                width: '100%'
              }}
            >          
              <TopProducts />
            </Container>
          </Box>
        </section>

        {/* Section Marques Partenaires Centrée */}
        <section aria-label="Nos marques partenaires">
          <Container 
            maxWidth="lg" 
            sx={{ 
              marginY: { xs: 5, sm: 7, md: 8 }, 
              padding: { xs: '0 16px', sm: '0 24px', md: '0 32px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Box sx={{ textAlign: 'center', marginBottom: { xs: 4, sm: 5, md: 6 }, width: '100%' }}>
              <Typography 
                component="h2"
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold', 
                  marginBottom: { xs: 1.5, sm: 2 },
                  background: 'black',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { 
                    xs: '1.6rem', 
                    sm: '2rem', 
                    md: '2.4rem',
                    lg: '2.8rem'
                  },
                  lineHeight: 1.2
                }}
              >
                Nos Marques Partenaires
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#666',
                  fontSize: { 
                    xs: '0.95rem', 
                    sm: '1.05rem', 
                    md: '1.15rem',
                    lg: '1.25rem'
                  },
                  lineHeight: 1.3,
                  maxWidth: { xs: '100%', sm: '80%', md: '70%' },
                  margin: '0 auto'
                }}
              >
                Des marques d'exception pour votre bien-être
              </Typography>
            </Box>
            
            <Box sx={{ 
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              '& .slick-slide': {
                padding: { xs: '0 6px', sm: '0 8px', md: '0 10px' },
                height: 'auto'
              },
              '& .slick-list': {
                padding: { xs: '0 12px', sm: '0 16px', md: '0 20px' },
                margin: { xs: '0 -12px', sm: '0 -16px', md: '0 -20px' }
              },
              '& .slick-track': {
                display: 'flex',
                alignItems: 'stretch'
              },
              '& .slick-slide > div': {
                height: '100%'
              },
              '& .slick-arrow': {
                zIndex: 1,
                display: { xs: 'none !important', md: 'block !important' },
                '&:before': {
                  fontSize: '22px',
                  color: '#333'
                }
              },
              '& .slick-prev': {
                left: { md: '-40px', lg: '-45px' }
              },
              '& .slick-next': {
                right: { md: '-40px', lg: '-45px' }
              }
            }}>
              <Slider {...brandSettings}>
                {brandImages.map((brand, index) => (
                  <Box key={index} sx={{ height: '100%' }}>
                    <Link href={brand.link} passHref>
                      <Card sx={{
                        cursor: 'pointer',
                        borderRadius: { xs: '16px', sm: '20px', md: '24px' },
                        overflow: 'hidden',
                        boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: { xs: '220px', sm: '240px', md: '260px' },
                        maxWidth: '100%',
                        '&:hover': {
                          transform: 'translateY(-12px)',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
                        }
                      }}>
                        <Box sx={{ 
                          aspectRatio: '16/10',
                          width: '100%',
                          position: 'relative',
                          overflow: 'hidden',
                          minHeight: { xs: '140px', sm: '160px', md: '180px' }
                        }}>
                          <Image
                            src={brand.src}
                            alt={brand.alt}
                            fill
                            style={{
                              objectFit: 'contain',
                              objectPosition: 'center',
                              padding: '16px'
                            }}
                            sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 22vw"
                            loading="lazy"
                          />
                        </Box>
                        <CardContent sx={{ 
                          textAlign: 'center', 
                          padding: { xs: 2, sm: 2.5, md: 3 },
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <Typography 
                            component="h3"
                            variant="h6" 
                            sx={{ 
                              fontWeight: 'bold',
                              marginBottom: { xs: 0.5, sm: 0.5, md: 1 },
                              fontSize: { 
                                xs: '0.85rem', 
                                sm: '0.95rem', 
                                md: '1.05rem',
                                lg: '1.15rem'
                              },
                              lineHeight: 1.2
                            }}
                          >
                            {brand.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontSize: { 
                                xs: '0.7rem', 
                                sm: '0.75rem', 
                                md: '0.8rem',
                                lg: '0.85rem'
                              },
                              lineHeight: 1.3
                            }}
                          >
                            {brand.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Link>
                  </Box>
                ))}
              </Slider>
            </Box>
          </Container>
        </section>

        {/* Section Trust Logos Centrée */}
        <section aria-label="Nos certifications et partenaires de confiance">
          <Box sx={{ 
            backgroundColor: '#f8f9fa', 
            padding: { xs: '40px 0', sm: '50px 0', md: '60px 0' },
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Container 
              maxWidth="lg" 
              sx={{ 
                padding: { xs: '0 16px', sm: '0 24px', md: '0 32px' },
                width: '100%'
              }}
            >            
              <TrustLogos />
            </Container>
          </Box>
        </section>
        {/* Section Avis Clients */}
        <section aria-label="Avis et témoignages clients">
          <Container maxWidth="lg" sx={{ 
            marginY: { xs: 4, sm: 6 }, 
            padding: { xs: '0 16px', sm: '0 24px' } 
          }}>
            <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
              <Typography 
                component="h2"
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold', 
                  marginBottom: 2,
                  color: '#333',
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
                }}
              >
                Ce que disent nos clients
              </Typography>
            </Box>
            <TrustpilotBanner />
            <Box sx={{ marginTop: 4 }}>
              <ReviewsSection productId={'*'} isInsertComment={false} />
            </Box>
          </Container>
        </section>

        {/* Section Contact */}
        <section aria-label="Nous contacter">
          <Box sx={{ backgroundColor: '#f8f9fa', padding: { xs: '40px 0', sm: '60px 0' } }}>
            <ContactSection />
          </Box>
        </section>
        {/* Footer */}
        <Footer />
      </Box>     
    </>
  );
}