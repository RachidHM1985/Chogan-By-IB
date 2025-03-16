import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography, Card, TextField, Button } from '@mui/material';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/router';
import CustomCardBrilhome from '../../components/CustomCardBrilhome';
import Layout from '../../components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

const BrilhomePage = () => {
  const [category, setCategory] = useState('All');
  const [Brilhome, setBrilhome] = useState([]);
  const [filteredBrilhome, setFilteredBrilhome] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const cleanString = (str) => str.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');

  const fetchBrilhome = async (category) => {
    console.log(category);
    setLoading(true);
    setError(null);
    let query = supabase.from('brilhome').select('*').order('code_produit', { ascending: true });

    if (category !== 'All') {
      query = query.eq('categorie', category);
    }


    const { data, error } = await query;

    if (error) {
      console.error('Error fetching Brilhome:', error);
      setError(error.message);
    } else {
      setBrilhome(data);
      setFilteredBrilhome(data);  // Set initial filteredBrilhome with the full dataset
    }
    setLoading(false);
  };

  // Debounced filter function
  const filterBrilhome = (query) => {
    const queryLower = cleanString(query);
    const filtered = Brilhome.filter((product) => {
      const codeToCompare = cleanString(product.code_produit);
      return codeToCompare.includes(queryLower);
    });
    setFilteredBrilhome(filtered);
  };

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      filterBrilhome(searchQuery);
    }, 500);

    return () => clearTimeout(timer);  // Clear the timeout when searchQuery changes
  }, [searchQuery, Brilhome]);

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);  // Update search query
  };

  const handleCardClick = (code_produit) => {
    router.push(`/brilhome/${category}/${code_produit}`);
  };

  // Effect to fetch Brilhome data based on category
  useEffect(() => {
    const categoryFromUrl = router.query.category || 'All';
    setCategory(categoryFromUrl);
    fetchBrilhome(categoryFromUrl);
  }, [router.query.category]);

  // Effect to reset filteredBrilhome when the Brilhome data changes
  useEffect(() => {
    if (Brilhome.length) {
      setFilteredBrilhome(Brilhome);
    }
  }, [Brilhome]);

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

        {/* Loading spinner or error */}
        {loading && !Brilhome.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body1" sx={{ marginTop: '20px' }}>
            Error: {error}
          </Typography>
        ) : (
          <div className="produit-grid" style={{ display: 'grid', gap: '5px' }}>
            {filteredBrilhome.length === 0 ? (
              <Typography variant="body1" sx={{ marginTop: '20px' }}>
                Aucun résultat trouvé pour votre recherche.
              </Typography>
            ) : (
              filteredBrilhome.map((produit) => (
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
                  <CustomCardBrilhome produit={produit} />
                </Card>
              ))
            )}
          </div>
        )}
      </Container>
    </Layout>
  );
};

export default BrilhomePage;