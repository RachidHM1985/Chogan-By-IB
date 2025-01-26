import React from 'react';
import { CardContent, Typography, Box, CardMedia } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomCardContent = ({ perfume, getLowestPrice }) => {
  return (
    <CardContent 
      className="custom-card-content p-3 d-flex" 
      style={{
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        backgroundColor: '#e0e0e0', // Background color to highlight the card
        backgroundImage: 'url(/images/background_card.jpg)', // Correctly specify the URL of the background image
        backgroundSize: 'cover', // Ensure the background image covers the entire card
        backgroundPosition: 'center', // Center the background image
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      }}
    >
      <CardMedia
        component="img"
        image={perfume.photo_url}
        alt={perfume.nom_produit}
        style={{
          width: '100px', // Reduced width for the image
          height: 'auto',
          objectFit: 'cover',
          borderRadius: '10px 0 0 10px',
        }}
      />
      <Box className="text-center" style={{ 
        padding: '10px', 
        flex: 1.5, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        backgroundColor: 'rgba(211, 211, 211, 0.5)', // Semi-transparent background color
        borderRadius: '10px 10px 10px 10px', // Match the border radius
      }}>
        <Typography variant="subtitle2" className="mb-1" style={{ fontSize: '0.8rem' }}>
          Inspiré de 
        </Typography>
        <Typography variant="h6" className="mb-2" style={{ fontWeight: 'bold', fontSize: '1rem', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {perfume.nom_produit}
        </Typography>
        <Typography variant="subtitle1" className="mb-1" style={{ fontWeight: 'bold', fontSize: '1rem', color: 'white', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {perfume.nom_marque}
        </Typography>
        <Typography variant="subtitle2" className="mb-1" style={{ fontSize: '0.8rem' }}>
          Code: {perfume.code}
        </Typography>
        <Typography variant="body2" className="mb-1" style={{ fontSize: '0.8rem' }}>
          À partir de {getLowestPrice(perfume)} €
        </Typography>
      </Box>
    </CardContent>
  );
};

export default CustomCardContent;