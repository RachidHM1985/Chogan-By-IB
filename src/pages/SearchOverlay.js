import React, { useState, useEffect } from 'react';
import { Modal, TextField, Grid, Typography, CircularProgress, InputAdornment, Box, Card, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CustomCardContent from '../components/CustomCardContent';
import { debounce } from 'lodash';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';
import { Add, Remove } from '@mui/icons-material';

const SearchOverlay = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const { addToCart } = useCart();
  const router = useRouter();

  // Fonction de recherche stricte
  const searchProducts = async (searchQuery) => {
    setLoading(true);
    try {
      if (!searchQuery.trim()) return;
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await fetch(`/api/search?query=${encodedQuery}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Filtrage strict sur le nom_produit et le nom_marque
        const filteredResults = data.filter((perfume) => {
          // Recherche stricte sur le nom du produit
          const nameMatch = perfume.nom_produit.toLowerCase() === searchQuery.toLowerCase();
          // Recherche stricte sur la marque du produit
          const brandMatch = perfume.nom_marque.toLowerCase() === searchQuery.toLowerCase();
          
          // Retourne true si le nom ou la marque correspond exactement
          return nameMatch || brandMatch;
        });
  
        setResults(filteredResults);
      } else {
        console.error("Erreur de chargement des produits");
      }
    } catch (error) {
      console.error("Erreur de réseau lors de la recherche", error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleCardClick = (perfumeCode) => {
    router.push(`/perfume/${perfumeCode}`);
    onClose();
  };

  useEffect(() => {
    const debouncedSearch = debounce(searchProducts, 500);
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
    }
  };

  const getLowestPrice = (perfume) => {
    const prices = [perfume.prix_30ml, perfume.prix_50ml, perfume.prix_70ml].filter(price => price !== null);
    const lowestPrice = Math.min(...prices);
    return lowestPrice.toFixed(2);
  };

  useEffect(() => {
    if (open) {
      searchProducts(''); // Charger les résultats au début
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        backgroundColor: 'white',
        padding: 2,
        width: '100%',
        height: '95%',
        margin: 'auto',
        marginTop: '2.5%',
        overflowY: 'auto',
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          paddingTop: '15px',
          zIndex: 1300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}>
          <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              placeholder="Que cherchez-vous?"
              size="small"
              sx={{
                width: '60%',
                marginLeft: '20%',
                marginRight: '20%',
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                  </InputAdornment>
                ),
              }}
            />
          </form>

          {/* Close button positioned at the top right of the modal */}
          <IconButton onClick={onClose} sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1300,
          }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <div>
          {/* Loading spinner */}
          {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}

          {/* No results found message */}
          {!loading && results.length === 0 && <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '30px' }}>Aucun résultat trouvé</Typography>}

          {/* List of results */}
          {results.length > 0 && !loading && (
            <div style={{
              maxHeight: 'calc(100vh - 150px)',
              overflowY: 'auto',
              marginTop: '40px',
              paddingBottom: '20px',
            }}>
              <Grid container spacing={2}>
                {results.map((perfume) => (
                  <Grid item xs={6} sm={4} md={3} key={perfume.id}>
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
                    >
                      <CustomCardContent perfume={perfume} getLowestPrice={getLowestPrice} />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
        </div>
      </Box>
    </Modal>
  );
};

export default SearchOverlay;
