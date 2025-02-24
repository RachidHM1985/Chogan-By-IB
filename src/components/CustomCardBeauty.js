import React, { useState, useEffect } from 'react';
import { CardContent, Typography, Box, CardMedia, Rating, CircularProgress } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomCardBeauty = ({ produit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
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
        width: { xs: '90%', sm: '300px' }, // Responsive width
        height: { xs: 'auto', sm: '450px' }, // Adjust height for mobile
        padding: '15px',
        margin: '10px auto', // Center on mobile
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
          width: '100%',
          height: { xs: '180px', sm: '200px' }, // Responsive image size
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
              objectFit: 'contain',
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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'auto',
          textAlign: 'center',
          gap: '8px',
          padding: '10px 0',
        }}
      >
        <Rating
          value={produit.note || 0}
          readOnly
          sx={{ color: '#ff9800' }}
        />

        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Noto Sans',
            fontWeight: '600',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            textTransform: 'capitalize',
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
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            opacity: 0.7,
          }}
        >
          {produit.description}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            fontWeight: '400',
          }}
        >
          Contenance: {produit.contenance}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '0.8rem', sm: '1rem' },
            fontWeight: '500',
            color: '#E53935',
          }}
        >
          Prix: {produit.prix.toFixed(2)}€
        </Typography>
      </Box>
    </CardContent>
  );
};

export default CustomCardBeauty;
