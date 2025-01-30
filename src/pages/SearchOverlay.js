import React, { useState, useEffect, useRef } from 'react';
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
  const [openSearch, setOpenSearch] = useState(false);  // Modal openSearch state
  const { addToCart } = useCart();
  const router = useRouter();

  // Search products function
  const searchProducts = async (searchQuery) => {
    setLoading(true);
    try {
      if (!searchQuery.trim()) return;
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await fetch(`/api/search?query=${encodedQuery}`);
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

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  
  const handleCardClick = (perfumeId) => {   
    router.push(`/perfume/${perfumeId}`); 
    onClose();
  };

  const fetchRandomPerfumes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?query=*`);
      if (response.ok) {
        const data = await response.json();
        const randomPerfumes = data.sort(() => 0.5 - Math.random()).slice(0, 12);
        setResults(randomPerfumes);
      } else {
        console.error('Erreur lors de la récupération des parfums');
      }
    } catch (error) {
      console.error("Erreur de réseau lors de la récupération des parfums", error);
    } finally {
      setLoading(false);
    }
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
    } else {
      fetchRandomPerfumes();
    }
  };


  const getLowestPrice = (perfume) => {
    const prices = [perfume.prix_30ml, perfume.prix_50ml, perfume.prix_70ml].filter(price => price !== null);
    const lowestPrice = Math.min(...prices);
    return lowestPrice.toFixed(2);
  };

  useEffect(() => {
    if (open) {
      fetchRandomPerfumes();
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
          overflowY: 'auto',  // Allow scrolling if content exceeds height
        }}>
          

          <Box sx={{
            position: 'absolute',        // Make the Box fixed within the modal
            top: 0,                      // Position it at the top of the modal
            left: 0,                     // Align it to the left side
            width: '100%',               // Ensure the Box takes the full width of the modal
            paddingTop: '15px',          // Add padding to the top for some spacing
            zIndex: 1300,                // Ensure it stays above other content
            display: 'flex',
            justifyContent: 'center',    // Center the search form
            alignItems: 'center',
            flexDirection: 'column',     // Stack items vertically (search form and close button)
          }}>
            <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                placeholder="Que cherchez-vous"
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
              position: 'absolute',  // Absolute position to the modal
              top: 10,               // 10px from the top
              right: 10,             // 10px from the right
              zIndex: 1300,          // Ensure it's above other elements
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
      maxHeight: 'calc(100vh - 150px)',  // Adjust to make space for search bar and close button
      overflowY: 'auto',  // Enable vertical scrolling
      marginTop: '40px',
      paddingBottom: '20px',  // Padding at the bottom for space
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
              onClick={() => handleCardClick(perfume.id)}
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
