import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Typography, Box, Button, IconButton, Select, MenuItem, Snackbar,Grid, Accordion, AccordionSummary, AccordionDetails, Rating } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Importation d'ExpandMoreIcon
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabaseClient';
import { useCart } from '../../../context/CartContext';
import Layout from '../../../components/Layout';
import Footer from '../../../components/Footer';
import ReviewsSection from '../../../components/ReviewsSection';

const ProduitDetailPage = () => {
  const router = useRouter();
  const { code_produit } = router.query;
  const { addToCart } = useCart();
  const [produit, setProduit] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!code_produit) return;
    const abortController = new AbortController();

    const fetchProduitDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('parfumerie_interieur')
          .select('*')
          .eq('code_produit', code_produit)
          .single();
        if (error) throw error;
        setProduit(data);
      } catch (err) {
        setError(`Erreur de chargement: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduitDetail();
    return () => abortController.abort();
  }, [code_produit]);

  const handleAddToCart = () => {
    if (!produit) return;
    addToCart(produit, produit.contenance, selectedQuantity);
    setTooltipMessage(`${produit.categorie} Chogan: ${produit.code_produit} ajouté(s) au panier`);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

   useEffect(() => {
      setShowTooltip(false);
      setTooltipMessage('');
    }, [code_produit]);

  return (
    <Layout>
      <Container fluid style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          {loading ? (
            <Typography variant="h6" align="center">Chargement...</Typography>
          ) : error ? (
            <Typography variant="h6" color="error" align="center">{error}</Typography>
          ) : (
            produit && (
              <>
                <Row className="d-flex justify-content-center align-items-center">
                  <Col xs={12} md={6} className="text-left d-flex flex-column align-items-center">
                  {/* Star Rating above the title */}
                        <Rating 
                            value={produit.note || 0} 
                            readOnly 
                            sx={{ marginBottom: '10px' }} 
                        />  
                    <Typography variant="h6" sx={{ fontWeight: '600', textAlign: 'center' }}>{produit.nom_produit}</Typography>
                    {produit.code_produit && (
                      <img src={`../../images/products/${produit.code_produit}.jpg`} alt={produit.description} className="img-fluid" style={{ maxWidth: '90%', height: 'auto', borderRadius: '10px' }} />
                    )}
                    <Typography variant="h6" sx={{ fontWeight: '600', textAlign: 'center' }}>Chogan: {produit.code_produit}</Typography>
                  </Col>
                  <Col xs={12} md={6} className="text-left d-flex flex-column align-items-center">
                    <Typography variant="body1" align="center">Contenance: {produit.contenance}</Typography>
                    <Typography variant="body1" align="center">Prix TTC: {produit.prix.toFixed(2)}€</Typography>
                    <div className="d-flex align-items-center" style={{ marginBottom: '10px' }}>
                      <IconButton onClick={() => setSelectedQuantity(Math.max(selectedQuantity - 1, 1))}><Remove /></IconButton>
                      <Select value={selectedQuantity} onChange={(e) => setSelectedQuantity(Number(e.target.value))} sx={{ width: '60px', textAlign: 'center', mx: 1 }}>
                        {[...Array(produit.stock ? Math.min(produit.stock, 10) : 10).keys()].map(num => (
                          <MenuItem key={num + 1} value={num + 1}>{num + 1}</MenuItem>
                        ))}
                      </Select>
                      <IconButton onClick={() => setSelectedQuantity(selectedQuantity + 1)}><Add /></IconButton>
                    </div>
                    <Button variant="contained" color="primary" onClick={handleAddToCart} sx={{ mt: 2, width: '100%' }}>
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
                      <Typography variant="body2">
                        {produit.description || 'Aucune description disponible pour ce parfum.'}
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
                              {produit.notes_tete}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="primary" align="center">
                              Notes de cœur:
                            </Typography>
                            <Typography variant="body2" align="center">
                              {produit.notes_coeur}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="primary" align="center">
                              Notes de fond:
                            </Typography>
                            <Typography variant="body2" align="center">
                              {produit.notes_fond}
                            </Typography>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                <ReviewsSection  tableName='parfumerie_interieur' productId={produit.code_produit} isInsertComment={true} />
              </>
            )
          )}
        </Box>
        {showTooltip && (
          <div
          className ="tooltip tooltip-succes show"
            style={{ top: `${window.scrollY + 10}px` }}
          >
            {tooltipMessage}
          </div>
        )}
      </Container>
      <Footer />
    </Layout>
  );
};

export default ProduitDetailPage;
