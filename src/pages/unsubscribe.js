import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, CircularProgress } from '@mui/material';

const Unsubscribe = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
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
          } else {
            setMessage(data.message); // Message d'erreur
          }
        } catch (error) {
          setMessage('Une erreur s\'est produite. Veuillez réessayer plus tard.');
        } finally {
          setLoading(false);
        }
      }
    };

    unsubscribeUser();
  }, [email]);

  return (
    <Container>
      {loading ? (
        <CircularProgress />
      ) : (
        <Typography variant="h6" gutterBottom>
          {message}
        </Typography>
      )}
    </Container>
  );
};

export default Unsubscribe;
