import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Typography, Button } from '@mui/material';
import Header from '../components/Header.js';
import Footer from '../components/Footer';

const Success = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { session_id, payment_intent, status } = router.query;

    if (!status) return; // Wait until payment_intent is available

    console.log("status : ", status);
    console.log("payment_intent : ", payment_intent);
    console.log("session_id : ", session_id);

    if (payment_intent.status === 'succeeded') {
      setLoading(false); // If payment is successful, stop loading
    } else {
      router.push('/echec'); // Redirect to failure page if payment is not succeeded
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
