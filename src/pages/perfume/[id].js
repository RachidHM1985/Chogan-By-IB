import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Typography, Box, Button, TextField, IconButton, Tooltip } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const PerfumeDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const [perfume, setPerfume] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');

  const capitalizeFirstLetter = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };


  // Récupérer les détails du parfum à partir de Supabase
  useEffect(() => {
    if (!id) return;

    const fetchPerfumeDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('parfums')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setPerfume(data);
      } catch (err) {
        setError('Erreur de chargement du parfum.');
      }
      setLoading(false);
    };

    fetchPerfumeDetail();
  }, [id]);

  const handleSizeChange = (perfumeId, size) => {
    setSelectedSizes((prevSizes) => ({
      ...prevSizes,
      [perfumeId]: {
        ...prevSizes[perfumeId],
        [size]: !prevSizes[perfumeId]?.[size],
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

  const handleAddToCart = () => {
    const sizes = selectedSizes[perfume.id] || {};
    let isValid = false;

    Object.keys(sizes).forEach((size) => {
      if (sizes[size]) {
        const quantity = quantities[perfume.id]?.[size] || 1;
        addToCart(perfume, size, quantity);
        isValid = true;
      }
    });

    if (isValid) {
      setTooltipMessage('Article(s) ajouté(s) au panier');
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    } else {
      setTooltipMessage('Veuillez sélectionner au moins une taille');
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  return (
    <>
      <Header />
      <Container
        fluid
        style={{
          maxWidth: '1550px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '60vh', // Minimum height for the page
          overflow: 'hidden', // Prevent scrolling
        }}
      >
        {/* Section for product details */}
        <Box
          sx={{
            flexGrow: 1,
            width: '100%',
            maxWidth: '100%', // Ensure the content doesn't overflow horizontally
            paddingTop: '100px',
          }}
        >
          {loading ? (
            <Typography variant="h6" align="center">Chargement...</Typography>
          ) : error ? (
            <Typography variant="h6" color="error" align="center">{error}</Typography>
          ) : (
            perfume && (
              <Row className="d-flex justify-content-center align-items-center" style={{ width: '100%' }}>
                <Col xs={12} md={6} className="text-left d-flex flex-column align-items-center">
                <Typography variant="body1" align="center">Inspiré de :</Typography>
                <Typography variant="h6" align="center" >{capitalizeFirstLetter(perfume.nom_produit)}</Typography>
                 <Typography variant="h6" align="center">{perfume.nom_marque}</Typography>
                  <img
                    src={`../../photos/products/${perfume.genre.toLowerCase()}.png`}
                    alt={perfume.nom_produit}
                    className="img-fluid" // Responsive class for image
                    style={{
                      maxWidth: '30%', // Max width to avoid overflow
                      height: '30%',   // Maintain aspect ratio
                      borderRadius: '10px',
                    }}
                  />
                </Col>
                <Col xs={12} md={6} className="text-left d-flex flex-column align-items-center">                  
                  <Typography variant="body1" align="center">Réf: {perfume.code}</Typography>
                  <Typography variant="body1" align="center">
                    Choisissez une contenance :
                  </Typography>
                  <div className="size-selection" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    {['30ml', '50ml', '70ml'].map((size) => perfume[`prix_${size}`] && (
                      <div key={size} className="d-flex flex-column align-items-center mb-2">
                        <div className="form-check" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Tooltip title={`Prix : ${perfume[`prix_${size}`].toFixed(2)}€`} placement="top">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`size-${size}-${perfume.id}`}
                              value={size}
                              onChange={() => handleSizeChange(perfume.id, size)}
                              checked={selectedSizes[perfume.id]?.[size] || false}
                            />
                          </Tooltip>
                          <label className="form-check-label" htmlFor={`size-${size}-${perfume.id}`} style={{ marginLeft: '10px' }}>
                            {size} - {perfume[`prix_${size}`].toFixed(2)}€
                          </label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton
                            onClick={() => updateQuantity(perfume.id, size, Math.max(quantities[perfume.id]?.[size] - 1, 1))}
                            sx={{ padding: '0 8px' }}
                          >
                            <Remove />
                          </IconButton>

                          <TextField
                            type="number"
                            value={quantities[perfume.id]?.[size] || 1}
                            onChange={(e) => updateQuantity(perfume.id, size, Math.max(Number(e.target.value), 1))}
                            inputProps={{ min: 1 }}
                            sx={{
                              marginRight: 0,
                              marginLeft: 0,
                              width: '60px',
                              textAlign: 'center',
                            }}
                          />

                          <IconButton
                            onClick={() => updateQuantity(perfume.id, size, (quantities[perfume.id]?.[size] || 0) + 1)}
                            sx={{ padding: '0 8px' }}
                          >
                            <Add />
                          </IconButton>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddToCart}
                    sx={{ marginTop: '20px' }}                   
                  >
                    Ajouter au panier
                  </Button>
                </Col>
              </Row>
            )
          )}
        </Box>
        {/* Tooltip */}
        {showTooltip && (
          <div
            className={`tooltip ${!selectedSizes[perfume.id]? 'tooltip-error' : 'tooltip-succes'} ${showTooltip ? 'show' : ''}`}
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

export default PerfumeDetailPage;
