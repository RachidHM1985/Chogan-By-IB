import React from 'react';
import { CardContent, Typography, Box, CardMedia } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomCardContent = ({ perfume, getLowestPrice }) => {
  return (
    <CardContent
      className="custom-card-content p-3 d-flex flex-column position-relative"
      sx={{
        position: 'relative', // Nécessaire pour gérer l'effet de superposition
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 8px 8px rgba(0.4, 0.4, 0.4, 0.4)',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)', // Légère animation de zoom au survol
        },
        marginBottom: '10px',
        backgroundColor: '#e9dfdf1f',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'; // Zoom léger au survol
        e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.3)'; // Ombre plus forte au survol
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'; // Retirer le zoom au survol
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)'; // Ombre légère
      }}
    >
      {/* Card Image Section */}
      <Box
        sx={{
          alignSelf:'center',
          justifySelf:'center',
          position: 'relative',
          overflow: 'hidden',
          height: '100px',
          marginBottom: '15px',
          transition: 'all 0.3s ease', // Transition pour l'effet de zoom
        }}
      >
        <CardMedia
  component="img"
  image={perfume.photo_url}
  alt={perfume.nom_produit}
  sx={{
    width: '100%', // Utiliser toute la largeur du CardMedia
    height: '100%', // Utiliser toute la hauteur du CardMedia
    objectFit: 'cover', // L'image couvre toute la zone sans être déformée
    borderRadius: '10px', // Coins arrondis pour l'élégance
    transition: 'transform 0.3s ease', // Animation pour le zoom au survol
    '&:hover': {
      transform: 'scale(1.05)', // Zoom léger pour effet interactif
    },
  }}
/>
<Typography
          variant="body2"
          sx={{
            fontSize: '0.9rem',
            opacity: 0.7,
            marginBottom: '6px', // Espacement réduit
          }}
        >
         Inspiré de : 
        </Typography>

      </Box>

      {/* Card Content Section */}
      <Box
        sx={{
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '130px', // Garder la hauteur fixe pour la structure
          textAlign: 'left', // Alignement à gauche pour les informations
        }}
      >
        {/* Product Name */}
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Netto Pro Bold', // Police moderne et classe
            fontWeight: '600',
            fontSize: '1.1rem',
            textTransform: 'capitalize',
            marginBottom: '8px', // Un peu plus d'espace en bas
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {perfume.nom_produit}
        </Typography>

        {/* Brand Name */}
        <Typography
          variant="body2"
          sx={{
            fontSize: '1rem',
            fontWeight: '400',
            opacity: 0.8,
            marginBottom: '6px', // Espacement réduit
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {perfume.nom_marque}
        </Typography>

        {/* Perfume Code */}
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.9rem',
            opacity: 0.7,
            marginBottom: '6px', // Espacement réduit
          }}
        >
          Code: {perfume.code}
        </Typography>

        {/* Price */}
        <Typography
          variant="body1"
          sx={{
            fontSize: '1rem',
            fontWeight: '600', // Mettre en gras
          }}
        >
          À partir de {getLowestPrice(perfume)} €
        </Typography>
      </Box>
    </CardContent>
  );
};

export default CustomCardContent;
