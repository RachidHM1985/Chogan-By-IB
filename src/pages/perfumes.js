import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Card, Typography, Select, MenuItem, Box, CircularProgress, Button, TextField } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';
import CustomCardContent from '../components/CustomCardContent';
import { useCart } from '../context/CartContext'; // Import Cart Context

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
  const { addToCart } = useCart(); // Use Cart Context
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
    const prices = [perfume.prix_15ml, perfume.prix_30ml, perfume.prix_50ml, perfume.prix_70ml].filter(price => price !== null);
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

  const updateQuantity = (productId, size, quantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: {
        ...prevQuantities[productId],
        [size]: quantity,
      },
    }));
  };

  const handleAddToCart = (product) => {
    const sizes = selectedSizes[product.id] || {}; // Récupérer les tailles sélectionnées pour ce produit
    let isValid = false;
    
    // Parcourir toutes les tailles sélectionnées
    Object.keys(sizes).forEach((size) => {
      if (sizes[size]) {
        const quantity = quantities[product.id]?.[size] || 1; // Quantité pour cette taille
        addToCart(product, size, quantity); // Ajouter chaque taille au panier
        isValid = true; // Marquer comme valide si au moins une taille est ajoutée
      }
    });
    
    // Vérification si au moins une taille a été validée et ajoutée au panier
    if (isValid) {
      setTooltipMessage('Article(s) ajouté(s) au panier');
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
      }, 2000);
      handleCloseCard(); // Fermer la carte uniquement si un article a été ajouté
    } else {
      // Si aucune taille n'est sélectionnée, afficher un message d'erreur
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
      <Container fluid className="mt-5 pt-5" style={{ maxWidth: '1550px', height: 'auto', overflowY: 'hidden' }}>
        <Typography variant="h5" gutterBottom sx={{ marginTop: { xs: '30px', md: '10px' } }}>
          Nos Parfums
        </Typography>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Select value={selectedBrand} onChange={handleBrandChange} displayEmpty>
            <MenuItem value="All">Toutes les marques</MenuItem>
            {brands.map((brand) => (
              <MenuItem key={brand.id} value={brand.nom_marque}>{brand.nom_marque}</MenuItem>
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
          <Box sx={{ 
            width: '100%', 
            flexGrow: 1, 
            overflowY: 'scroll', 
            height: 'calc(77vh - 200px)', 
            marginTop: '10px', 
            '&::-webkit-scrollbar': { display: 'none' }, 
            msOverflowStyle: 'none', 
            scrollbarWidth: 'none' 
          }}>
            <Row>
              {perfumes.map((perfume) => (
                <Col xs={12} sm={6} md={4} lg={3} key={perfume.id}>
                  <Card 
                    className="h-101" 
                    sx={{ 
                      height: '200px', 
                      borderRadius: '10px', 
                      border: '1px solid #ddd', 
                      '&:hover': { boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)' }, 
                      '&:focus': { boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)' },
                      backgroundImage: `url(${perfume.image_url})`, 
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      height: 'inherit',
                      marginBottom: '20px'
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

        {selectedPerfume && (
          <div key={selectedPerfume.id} className="product-details-content" ref={detailsRef}>
            <Row className="align-items-center">
              <Col xs={12} md={6} className="d-flex justify-content-center">
                <img
                  src={`./photos/products/${selectedPerfume.genre.toLowerCase()}.png`}
                  alt={selectedPerfume.nom_produit}
                  className="product-details-image"
                  onError={(e) => e.target.src = "/selectedPerfume.nom_produit.jpg"} // Fallback if image not found
                  style={{ width: '100%', borderRadius: '10px' }}
                />
              </Col>
              <Col xs={12} md={6} className="text-left">
                <div className="product-details-info">
                  <Typography variant="h6">Inspiré de</Typography>
                  <Typography variant="h4">{selectedPerfume.nom_produit}</Typography>
                  <Typography variant="h5">{selectedPerfume.nom_marque}</Typography>
                  <Typography variant="body1">Réf: {selectedPerfume.code}</Typography>
                  <Typography variant="body1">Choisissez une contenance :</Typography>
                  <div className="size-selection" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '10px' }}>
                  {selectedPerfume.prix_30ml && (
                    <div className="d-flex flex-column align-items-start mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`size-30ml-${selectedPerfume.id}`}
                          name={`size-${selectedPerfume.id}`}
                          value="30ml"
                          onChange={() => handleSizeChange(selectedPerfume.id, '30ml')}
                          checked={selectedSizes[selectedPerfume.id]?.['30ml'] || false}
                        />
                        <label className="form-check-label" htmlFor={`size-30ml-${selectedPerfume.id}`}>
                          30ml - {selectedPerfume.prix_30ml.toFixed(2)}€
                        </label>
                      </div>
                      <TextField
                        type="number"
                        value={quantities[selectedPerfume.id]?.['30ml'] || 0}
                        onChange={(e) => updateQuantity(selectedPerfume.id, '30ml', Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        sx={{
                          marginRight: 0,
                          marginLeft: 0,
                          width: { xs: '50%', sm: '150px' }, // Augmenter la largeur pour les petits écrans
                          fontSize: { xs: '0.875rem', sm: '1rem' }, // Ajuster la taille de la police
                          height: { xs: '45px', sm: '40px' }, // Ajuster la hauteur du champ
                        }}
                      />
                    </div>
                  )}
                  {selectedPerfume.prix_50ml && (
                    <div className="d-flex flex-column align-items-start mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`size-50ml-${selectedPerfume.id}`}
                          name={`size-${selectedPerfume.id}`}
                          value="50ml"
                          onChange={() => handleSizeChange(selectedPerfume.id, '50ml')}
                          checked={selectedSizes[selectedPerfume.id]?.['50ml'] || false}
                        />
                        <label className="form-check-label" htmlFor={`size-50ml-${selectedPerfume.id}`}>
                          50ml - {selectedPerfume.prix_50ml.toFixed(2)}€
                        </label>
                      </div>
                      <TextField
                        type="number"
                        value={quantities[selectedPerfume.id]?.['50ml'] || 1}
                        onChange={(e) => updateQuantity(selectedPerfume.id, '50ml', Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        sx={{
                          marginRight: 0,
                          marginLeft: 0,
                          width: { xs: '50%', sm: '150px' }, // Augmenter la largeur pour les petits écrans
                          fontSize: { xs: '0.875rem', sm: '1rem' }, // Ajuster la taille de la police
                          height: { xs: '45px', sm: '40px' }, // Ajuster la hauteur du champ
                        }}
                      />
                    </div>
                  )}
                  {selectedPerfume.prix_70ml && (
                    <div className="d-flex flex-column align-items-start mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`size-70ml-${selectedPerfume.id}`}
                          name={`size-${selectedPerfume.id}`}
                          value="70ml"
                          onChange={() => handleSizeChange(selectedPerfume.id, '70ml')}
                          checked={selectedSizes[selectedPerfume.id]?.['70ml'] || false}
                        />
                        <label className="form-check-label" htmlFor={`size-70ml-${selectedPerfume.id}`}>
                          70ml - {selectedPerfume.prix_70ml.toFixed(2)}€
                        </label>
                      </div>
                      <TextField
                        type="number"
                        value={quantities[selectedPerfume.id]?.['70ml'] || 0}
                        onChange={(e) => updateQuantity(selectedPerfume.id, '70ml', Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        sx={{
                          marginRight: 0,
                          marginLeft: 0,
                          width: { xs: '50%', sm: '150px' }, // Augmenter la largeur pour les petits écrans
                          fontSize: { xs: '0.875rem', sm: '1rem' }, // Ajuster la taille de la police
                          height: { xs: '45px', sm: '40px' }, // Ajuster la hauteur du champ
                        }}
                      />
                    </div>
                  )}
                </div>

                  <div className="add-to-cart d-flex justify-content-center" style={{ marginTop: '20px' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddToCart(selectedPerfume)} // Trigger add to cart
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
