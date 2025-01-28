import React from 'react';
import { CardContent, Typography, Box, CardMedia } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomCardContent = ({ perfume, getLowestPrice }) => {

  const capitalizeFirstLetter = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <CardContent
      className="custom-card-content p-3 d-flex flex-column position-relative"
      sx={{
        position: 'relative',
        borderRadius: '15px', // Bordures arrondies de la carte
        overflow: 'hidden',
        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.3)', // Ombre avec un léger flou
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)', // Zoom au survol
          boxShadow: '0 16px 30px rgba(0, 0, 0, 0.4)', // Ombre plus forte au survol
        },
        backgroundColor: '#e9dfdf1f',
        border: '2px solid rgba(0, 0, 0, 0.1)', // Bordure fine pour délimiter la carte
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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

      </Box>

      {/* Card Content Section */}
      <Box
        sx={{
          padding: '5px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '150px', // Garder la hauteur fixe pour la structure
          textAlign: 'left', // Alignement à gauche pour les informations
        }}
      >
        <Typography
         variant="body2"
         sx={{
           fontSize: '0.7rem',
           opacity: 0.7,
           marginBottom: '2px', // Espacement réduit
         }}
        >
         Inspiré de : 
        </Typography>

        {/* Product Name */}
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Netto Pro Bold', // Police moderne et classe
            fontWeight: '600',
            fontSize: '0.8rem',
            textTransform: 'capitalize',
            marginBottom: '4px', // Un peu plus d'espace en bas
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {capitalizeFirstLetter(perfume.nom_produit)}
        </Typography>

        {/* Brand Name */}
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.8rem',
            fontWeight: '400',
            opacity: 0.8,
            marginBottom: '4px', // Espacement réduit
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
            fontSize: '0.8rem',
            opacity: 0.7,
          }}
        >
          Code: {perfume.code}
        </Typography>

        {/* Price */}
        <Typography
          variant="body1"
          sx={{
            fontSize: '0.8rem',
            fontWeight: '400', // Mettre en gras
          }}
        >
          À partir de {getLowestPrice(perfume)} €
        </Typography>
      </Box>
    </CardContent>
  );
};

export default CustomCardContent;
