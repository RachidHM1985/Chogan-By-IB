import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, CircularProgress, Typography, Select, MenuItem } from '@mui/material';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';
import CustomCardContent from '../components/CustomCardContent';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

const PerfumesPage = () => {
  const [category, setCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [perfumes, setPerfumes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    const categoryFromUrl = router.query.category || 'All';
    setCategory(categoryFromUrl);
    fetchPerfumes(categoryFromUrl, selectedBrand);
  }, [router.query.category, selectedBrand]);

  const nameCategory = category;

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

  const handleCardClick = (perfumeId) => {
    router.push(`/perfume/${perfumeId}`); // Navigue vers la page de détails du parfum
  };

  const getLowestPrice = (perfume) => {
    const prices = [perfume.prix_30ml, perfume.prix_50ml, perfume.prix_70ml].filter(price => price !== null);
    const lowestPrice = Math.min(...prices);
    return lowestPrice.toFixed(2);
  };

  return (
    <>
      <Header />
      <Container
        fluid
        sx={{         
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', // Centrer tout le contenu verticalement
          alignItems: 'center', // Centrer horizontalement
          overflowY: 'hidden',
          
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ marginTop:'10vh' }}>
          Nos Parfums {nameCategory}
        </Typography>

        <div className="d-flex justify-content-center align-items-center mb-3">
          <Select
            value={selectedBrand}
            onChange={handleBrandChange}
            displayEmpty
            sx={{
              textAlign: 'center', // Centrer le texte dans le Select
              width: '200px', // Largeur fixe pour le Select
            }}
          >
            <MenuItem value="All">Toutes les marques</MenuItem>
            {brands.map((brand) => (
              <MenuItem key={brand.id} value={brand.nom_marque}>
                {brand.nom_marque}
              </MenuItem>
            ))}
          </Select>
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
          <Box
            sx={{
              width: '100%',
              flexGrow: 1,
              overflowY: 'scroll',
            }}
          >
            <div className="perfume-grid">
              {perfumes.map((perfume) => (
                <div className="perfume-card" key={perfume.id}>
                  <div
                    className="perfume-card-inner"
                    onClick={() => handleCardClick(perfume.id)}
                  >
                    <div
                      className="perfume-card-content"
                      style={{
                        backgroundImage: `url(${perfume.image_url})`,
                      }}
                    >
                      <CustomCardContent perfume={perfume} getLowestPrice={getLowestPrice} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Box>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default PerfumesPage;
