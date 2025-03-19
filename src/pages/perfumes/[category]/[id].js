import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Typography, Box, Button, TextField, IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails, Grid, Rating } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabaseClient';
import { useCart } from '../../../context/CartContext';
import Footer from '../../../components/Footer';
import ReviewsSection from '../../../components/ReviewsSection';
import Layout from '../../../components/Layout';
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
          .eq('code_produit', id)
          .single();

        if (error) {
          throw error;
        }

        setPerfume(data);
        const availableSizes = ['30ml', '50ml', '70ml'].filter((size) => data[`prix_${size}`]);
      if (availableSizes.length === 1) {
        setSelectedSizes({ [data.id]: { [availableSizes[0]]: true } });
      }
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

  useEffect(() => {
    if (perfume) {
      const availableSizes = ['30ml', '50ml', '70ml'].filter((size) => perfume[`prix_${size}`]);
      if (availableSizes.length === 1) {
        setSelectedSizes({ [perfume.id]: { [availableSizes[0]]: true } });
      }
    }
  }, [perfume]);

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

  if (loading) return <Typography variant="h6" align="center">Chargement...</Typography>;
  if (error) return <Typography variant="h6" color="error" align="center">{error}</Typography>;
  if (!perfume) return <Typography variant="h6" align="center">Aucun parfum trouvé.</Typography>;

  const availableSizes = ['30ml', '50ml', '70ml'].filter((size) => perfume[`prix_${size}`]);

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
          width: '100%', // Assurez-vous que la largeur est 100%
          padding: 0, // Enlever les espacements si vous voulez une largeur complète
        }}
      >
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          {loading ? (
            <Typography variant="h6" align="center">Chargement...</Typography>
          ) : error ? (
            <Typography variant="h6" color="error" align="center">{error}</Typography>
          ) : (
            perfume && (
              <>
                <Row className="d-flex justify-content-center align-items-center">
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
                        width: '100%', // S'assurer que le texte occupe toute la largeur
                        textAlign: 'center', // Centrer le texte si nécessaire
                      }}
                    >
                      {perfume.genre === "Brume cheveux"
                        ? `Brume cheveux - Chogan n°${perfume.code_produit}`
                        : `Parfum - Chogan n°${perfume.code_produit}`}
                    </Typography>
                   
                    <img
                      src={`../../${perfume.photo_url}`}
                      alt={perfume.nom_produit}
                      className="img-fluid"
                      style={{
                        maxWidth: '90%', // Assurez-vous que l'image prend toute la largeur disponible
                        height: 'auto',
                        borderRadius: '10px',
                        objectFit: 'contain',
                        display: 'block',  // Utilisez block pour qu'elle se comporte comme un élément de bloc
                        marginLeft: 'auto',  // Centrer horizontalement avec flexbox
                        marginRight: 'auto', // Centrer horizontalement avec flexbox
                      }}
                    />
                  </Col>
                  <Col xs={12} md={6} className="text-left d-flex flex-column align-items-center">
                    <Typography variant="body1" align="center">
                      Choisissez une contenance :
                    </Typography>
                    <div className="size-selection" style={{ display: 'flex', flexDirection: 'row', gap: '10px', width: '100%' }}>
                      {availableSizes.map((size) => (
                        <div key={size} className="d-flex flex-column align-items-center mb-2" style={{ width: '100%' }}>
                          <div className="form-check" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '10px' }}>
                            <Tooltip title={`Prix : ${perfume[`prix_${size}`].toFixed(2)}€`} placement="top">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`size-${size}-${perfume.id}`}
                                value={size}
                                onChange={() => handleSizeChange(perfume.id, size)}
                                checked={selectedSizes[perfume.id]?.[size] || availableSizes.length === 1}
                                disabled={availableSizes.length === 1}
                              />
                            </Tooltip>
                            <label className="form-check-label" htmlFor={`size-${size}-${perfume.id}`} style={{ textAlign: 'center' }}>
                              {size} - {perfume[`prix_${size}`].toFixed(2)}€
                            </label>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={() => updateQuantity(perfume.id, size, Math.max((quantities[perfume.id]?.[size] || 1) - 1, 1))}>
                              <Remove />
                            </IconButton>
                            <TextField
                              type="number"
                              value={quantities[perfume.id]?.[size] || 1}
                              onChange={(e) => updateQuantity(perfume.id, size, Math.max(Number(e.target.value), 1))}
                              inputProps={{ min: 1 }}
                              sx={{ width: '60px', textAlign: 'center' }}
                            />
                            <IconButton onClick={() => updateQuantity(perfume.id, size, (quantities[perfume.id]?.[size] || 0) + 1)}>
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
                      sx={{ marginTop: '20px', width: '100%' }} // S'assurer que le bouton prend toute la largeur
                    >
                      Ajouter au panier
                    </Button>
                  </Col>
                </Row>
                {/* Description and Notes Olfactives */}
                <Box sx={{
                        width: '100%', // Assurez-vous que le box prend toute la largeur
                        paddingTop: '10px',
                        paddingBottom: '10px',
                        marginLeft: '0%',
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
                {/* Notes Olfactives Accordion */}
                <Accordion
                      sx={{
                        width: '100%', // Assurez-vous que l'accordion prend toute la largeur
                        boxShadow: 'none',
                        marginLeft: '0%',
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
                        <Grid container spacing={2} justifyContent="center" style={{ width: '100%' }}>
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
                <ReviewsSection productId={perfume.code_produit} isInsertComment={true} />
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
