import { Container, Grid, Typography, Box, Button, Divider, Paper } from '@mui/material';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './about.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoverEffect, setHoverEffect] = useState(false);

  const handleScroll = () => {
    const position = window.pageYOffset;
    if (position > 150) {
      setIsVisible(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <Header />
    <Container maxWidth="lg" className={styles.container}>
      <Box mb={4} className={styles.heroSection}>
        <Typography variant="h3" align="center" className={`${styles.sectionTitle} ${isVisible ? styles.fadeIn : ''}`}>
          À propos de Chogan
        </Typography>
        <Typography variant="body1" align="center" className={`${styles.introText} ${isVisible ? styles.fadeIn : ''}`}>
          Rejoignez une entreprise dynamique, innovante, et en pleine expansion. Découvrez nos produits de qualité et les opportunités exceptionnelles que nous offrons à nos distributeurs !
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper className={`${styles.infoCard} ${isVisible ? styles.fadeIn : ''}`} elevation={3}>
            <Typography variant="h6" color="primary">Notre Histoire</Typography>
            <Typography variant="body1">
              Fondé en 2013, Chogan Group est un acteur majeur dans l'industrie des cosmétiques et des soins personnels. Notre croissance rapide est le fruit de notre engagement envers l'innovation et la qualité, et de notre modèle de marketing de réseau qui permet à nos distributeurs de réussir.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <img src="/images/default-image.jpg" alt="Histoire de Chogan" className={`${styles.image} ${isVisible ? styles.fadeIn : ''}`} />
        </Grid>
      </Grid>

      <Box my={5}>
        <Typography variant="h5" className={`${styles.sectionTitle} ${isVisible ? styles.fadeIn : ''}`}>
          Pourquoi Chogan ?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box className={`${styles.featureBox} ${hoverEffect ? styles.featureHover : ''}`} onMouseEnter={() => setHoverEffect(true)} onMouseLeave={() => setHoverEffect(false)}>
              <Typography variant="h6">Qualité Excellente</Typography>
              <Typography variant="body2">
                Nos produits sont fabriqués avec des ingrédients de première qualité, garantissant des résultats visibles. Nous offrons des solutions de soins qui respectent votre peau et votre bien-être.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className={`${styles.featureBox} ${hoverEffect ? styles.featureHover : ''}`} onMouseEnter={() => setHoverEffect(true)} onMouseLeave={() => setHoverEffect(false)}>
              <Typography variant="h6">Innovation Continue</Typography>
              <Typography variant="body2">
                Chogan investit constamment dans la recherche et le développement pour proposer des produits innovants et des formules exclusives. Nos produits sont à la pointe de la technologie cosmétique.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className={`${styles.featureBox} ${hoverEffect ? styles.featureHover : ''}`} onMouseEnter={() => setHoverEffect(true)} onMouseLeave={() => setHoverEffect(false)}>
              <Typography variant="h6">Opportunités d'Affaires</Typography>
              <Typography variant="body2">
                En rejoignant Chogan, vous avez l'opportunité de développer votre propre réseau de distributeurs, de gagner des revenus et d'atteindre le succès professionnel tout en aidant les autres à réussir.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box my={5} className={`${styles.visionBox} ${isVisible ? styles.fadeIn : ''}`}>
        <Typography variant="h5" className={styles.sectionTitle}>
          Notre Vision
        </Typography>
        <Typography variant="body1">
          Être la référence mondiale dans les soins personnels, en offrant des produits qui inspirent confiance et en permettant à nos distributeurs de changer leur vie grâce à un système de marketing éthique et performant.
        </Typography>
      </Box>

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
