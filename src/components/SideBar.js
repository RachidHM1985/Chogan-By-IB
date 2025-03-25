import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Drawer, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const Sidebar = ({ open, onClose }) => {
  const [subCategoriesBeauty, setSubCategoriesBeauty] = useState([]);
  const [subCategoriesPeptilux, setSubCategoriesPeptilux] = useState([]);
  const [subCategoriesBrilhome, setSubCategoriesBrilhome] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Récupération des catégories beauty
        const responseBeauty = await axios.get('/api/categoriesAurodhea');
        setSubCategoriesBeauty(responseBeauty.data);

         // Récupération des catégories peptilux
         const responsePeptilux = await axios.get('/api/categoriesPeptilux');
         setSubCategoriesPeptilux(responsePeptilux.data);
        
        // Récupération des catégories brilhome (catégories distinctes de la table brilhome_products)
        const responseBrilhome = await axios.get('/api/categoriesBrilhome');
        setSubCategoriesBrilhome(responseBrilhome.data);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (category, type) => {
    router.push(`/${type}?category=${encodeURIComponent(category)}`);
    onClose(); // Fermer la sidebar après sélection
  };

  // Catégories prédéfinies pour Brilhome si l'API n'est pas encore implémentée
  const brilhomeCategories = [
    "Savons pour les mains",
    "Lessive",
    "Nettoyants surfaces",
    "Produits vaisselle",
    "Désodorisants",
    "Nettoyants sols"
  ];

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '70vw', md: '300px' }, backgroundColor: '#EFE7DB', color: '#fff', height: '100%', padding: '10px' }}>
        <List>
          {/* Parfums */}
          <Accordion sx={{ backgroundColor: '#E0D6C5', color: 'white', borderRadius: '8px', marginBottom: '8px' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
              <ListItemText primary="Parfums" sx={{ textAlign: 'center', fontWeight: 'bold' }} />
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {['Homme', 'Femme', 'Unisexe', 'Luxe', 'Brume cheveux'].map((category) => (
                  <ListItem button key={category} onClick={() => handleCategorySelect(category, 'perfumes')}>
                    <ListItemText primary={category} sx={{ textAlign: 'center' }} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Produits de Beauté */}
          <Accordion sx={{ backgroundColor: '#E0D6C5', color: 'white', borderRadius: '8px', marginBottom: '8px' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
              <ListItemText primary="Produits de Beauté" sx={{ textAlign: 'center', fontWeight: 'bold' }} />
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {subCategoriesBeauty.length > 0 ? (
                  subCategoriesBeauty.map((category, index) => (
                    <ListItem button key={index} onClick={() => handleCategorySelect(category, 'beauty')}>
                      <ListItemText primary={category} sx={{ textAlign: 'center' }} />
                    </ListItem>
                  ))
                ) : (
                  <ListItemText primary="Chargement..." sx={{ textAlign: 'center', fontStyle: 'italic' }} />
                )}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Produits de Peptilux */}
          <Accordion sx={{ backgroundColor: '#E0D6C5', color: 'white', borderRadius: '8px', marginBottom: '8px' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
              <ListItemText primary="Produits de Cosmétique de luxe" sx={{ textAlign: 'center', fontWeight: 'bold' }} />
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {subCategoriesPeptilux.length > 0 ? (
                  subCategoriesPeptilux.map((category, index) => (
                    <ListItem button key={index} onClick={() => handleCategorySelect(category, 'peptilux')}>
                      <ListItemText primary={category} sx={{ textAlign: 'center' }} />
                    </ListItem>
                  ))
                ) : (
                  <ListItemText primary="Chargement..." sx={{ textAlign: 'center', fontStyle: 'italic' }} />
                )}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Produits Brilhome */}
          <Accordion sx={{ backgroundColor: '#E0D6C5', color: 'white', borderRadius: '8px', marginBottom: '8px' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
              <ListItemText primary="Entretien de la maison" sx={{ textAlign: 'center', fontWeight: 'bold' }} />
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {subCategoriesBrilhome.length > 0 ? (
                  subCategoriesBrilhome.map((category, index) => (
                    <ListItem button key={index} onClick={() => handleCategorySelect(category, 'brilhome')}>
                      <ListItemText primary={category} sx={{ textAlign: 'center' }} />
                    </ListItem>
                  ))
                ) : (
                  // Utiliser les catégories prédéfinies si l'API ne retourne rien
                  brilhomeCategories.map((category, index) => (
                    <ListItem button key={index} onClick={() => handleCategorySelect(category, 'brilhome')}>
                      <ListItemText primary={category} sx={{ textAlign: 'center' }} />
                    </ListItem>
                  ))
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        </List>

        {/* Rejoins-nous */}
        <List sx={{ backgroundColor: '#E0D6C5', color: 'white', borderRadius: '8px', marginTop: '10px', textAlign: 'center' }}>
          <ListItem component={Link} href="/BecomeConsultant">
            <ListItemText primary="Rejoins-nous!" sx={{ textAlign: 'center', fontWeight: 'bold' }} />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;