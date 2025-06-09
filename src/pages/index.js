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
      subtitle: "Parfums authentiques inspirés par les plus grandes marques - Livraison gratuite dès 80€",
      cta: "Explorer maintenant",
      badge: "Nouveauté",
      alt: "Collection de parfums premium - Fragrances d'exception et parfums de luxe"
    },
    { 
      src: '/images/image0_promo.png', 
      href: '/perfumes',
      title: "Parfums de Luxe",
      subtitle: "L'élégance à votre portée - Grandes marques disponibles",
      cta: "Voir la collection",
      badge: "Tendance",
      alt: "Parfums de luxe pour homme et femme - Élégance et raffinement"
    },
    { 
      src: '/images/image4_promo.png', 
      href: '/beauty',
      title: "Soins & Beauté",
      subtitle: "Révélez votre beauté naturelle avec nos produits certifiés",
      cta: "Découvrir",
      badge: "Best-seller",
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
      icon: <LocalShipping sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#2196F3' }} />,
      title: "Livraison gratuite",
      subtitle: "Dès 80€ d'achat",
      description: "Profitez de la livraison gratuite pour toute commande supérieure à 80€"
    },
    {
      icon: <Security sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#4CAF50' }} />,
      title: "Paiement sécurisé",
      subtitle: "100% protégé",
      description: "Vos transactions sont sécurisées avec notre système de paiement SSL"
    },
    {
      icon: <Support sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#FF9800' }} />,
      title: "Support 24/7",
      subtitle: "Assistance dédiée",
      description: "Notre équipe de support client est disponible 24h/24 et 7j/7"
    },
    {
      icon: <Star sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#FFD700' }} />,
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
          centerPadding: '20px',
          arrows: false
        }
      }
    ]
  };

  // Données structurées JSON-LD pour le SEO
  const structuredData = {
    "@context": "https://schema.org",
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
          position: 'relative',
          top: { xs: '56px', sm: '64px', md: '10vh' },
          overflow: 'hidden',
          minHeight: 'calc(100vh - 56px)',
          '@media (max-width: 600px)': {
            top: '56px'
          }
        }}
      >
        
        {/* Hero Section Optimisée */}
        <section aria-label="Promotions et collections en vedette">
          <Box sx={{ 
            position: 'relative',
            marginBottom: { xs: 2, sm: 3, md: 4 },
            padding: { xs: '8px', sm: '16px', md: '20px' },
            '& .custom-hero-dots': {
              bottom: { xs: '10px', sm: '15px', md: '20px' },
              '& li': {
                margin: { xs: '0 2px', sm: '0 3px' }
              },
              '& li button:before': {
                fontSize: { xs: '8px', sm: '10px', md: '12px' },
                color: 'white',
                opacity: 0.5
              },
              '& li.slick-active button:before': {
                opacity: 1,
                color: 'white'
              }
            }
          }}>
            <Slider {...heroSettings}>
              {heroSlides.map((slide, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '60%',
                      height: { 
                        xs: '250px', 
                        sm: '350px', 
                        md: '450px', 
                        lg: '550px',
                        xl: '600px'
                      },
                      borderRadius: { xs: '12px', sm: '16px', md: '20px' },
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      margin: '0 auto',
                      maxWidth: '100%'
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                      priority={index === 0}
                      quality={85}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        borderRadius: { xs: '12px', sm: '16px', md: '20px' },
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 2
                      }}
                    />
                    <Container 
                      maxWidth="lg" 
                      sx={{ 
                        position: 'relative', 
                        zIndex: 3,
                        padding: { xs: '0 16px', sm: '0 24px' }
                      }}
                    >
                      <Box sx={{ 
                        color: 'white', 
                        maxWidth: { xs: '100%', sm: '80%', md: '600px' },
                        padding: { xs: '16px', sm: '24px', md: '40px', lg: '60px' },
                        animation: 'fadeInUp 1s ease-out'
                      }}>
                        <Chip 
                          label={slide.badge}
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            marginBottom: { xs: 1, sm: 1.5, md: 2 },
                            backdropFilter: 'blur(10px)',
                            fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' },
                            height: { xs: '20px', sm: '24px', md: '28px' }
                          }}
                        />
                        <Typography 
                          component="h1"
                          variant="h2" 
                          sx={{ 
                            fontWeight: 'bold',
                            marginBottom: { xs: 0.5, sm: 1, md: 2 },
                            fontSize: { 
                              xs: '1.25rem', 
                              sm: '1.75rem', 
                              md: '2.25rem', 
                              lg: '2.75rem',
                              xl: '3.5rem'
                            },
                            textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
                            lineHeight: { xs: 1.2, md: 1.3 }
                          }}
                        >
                          {slide.title}
                        </Typography>
                        <Typography 
                          component="p"
                          variant="h5" 
                          sx={{ 
                            marginBottom: { xs: 1.5, sm: 2, md: 3, lg: 4 },
                            opacity: 0.95,
                            fontSize: { 
                              xs: '0.8rem', 
                              sm: '0.9rem', 
                              md: '1rem', 
                              lg: '1.1rem',
                              xl: '1.25rem'
                            },
                            lineHeight: 1.4,
                            textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
                            display: { xs: '-webkit-box', sm: 'block' },
                            WebkitLineClamp: { xs: 3, sm: 'none' },
                            WebkitBoxOrient: { xs: 'vertical', sm: 'initial' },
                            overflow: { xs: 'hidden', sm: 'visible' }
                          }}
                        >
                          {slide.subtitle}
                        </Typography>
                        <Button
                          component="a"
                          href={slide.href}
                          variant="contained"
                          size="large"
                          endIcon={<ArrowForward sx={{ fontSize: { xs: '16px', sm: '18px', md: '20px' } }} />}
                          aria-label={`${slide.cta} - ${slide.title}`}
                          sx={{
                            backgroundColor: 'white',
                            color: 'black',
                            fontWeight: 'bold',
                            padding: { 
                              xs: '8px 16px', 
                              sm: '10px 24px', 
                              md: '12px 30px' 
                            },
                            borderRadius: '50px',
                            fontSize: { 
                              xs: '0.75rem', 
                              sm: '0.85rem', 
                              md: '0.95rem',
                              lg: '1rem'
                            },
                            textTransform: 'none',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 35px rgba(0,0,0,0.4)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {slide.cta}
                        </Button>
                      </Box>
                    </Container>
                  </Box>
                </Box>
              ))}
            </Slider>
          </Box>
        </section>

        {/* Section Avantages avec Accessibilité */}
        <section aria-label="Nos avantages clients">
          <Container 
            maxWidth="lg" 
            sx={{ 
              marginBottom: { xs: 4, sm: 5, md: 6 }, 
              padding: { xs: '0 12px', sm: '0 16px', md: '0 24px' } 
            }}
          >
            <Typography 
              component="h2" 
              variant="h3" 
              sx={{ 
                textAlign: 'center', 
                marginBottom: { xs: 2.5, sm: 3, md: 4 }, 
                fontWeight: 'bold',
                color: '#333',
                fontSize: { 
                  xs: '1.4rem', 
                  sm: '1.8rem', 
                  md: '2.2rem',
                  lg: '2.5rem'
                },
                lineHeight: 1.2,
                padding: { xs: '0 8px', sm: '0' }
              }}
            >
              Pourquoi nous choisir ?
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              {benefits.map((benefit, index) => (
                <Grid item xs={6} sm={6} md={3} key={index}>
                  <Card sx={{ 
                    textAlign: 'center',
                    padding: { xs: 1.5, sm: 2, md: 3 },
                    height: '100%',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    borderRadius: { xs: '12px', sm: '16px', md: '20px' },
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                    },
                    minHeight: { xs: '140px', sm: '160px', md: '180px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Box 
                      sx={{ 
                        marginBottom: { xs: 0.5, sm: 1, md: 2 },
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
                          xs: '0.8rem', 
                          sm: '0.9rem', 
                          md: '1rem',
                          lg: '1.1rem'
                        },
                        lineHeight: 1.2
                      }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { 
                          xs: '0.65rem', 
                          sm: '0.75rem', 
                          md: '0.8rem',
                          lg: '0.875rem'
                        },
                        lineHeight: 1.3
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

        {/* Section Produits Populaires */}
        <section aria-label="Nos produits populaires">
          <Box sx={{ 
            backgroundColor: '#fafafa', 
            padding: { xs: '10px 0', sm: '10px 0', md: '10px 0' } 
          }}>
            <Container 
              maxWidth="lg" 
              sx={{ 
                padding: { xs: '0 12px', sm: '0 16px', md: '0 20px' } 
              }}
            >          
              <TopProducts />
            </Container>
          </Box>
        </section>

        {/* Section Marques Partenaires Optimisée */}
        <section aria-label="Nos marques partenaires">
          <Container 
            maxWidth="lg" 
            sx={{ 
              marginY: { xs: 4, sm: 6, md: 8 }, 
              padding: { xs: '0 12px', sm: '0 16px', md: '0 24px' } 
            }}
          >
            <Box sx={{ textAlign: 'center', marginBottom: { xs: 3, sm: 4, md: 5 } }}>
              <Typography 
                component="h2"
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold', 
                  marginBottom: { xs: 1.5, sm: 2 },
                  background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { 
                    xs: '1.4rem', 
                    sm: '1.8rem', 
                    md: '2.2rem',
                    lg: '2.5rem'
                  },
                  lineHeight: 1.2,
                  padding: { xs: '0 8px', sm: '0' }
                }}
              >
                Nos Marques Partenaires
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#666',
                  fontSize: { 
                    xs: '0.9rem', 
                    sm: '1rem', 
                    md: '1.1rem',
                    lg: '1.25rem'
                  },
                  lineHeight: 1.3,
                  padding: { xs: '0 16px', sm: '0' }
                }}
              >
                Des marques d'exception pour votre bien-être
              </Typography>
            </Box>
            
            <Box sx={{ 
              '& .slick-slide': {
                padding: { xs: '0 4px', sm: '0 6px', md: '0 8px' },
                height: 'auto'
              },
              '& .slick-list': {
                padding: { xs: '0 8px', sm: '0 12px', md: '0 20px' },
                margin: { xs: '0 -8px', sm: '0 -12px', md: '0 -20px' }
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
                  fontSize: '20px',
                  color: '#333'
                }
              },
              '& .slick-prev': {
                left: { md: '-35px', lg: '-40px' }
              },
              '& .slick-next': {
                right: { md: '-35px', lg: '-40px' }
              }
            }}>
              <Slider {...brandSettings}>
                {brandImages.map((brand, index) => (
                  <Box key={index} sx={{ height: '100%' }}>
                    <Link href={brand.link} passHref>
                      <Card sx={{
                        cursor: 'pointer',
                        borderRadius: { xs: '12px', sm: '16px', md: '20px' },
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: { xs: '200px', sm: '220px', md: '240px' },
                        '&:hover': {
                          transform: 'translateY(-10px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
                        }
                      }}>
                        <Box sx={{ 
                          aspectRatio: '16/9',
                          width: '100%',
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: { xs: '12px 12px 0 0', sm: '16px 16px 0 0', md: '20px 20px 0 0' },
                          minHeight: { xs: '120px', sm: '140px', md: '160px' }
                        }}>
                          <Image
                            src={brand.src}
                            alt={brand.alt}
                            fill
                            style={{
                              objectFit: 'contain',
                              objectPosition: 'center'
                            }}
                            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
                            loading="lazy"
                          />
                        </Box>
                        <CardContent sx={{ 
                          textAlign: 'center', 
                          padding: { xs: 1.5, sm: 2, md: 3 },
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
                                xs: '0.8rem', 
                                sm: '0.9rem', 
                                md: '1rem',
                                lg: '1.1rem'
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
                                xs: '0.65rem', 
                                sm: '0.75rem', 
                                md: '0.8rem',
                                lg: '0.875rem'
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

        {/* Section Trust Logos */}
        <section aria-label="Nos certifications et partenaires de confiance">
          <Box sx={{ 
            backgroundColor: '#f8f9fa', 
            padding: { xs: '32px 0', sm: '40px 0', md: '50px 0' } 
          }}>
            <Container 
              maxWidth="lg" 
              sx={{ 
                padding: { xs: '0 12px', sm: '0 16px', md: '0 24px' } 
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