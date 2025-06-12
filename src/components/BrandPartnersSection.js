import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Box, 
  Typography, 
  Skeleton, 
  Fade, 
  Backdrop,
  Modal,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  Button,
  Container
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { 
  Close as CloseIcon, 
  Launch as LaunchIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Animations optimisées
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const gradientFlow = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 30px rgba(25, 118, 210, 0.2); }
  50% { box-shadow: 0 0 50px rgba(25, 118, 210, 0.4); }
`;

// Section principale optimisée
const SectionContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  background: `
    radial-gradient(circle at 20% 20%, rgba(25, 118, 210, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(156, 39, 176, 0.05) 0%, transparent 50%),
    ${theme.palette.grey[50]}
  `,
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, 
      transparent 0%, ${theme.palette.primary.main} 50%, transparent 100%)`,
    backgroundSize: '200% 100%',
    animation: `${gradientFlow} 3s ease-in-out infinite`,
  },
}));

// Container de carrousel horizontal responsive
const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
}));

const CarouselTrack = styled(Box)(({ translateX }) => ({
  display: 'flex',
  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: `translateX(${translateX}px)`,
  gap: 24,
  padding: '16px 8px',
}));

// Carte compacte optimisée avec redirection
const BrandCard = styled(Box)(({ theme, featured, isVisible, isExternal }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2.5),
  borderRadius: 20,
  backgroundColor: theme.palette.common.white,
  border: `2px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  minWidth: 260,
  maxWidth: 260,
  flexShrink: 0,
  textDecoration: 'none', // Pour les liens
  color: 'inherit', // Pour les liens
  
  // Animation d'entrée
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
  
  // Style featured
  ...(featured && {
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.light}15 0%, 
      ${theme.palette.common.white} 100%)`,
    border: `2px solid ${theme.palette.primary.main}30`,
    animation: `${glow} 3s ease-in-out infinite`,
  }),

  // Effet de brillance
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, 
      transparent 0%, 
      ${theme.palette.common.white}40 50%, 
      transparent 100%)`,
    transition: 'left 0.6s ease',
    zIndex: 1,
  },

  '&:hover': {
    transform: 'translateY(-10px) scale(1.02)',
    boxShadow: `0 16px 32px -10px ${theme.palette.primary.main}25`,
    borderColor: theme.palette.primary.main,
    animation: `${float} 2s ease-in-out infinite`,
    
    '&::after': {
      left: '100%',
    },
    
    '& .brand-image': {
      transform: 'scale(1.05)',
    },
    
    '& .brand-name': {
      color: theme.palette.primary.main,
    },
    
    // Indicateur de lien externe
    ...(isExternal && {
      '& .external-indicator': {
        opacity: 1,
        transform: 'translate(0, 0)',
      }
    }),
  },
}));

// Container d'image
const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 200,
  height: 200,
  marginBottom: theme.spacing(1.5),
  borderRadius: 24,
  overflow: 'hidden',
  background: `radial-gradient(circle, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `
    inset 0 2px 8px ${theme.palette.grey[200]},
    0 6px 24px ${theme.palette.grey[300]}20
  `,
  
  '& .brand-image': {
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: 12,
  },
}));

// Indicateur de lien externe
const ExternalLinkIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transform: 'translate(-8px, -8px)',
  transition: 'all 0.3s ease',
  zIndex: 2,
  
  '& .MuiSvgIcon-root': {
    fontSize: 14,
  },
}));

// Titre avec dégradé
const StyledTitle = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.text.primary} 0%, 
    ${theme.palette.primary.main} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 800,
  marginBottom: theme.spacing(2),
}));

// Contrôles optimisés
const CarouselButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 48,
  height: 48,
  backgroundColor: theme.palette.common.white,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'all 0.3s ease',
  zIndex: 2,
  
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    transform: 'translateY(-50%) scale(1.1)',
  },
  
  '&.prev': {
    left: 16,
  },
  
  '&.next': {
    right: 16,
  },
}));

const DotIndicator = styled(Box)(({ theme, active }) => ({
  width: active ? 24 : 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[300],
  transition: 'all 0.3s ease',
  cursor: 'pointer',
}));

// Skeleton optimisé
const PremiumSkeleton = styled(Box)(({ theme }) => ({
  borderRadius: 20,
  background: `linear-gradient(90deg, 
    ${theme.palette.grey[200]} 25%, 
    ${theme.palette.grey[100]} 50%, 
    ${theme.palette.grey[200]} 75%)`,
  backgroundSize: '200% 100%',
  animation: `${shimmer} 1.5s infinite`,
  minWidth: 260,
  height: 280,
}));

export default function PartnerBrandsSection({
  brands = [],
  title = "Nos Marques Partenaires",
  subtitle = "Des marques d'exception pour votre bien-être",
  loading = false,
  maxBrandsToShow,
  featuredBrands = [],
  autoplay = false,
  autoplayDelay = 5000,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [visibleBrands, setVisibleBrands] = useState(new Set());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  // Données validées et optimisées
  const validBrands = useMemo(() => 
    Array.isArray(brands) ? brands.filter(brand => brand?.src && brand?.name) : []
  , [brands]);

  const displayBrands = useMemo(() => 
    maxBrandsToShow ? validBrands.slice(0, maxBrandsToShow) : validBrands
  , [validBrands, maxBrandsToShow]);

  // Configuration carrousel
  const slideWidth = 284;
  const visibleCards = Math.floor((containerRef.current?.offsetWidth || 1200) / slideWidth);
  const maxSlides = Math.max(0, displayBrands.length - visibleCards);
  const translateX = -currentSlide * slideWidth;

  // Mise à jour des états de navigation
  useEffect(() => {
    setCanScrollLeft(currentSlide > 0);
    setCanScrollRight(currentSlide < maxSlides);
  }, [currentSlide, maxSlides]);

  // Intersection Observer optimisé
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.getAttribute('data-index');
            setTimeout(() => {
              setVisibleBrands(prev => new Set([...prev, index]));
            }, parseInt(index) * 100);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const elements = sectionRef.current?.querySelectorAll('[data-index]');
    elements?.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [displayBrands]);

  // Autoplay optimisé
  useEffect(() => {
    if (autoplay && displayBrands.length > visibleCards) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => prev >= maxSlides ? 0 : prev + 1);
      }, autoplayDelay);
      return () => clearInterval(interval);
    }
  }, [autoplay, maxSlides, autoplayDelay, visibleCards]);

  // Fonction pour gérer la redirection
  const handleBrandClick = useCallback((brand, event) => {
    // Si pas de lien, ne rien faire
    if (!brand.link || brand.link === '#') {
      event.preventDefault();
      return;
    }

    // Pour les liens externes, ouvrir dans un nouvel onglet
    if (brand.external) {
      window.open(brand.link, '_blank', 'noopener,noreferrer');
      event.preventDefault();
    }
    // Pour les liens internes, laisser Next.js gérer la navigation
  }, []);

  const nextSlide = useCallback(() => {
    if (canScrollRight) {
      setCurrentSlide(prev => Math.min(prev + 1, maxSlides));
    }
  }, [canScrollRight, maxSlides]);

  const prevSlide = useCallback(() => {
    if (canScrollLeft) {
      setCurrentSlide(prev => Math.max(prev - 1, 0));
    }
  }, [canScrollLeft]);

  if (validBrands.length === 0 && !loading) return null;

  // Rendu des cartes avec redirection
  const renderBrandCard = (brand, index) => {
    const isFeatured = featuredBrands.includes(brand.id || brand.name);
    const isVisible = visibleBrands.has(index.toString());
    const hasLink = brand.link && brand.link !== '#';
    const isExternal = brand.external === true;
    
    const cardContent = (
      <>
        {isFeatured && (
          <Chip 
            label="✨ Premium" 
            size="small"
            sx={{ 
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 2,
              background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
              color: 'white',
              fontSize: '0.7rem',
            }}
          />
        )}

        {isExternal && (
          <ExternalLinkIndicator className="external-indicator">
            <LaunchIcon />
          </ExternalLinkIndicator>
        )}

        <ImageContainer>
          <Image
            src={brand.src}
            alt={brand.alt || `Logo ${brand.name}`}
            width={200}
            height={160}
            className="brand-image"
            style={{ objectFit: 'contain', borderRadius: '12px' }}
            loading={index < 6 ? 'eager' : 'lazy'}
            quality={90}
          />
        </ImageContainer>

        <Typography 
          variant="h6" 
          className="brand-name"
          sx={{ 
            fontWeight: 600,
            textAlign: 'center',
            transition: 'color 0.3s ease',
            fontSize: '1rem',
            lineHeight: 1.3,
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            mb: 0.5,
            px: 1,
          }}
        >
          {brand.name}
        </Typography>

        {brand.category && (
          <Chip
            label={brand.category}
            size="small"
            variant="outlined"
            sx={{ 
              fontSize: '0.7rem',
              height: 24,
              borderRadius: 2 
            }}
          />
        )}
      </>
    );

    // Si la marque a un lien, envelopper dans Link ou a
    if (hasLink) {
      if (isExternal) {
        // Lien externe - utiliser balise a normale
        return (
          <BrandCard
            key={brand.id || index}
            component="a"
            href={brand.link}
            target="_blank"
            rel="noopener noreferrer"
            data-index={index}
            featured={isFeatured}
            isVisible={isVisible}
            isExternal={isExternal}
            onClick={(e) => handleBrandClick(brand, e)}
          >
            {cardContent}
          </BrandCard>
        );
      } else {
        // Lien interne - utiliser Next.js Link
        return (
          <Link key={brand.id || index} href={brand.link} passHref legacyBehavior>
            <BrandCard
              component="a"
              data-index={index}
              featured={isFeatured}
              isVisible={isVisible}
              isExternal={false}
            >
              {cardContent}
            </BrandCard>
          </Link>
        );
      }
    } else {
      // Pas de lien - carte normale
      return (
        <BrandCard
          key={brand.id || index}
          data-index={index}
          featured={isFeatured}
          isVisible={isVisible}
          isExternal={false}
          sx={{ cursor: 'default' }}
        >
          {cardContent}
        </BrandCard>
      );
    }
  };

  // État de chargement
  if (loading) {
    return (
      <SectionContainer>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Skeleton variant="text" width={400} height={60} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width={600} height={30} sx={{ mx: 'auto' }} />
          </Box>
          
          <CarouselContainer>
            <Box sx={{ display: 'flex', gap: 3, p: 2, overflow: 'hidden' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <PremiumSkeleton key={i} />
              ))}
            </Box>
          </CarouselContainer>
        </Container>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer ref={sectionRef}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center' }}>
          <StyledTitle variant={"h6"}>
            {title}
          </StyledTitle>
          {subtitle && (
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Carrousel horizontal responsive */}
        <CarouselContainer ref={containerRef}>
          <Box sx={{ overflow: 'hidden' }}>
            <CarouselTrack translateX={translateX}>
              {displayBrands.map((brand, index) => (
                <Fade key={brand.id || index} in={visibleBrands.has(index.toString())} timeout={600}>
                  <div>{renderBrandCard(brand, index)}</div>
                </Fade>
              ))}
            </CarouselTrack>
          </Box>

          {/* Boutons de navigation */}
          {displayBrands.length > visibleCards && (
            <>
              <CarouselButton 
                className="prev"
                onClick={prevSlide} 
                disabled={!canScrollLeft}
                sx={{ opacity: canScrollLeft ? 1 : 0.3 }}
              >
                <ArrowBackIcon />
              </CarouselButton>

              <CarouselButton 
                className="next"
                onClick={nextSlide} 
                disabled={!canScrollRight}
                sx={{ opacity: canScrollRight ? 1 : 0.3 }}
              >
                <ArrowForwardIcon />
              </CarouselButton>
            </>
          )}
        </CarouselContainer>

        {/* Indicateurs de pagination */}
        {displayBrands.length > visibleCards && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 4 }}>
            {Array.from({ length: maxSlides + 1 }).map((_, index) => (
              <DotIndicator
                key={index}
                active={currentSlide === index}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </Box>
        )}

        {/* Compteur */}
        {maxBrandsToShow && validBrands.length > maxBrandsToShow && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Chip
              label={`+ ${validBrands.length - maxBrandsToShow} autres partenaires`}
              sx={{
                px: 3,
                py: 1,
                fontSize: '1rem',
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
              }}
            />
          </Box>
        )}
      </Container>
    </SectionContainer>
  );
}