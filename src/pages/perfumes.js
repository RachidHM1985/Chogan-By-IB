import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography, Select, Card, MenuItem, TextField } from '@mui/material';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';
import CustomCardContent from '../components/CustomCardContent';
import { useCart } from '../context/CartContext';
import Layout from '../components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from '../components/Footer';

const PerfumesPage = () => {
  const [category, setCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [perfumes, setPerfumes] = useState([]);
  const [filteredPerfumes, setFilteredPerfumes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    const categoryFromUrl = router.query.category || 'All';
    setCategory(categoryFromUrl);
    fetchPerfumes(categoryFromUrl, selectedBrand);
  }, [router.query.category, selectedBrand]);

  useEffect(() => {
    // Filtrage des parfums basé sur la recherche stricte
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();

      // Filtrage strict sur le nom et la marque
      const filtered = perfumes.filter((perfume) =>
        perfume.nom_produit.toLowerCase() === lowerCaseQuery || // Recherche exacte sur le nom du parfum
        perfume.nom_marque.toLowerCase() === lowerCaseQuery // Recherche exacte sur la marque
      );

      // Appliquer également le filtre de catégorie si nécessaire
      const filteredByCategory = filtered.filter((perfume) => {
        if (category === 'All') return true;
        return perfume.genre.toLowerCase() === category.toLowerCase();
      });

      setFilteredPerfumes(filteredByCategory);
    } else {
      setFilteredPerfumes(perfumes);
    }
  }, [searchQuery, perfumes, category]);

  const fetchPerfumes = async (category, brand) => {
    setLoading(true);
    setError(null);
    let query = supabase.from('parfums').select('*').order('nom_marque', { ascending: true });

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
      setFilteredPerfumes(data); // Initialisation des parfums filtrés avec les données récupérées
      if (brands.length === 0) {
        const uniqueBrands = [...new Set(data.map(item => item.nom_marque))];
        setBrands(uniqueBrands.map((nom_marque, index) => ({ id: index, nom_marque })));
      }
    }
    setLoading(false);
  };

  const handleBrandChange = (event) => {
    const newBrand = event.target.value;
    setSelectedBrand(newBrand);
    fetchPerfumes(category, newBrand);
  };

  const handleCardClick = (perfumeCode) => {
    router.push(`/perfume/${perfumeCode}`); // Navigue vers la page de détails du parfum
  };

  const getLowestPrice = (perfume) => {
    const prices = [perfume.prix_30ml, perfume.prix_50ml, perfume.prix_70ml].filter(price => price !== null);
    const lowestPrice = Math.min(...prices);
    return lowestPrice.toFixed(2);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterPerfumes(query);
  };
  
  const filterPerfumes = (query) => {
    const filteredPerfumes = perfumes.filter((perfume) => {
      // On effectue une recherche stricte sur le nom du parfum et le code
      const nameMatch = perfume.nom_produit.toLowerCase().includes(query);
      const codeMatch = perfume.code.toLowerCase().includes(query);
      const brandMatch = perfume.nom_marque.toLowerCase().includes(query);
      
      return (nameMatch || codeMatch) && brandMatch;
    });
    setFilteredPerfumes(filteredPerfumes); // Liste filtrée
  };
  

  return (
    <>
      <Layout>
        <Container
          fluid
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden', // Cache la barre de défilement de la page
            padding: 0, // Enlève les marges et paddings autour
          }}
        >
          {/* Barre de recherche */}
          <div style={{width: '98%', maxWidth: '600px', marginBottom:'10px',  borderRadius: '20px', }}>
            <TextField
              label="Recherchez des parfums inspirés des grandes marques"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                fontSize:'0.7em',
                borderColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 0px 5px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white',
                marginTop: '10px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white', // Empêche la bordure par défaut
                  },
                  '&:hover fieldset': {
                    borderColor: 'white', // Empêche la bordure lors du survol
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'transparent', // Empêche la bordure bleue de focus
                    boxShadow: 'none', // Annule le shadow du focus
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize:'1em',
                  opacity:'0.5',
                  color: 'black', // Couleur du label en noir
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'black', // Assure que la couleur du label reste noire même lorsqu'il est focus
                },
              }}
              placeholder="Trouvez des alternatives aux parfums de luxe"
            />
          </div>

          {loading ? (
            <Box sx={{display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" variant="body1" sx={{ marginTop: '20px' }}>
              Error: {error}
            </Typography>
          ) : (
            <div className="perfume-grid" style={{ display: 'grid', gap: '5px' }}>
              {filteredPerfumes.map((perfume) => (
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
              ))}
            </div>
          )}
        </Container>
      </Layout>
    </>
  );
};

export default PerfumesPage;
