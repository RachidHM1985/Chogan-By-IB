import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Drawer, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails, Box, ListItemIcon } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

// Importation des icônes
import SpaIcon from '@mui/icons-material/Spa';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { Icon } from '@iconify/react';
import DiffuseurIcon from './DiffuseurIcon'; 
import CosmeticIcon from './CosmeticIcon';
import LuxuryCosmeticIcon from './LuxuryCosmeticIcon';

const Sidebar = ({ open, onClose }) => {
  const [subCategoriesBeauty, setSubCategoriesBeauty] = useState([]);
  const [subCategoriesPeptilux, setSubCategoriesPeptilux] = useState([]);
  const [subCategoriesBrilhome, setSubCategoriesBrilhome] = useState([]);
  const [subCategoriesParfumerieInterieur, setSubCategoriesParfumerieInterieur] = useState([]);
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
        
        // Récupération des catégories brilhome
        const responseBrilhome = await axios.get('/api/categoriesBrilhome');
        setSubCategoriesBrilhome(responseBrilhome.data);

        // Récupération des catégories parfumerieInterieur 
        const responseParfumerieInterieur = await axios.get('/api/categoriesParfumerieInterieur');
        setSubCategoriesParfumerieInterieur(responseParfumerieInterieur.data);
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

  // Style personnalisé pour les accordéons
  const accordionStyle = {
    backgroundColor: 'transparent',
    color: '#593925',
    borderRadius: '8px',
    marginBottom: '8px',
    boxShadow: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    }
  };

  // Style pour les éléments de liste au survol
  const listItemStyle = {
    borderRadius: '6px',
    margin: '2px 0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      transform: 'translateX(5px)',
    }
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box 
        sx={{ 
          width: { xs: '70vw', md: '300px' }, 
          background: 'linear-gradient(135deg, #EFE7DB 0%, #D6C1A6 100%)', 
          color: '#593925', 
          height: '100%', 
          padding: '15px',
          overflowY: 'auto',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
          paddingTop: '15%'
        }}
      >
        <List>
          {/* Parfums */}
          <Accordion 
            sx={{ 
              ...accordionStyle,
              '& .MuiAccordionSummary-root:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }
            }}
          >
           <AccordionSummary 
              expandIcon={<ExpandMoreIcon sx={{ color: '#593925' }} />}
              sx={{ 
                borderRadius: '8px',
                display: 'flex', 
                alignItems: 'center' // Centre tous les éléments verticalement
              }}
            >
              <Box 
                component="img" 
                src="images/icon-parfum.png" 
                alt="Parfums" 
                sx={{ 
                  width: '5vh', 
                  height: '5vh', 
                  marginRight: '21px', 
                  objectFit: 'contain',
                  display: 'flex',
                  alignItems: 'center' // Alignement interne de l'image
                }} 
              />
              <ListItemText 
                primary="Parfums" 
                sx={{ 
                  '& .MuiTypography-root': { 
                    marginLeft: '5px',
                    fontWeight: 'bold',
                    fontSize: '1rem', 
                    marginTop: '5px'
                  } 
                }} 
              />
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {['Homme', 'Femme', 'Unisexe', 'Luxe', 'Brume cheveux'].map((category) => (
                  <ListItem 
                    button 
                    key={category} 
                    onClick={() => handleCategorySelect(category, 'perfumes')}
                    sx={listItemStyle}
                  >
                  <ListItemText 
                    primary={category} 
                    sx={{ 
                      paddingLeft: '10px',
                      display: 'flex', // Utiliser flexbox pour centrer l'élément
                      alignItems: 'center', // Centrer verticalement
                      justifyContent: 'center', // Centrer horizontalement
                      '& .MuiTypography-root': { 
                        fontSize: '1rem', // Taille du texte
                        fontWeight: '400', // Poids léger pour une allure raffinée
                        fontFamily: '"Roboto", sans-serif', // Police claire et raffinée
                        color: '#4E3B31', // Couleur douce et élégante
                        letterSpacing: '0.5px', // Espacement léger pour un effet aéré
                        lineHeight: '1.6', // Espacement des lignes pour améliorer la lisibilité
                        textAlign: 'center', // Centrer le texte
                        '&:hover': {
                          color: '#593925', // Couleur au survol
                          textDecoration: 'underline', // Ajouter un sous-lignage au survol pour plus de raffinement
                          cursor: 'pointer', // Indiquer que l'élément est interactif
                        },
                      }
                    }} 
                  />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Parfums d'intérieur */}
          <Accordion 
            sx={{ 
              ...accordionStyle,
              '& .MuiAccordionSummary-root:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }
            }}
          >
             <AccordionSummary 
              expandIcon={<ExpandMoreIcon sx={{ color: '#593925' }} />}
              sx={{ borderRadius: '8px', display: 'flex', alignItems: 'center' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {/* Image JPG remplaçant l'icône */}
                <Box 
                  component="img" 
                  src="images/icon-diffuseur.png"  
                  alt="Parfums d'intérieur"
                  sx={{ 
                    width: '6vh', 
                    height: '6vh', 
                    marginRight: '11px', 
                    objectFit: 'contain' 
                  }} 
                />
                <ListItemText 
                  primary="Parfums d'intérieur" 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      marginLeft: '5px',
                      fontWeight: 'bold',
                      fontSize: '1rem' 
                    } 
                  }} 
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {subCategoriesParfumerieInterieur.length > 0 ? (
                  subCategoriesParfumerieInterieur.map((category, index) => (
                    <ListItem 
                      button 
                      key={index} 
                      onClick={() => handleCategorySelect(category, 'parfumerieInterieur')}
                      sx={listItemStyle}
                    >
                      <ListItemText 
                        primary={category} 
                        sx={{ 
                          paddingLeft: '10px',
                          display: 'flex', // Utiliser flexbox pour centrer l'élément
                          alignItems: 'center', // Centrer verticalement
                          justifyContent: 'center', // Centrer horizontalement
                          '& .MuiTypography-root': { 
                            fontSize: '1rem', // Taille du texte
                            fontWeight: '400', // Poids léger pour une allure raffinée
                            fontFamily: '"Roboto", sans-serif', // Police claire et raffinée
                            color: '#4E3B31', // Couleur douce et élégante
                            letterSpacing: '0.5px', // Espacement léger pour un effet aéré
                            lineHeight: '1.6', // Espacement des lignes pour améliorer la lisibilité
                            textAlign: 'center', // Centrer le texte
                            '&:hover': {
                              color: '#593925', // Couleur au survol
                              textDecoration: 'underline', // Ajouter un sous-lignage au survol pour plus de raffinement
                              cursor: 'pointer', // Indiquer que l'élément est interactif
                            },
                          }
                        }} 
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItemText 
                    primary="Chargement..." 
                    sx={{ 
                      paddingLeft: '10px',
                      fontStyle: 'italic',
                      '& .MuiTypography-root': { 
                        fontSize: '0.95rem' 
                      }
                    }} 
                  />
                )}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Produits de Beauté */}
          <Accordion 
            sx={{ 
              ...accordionStyle,
              '& .MuiAccordionSummary-root:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon sx={{ color: '#593925' }} />}
              sx={{ borderRadius: '8px', display: 'flex', alignItems: 'center' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Image JPG remplaçant l'icône */}
                <Box 
                  component="img" 
                  src="images/icon-beauty.png"  
                  alt="Produits de Beauté"
                  sx={{ 
                    width: '7vh', 
                    height: '7vh', 
                    marginRight: '4px', 
                    objectFit: 'contain' 
                  }} 
                />
                <ListItemText 
                  primary="Produits de Beauté" 
                  sx={{ 
                    '& .MuiTypography-root': {
                      marginLeft: '5px',
                      fontWeight: 'bold',
                      fontSize: '1rem' 
                    } 
                  }} 
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {subCategoriesBeauty.length > 0 ? (
                  subCategoriesBeauty.map((category, index) => (
                    <ListItem 
                      button 
                      key={index} 
                      onClick={() => handleCategorySelect(category, 'beauty')}
                      sx={listItemStyle}
                    >
                      <ListItemText 
                        primary={category} 
                        sx={{ 
                          paddingLeft: '10px',
                          display: 'flex', // Utiliser flexbox pour centrer l'élément
                          alignItems: 'center', // Centrer verticalement
                          justifyContent: 'center', // Centrer horizontalement
                          '& .MuiTypography-root': { 
                            fontSize: '1rem', // Taille du texte
                            fontWeight: '400', // Poids léger pour une allure raffinée
                            fontFamily: '"Roboto", sans-serif', // Police claire et raffinée
                            color: '#4E3B31', // Couleur douce et élégante
                            letterSpacing: '0.5px', // Espacement léger pour un effet aéré
                            lineHeight: '1.6', // Espacement des lignes pour améliorer la lisibilité
                            textAlign: 'center', // Centrer le texte
                            '&:hover': {
                              color: '#593925', // Couleur au survol
                              textDecoration: 'underline', // Ajouter un sous-lignage au survol pour plus de raffinement
                              cursor: 'pointer', // Indiquer que l'élément est interactif
                            },
                          }
                        }} 
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItemText 
                    primary="Chargement..." 
                    sx={{ 
                      paddingLeft: '10px',
                      fontStyle: 'italic',
                      '& .MuiTypography-root': { 
                        fontSize: '0.95rem' 
                      }
                    }} 
                  />
                )}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Produits de Peptilux */}
          <Accordion 
            sx={{ 
              ...accordionStyle,
              '& .MuiAccordionSummary-root:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon sx={{ color: '#593925' }} />}
              sx={{ borderRadius: '8px', display: 'flex', alignItems: 'center' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Remplacement de l'icône par une image PNG */}
                <Box 
                  component="img" 
                  src="images/icon-peptilux.png"  
                  alt="Cosmétique de luxe"
                  sx={{ 
                    width: '7vh', 
                    height: '7vh', 
                    marginRight: '4px', 
                    objectFit: 'contain' 
                  }} 
                />
                <ListItemText 
                  primary="Cosmétique de luxe" 
                  sx={{ 
                    '& .MuiTypography-root': {
                      marginLeft: '5px',
                      fontWeight: 'bold',
                      fontSize: '1rem' 
                    } 
                  }} 
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {subCategoriesPeptilux.length > 0 ? (
                  subCategoriesPeptilux.map((category, index) => (
                    <ListItem 
                      button 
                      key={index} 
                      onClick={() => handleCategorySelect(category, 'peptilux')}
                      sx={{ 
                        paddingLeft: '10px',
                        display: 'flex', // Utiliser flexbox pour centrer l'élément
                        alignItems: 'center', // Centrer verticalement
                        justifyContent: 'center', // Centrer horizontalement
                        '& .MuiTypography-root': { 
                          fontSize: '1rem', // Taille du texte
                          fontWeight: '400', // Poids léger pour une allure raffinée
                          fontFamily: '"Roboto", sans-serif', // Police claire et raffinée
                          color: '#4E3B31', // Couleur douce et élégante
                          letterSpacing: '0.5px', // Espacement léger pour un effet aéré
                          lineHeight: '1.6', // Espacement des lignes pour améliorer la lisibilité
                          textAlign: 'center', // Centrer le texte
                          '&:hover': {
                            color: '#593925', // Couleur au survol
                            textDecoration: 'underline', // Ajouter un sous-lignage au survol pour plus de raffinement
                            cursor: 'pointer', // Indiquer que l'élément est interactif
                          },
                        }
                      }} 
                    >
                      <ListItemText 
                        primary={category} 
                        sx={{ 
                          paddingLeft: '10px',
                          '& .MuiTypography-root': { 
                            fontSize: '0.95rem' 
                          }
                        }} 
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItemText 
                    primary="Chargement..." 
                    sx={{ 
                      paddingLeft: '10px',
                      fontStyle: 'italic',
                      '& .MuiTypography-root': { 
                        fontSize: '0.95rem' 
                      }
                    }} 
                  />
                )}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Produits Brilhome */}
          <Accordion 
            sx={{ 
              ...accordionStyle,
              '& .MuiAccordionSummary-root:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon sx={{ color: '#593925' }} />}
              sx={{ borderRadius: '8px', display: 'flex', alignItems: 'center' }}
            >
              {/* Remplacer l'icône par une image PNG */}
              <Box 
                component="img" 
                src="images/icon-brilhome.png"  
                alt="Entretien de la maison"
                sx={{ 
                  width: '7vh', 
                  height: '7vh', 
                  marginRight: '10px', 
                  objectFit: 'contain' 
                }} 
              />
              <ListItemText 
                primary="Entretien de la maison" 
                sx={{ 
                  '& .MuiTypography-root': {
                    fontWeight: 'bold',
                    fontSize: '1rem' 
                  } 
                }} 
              />
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {subCategoriesBrilhome.length > 0 ? (
                  subCategoriesBrilhome.map((category, index) => (
                    <ListItem 
                      button 
                      key={index} 
                      onClick={() => handleCategorySelect(category, 'brilhome')}
                      sx={{ 
                        paddingLeft: '10px',
                        display: 'flex', // Utiliser flexbox pour centrer l'élément
                        alignItems: 'center', // Centrer verticalement
                        justifyContent: 'center', // Centrer horizontalement
                        '& .MuiTypography-root': { 
                          fontSize: '1rem', // Taille du texte
                          fontWeight: '400', // Poids léger pour une allure raffinée
                          fontFamily: '"Roboto", sans-serif', // Police claire et raffinée
                          color: '#4E3B31', // Couleur douce et élégante
                          letterSpacing: '0.5px', // Espacement léger pour un effet aéré
                          lineHeight: '1.6', // Espacement des lignes pour améliorer la lisibilité
                          textAlign: 'center', // Centrer le texte
                          '&:hover': {
                            color: '#593925', // Couleur au survol
                            textDecoration: 'underline', // Ajouter un sous-lignage au survol pour plus de raffinement
                            cursor: 'pointer', // Indiquer que l'élément est interactif
                          },
                        }
                      }} 
                    >
                      <ListItemText 
                        primary={category} 
                        sx={{ 
                          paddingLeft: '10px',
                          '& .MuiTypography-root': { 
                            fontSize: '0.95rem' 
                          }
                        }} 
                      />
                    </ListItem>
                  ))
                ) : (
                  // Utiliser les catégories prédéfinies si l'API ne retourne rien
                  brilhomeCategories.map((category, index) => (
                    <ListItem 
                      button 
                      key={index} 
                      onClick={() => handleCategorySelect(category, 'brilhome')}
                      sx={listItemStyle}
                    >
                      <ListItemText 
                        primary={category} 
                        sx={{ 
                          paddingLeft: '10px',
                          '& .MuiTypography-root': { 
                            fontSize: '0.95rem' 
                          }
                        }} 
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        </List>

        {/* Rejoins-nous */}
        <Box 
          sx={{ 
            marginTop: '20px', 
            background: 'linear-gradient(135deg, #C4AD91 0%, #B39475 100%)',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            }
          }}
        >
          <ListItem 
            component={Link} 
            href="/BecomeConsultant"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              padding: '12px',
              color: 'white',
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto', marginRight: '8px' }}>
              <GroupAddIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Rejoins-nous!" 
              sx={{ 
                '& .MuiTypography-root': { 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  color: 'white'
                } 
              }} 
            />
          </ListItem>
        </Box>
      </Box>
    </Drawer>
  );
};

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;