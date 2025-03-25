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
          height: { xs: '200px', sm: '250px' }, // Ajustez la hauteur de l'image pour éviter le rognage
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
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
              objectFit: 'contain', // Utilisez 'contain' pour éviter le rognage
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
        <Rating
          value={produit.note || 0}
          readOnly
          sx={{
            marginBottom: '8px',
            color: '#ff9800',
          }}
        />
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
          Chogan: {produit.code_produit}
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
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            fontWeight: '400',
          }}
        >
          Contenance: {produit.contenance}
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
          Prix: {produit.prix.toFixed(2)}€
        </Typography>
      </Box>
    </CardContent>
  );
};

export default CustomCardBeauty;
