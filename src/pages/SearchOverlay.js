import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  TextField, 
  Grid, 
  Typography, 
  CircularProgress, 
  InputAdornment, 
  Box, 
  Card, 
  IconButton 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CustomCardContent from '../components/CustomCardContent';
import { debounce } from 'lodash';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';

const SearchOverlay = ({ open, onClose }) => {
  // États pour gérer la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  // Hooks personnalisés
  const { addToCart } = useCart();
  const router = useRouter();

  // Récupération de produits aléatoires
  const getRandomProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/search`);
      if (response.ok) {
        const data = await response.json();
        const shuffled = data.sort(() => 0.5 - Math.random());
        const randomResults = shuffled.slice(0, 10);
        setResults(randomResults);
      } else {
        throw new Error('Erreur de chargement des produits');
      }
    } catch (error) {
      setError("Erreur de réseau lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  // Recherche de produits
  const searchProducts = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      if (!searchQuery.trim()) return;
      
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await fetch(`/api/search?query=${encodedQuery}`);

      if (response.ok) {
        const data = await response.json();
        const filteredResults = data.filter((perfume) => {
          const cleanedQuery = searchQuery.trim().toLowerCase();
          const nameMatch = perfume.nom_produit.toLowerCase().includes(cleanedQuery);
          const brandMatch = perfume.nom_marque.toLowerCase().includes(cleanedQuery);
          const codeMatch = perfume.code.toLowerCase().includes(cleanedQuery);
          const genreMatch = perfume.genre.toLowerCase().includes(cleanedQuery);
          
          return nameMatch || brandMatch || codeMatch || genreMatch;
        });

        if (filteredResults.length === 0) {
          setError("Aucun parfum trouvé pour cette recherche.");
        } else {
          setResults(filteredResults);
        }
      } else {
        throw new Error('Erreur de chargement des produits');
      }
    } catch (error) {
      setError("Erreur de réseau lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  // Gestion du clic sur une carte de parfum
  const handleCardClick = (perfumeCode) => {
    router.push(`/perfume/${perfumeCode}`);
    onClose();
  };

  // Hook pour la recherche avec debounce
  useEffect(() => {
    const debouncedSearch = debounce(searchProducts, 500);
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery]);

  // Gestion de la soumission de recherche
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
    }
  };

  // Chargement des produits aléatoires à l'ouverture
  useEffect(() => {
    if (open) {
      getRandomProducts();
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      {/* Contenu du modal similaire à votre implémentation originale */}
      <Box sx={{
        backgroundColor: 'white',
        padding: 2,        
        margin: 'auto',
        marginTop: '2.5%',
        overflowY: 'auto',
        top: '10px',
        position: 'absolute',
      }}>
        {/* Formulaire de recherche */}
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

        {/* Gestion des états de résultats */}
        {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
        
        {error && (
          <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '30px', color: 'red' }}>
            {error}
          </Typography>
        )}

        {!loading && results.length === 0 && !error && (
          <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '30px' }}>
            Aucune recherche effectuée, ou aucun parfum trouvé.
          </Typography>
        )}

        {/* Liste des résultats */}
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
                    <CustomCardContent 
                      perfume={perfume} 
                      getLowestPrice={(perfume) => {
                        const prices = [perfume.prix_30ml, perfume.prix_50ml, perfume.prix_70ml].filter(price => price !== null);
                        const lowestPrice = Math.min(...prices);
                        return lowestPrice.toFixed(2);
                      }} 
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        )}
      </Box>
    </Modal>
  );
};

export default SearchOverlay;