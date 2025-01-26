import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Modal, TextField, Button, Grid, Typography, CircularProgress, InputAdornment, Autocomplete, Box, Card } from '@mui/material';
import { IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CustomCardContent from '../components/CustomCardContent';
import { debounce } from 'lodash';
import { useCart } from './CartContext'; // Import Cart Context
import { useRouter } from 'next/router';  // Importer useRouter depuis next/router
import '../styles/globals.css'

const SearchOverlay = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [focus, setFocus] = useState(false); 
  const detailsRef = useRef(null);
  const [focusedCard, setFocusedCard] = useState(null);
  const { addToCart } = useCart(); // Use Cart Context
  const router = useRouter(); // Initialiser le hook router

  const hideOnPages = ['/about', '/BecomeConsultant']; // Définir les pages où l'élément ne doit pas apparaître
  const shouldHide = hideOnPages.includes(router.pathname); // Vérifier si on est sur une page à exclure

  
  // Fonction de recherche
  const searchProducts = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?query=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        console.error("Erreur de chargement des produits");
      }
    } catch (error) {
      console.error("Erreur de réseau lors de la recherche", error);
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement de la valeur de recherche
  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  useEffect(() => {
    const debouncedSearch = debounce(searchProducts, 500); // Use debounce
    debouncedSearch(searchQuery);  // Trigger debounced search
    return () => debouncedSearch.cancel();  // Cleanup on unmount
  }, [searchQuery]);  // Dependency on searchQuery
 
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim() && searchQuery ==="") {
      searchProducts(searchQuery); // Trigger search when form is submitted
    }else {
      fetchRandomPerfumes();
    }
  };
  

  const handleCardClick = (perfume) => {
    setSelectedPerfume(perfume);
  };

  const handleCloseCard = () => {
    setSelectedPerfume(null);
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: !prev[productId]?.[size],
      }
    }));
  };

  const updateQuantity = (productId, size, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: value,
      }
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

  const toggleOverlay = () => {
    setOpen(!open);
    if (!open) setSearchQuery('');
  };

  const getLowestPrice = (perfume) => {
    const prices = [perfume.prix_15ml, perfume.prix_30ml, perfume.prix_50ml, perfume.prix_70ml].filter(price => price !== null);
    const lowestPrice = Math.min(...prices);
    return lowestPrice.toFixed(2);
  };

  const fetchRandomPerfumes = async () => {
    const searchQuery = "*";
    setLoading(true);
    const response = await fetch(`/api/search?query=${searchQuery}`);
    if (response.ok) {
      const data = await response.json();
      const randomPerfumes = data.sort(() => 0.5 - Math.random()).slice(0, 12);
      setResults(randomPerfumes);
    } else {
      console.error('Erreur lors de la récupération des parfums');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchRandomPerfumes();
    }
  }, [open]);

  const handleCloseModal  = () => {
        // Réinitialisation de tous les états nécessaires
      setSearchQuery(''); // Vide le champ de recherche
      setSelectedPerfume(null); // Réinitialise le parfum sélectionné
      setSelectedSizes({}); // Réinitialise la sélection des tailles
      setQuantities({}); // Réinitialise les quantités
      setResults([]); // Vide les résultats
      setFocus(false); // Retire le focus du champ de recherche
      setOpen(false); // Ferme la modal
  };

  const handleCloseSearch = () => {
    setSearchQuery('');  // Réinitialise la recherche
    setOpen(false);       // Ferme la modal
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        handleCloseCard();
        handleCloseSearch()
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [detailsRef]);

  const closeModal = () => {
    setOpen(false);  // Cela ferme la modal
  };

 
  return(
    <div style={{ width: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>      
    <Container>
    {!shouldHide && (
      <div
        onClick={toggleOverlay}
        className="justify-content-center"
        style={{
          borderRadius: '8px',
          justifyContent: 'center',
          alignItems: 'center',
          width: focus ? '60%' : '100%',
          height: '40px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #000',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          alignContent: 'end',
        }}
      >
        <Col xs="auto">
          <IconButton
            sx={{
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            <SearchIcon />
          </IconButton>
        </Col>
        {focus && (
        <Autocomplete
          value={searchQuery}
          onChange={(event, newValue) => setSearchQuery(newValue)}
          freeSolo
          options={results.map((product) => product.nom_produit)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Que cherchez-vous"
              size="small"
              sx={{
                width: focus ? '60%' : '100%', // Ajuste la largeur du champ en fonction du focus
                marginBottom: '15px',
                backgroundColor: 'white',
              }}
              InputProps={{
                startAdornment: (
          <InputAdornment position="start">
            {loading ? <CircularProgress size={24} /> : <SearchIcon style={{ color: 'black' }} />}
          </InputAdornment>
        ),
      }}
    />
  )}
/>
        
        )}
      </div>)}
    </Container>
  </div>

      <Modal open={open} onClose={toggleOverlay} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            width: '95%',
            height: '95%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >  {/* Icône de fermeture en haut à droite */}
        <IconButton
          onClick={closeModal}  // Appel de la fonction closeModal pour fermer la modal
          edge="end"
          sx={{
            position: 'absolute', // Positionner absolument
            top: '5%', // Espacement du haut
            right: '5%', // Espacement de la droite
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
    
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Grid container justifyContent="center" alignItems="center" sx={{ paddingTop: '5px' }}>
              <form onSubmit={handleSearchSubmit} style={{ width: '60%' }}>
                <Autocomplete
                  value={searchQuery}
                  onInputChange={(_, newInputValue) => setSearchQuery(newInputValue)} // Handle input change correctly
                  freeSolo
                  options={results.map((product) => product.nom_produit)} // Suggestion list
                  renderInput={(params) => (
                    <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Que cherchez-vous"
                    size="small"
                    sx={{
                      width: '100%',
                      maxWidth: '1000px',
                      marginBottom: '15px',
                      backgroundColor: 'white',
                    }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          {loading ? <CircularProgress size={24} /> : <SearchIcon style={{ color: 'black' }} />}
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              </form>
            </Grid>
          </div>
          <div>
            {loading && <CircularProgress />}
            {!loading && results.length === 0 && <Typography>Aucun résultat trouvé</Typography>}
            {results.length > 0 && !loading && (
              <Box
                sx={{
                  width: '100%',
                  flexGrow: 1,
                  overflowY: 'scroll',
                  height: 'calc(77vh - 50px)',
                  marginTop: '10px',
                }}
              >
                <Grid container spacing={2}>
                  {results.map((perfume) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={perfume.id}>
                      <Card
                        sx={{
                          flexDirection: 'row',
                          height: '200px',
                          borderRadius: '10px',
                          border: '1px solid #ddd',
                          '&:hover': { boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)' },
                          backgroundImage: `url(${perfume.image_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          cursor: 'pointer',
                          height: 'inherit',
                          marginBottom: '20px',
                        }}
                        onClick={() => handleCardClick(perfume)}
                      >
                        <CustomCardContent perfume={perfume} getLowestPrice={getLowestPrice} />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </div>

          {/* Détails du produit sélectionné */}
          {selectedPerfume && (
            <div key={selectedPerfume.id} className="product-details-content" ref={detailsRef}>
              <Row className="align-items-center">
                <Col xs={12} md={6} className="d-flex justify-content-center">
                  <img
                    src={`./photos/products/${selectedPerfume.genre.toLowerCase()}.png`}
                    alt={selectedPerfume.nom_produit}
                    className="product-details-image"
                    onError={(e) => e.target.src = "/default-image.jpg"} // Fallback if image not found
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
                            value={quantities[selectedPerfume.id]?.['30ml'] || 1}
                            onChange={(e) => updateQuantity(selectedPerfume.id, '30ml', Number(e.target.value))}
                            inputProps={{ min: 1 }}
                            style={{ marginLeft: '10px', width: '60px' }}
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
                            style={{ marginLeft: '10px', width: '60px' }}
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
                            value={quantities[selectedPerfume.id]?.['70ml'] || 1}
                            onChange={(e) => updateQuantity(selectedPerfume.id, '70ml', Number(e.target.value))}
                            inputProps={{ min: 1 }}
                            style={{ marginLeft: '10px', width: '60px' }}
                          />
                        </div>
                      )}
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
        </div>        
      </Modal>
    </div>
  );
};

export default SearchOverlay;
