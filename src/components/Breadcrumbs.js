import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material'; // Import de l'icône Home
import { useRouter } from 'next/router';

const MyBreadcrumbs = () => {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Un dictionnaire pour la traduction des catégories
  const labelMap = {
    homme: 'Homme',
    femme: 'Femme',
    enfants: 'Enfants',
    parfums: 'Parfums',
    beauty: 'Beauté',
    soinCapillaire: 'Soins Capillaires', // Gestion de la catégorie "Soins Capillaires"
  };

  useEffect(() => {
    const { category, subCategory, id } = router.query; // Récupère la catégorie, sous-catégorie et id dans l'URL
    const path = router.asPath.split('?')[0].split('/').filter((el) => el); // Exclure les paramètres de la requête

    // Base des breadcrumbs
    let crumbs = [
      { label: 'Accueil', href: '/' }, // Toujours un lien vers la page d'accueil
    ];

    // Si nous sommes sur la page "Beauty"
    if (path[0] === 'beauty') {
      crumbs.push({ label: 'Beauté', href: '/beauty' });

      // Si la catégorie est définie dans l'URL
      if (category) {
        // Traduire la catégorie si possible
        const categoryLabel = labelMap[category.toLowerCase()] || category;
        crumbs.push({
          label: categoryLabel,
          href: `/beauty?category=${category}`, // Lien vers la catégorie avec le paramètre
        });
      }

      // Ajouter la sous-catégorie, si elle existe
      if (subCategory) {
        const subCategoryLabel = labelMap[subCategory.toLowerCase()] || subCategory;
        crumbs.push({
          label: subCategoryLabel,
          href: `/beauty?category=${category}&subCategory=${subCategory}`, // Lien vers la sous-catégorie avec les paramètres
        });
      }
    }

    // Ajouter l'ID du produit dans les crumbs si présent
    if (id) {
      crumbs.push({ label: `Produit ${id}`, href: '#' }); // Affichage de l'ID sans lien
    }

    // Mise à jour des breadcrumbs
    setBreadcrumbs(crumbs);
  }, [router.query, router.asPath]); // Re-calculer si la route change

  // Fonction pour gérer les clics sur les breadcrumbs
  const handleBreadcrumbClick = (href) => {
    if (href !== '#') {
      router.push(href); // Naviguer vers la page sans rafraîchissement
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
              e.preventDefault(); // Empêche le comportement de lien classique
              handleBreadcrumbClick(breadcrumb.href); // Gère la navigation fluide
            }}
            sx={{ cursor: 'pointer' }}
          >
            {/* Ajouter l'icône Home avant "Accueil" */}
            {index === 0 && <HomeIcon sx={{ marginRight: '8px' }} />}
            {breadcrumb.label}
          </Link>
        ) : (
          // Sinon, afficher le texte sans lien (pour l'ID)
          <Typography key={index} color="text.primary">
            {breadcrumb.label}
          </Typography>
        )
      ))}
    </Breadcrumbs>
  );
};

export default MyBreadcrumbs;
