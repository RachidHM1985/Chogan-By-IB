import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography, Select, Card, MenuItem } from '@mui/material';
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
    const currentUrl = router.asPath.split('?')[0]; // Remove any query parameters
    router.push(`/perfume/${perfumeId}`); // Navigue vers la page de détails du parfum
  };

  const getLowestPrice = (perfume) => {
    const prices = [perfume.prix_30ml, perfume.prix_50ml, perfume.prix_70ml].filter(price => price !== null);
    const lowestPrice = Math.min(...prices);
    return lowestPrice.toFixed(2);
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
          <div className="d-flex justify-content-center align-items-center mb-3" style={{ marginTop: '20px' }}>
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
              <div className="perfume-grid" style={{ display: 'grid', gap: '10px' }}>
                {perfumes.map((perfume) => (
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
                    onClick={() => handleCardClick(perfume.id)}
                    key={perfume.id}
                  >
                    <CustomCardContent perfume={perfume} getLowestPrice={getLowestPrice} />
                  </Card>
                ))}
              </div>
            )}
        

          
        </Container>
      </Layout>
      <Footer />
    </>
  );
};

export default PerfumesPage;
