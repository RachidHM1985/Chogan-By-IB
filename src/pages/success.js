import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Typography, Button } from '@mui/material';
import Header from '../components/Header.js';
import Footer from '../components/Footer';
import '../styles/globals.css'

const Success = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { session_id, payment_intent, status } = router.query;

    if (status === 'succeeded') {
      setLoading(false); // Si le paiement est réussi, arrête le chargement.
    } else {
      router.push('/echec'); // Si l'état n'est pas 'succeeded', redirige vers la page d'échec.
    }
  }, [router.query]);

  return (
    <>
    <Header />
    <div>
      {loading ? (
        <Typography variant="h6" align="center">
          Vérification du paiement...
        </Typography>
      ) : (
        <div>
          <Typography variant="h4" align="center" color="green">
            Paiement réussi !
          </Typography>
          <Typography variant="h6" align="center">
            Merci pour votre commande, votre paiement a été effectué avec succès. Vous allez recevoir un mail de confirmation.
          </Typography>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button variant="contained" color="primary" onClick={() => router.push('/')}>
              Retour à la page d'accueil
            </Button>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
};

export default Success;
