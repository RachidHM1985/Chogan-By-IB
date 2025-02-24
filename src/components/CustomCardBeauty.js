import React, { useState, useEffect } from 'react';
import { CardContent, Typography, Box, CardMedia, Rating, CircularProgress } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomCardBeauty = ({ produit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate image loading
    setLoading(true);
    const img = new Image();
    img.src = `/images/products/${produit.code_produit}.jpg`;
    img.onload = () => setLoading(false);
    img.onerror = () => {
      setLoading(false);
      setError(true);
    };
  }, [produit.code_produit]);

  return (
    <CardContent
      className="custom-card-content p-3 d-flex flex-column position-relative"
      sx={{
        position: 'relative',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 16px 30px rgba(0, 0, 0, 0.4)',
        },
        backgroundColor: 'white',
        border: '2px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '300px', // Fixed width for all cards
        height: '450px', // Fixed height for all cards
      }}
    >
      {/* Card Image Section */}
      <Box
        sx={{
          alignSelf: 'center',
          justifySelf: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '10px',
          transition: 'all 0.3s ease',
          width: '100%', // Ensure the image container takes full width
          height: '200px', // Fixed height for the image container
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography variant="body2" color="error">
            Image not available
          </Typography>
        ) : (
          <CardMedia
            component="img"
            image={`/images/products/${produit.code_produit}.jpg`}
            alt={produit.sous_categorie}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain', // Ensure the image fits within the container
              borderRadius: '10px',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
        )}
      </Box>
      {/* Card Content Section */}
      <Box
        sx={{
          padding: '1px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '150px',
          textAlign: 'center',
        }}
      >
        {/* Display the Rating above the title */}
        <Rating
          value={produit.note || 0}
          readOnly
          sx={{
            marginBottom: '8px',
            color: '#ff9800',
          }}
        />
        
        {/* Product code */}
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Noto Sans',
            fontWeight: '600',
            fontSize: '0.8rem',
            textTransform: 'capitalize',
            marginBottom: '4px',
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Ref n°: {produit.code_produit}
        </Typography>      
        <Typography
          variant="body1"
          sx={{
            fontSize: '0.8rem',
            opacity: 0.7,
            marginBottom: '2px',
          }}
        >
          {produit.description}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: '0.8rem',
            fontWeight: '400',
            width: '100%',
            textAlign: 'center',
          }}
        >
          Contenance: {produit.contenance}
        </Typography>
        
        {/* Price */}
        <Typography
          variant="body1"
          sx={{
            fontSize: '0.8rem',
            fontWeight: '400',
            width: '100%',
            textAlign: 'center',
          }}
        >
          prix: {produit.prix}
        </Typography>
      </Box>
    </CardContent>
  );
};

export default CustomCardBeauty;