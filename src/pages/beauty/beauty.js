import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography, Card, TextField, Button } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import CustomCardBeauty from '../../components/CustomCardBeauty';
import Layout from '../../components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

const BeautyPage = () => {
  const [category, setCategory] = useState('All');
  const [selectedGamme, setSelectedGamme] = useState('All');
  const [beauty, setBeauty] = useState([]);
  const [filteredBeauty, setFilteredBeauty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gammes, setGammes] = useState([]);
  const router = useRouter();

  const cleanString = (str) => str.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');

  const fetchBeauty = async (category, gamme) => {
    console.log(category);
    setLoading(true);
    setError(null);
    let query = supabase.from('aurodhea').select('*').order('code_produit', { ascending: true });

    if (category !== 'All') {
      query = query.eq('categorie', category);
    }

    if (gamme !== 'All') {
      query = query.eq('gamme', gamme);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching beauty:', error);
      setError(error.message);
    } else {
      setBeauty(data);
      setFilteredBeauty(data);  // Set initial filteredBeauty with the full dataset

      // Extract unique gamme values, excluding null values
      const uniqueGammes = [...new Set(data.map(item => item.gamme))].filter(gamme => gamme !== null);
      setGammes(uniqueGammes);
    }
    setLoading(false);
  };

  // Debounced filter function
  const filterBeauty = (query) => {
    const queryLower = cleanString(query);
    const filtered = beauty.filter((product) => {
      const codeToCompare = cleanString(product.code_produit);
      return codeToCompare.includes(queryLower);
    });
    setFilteredBeauty(filtered);
  };

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      filterBeauty(searchQuery);
    }, 500);

    return () => clearTimeout(timer);  // Clear the timeout when searchQuery changes
  }, [searchQuery, beauty]);

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);  // Update search query
  };

  const handleCardClick = (code_produit) => {
    router.push(`/beauty/${category}/${code_produit}`);
  };

  const handleGammeClick = (gamme) => {
    setSelectedGamme(prevGamme => (prevGamme === gamme ? 'All' : gamme));
  };

  // Effect to fetch beauty data based on category and gamme
  useEffect(() => {
    const categoryFromUrl = router.query.category || 'All';
    setCategory(categoryFromUrl);
    fetchBeauty(categoryFromUrl, selectedGamme);
  }, [router.query.category, selectedGamme]);

  // Effect to reset filteredBeauty when the beauty data changes
  useEffect(() => {
    if (beauty.length) {
      setFilteredBeauty(beauty);
    }
  }, [beauty]);

  return (
    <Layout>
      <Container
          fluid
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            padding: 0,
          }}
        >
        {/* Search bar */}
        <div style={{ width: '98%', maxWidth: '600px', marginBottom: '10px', borderRadius: '20px' }}>
          <TextField
            label="Recherchez vos produits de beauté"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              fontSize: '0.7em',
              borderColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 0px 5px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white',
              marginTop: '10px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                  boxShadow: 'none',
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: '1em',
                opacity: '0.5',
                color: 'black',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'black',
              },
            }}
            placeholder="Trouvez vos produits de soins"
          />
        </div>

        {/* Gamme buttons */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          {gammes.map((gamme) => (
            <Button
              key={gamme}
              variant={selectedGamme === gamme ? 'contained' : 'outlined'}
              onClick={() => handleGammeClick(gamme)}
              sx={{
                borderRadius: '20px',
                textTransform: 'capitalize',
                padding: '5px 15px',
              }}
            >
              Gamme {gamme}
            </Button>
          ))}
        </Box>

        {/* Loading spinner or error */}
        {loading && !beauty.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body1" sx={{ marginTop: '20px' }}>
            Error: {error}
          </Typography>
        ) : (
          <div className="produit-grid" style={{ display: 'grid', gap: '5px' }}>
            {filteredBeauty.length === 0 ? (
              <Typography variant="body1" sx={{ marginTop: '20px' }}>
                Aucun résultat trouvé pour votre recherche.
              </Typography>
            ) : (
              filteredBeauty.map((produit) => (
                <Card
                sx={{
                  borderRadius: '15px',
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                    backgroundImage: `url(${produit.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  onClick={() => handleCardClick(produit.code_produit)}
                  key={produit.id}
                >
                  <CustomCardBeauty produit={produit} />
                </Card>
              ))
            )}
          </div>
        )}
      </Container>
    </Layout>
  );
};

export default BeautyPage;