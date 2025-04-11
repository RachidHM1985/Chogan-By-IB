import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography, Card, TextField, Button } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import CustomCardParfumerieInterieur from '../../components/CustomCardParfumerieInterieur';
import Layout from '../../components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

const ParfumerieInterieurPage = () => {
  const [category, setCategory] = useState('All');
  const [parfumerieInterieur, setParfumerieInterieur] = useState([]);
  const [filteredParfumerieInterieur, setfilteredParfumerieInterieur] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const cleanString = (str) => str.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');

  const fetchParfumerieInterieur = async (category) => {
    console.log(category);
    setLoading(true);
    setError(null);
    let query = supabase.from('parfumerie_interieur').select('*').order('code_produit', { ascending: true });

    if (category !== 'All') {
      query = query.eq('categorie', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching parfumerieInterieur:', error);
      setError(error.message);
    } else {
      setParfumerieInterieur(data);
      setfilteredParfumerieInterieur(data);  // Set initial filteredParfumerieInterieur with the full dataset
    }
    setLoading(false);
  };

  // Debounced filter function
  const filterParfumerieInterieur = (query) => {
    const queryLower = cleanString(query);
    const filtered = parfumerieInterieur.filter((product) => {
      const codeToCompare = cleanString(product.code_produit);
      return codeToCompare.includes(queryLower);
    });
    setfilteredParfumerieInterieur(filtered);
  };

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      filterParfumerieInterieur(searchQuery);
    }, 500);

    return () => clearTimeout(timer);  // Clear the timeout when searchQuery changes
  }, [searchQuery, parfumerieInterieur]);

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);  // Update search query
  };

  const handleCardClick = (code_produit) => {
    router.push(`/parfumerieInterieur/${category}/${code_produit}`);
  };


  // Effect to fetch parfumerieInterieur data based on category
  useEffect(() => {
    const categoryFromUrl = router.query.category || 'All';
    setCategory(categoryFromUrl);
    fetchParfumerieInterieur(categoryFromUrl);
  }, [router.query.category]);

  // Effect to reset filteredParfumerieInterieur when the parfumerieInterieur data changes
  useEffect(() => {
    if (parfumerieInterieur.length) {
      setfilteredParfumerieInterieur(parfumerieInterieur);
    }
  }, [parfumerieInterieur]);

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
        {loading && !parfumerieInterieur.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body1" sx={{ marginTop: '20px' }}>
            Error: {error}
          </Typography>
        ) : (
          <div className="produit-grid" style={{ display: 'grid', gap: '5px' }}>
            {filteredParfumerieInterieur.length === 0 ? (
              <Typography variant="body1" sx={{ marginTop: '10px' }}>
                Aucun résultat trouvé pour votre recherche.
              </Typography>
            ) : (
              filteredParfumerieInterieur.map((produit) => (
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
                  <CustomCardParfumerieInterieur produit={produit} />
                </Card>
              ))
            )}
          </div>
        )}
      </Container>
    </Layout>
  );
};

export default ParfumerieInterieurPage;