import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Paper, List, ListItem, ListItemText, Box } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router'; 
import axios from 'axios';

const Sidebar = ({ onCategorySelect = () => {} }) => {
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [showSubCategoriesBeauty, setShowSubCategoriesBeauty] = useState(false);
  const [subCategoriesBeauty, setSubCategoriesBeauty] = useState([]); 

  const router = useRouter(); 

  const handleParfumsClick = () => {
    setShowSubCategories(!showSubCategories);
  };

  const handleBeautyClick = () => {
    setShowSubCategoriesBeauty(!showSubCategoriesBeauty);
  };

  const handleCategorySelect = (category) => {
    router.push(`/perfumes?category=${category}`);
    if (onCategorySelect) onCategorySelect(category); // Invoke callback if provided
  };

  const handleCategoryBeautySelect = (category) => {
    router.push(`/beauty?category=${category}`);
    if (onCategorySelect) onCategorySelect(category); // Invoke callback if provided
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setSubCategoriesBeauty(response.data); // Set the categories data for beauty
      } catch (error) {
        console.error('Error while fetching categories:', error);
        // Optional: You could display a user-friendly message to the UI.
      }
    };

    fetchCategories();
  }, []);

  // Memoizing to avoid unnecessary rerenders of beauty categories.
  const beautyCategories = useMemo(() => {
    return subCategoriesBeauty.map((category, index) => (
      <ListItem key={index} button onClick={() => handleCategoryBeautySelect(category)}>
        <ListItemText primary={category} sx={{ textAlign: 'center', fontFamily: 'Courier New, monospace', borderBottom: '1px solid #ddd' }} />
      </ListItem>
    ));
  }, [subCategoriesBeauty]);

  return (
    <Paper sx={{ paddingTop: '50px', paddingBottom: '20px', height: '100vh', overflowX: 'auto', width: '40vh' }}>
      <List sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Parfums Section */}
        <ListItem button onClick={handleParfumsClick} sx={{ borderBottom: '1px solid #ddd' }}>
          <ListItemText primary="Parfums" />
        </ListItem>
        {showSubCategories && (
          <Box sx={{ display: 'flex', flexDirection: 'row', overflowX: 'auto', width: '100%', justifyContent: 'center', borderBottom: '1px solid #ddd' }}>
            <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
              <ListItem button onClick={() => handleCategorySelect('Homme')}>
                <ListItemText primary="Homme" sx={{ textAlign: 'center', fontFamily: 'Courier New, monospace', borderBottom: '1px solid #ddd' }} />
              </ListItem>
              <ListItem button onClick={() => handleCategorySelect('Femme')}>
                <ListItemText primary="Femme" sx={{ textAlign: 'center', fontFamily: 'Courier New, monospace', borderBottom: '1px solid #ddd' }} />
              </ListItem>
              <ListItem button onClick={() => handleCategorySelect('Unisex')}>
                <ListItemText primary="Unisexe" sx={{ textAlign: 'center', fontFamily: 'Courier New, monospace', borderBottom: '1px solid #ddd' }} />
              </ListItem>
              <ListItem button onClick={() => handleCategorySelect('Luxe')}>
                <ListItemText primary="Luxe" sx={{ textAlign: 'center', fontFamily: 'Courier New, monospace', borderBottom: '1px solid #ddd' }} />
              </ListItem>
              <ListItem button onClick={() => handleCategorySelect('Brume cheveux')}>
                <ListItemText primary="Brume pour cheveux" sx={{ textAlign: 'center', fontFamily: 'Courier New, monospace', borderBottom: '1px solid #ddd' }} />
              </ListItem>
            </List>
          </Box>
        )}
        
        {/* Beauty Products Section */}
        <List sx={{ display: 'flex', flexDirection: 'column' }}>
          <ListItem button onClick={handleBeautyClick} sx={{ borderBottom: '1px solid #ddd' }}>
            <ListItemText primary="Produits de beauté" />
          </ListItem>
          {subCategoriesBeauty.length > 0 && showSubCategoriesBeauty && (
            <Box sx={{ display: 'flex', flexDirection: 'row', overflowX: 'auto', width: '100%', justifyContent: 'center', borderBottom: '1px solid #ddd' }}>
              <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
                {beautyCategories}
              </List>
            </Box>
          )}
        </List>

        {/* Join Us Link */}
        <List>
          <ListItem button component={Link} href="/BecomeConsultant">
            <ListItemText primary="Rejoins-nous!" />
          </ListItem>
        </List>
      </List>
    </Paper>
  );
};

Sidebar.propTypes = {
  onCategorySelect: PropTypes.func,  // Ensure this is a function
};

export default Sidebar;
