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
  IconButton,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { debounce } from 'lodash';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';

// Composant pour afficher un produit dans une card
const ProductCard = ({ product, onClick }) => {
  // Déterminer le prix à afficher en fonction du type de produit
  const getDisplayPrice = () => {
    if (product.type === 'parfum') {
      const prices = [product.prix_30ml, product.prix_50ml, product.prix_70ml, product.prix_15ml].filter(price => price !== null && price !== undefined);
      if (prices.length === 0) return 'Prix non disponible';
      return `À partir de ${Math.min(...prices).toFixed(2)}€`;
    } else {
      return product.prix ? `${product.prix.toFixed(2)}€` : 'Prix non disponible';
    }
  };

  // Formater le titre du produit en fonction du type
  const getProductTitle = () => {
    if (product.type === 'parfum') {
      return `PARFUM : ${product.code_produit}`;
    } else {
      return product.nom_produit;
    }
  };

  return (
    <Card
      sx={{
        borderRadius: '15px',
        border: '1px solid #ddd',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        height: '250px', // Augmentation de la hauteur
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `url(/images/products/${product.code_produit}.jpg), url(${product.image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={onClick}
    >
      <Box 
        sx={{
          mt: 'auto',
          background: 'rgba(255, 255, 255, 0.85)',
          p: 2, // Padding augmenté
          width: '100%'
        }}
      >
        <Chip 
          label={product.category} 
          size="small" 
          color="primary"
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10,
            backgroundColor: getCategoryColor(product.type),
          }} 
        />
        
        <Typography 
          variant="subtitle1" 
          fontWeight="bold" 
          sx={{ 
            fontSize: '0.9rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: product.type === 'parfum' ? 3 : 1,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {getProductTitle()}
        </Typography>
        
        {product.type !== 'parfum' && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
            {product.nom_marque}
          </Typography>
        )}
        
        {product.type === 'parfum' && product.genre && (
          <><Typography variant="caption" display="block" sx={{ fontSize: '0.85rem' }}>
            {product.genre}
          </Typography><Typography variant="caption" display="block" sx={{ fontSize: '0.85rem' }}>
              Parfum inspiré par {product.nom_produit} de {product.nom_marque}
            </Typography></>
        )}
        
        <Typography variant="body2" fontWeight="bold" sx={{ mt: 1, fontSize: '1rem' }}>
          {getDisplayPrice()}
        </Typography>
      </Box>
    </Card>
  );
};

// Fonction pour attribuer une couleur à chaque catégorie
const getCategoryColor = (type) => {
  switch (type) {
    case 'parfum':
      return '#9c27b0'; // Violet
    case 'aurodhea':
      return '#4caf50'; // Vert
    case 'brilhome':
      return '#2196f3'; // Bleu
    case 'parfumerie_interieur':
      return '#ff9800'; // Orange
    case 'peptilux':
      return '#e91e63'; // Rose
    default:
      return '#9e9e9e'; // Gris
  }
};

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
        // Limiter à 20 produits maximum
        setResults(data.slice(0, 20));
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
    if (!searchQuery || !searchQuery.trim()) {
      getRandomProducts();
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      const response = await fetch(`/api/search?query=${encodedQuery}`);

      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          setError("Aucun produit trouvé pour cette recherche.");
          setResults([]);
        } else {
          // Limiter à 20 produits maximum
          setResults(data.slice(0, 20));
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

  // Gestion du clic sur une carte de produit
  const handleCardClick = (product) => {
    // Rediriger vers la page du produit en fonction de son type
    switch (product.type) {
      case 'parfum':
        router.push(`/perfumes/${product.genre || 'All'}/${product.code_produit}`);
        break;
      case 'aurodhea':
        router.push(`/beauty/all/${product.code_produit}`);
        break;
      case 'brilhome':
        router.push(`/brilhome/all/${product.code_produit}`);
        break;
      case 'parfumerie_interieur':
        router.push(`/parfumerieInterieur/all/${product.code_produit}`);
        break;
      case 'peptilux':
        router.push(`/peptilux/all/${product.code_produit}`);
        break;
    }
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
    searchProducts(searchQuery);
  };

  // Chargement des produits aléatoires à l'ouverture
  useEffect(() => {
    if (open) {
      getRandomProducts();
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        backgroundColor: 'white',
        padding: 3,
        margin: 'auto',
        marginTop: '2.5%',
        overflowY: 'auto',
        top: '10px',
        position: 'absolute',
        height: '90%',
        width: '90%',
        maxWidth: '1200px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderRadius: 2,
        boxShadow: 24,
      }}>
        {/* Bouton de fermeture */}
        <IconButton 
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        {/* Titre */}
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          Recherche de produits
        </Typography>

        {/* Formulaire de recherche */}
        <form onSubmit={handleSearchSubmit} style={{ width: '100%', marginBottom: '20px' }}>
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            placeholder="Rechercher par nom, code, marque, catégorie..."
            fullWidth
            sx={{ mb: 2 }}
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
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '30px', color: 'red' }}>
            {error}
          </Typography>
        )}

        {!loading && results.length === 0 && !error && (
          <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '30px' }}>
            Aucun produit trouvé.
          </Typography>
        )}

        {/* Liste des résultats */}
        {results.length > 0 && !loading && !error && (
          <Box sx={{
            maxHeight: 'calc(100vh - 250px)',
            overflowY: 'auto',
            padding: '10px',
          }}>
            <Grid container spacing={3}>
              {results.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`${product.type}-${product.id}`}>
                  <ProductCard 
                    product={product} 
                    onClick={() => handleCardClick(product)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default SearchOverlay;