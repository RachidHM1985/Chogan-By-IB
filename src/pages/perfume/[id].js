import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Typography, Box, Button, TextField, IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails, Grid, Rating } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ReviewsSection from '../../components/ReviewsSection';
import Layout from '../../components/Layout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

  useEffect(() => {
    setSelectedSizes({});
    setQuantities({});
    setLoading(true);
    setError(null);

    if (!id) return;

    const fetchPerfumeDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('parfums')
          .select('*')
          .eq('code', id)
          .single();

        if (error) {
          throw error;
        }

        setPerfume(data);
      } catch (err) {
        setError('Erreur de chargement du parfum.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerfumeDetail();
  }, [id]);

  useEffect(() => {
    setShowTooltip(false);
    setTooltipMessage('');
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
      <Layout>
        <Container
          fluid
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
            minHeight: '100vh', // Prendre toute la hauteur de la fenêtre
          }}
        >
          <Box sx={{ flexGrow: 1,width: '100%' }}>
            {loading ? (
              <Typography variant="h6" align="center">Chargement...</Typography>
            ) : error ? (
              <Typography variant="h6" color="error" align="center">{error}</Typography>
            ) : (
              perfume && (
                <>
                  <Row className="d-flex justify-content-center align-items-center" style={{ width: '100%' }}>
                    <Col xs={12} md={6} className="text-left d-flex flex-column align-items-center">
                      {/* Star Rating above the title */}
                      <Rating 
                        value={perfume.note || 0} 
                        readOnly 
                        sx={{ marginBottom: '10px' }} 
                      />
                      
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Noto Sans', 
                          fontWeight: '600',
                          fontSize: '1.2rem',
                          textTransform: 'capitalize',
                          marginBottom: '4px',
                          whiteSpace: 'normal',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        PARFUM N°{perfume.code}
                      </Typography>
                     
                      <img
                        src={`../../photos/products/${perfume.genre.toLowerCase()}.png`}
                        alt={perfume.nom_produit}
                        className="img-fluid"
                        style={{
                          maxWidth: '50%',
                          height: 'auto',
                          borderRadius: '10px',
                          objectFit: 'contain',
                        }}
                      />
                    </Col>
                    <Col xs={12} md={6} className="text-left d-flex flex-column align-items-center">
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
                  {/* Description and Notes Olfactives */}
                  <Box sx={{
                          width: {
                            xs: '100%',  
                            sm: '70vh',  
                          },
                          paddingTop: '10px',
                          paddingBottom: '10px',
                          marginLeft: '2%',
                          borderBottom: '1px solid black',
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
                          Description
                        </Typography>
                        <Typography variant="body2" sx={{ paddingBottom: '10px' }}>
                          Cette fragrance s'inspire des notes olfactives du parfum {perfume.nom_produit} de {perfume.nom_marque}, sans être affiliée à la marque. Elle offre une alternative unique avec une composition différente.
                        </Typography>
                        <Typography variant="body2">
                          {perfume.description || 'Aucune description disponible pour ce parfum.'}
                        </Typography>
                      </Box>
                      <Accordion
                        sx={{
                          width: {
                            xs: '100%',  
                            sm: '70vh',  
                          },
                          boxShadow: 'none',
                          marginLeft: '2%',
                          borderBottom: '1px solid black',
                          '&.Mui-expanded': { 
                            margin: 0, 
                          },
                          '&:before': { display: 'none' }, 
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="notes-content"
                          id="notes-header"
                        >
                          <Typography variant="body1">Notes Olfactives</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2} justifyContent="center">
                            <Grid item xs={4}>
                              <Typography variant="body2" color="primary" align="center">
                                Notes de tête:
                              </Typography>
                              <Typography variant="body2" align="center">
                                {perfume.notes_tete}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="body2" color="primary" align="center">
                                Notes de cœur:
                              </Typography>
                              <Typography variant="body2" align="center">
                                {perfume.notes_coeur}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="body2" color="primary" align="center">
                                Notes de fond:
                              </Typography>
                              <Typography variant="body2" align="center">
                                {perfume.notes_fond}
                              </Typography>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                  <ReviewsSection productId={perfume.code} isInsertComment={true} />
                </>
              )
            )}
          </Box>
          {showTooltip && (
            <div
              className={`tooltip ${!selectedSizes[perfume.id]? 'tooltip-error' : 'tooltip-succes'} ${showTooltip ? 'show' : ''}`}
              style={{ top: `${window.scrollY + 10}px` }}
            >
              {tooltipMessage}
            </div>
          )}
        </Container>
        <Box sx={{ flexGrow: 1 }} />
        <Footer />
      </Layout>
    </>
  );
};

export default PerfumeDetailPage;
