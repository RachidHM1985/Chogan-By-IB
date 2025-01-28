import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Card, Typography, Select, MenuItem, Box, CircularProgress, Button, TextField } from '@mui/material';
import { IconButton } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';
import CustomCardContent from '../components/CustomCardContent';
import { useCart } from '../context/CartContext';
import { Add, Remove } from '@mui/icons-material';

const PerfumesPage = () => {
  const [category, setCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [perfumes, setPerfumes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});
  const router = useRouter();
  const detailsRef = useRef(null);
  const { addToCart } = useCart();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [focusedCard, setFocusedCard] = useState(null);

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

  const handleCardClick = (perfume) => {
    setSelectedPerfume(perfume);
  };

  const getLowestPrice = (perfume) => {
    const prices = [perfume.prix_30ml, perfume.prix_50ml, perfume.prix_70ml].filter(price => price !== null);
    const lowestPrice = Math.min(...prices);
    return lowestPrice.toFixed(2);
  };

  const handleCloseCard = () => {
    setSelectedPerfume(null);
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prevSizes) => ({
      ...prevSizes,
      [productId]: {
        ...prevSizes[productId],
        [size]: !prevSizes[productId]?.[size],
      },
    }));
  };

  const updateQuantity = (perfumeId, size, quantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [perfumeId]: {
        ...prevQuantities[perfumeId],
        [size]: quantity,
      },
    }));
  };

  const handleAddToCart = (product) => {
    const sizes = selectedSizes[product.id] || {};
    let isValid = false;

    Object.keys(sizes).forEach((size) => {
      if (sizes[size]) {
        const quantity = quantities[product.id]?.[size] || 1;
        addToCart(product, size, quantity);
        isValid = true;
      }
    });

    if (isValid) {
      setTooltipMessage('Article(s) ajouté(s) au panier');
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
      }, 2000);
      handleCloseCard();
    } else {
      setTooltipMessage('Veuillez sélectionner au moins une taille');
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
      }, 2000);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        handleCloseCard();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [detailsRef]);

  return (
    <>
      <Header />
      <Container
  fluid
  className="mt-5 pt-5"
  style={{
    maxWidth: '1550px',
    height: 'calc(113vh - 300px)', // Ajustez la hauteur pour éviter les chevauchements avec le footer
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // Centrer tout le contenu verticalement
    alignItems: 'center', // Centrer horizontalement
    overflow: 'hidden',
  }}
>
  <Typography variant="h5" gutterBottom sx={{ marginTop: { xs: '30px', md: '10px' } }}>
    Nos Parfums
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
        height: 'calc(77vh - 220px)', // Ajuster la hauteur de la liste des parfums
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'center', // Centrer les éléments à l'intérieur de Box
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      <Row className="d-flex justify-content-center">
        {perfumes.map((perfume) => (
          <Col xs={12} sm={6} md={4} lg={3} key={perfume.id} className="d-flex justify-content-center">
            <Card
              className="h-101"
              sx={{
                height: '180px',
                borderRadius: '10px',
                border: '1px solid #ddd',
                '&:hover': { boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)' },
                '&:focus': { boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)' },
                backgroundImage: `url(${perfume.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'center', // Centrer le contenu dans la carte
                alignItems: 'center',
              }}
              onClick={() => handleCardClick(perfume)}
              tabIndex={0}
            >
              <CustomCardContent perfume={perfume} getLowestPrice={getLowestPrice} />
            </Card>
          </Col>
        ))}
      </Row>
    </Box>
  )}

  {/* Détails du produit sélectionné */}
  {selectedPerfume && (
    <div key={selectedPerfume.id} className="product-details-content" ref={detailsRef} style={{ width: '100%' }}>
      <Row className="align-items-center" style={{ display: 'flex', justifyContent: 'center' }}>
        <Col xs={12} md={6} className="d-flex justify-content-center">
          <img
            src={`./photos/products/${selectedPerfume.genre.toLowerCase()}.png`}
            alt={selectedPerfume.nom_produit}
            className="product-details-image"
            onError={(e) => e.target.src = "/default-image.jpg"} // Fallback if image not found
            style={{ width: '100%', borderRadius: '10px' }}
          />
        </Col>
        <Col xs={12} md={6} className="text-left d-flex flex-column align-items-center">
          <div className="product-details-info">
            <Typography variant="h6" align="center">Inspiré de</Typography>
            <Typography variant="h4" align="center">{selectedPerfume.nom_produit}</Typography>
            <Typography variant="h5" align="center">{selectedPerfume.nom_marque}</Typography>
            <Typography variant="body1" align="center">Réf: {selectedPerfume.code}</Typography>
            <Typography variant="body1" align="center">Choisissez une contenance :</Typography>
            <div className="size-selection" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              {/* Contenance et quantité */}
              {['30ml', '50ml', '70ml'].map((size) => selectedPerfume[`prix_${size}`] && (
                <div key={size} className="d-flex flex-column align-items-center mb-2">                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="form-check" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`size-${size}-${selectedPerfume.id}`}
                      name={`size-${selectedPerfume.id}`}
                      value={size}
                      onChange={() => handleSizeChange(selectedPerfume.id, size)}
                      checked={selectedSizes[selectedPerfume.id]?.[size] || false}
                    />
                    <label className="form-check-label" htmlFor={`size-${size}-${selectedPerfume.id}`} style={{ marginLeft: '10px' }}>
                      {size} - {selectedPerfume[`prix_${size}`].toFixed(2)}€
                    </label>
                  </div>
                    <IconButton
                      onClick={() => updateQuantity(selectedPerfume.id, size, Math.max(quantities[selectedPerfume.id]?.[size] - 1, 1))}
                      sx={{ padding: '0 8px' }}
                    >
                      <Remove />
                    </IconButton>

                    <TextField
                      type="number"
                      value={quantities[selectedPerfume.id]?.[size] || 0}
                      onChange={(e) => updateQuantity(selectedPerfume.id, size, Math.max(Number(e.target.value), 1))}
                      inputProps={{ min: 1 }}
                      sx={{
                        marginRight: 0,
                        marginLeft: 0,
                        width: '60px',
                        textAlign: 'center',
                      }}
                    />

                    <IconButton
                      onClick={() => updateQuantity(selectedPerfume.id, size, (quantities[selectedPerfume.id]?.[size] || 0) + 1)}
                      sx={{ padding: '0 8px' }}
                    >
                      <Add />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
            <div className="add-to-cart d-flex justify-content-center" style={{ marginTop: '20px' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAddToCart(selectedPerfume)}
              >
                Ajouter au panier
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )}

        {/* Tooltip */}
        {showTooltip && (
          <div
            className={`tooltip ${!selectedSizes[focusedCard] ? 'tooltip-error' : 'tooltip-succes'} ${showTooltip ? 'show' : ''}`}
            style={{ top: `${window.scrollY + 10}px` }}
          >
            {tooltipMessage}
          </div>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default PerfumesPage;