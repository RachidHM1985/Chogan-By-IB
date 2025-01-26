// components/SearchResults.js
import React from 'react';
import { Grid, Typography, Card, CardContent, CardMedia, Button, Box } from '@mui/material';
import { useRouter } from 'next/router';
import '../styles/globals.css'


const SearchResults = ({ results }) => {
  const router = useRouter();

  return (
    <Grid container spacing={2} justifyContent="center" sx={{ paddingTop: '20px' }}>
      {results.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={product.image_url || '/images/placeholder.jpg'}
              alt={product.nom_produit}
            />
            <CardContent>
              <Typography variant="h6">{product.nom_produit}</Typography>
              <Typography variant="body2" color="textSecondary">
                {product.description.slice(0, 100)}...
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <Typography variant="body1" color="primary">
                  {product.prix}€
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push(`/product/${product.id}`)} // Lien vers la page du produit
                >
                  Voir Détails
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SearchResults;
