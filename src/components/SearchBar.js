// components/SearchBar.js
import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, InputAdornment, CircularProgress, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/router';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]); // Liste des produits pour l'auto-complétion
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  
  const handleSearchChange = (event, value) => {
    setSearchQuery(value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
  
    if (searchQuery.trim()) {
      const response = await fetch(`/api/search?query=${searchQuery}`);
  
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        console.error("Erreur de chargement des produits");
      }
    } else {
      console.error("Le champ de recherche est vide.");
    }
  };  

  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ paddingTop: '5px'}}>
      <form onSubmit={handleSearchSubmit} style={{width:'300px'}}>
        <Autocomplete
          value={searchQuery}
          onChange={handleSearchChange}
          freeSolo
          options={products.map((product) => product.nom_produit)}
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
                    {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </form>
    </Grid>
  );
};

export default SearchBar;
