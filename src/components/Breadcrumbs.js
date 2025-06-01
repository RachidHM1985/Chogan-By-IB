import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Link, Typography, Box, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';

const MyBreadcrumbs = () => {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // const promo = {
  //   title: "🔥 Vente Flash -50% sur tous les produits Chogan ! 🔥",
  //   subtitle: (
  //     <>
  //       Offre valable jusqu'au vendredi 30 mai 2025 minuit.<br />
  //       <strong style={{ color: '#fff200' }}>
  //         N'oubliez pas de saisir le code <span style={{ color: '#000' }}>CHOGAN50</span> lors de la validation du panier !
  //       </strong>
  //     </>
  //   ),
  //   background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
  //   ctaText: "J'en profite",
  // };

  const labelMap = {
    homme: 'Homme',
    femme: 'Femme',
    enfants: 'Enfants',
    perfumes: 'Parfums',
    beauty: 'Beauté',
    brilhome: 'Brilhome',
    peptilux: 'Peptilux',
    parfumerieInterieur: 'Parfumerie Intérieur',
  };

  useEffect(() => {
    const path = router.asPath.split('?')[0].split('/').filter(Boolean);
    const { category, subCategory } = router.query;
    let crumbs = [{ label: 'Accueil', href: '/' }];

    if (path.length > 0) {
      const firstSegment = path[0].toLowerCase();

      if (['perfume', 'perfumes', 'beauty', 'brilhome', 'peptilux', 'parfumerieinterieur'].includes(firstSegment)) {
        const baseLabel = labelMap[firstSegment] || firstSegment;
        crumbs.push({ label: baseLabel, href: `/${firstSegment}` });

        if (category) {
          const catLabel = labelMap[category.toLowerCase()] || category;
          crumbs.push({ label: catLabel, href: `/${firstSegment}?category=${category}` });
        }

        if (subCategory && firstSegment === 'beauty') {
          const subCatLabel = labelMap[subCategory.toLowerCase()] || subCategory;
          crumbs.push({
            label: subCatLabel,
            href: `/${firstSegment}?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(subCategory)}`,
          });
        }

        if (path.length === 3) {
          const productId = path[2];
          crumbs.push({ label: `Chogan: ${productId}`, href: '#' });
        }
      }
    }

    setBreadcrumbs(crumbs);
  }, [router.asPath]);

  const handleBreadcrumbClick = (href) => {
    if (href !== '#') {
      router.push(href);
    }
  };

  // Le bouton n'a plus d'action de redirection, on peut afficher une alerte facultative
  const handlePromoClick = () => {
    alert("N'oubliez pas de saisir le code CHOGAN50 lors de la validation du panier !");
  };

  return (
    <>
      {/* Bannière promo compacte et impactante pleine largeur */}
      {/* <Box
        sx={{
          width: '100%',
          background: promo.background,
          color: 'white',
          textAlign: 'center',
          py: { xs: 2, md: 3 },
          px: 2,
          userSelect: 'none',
          boxShadow: '0 4px 15px rgba(255, 75, 43, 0.6)',
          position: 'relative',
          overflow: 'hidden',
          mb: 3,
          fontFamily: "'Poppins', sans-serif",
          animation: 'pulse 6s infinite alternate ease-in-out',
          '@keyframes pulse': {
            '0%': { filter: 'brightness(1)' },
            '100%': { filter: 'brightness(1.1)' },
          },
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: '900',
            textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
            mb: 1,
            fontSize: { xs: '1.4rem', md: '2rem' },
          }}
        >
          {promo.title}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: '600',
            mb: 2,
            fontSize: { xs: '0.9rem', md: '1.1rem' },
            textShadow: '1px 1px 5px rgba(0,0,0,0.2)',
            lineHeight: 1.4,
          }}
        >
          {promo.subtitle}
        </Typography>
        <Button
          variant="contained"
          size="medium"
          onClick={handlePromoClick}
          sx={{
            backgroundColor: '#fff',
            color: promo.background,
            fontWeight: 'bold',
            px: 4,
            py: 1,
            borderRadius: 4,
            boxShadow: '0 4px 10px rgba(255,75,43,0.6)',
            '&:hover': {
              backgroundColor: '#f4f4f4',
            },
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            cursor: 'pointer',
          }}
          aria-label="Profitez de la vente flash"
        >
          {promo.ctaText}
        </Button>
      </Box> */}

      {/* Fil d'Ariane classique sous la bannière */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
        }}
      >
        <Breadcrumbs aria-label="fil d'ariane">
          {breadcrumbs.map((breadcrumb, index) =>
            breadcrumb.href !== '#' ? (
              <Link
                key={index}
                color="inherit"
                underline="hover"
                onClick={(e) => {
                  e.preventDefault();
                  handleBreadcrumbClick(breadcrumb.href);
                }}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: index === breadcrumbs.length - 1 ? 'bold' : 'normal',
                  fontSize: index === 0 ? '1.1rem' : '1rem',
                }}
              >
                {index === 0 && <HomeIcon sx={{ mr: 0.8 }} />}
                {breadcrumb.label}
              </Link>
            ) : (
              <Typography
                key={index}
                color="text.primary"
                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
              >
                {breadcrumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      </Box>
    </>
  );
};

export default MyBreadcrumbs;
