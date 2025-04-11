import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Tentative de connexion à Supabase
    const { user, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Erreur d\'authentification : ' + authError.message);
      return;
    }

    // Récupérer la session pour obtenir les informations de l'utilisateur
    const { data: { session } } = await supabase.auth.getSession();

    // Si aucune session n'est disponible, afficher une erreur
    if (!session || !session.user) {
      setError('Utilisateur non trouvé');
      return;
    }

    // Vérification du rôle de l'utilisateur dans la table `profiles`
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      setError('Erreur lors de la récupération du rôle de l\'utilisateur');
      return;
    }

    if (profile.role !== 'admin') {
      setError('Accès refusé. Vous n\'avez pas le rôle d\'administrateur.');
      return;
    }

    // Si tout est bon, rediriger vers la page des commandes
    router.push('/admin/orders');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
        <Typography variant="h5">Connexion Administrateur</Typography>

        <form onSubmit={handleLogin} style={{ width: '100%', marginTop: '20px' }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            color="primary"
          >
            Se connecter
          </Button>

          {error && <Typography color="error" variant="body2">{error}</Typography>}
        </form>
      </Box>
    </Container>
  );
};

export default AdminLogin;