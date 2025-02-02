import React, { useState, useEffect } from 'react';
import { Modal, TextField, Grid, Typography, CircularProgress, InputAdornment, Box, Card, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CustomCardContent from '../components/CustomCardContent';
import { debounce } from 'lodash';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';

const SearchOverlay = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null); // Ajout de l'état d'erreur
  const { addToCart } = useCart();
  const router = useRouter();

  // Fonction pour obtenir des résultats de parfum aléatoires
  const getRandomProducts = async () => {
    setLoading(true);
    setError(null); // Réinitialisation de l'erreur au début
    try {
      const response = await fetch(`/api/search`); // Récupérer tous les produits
      if (response.ok) {
        const data = await response.json();

        // Mélanger les produits pour obtenir un ordre aléatoire
        const shuffled = data.sort(() => 0.5 - Math.random());

        // Limiter le nombre de produits à afficher (par exemple, 10)
        const randomResults = shuffled.slice(0, 10);

        setResults(randomResults);
      } else {
        throw new Error('Erreur de chargement des produits'); // Lancer une erreur si la réponse n'est pas OK
      }
    } catch (error) {
      setError("Erreur de réseau lors de la recherche"); // Gérer l'erreur de réseau
    } finally {
      setLoading(false);
    }
  };

  // Fonction de recherche stricte
  const searchProducts = async (searchQuery) => {
    setLoading(true);
    setError(null); // Réinitialisation de l'erreur au début
    try {
      if (!searchQuery.trim()) return;
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await fetch(`/api/search?query=${encodedQuery}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Filtrage strict sur le nom_produit, nom_marque et code
        const filteredResults = data.filter((perfume) => {
          const cleanedQuery = searchQuery.trim().toLowerCase();
          
          // Recherche stricte sur le nom du produit
          const nameMatch = perfume.nom_produit.toLowerCase() === cleanedQuery;
          // Recherche stricte sur la marque du produit
          const brandMatch = perfume.nom_marque.toLowerCase() === cleanedQuery;
          // Recherche stricte sur le code du parfum
          const codeMatch = perfume.code.toLowerCase() === cleanedQuery;
          
          return nameMatch || brandMatch || codeMatch;
        });

        // Vérifier si des résultats ont été trouvés
        if (filteredResults.length === 0) {
          setError("Aucun parfum trouvé pour cette recherche."); // Ajouter un message d'erreur si aucun parfum n'est trouvé
        }
        
        setResults(filteredResults);
      } else {
        throw new Error('Erreur de chargement des produits'); // Lancer une erreur si la réponse n'est pas OK
      }
    } catch (error) {
      setError("Erreur de réseau lors de la recherche"); // Gérer l'erreur de réseau
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

  useEffect(() => {
    if (open) {
      getRandomProducts();
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        backgroundColor: 'white',
        padding: 2,        
        margin: 'auto',
        marginTop: '2.5%',
        overflowY: 'auto',
        top: '10px',
        position: 'absolute',
      }}>
        <Box sx={{
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

          {/* Error message */}
          {error && <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '30px', color: 'red' }}>{error}</Typography>}

          {/* No results found message */}
          {!loading && results.length === 0 && !error && (
            <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '30px' }}>
              Aucune recherche effectuée, ou aucun parfum trouvé.
            </Typography>
          )}

          {/* List of results */}
          {results.length > 0 && !loading && !error && (
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
                      <CustomCardContent perfume={perfume} getLowestPrice={(perfume) => {
                        const prices = [perfume.prix_30ml, perfume.prix_50ml, perfume.prix_70ml].filter(price => price !== null);
                        const lowestPrice = Math.min(...prices);
                        return lowestPrice.toFixed(2);
                      }} />
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
