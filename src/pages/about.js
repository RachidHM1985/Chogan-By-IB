import { Container, Grid, Typography, Box, Button, Paper } from '@mui/material';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './about.module.css';
import Header from '../components/Header';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoverEffect, setHoverEffect] = useState(false);

  // Fonction de gestion du scroll
  const handleScroll = () => {
    const position = window.pageYOffset;
    if (position > 50) {
      setIsVisible(true); // Activer l'animation si l'utilisateur fait défiler la page
    } else {
      setIsVisible(false); // Désactiver l'animation quand on revient en haut
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll); // Nettoyage de l'événement
    };
  }, []);

  return (
          <>
      <Header />  {/* Ajout de l'entête avec le logo et la navigation */}
      <Container maxWidth="lg" className={styles.container}>
        {/* Section Hero avec un titre et une description */}
        <Box mb={4} className={styles.heroSection}>
          <Typography
            variant="h3"
            align="center"
          >
            À propos de Chogan
          </Typography>
          <Typography
            variant="body1"
            align="center"
            className={`${styles.introText} ${isVisible ? styles.fadeIn : ''}`}
          >
            Rejoignez une entreprise dynamique, innovante, et en pleine expansion. Découvrez nos produits de qualité et les opportunités exceptionnelles que nous offrons à nos distributeurs !
          </Typography>
        </Box>

        {/* Section Grid avec Material UI et Bootstrap pour responsive */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper className={`${styles.infoCard} ${isVisible ? styles.fadeIn : ''}`} elevation={3}>
              <Typography variant="h6" color="primary">
                Notre Histoire
              </Typography>
              <Typography variant="body1">
                Fondé en 2013, Chogan Group est un acteur majeur dans l'industrie des cosmétiques et des soins personnels. Notre croissance rapide est le fruit de notre engagement envers l'innovation et la qualité, et de notre modèle de marketing de réseau qui permet à nos distributeurs de réussir.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <img
              src="/images/default-image.jpg"
              alt="Histoire de Chogan"
              className={`${styles.image} ${isVisible ? styles.fadeIn : ''}`}
            />
          </Grid>
        </Grid>

        {/* Section des raisons de rejoindre Chogan */}
        <Box my={5}>
          <Typography variant="h5" className={`${styles.sectionTitle} ${isVisible ? styles.fadeIn : ''}`}>
            Pourquoi Chogan ?
          </Typography>
          <Grid container spacing={4}>
            {['Qualité Excellente', 'Innovation Continue', 'Opportunités d\'Affaires'].map((title, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  className={`${styles.featureBox} ${hoverEffect ? styles.featureHover : ''}`}
                  onMouseEnter={() => setHoverEffect(true)}
                  onMouseLeave={() => setHoverEffect(false)}
                >
                  <Typography variant="h6">{title}</Typography>
                  <Typography variant="body2">
                    {title === 'Qualité Excellente'
                      ? 'Nos produits sont fabriqués avec des ingrédients de première qualité, garantissant des résultats visibles.'
                      : title === 'Innovation Continue'
                      ? 'Chogan investit constamment dans la recherche et le développement pour proposer des produits innovants.'
                      : 'En rejoignant Chogan, vous avez l\'opportunité de développer votre propre réseau de distributeurs.'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Section Vision */}
        <Box my={5} className={`${styles.visionBox} ${isVisible ? styles.fadeIn : ''}`}>
          <Typography variant="h5" className={styles.sectionTitle}>
            Notre Vision
          </Typography>
          <Typography variant="body1">
            Être la référence mondiale dans les soins personnels, en offrant des produits qui inspirent confiance et en permettant à nos distributeurs de changer leur vie grâce à un système de marketing éthique et performant.
          </Typography>
        </Box>

        {/* Section Rejoindre Chogan */}
        <Box my={5}>
          <Typography variant="h5" className={`${styles.sectionTitle} ${isVisible ? styles.fadeIn : ''}`}>
            Rejoignez-nous et Changez de Vie
          </Typography>
          <Typography variant="body1" className={`${styles.sectionContent} ${isVisible ? styles.fadeIn : ''}`}>
            En tant que membre du réseau Chogan, vous bénéficiez de multiples avantages : une formation continue, des outils puissants pour développer votre activité, et la possibilité de travailler à votre propre rythme. Transformez votre passion en une carrière rentable et épanouissante.
          </Typography>
          <Box textAlign="center" mt={4}>
            <Link href="/BecomeConsultant" passHref>
              <Button variant="contained" color="primary" size="large" className={styles.joinButton}>
                Rejoindre Chogan
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default About;
