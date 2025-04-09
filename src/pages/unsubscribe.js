import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Créer un thème personnalisé pour la police Montserrat
const theme = createTheme({
  typography: {
    fontFamily: '"Montserrat", sans-serif', // Appliquer Montserrat sans empattement
  },
});

const Unsubscribe = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info'); // Par défaut, information
  const router = useRouter();
  const { email } = router.query;

  useEffect(() => {
    const unsubscribeUser = async () => {
      if (email) {
        try {
          const response = await fetch(`/api/unsubscribe?email=${email}`);
          const data = await response.json();

          if (response.ok) {
            setMessage(data.message); // Message de succès
            setSeverity('success'); // Type d'alerte pour succès
          } else {
            setMessage(data.message); // Message d'erreur
            setSeverity('error'); // Type d'alerte pour erreur
          }
        } catch (error) {
          setMessage('Une erreur s\'est produite. Veuillez réessayer plus tard.');
          setSeverity('error'); // Type d'alerte pour erreur
        } finally {
          setLoading(false);
        }
      }
    };

    unsubscribeUser();
  }, [email]);

  return (
    <ThemeProvider theme={theme}>
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: 2,
        }}
      >
        {loading ? (
          <CircularProgress sx={{ marginTop: 3 }} />
        ) : (
          <Alert
            severity={severity}
            sx={{
              marginTop: 3,
              width: '100%',
              maxWidth: 600,
              textAlign: 'center',
              fontFamily: '"Montserrat", sans-serif',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {message}
            </Typography>
          </Alert>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default Unsubscribe;
