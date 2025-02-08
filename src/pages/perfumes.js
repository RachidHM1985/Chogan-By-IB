import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography, Card, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';
import CustomCardContent from '../components/CustomCardContent';
import { useCart } from '../context/CartContext';
import Layout from '../components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

// Message défilant
const Marquee = () => {
  return (
    <Box
      sx={{
        borderRadius:'15px',
        width: '100%',
        height: '30px',
        backgroundColor: '#EFE7DB',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          whiteSpace: 'nowrap',
          animation: 'scrollLeft 20s linear infinite',
          fontSize: '1.2em',
          color: '#333',
          padding: '0 20px',
        }}
      >Inspirés par des marques prestigieuses, nos parfums ont une composition unique et sont accessibles, sans lien officiel avec ces marques.</Box>
      <style jsx>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(30%);
          }
          100% {
            transform: translateX(-95%);
          }
        }
      `}</style>
    </Box>
  );
};

const PerfumesPage = () => {
  const [category, setCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [perfumes, setPerfumes] = useState([]);
  const [filteredPerfumes, setFilteredPerfumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const cleanString = (str) => str.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');

  const fetchPerfumes = async (category, brand) => {
    setLoading(true);
    setError(null);
    let query = supabase.from('parfums').select('*').order('nom_marque', 'code', { ascending: true });

    if (category !== 'All') {
      query = query.eq('genre', category);
    }

    if (brand && brand !== 'All') {
      query = query.eq('nom_marque', brand);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching perfumes:', error);
      setError(error.message);
    } else {
      setPerfumes(data);
      setFilteredPerfumes(data);
    }
    setLoading(false);
  };

  const filterPerfumes = (query) => {
    const queryLower = cleanString(query);

    const filteredPerfumes = perfumes.filter((perfume) => {
      const codeToCompare = cleanString(perfume.code);
      const nameMatch = cleanString(perfume.nom_produit).includes(queryLower);
      const brandMatch = cleanString(perfume.nom_marque).includes(queryLower);
      return (codeToCompare === queryLower || nameMatch || brandMatch);
    });

    setFilteredPerfumes(filteredPerfumes);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterPerfumes(query);
  };

  const handleCardClick = (perfumeCode) => {
    router.push(`/perfume/${perfumeCode}`);
  };

  // Récupérer le prix le plus bas parmi les différentes tailles
  const getLowestPrice = (perfume) => {
    const prices = [perfume.prix_30ml, perfume.prix_50ml, perfume.prix_70ml].filter(price => price !== null);
    const lowestPrice = Math.min(...prices);
    return lowestPrice.toFixed(2);
  };

  // Effet pour initialiser les parfums au chargement de la page
  useEffect(() => {
    const categoryFromUrl = router.query.category || 'All';
    setCategory(categoryFromUrl);
    fetchPerfumes(categoryFromUrl, selectedBrand);
  }, [router.query.category, selectedBrand]);

  return (
    <>  
      <Layout>
      <Marquee />
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
          {/* Barre de recherche */}
          <div style={{ width: '98%', maxWidth: '600px', marginBottom: '10px', borderRadius: '20px' }}>
            <TextField
              label="Recherchez des parfums inspirés des grandes marques"
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
              placeholder="Trouvez des alternatives aux parfums de luxe"
            />
          </div>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" variant="body1" sx={{ marginTop: '20px' }}>
              Error: {error}
            </Typography>
          ) : (
            <div className="perfume-grid" style={{ display: 'grid', gap: '5px' }}>
              {filteredPerfumes.length === 0 ? (
                <Typography variant="body1" sx={{ marginTop: '20px' }}>
                  Aucun résultat trouvé pour votre recherche.
                </Typography>
              ) : (
                filteredPerfumes.map((perfume) => (
                  <Card
                    sx={{
                      borderRadius: '15px',
                      border: '1px solid #ddd',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      backgroundImage: `url(${perfume.image_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    onClick={() => handleCardClick(perfume.code)}
                    key={perfume.id}
                  >
                    <CustomCardContent perfume={perfume} getLowestPrice={getLowestPrice} />
                  </Card>
                ))
              )}
            </div>
          )}
        </Container>
      </Layout>
    </>
  );
};

export default PerfumesPage;
