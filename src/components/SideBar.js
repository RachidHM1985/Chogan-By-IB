import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, List, ListItem, ListItemText, Box } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Importer useRouter

const Sidebar = ({ onCategorySelect = () => { } }) => {
  const [showSubCategories, setShowSubCategories] = useState(false);
  const router = useRouter(); // Initialiser le hook useRouter

  const handleParfumsClick = () => {
    setShowSubCategories(!showSubCategories);
  };

  const handleCategorySelect = (category) => {
    router.push(`/perfumes?category=${category}`);
  };

  return (
    <Paper sx={{ paddingTop: '50px', paddingBottom: '20px', height: '100vh', overflowX: 'auto', width: '25vh',  }}>
      <List sx={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #ddd' }}>
        <ListItem button onClick={handleParfumsClick} sx={{ borderBottom: '1px solid #ddd'}}>
          <ListItemText primary="Parfums" />
        </ListItem>
        {showSubCategories && (
          <Box sx={{ display: 'flex', flexDirection: 'row', overflowX: 'auto', width: '100%', justifyContent: 'center', borderBottom: '1px solid #ddd' }}>
            <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
              <ListItem button onClick={() => handleCategorySelect('Homme')}>
                <ListItemText primary="Homme" sx={{ textAlign: 'center', fontFamily: 'Courier New, monospace', borderBottom: '1px solid #ddd'  }} />
              </ListItem>
              <ListItem button onClick={() => handleCategorySelect('Femme')}>
                <ListItemText primary="Femme" sx={{ textAlign: 'center', fontFamily: 'Courier New, monospace',borderBottom: '1px solid #ddd'  }} />
              </ListItem>
              <ListItem button onClick={() => handleCategorySelect('Unisex')}>
                <ListItemText primary="Unisexe" sx={{ textAlign: 'center', fontFamily: 'Courier New, monospace', borderBottom: '1px solid #ddd'  }} />
              </ListItem>
              <ListItem button onClick={() => handleCategorySelect('Luxe')}>
                <ListItemText primary="Luxe" sx={{ textAlign: 'center', fontFamily: 'Courier New, monospace', borderBottom: '1px solid #ddd'  }} />
              </ListItem>
            </List>
          </Box>
        )}
        {/*<ListItem button component={Link} href="/produits-interieurs">
          <ListItemText primary="Entretien de la maison" />
        </ListItem>
        <ListItem button component={Link} href="/produits-beaute">
          <ListItemText primary="Produits de beauté" />
        </ListItem>*/}
        <ListItem button component={Link} href="/BecomeConsultant">
          <ListItemText primary="Rejoins-nous!" />
        </ListItem>
      </List>
    </Paper>
  );
};

Sidebar.propTypes = {
  onCategorySelect: PropTypes.func,
};

export default Sidebar;