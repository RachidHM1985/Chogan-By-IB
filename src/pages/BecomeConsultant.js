import { Container, Grid, Typography, Box, Button, Card, CardContent, TextField } from '@mui/material';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BecomeConsultant = () => {
  // Initialisation de l'état
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Gestion des changements des champs de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.name && formData.email && formData.phone && formData.message) {
      console.log('Form submitted:', formData);
      
      // Envoi des données du formulaire au backend (Serveur Node.js)
      fetch('http://localhost:5000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message); // Affiche un message de succès
          setFormData({
            name: '',
            email: '',
            phone: '',
            message: ''
          });
        } else if (data.error) {
          alert(data.error); // Affiche une erreur si un champ est manquant
        }
      })
      .catch((error) => {
        alert('Une erreur s\'est produite');
        console.error('Error:', error);
      });
    } else {
      alert('Veuillez remplir tous les champs');
    }
  };
  

  return (
    <>
      <Header />
      <Container
        maxWidth="md"
        sx={{
          marginTop: 5,
          height: '100vh', // Assure que le container prend toute la hauteur de la fenêtre
          overflowY: 'auto', // Permet le défilement vertical si nécessaire
        }}
      >
        <Box sx={{ backgroundColor: '#f5f5f5', padding: '30px', borderRadius: '8px', boxShadow: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Rejoignez le Réseau Chogan
          </Typography>
          <Typography variant="h6" align="center" paragraph>
            Découvrez une opportunité unique de devenir consultant indépendant et de transformer votre vie.
          </Typography>

          {/* Arguments pour rejoindre Chogan */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Liberté et Flexibilité</Typography>
                  <Typography variant="body1">
                    Gérez votre propre emploi du temps et travaillez à votre rythme. Vous êtes votre propre patron, avec la liberté de choisir vos heures et votre lieu de travail.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Support et Formation</Typography>
                  <Typography variant="body1">
                    Accédez à des formations de haute qualité et à un réseau de soutien pour vous aider à réussir. Chogan vous guide à chaque étape de votre parcours.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Revenu Illimité</Typography>
                  <Typography variant="body1">
                    Profitez des revenus récurrents grâce à notre système de marketing de réseau. Plus vous développez votre réseau, plus vos revenus augmentent.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Produits de Qualité</Typography>
                  <Typography variant="body1">
                    Représentez une marque de produits de soins personnels et cosmétiques de haute qualité, appréciée à l'international. Offrez à vos clients des produits premium.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Formulaire pour devenir consultant */}
          <Typography variant="h5" align="center" sx={{ marginTop: 5 }} gutterBottom>
            Postulez pour devenir consultant
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom complet"
                  variant="outlined"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Adresse e-mail"
                  variant="outlined"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Numéro de téléphone"
                  variant="outlined"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  variant="outlined"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Button variant="contained" color="primary" type="submit">
                  Rejoindre Chogan
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
    </>
  );
};

export default BecomeConsultant;
