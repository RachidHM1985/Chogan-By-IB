import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';

const MyBreadcrumbs = () => {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Dictionnaire de traduction des catégories et sous-catégories
  const labelMap = {
    homme: 'Homme',
    femme: 'Femme',
    enfants: 'Enfants',
    perfumes: 'Parfums',
    beauty: 'Beauté',
    brilhome: 'Brilhome',
    peptilux: 'Peptilux', // Nouvelle catégorie ajoutée
  };
  useEffect(() => {
    const path = router.asPath.split('?')[0].split('/').filter(Boolean);
    const { category, subCategory } = router.query; // Récupération des paramètres d'URL
    let crumbs = [{ label: 'Accueil', href: '/' }];

    if (path.length > 0) {
      // 🔹 Gestion des parfums (supporte "perfume" et "perfumes")
      if (path[0] === 'perfume' || path[0] === 'perfumes') {
        crumbs.push({ label: 'Parfums', href: '/perfumes' });

        if (category) {
          const categoryLabel = labelMap[category.toLowerCase()] || category;
          crumbs.push({
            label: categoryLabel,
            href: `/perfumes?category=${category}`,
          });
        }

        if (path.length === 3) {
          const productId = path[2];
          crumbs.push({ label: `Chogan: ${productId}`, href: '#' });
        }
      }

      // 🔹 Gestion de la beauté
      if (path[0] === 'beauty') {
        crumbs.push({ label: 'Beauté', href: '/beauty' });

        if (category) {
          const categoryLabel = labelMap[category.toLowerCase()] || category;
          crumbs.push({
            label: categoryLabel,
            href: `/beauty?category=${category}`,
          });
        }

        if (subCategory) {
          const subCategoryLabel = labelMap[subCategory.toLowerCase()] || subCategory;
          crumbs.push({
            label: subCategoryLabel,
            href: `/beauty?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(subCategory)}`,
          });
        }
        if (path.length === 3) {
          const productId = path[2];
          crumbs.push({ label: `Chogan: ${productId}`, href: '#' });
        }
      }

      // 🔹 Gestion de la nouvelle catégorie Brilhome
      if (path[0] === 'brilhome') {
        crumbs.push({ label: 'Brilhome', href: '/brilhome' });

        if (category) {
          const categoryLabel = labelMap[category.toLowerCase()] || category;
          crumbs.push({
            label: categoryLabel,
            href: `/brilhome?category=${category}`,
          });
        }

        if (path.length === 3) {
          const productId = path[2];
          crumbs.push({ label: `Produit: ${productId}`, href: '#' });
        }
      }
      // 🔹 Gestion de la nouvelle catégorie Peptilux
      if (path[0] === 'peptilux') {
        crumbs.push({ label: 'Peptilux', href: '/peptilux' });

        if (category) {
          const categoryLabel = labelMap[category.toLowerCase()] || category;
          crumbs.push({
            label: categoryLabel,
            href: `/peptilux?category=${category}`,
          });
        }

        if (path.length === 3) {
          const productId = path[2];
          crumbs.push({ label: `Produit: ${productId}`, href: '#' });
        }
      }

      // 🔹 Gestion de la nouvelle catégorie parfumerie intérieur
      if (path[0] === 'parfumerieInterieur') {
        crumbs.push({ label: 'parfumerie Interieur', href: '/parfumerieInterieur' });

        if (category) {
          const categoryLabel = labelMap[category.toLowerCase()] || category;
          crumbs.push({
            label: categoryLabel,
            href: `/parfumerieInterieur?category=${category}`,
          });
        }

        if (path.length === 3) {
          const productId = path[2];
          crumbs.push({ label: `Produit: ${productId}`, href: '#' });
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

  return (
    <Breadcrumbs aria-label="fil d'ariane" sx={{ marginBottom: '20px' }}>
      {breadcrumbs.map((breadcrumb, index) => (
        breadcrumb.href !== '#' ? (
          <Link
            key={index}
            color="inherit"
            onClick={(e) => {
              e.preventDefault();
              handleBreadcrumbClick(breadcrumb.href);
            }}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {index === 0 && <HomeIcon sx={{ marginRight: '8px' }} />}
            {breadcrumb.label}
          </Link>
        ) : (
          <Typography key={index} color="text.primary">
            {breadcrumb.label}
          </Typography>
        )
      ))}
    </Breadcrumbs>
  );
};

export default MyBreadcrumbs;
