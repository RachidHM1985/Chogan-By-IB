import { useState } from 'react';
import { supabase } from '../../supabaseClient'; // Assurez-vous d'importer votre client Supabase
import { useRouter } from 'next/router';
import { Container, Grid, TextField, Button, Typography, Box, Paper } from '@mui/material';
import { Alert } from 'react-bootstrap'; // Utiliser Bootstrap pour alertes

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Connexion avec Supabase
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Si la connexion réussie, rediriger vers la page d'administration
      router.push('/admin/orders'); // Rediriger vers la page des commandes
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ padding: '2rem' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" align="center" color="primary">
            Connexion Admin
          </Typography>

          {/* Affichage d'erreurs avec Bootstrap */}
          {error && (
            <Alert variant="danger" style={{ marginTop: '1rem' }}>
              {error}
            </Alert>
          )}

          {/* Formulaire de connexion */}
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Mot de passe"
                  variant="outlined"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Se connecter
            </Button>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLogin;
