import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
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
  };

  useEffect(() => {
    const { category, id } = router.query; // Récupère la catégorie et le code du parfum dans les paramètres de l'URL
    const path = router.asPath.split('?')[0].split('/').filter((el) => el); // Exclure les paramètres de la requête

    // Base des breadcrumbs
    const crumbs = [
      { label: 'Accueil', href: '/' }, // Toujours un lien vers la page d'accueil
    ];

    // Si nous sommes sur la page "Parfums"
    if (path[0] === 'perfumes') {
      crumbs.push({ label: 'Parfums', href: '/perfumes' });

      // Si la catégorie est définie dans l'URL
      if (category) {
        // Traduire la catégorie si possible
        const categoryLabel = labelMap[category.toLowerCase()] || category;
        crumbs.push({
          label: categoryLabel,
          href: `/perfumes?category=${category}`, // Lien vers la catégorie avec le paramètre
        });
      }
    }

    if (id) {
      crumbs.push({ label: `Parfums`, href: '/perfumes' });  // Lien vers la page Parfums
      crumbs.push({ label: `${id}`, href: '#' }); // Affichage de l'ID sans lien
    }

    // Mise à jour des breadcrumbs
    setBreadcrumbs(crumbs);
  }, [router.query, router.asPath]); // Re-calculer si la route change

  return (
    <Breadcrumbs aria-label="fil d'ariane" sx={{ marginBottom: '20px' }}>
      {breadcrumbs.map((breadcrumb, index) => (
        <Link key={index} color="inherit" href={breadcrumb.href}>
          {breadcrumb.label}
        </Link>
      ))}
    </Breadcrumbs>
  );
};

export default MyBreadcrumbs;
