import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Typography, Button, CircularProgress } from '@mui/material';
import Header from '../components/Header.js';
import Footer from '../components/Footer';

const Success = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {

    if (!router.isReady) {
      return; // Ne pas exécuter le code tant que le router n'est pas prêt
    }
    const { session_id, status } = router.query;
    // Ensure session_id and status are available
    if (!session_id) {
      setError('Détails de session invalides.');
      setLoading(false);
      return;
    }

    const fetchSessionDetails = async () => {
      try {
        // Fetch session details from the API
        const response = await fetch(`/api/getSessionDetails?session_id=${session_id}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des détails de la session.');
        }

        const data = await response.json();
        console.log("Données de la session Stripe:", data);  // Log the response to see its structure

        if (status === 'succeeded') {
          // Ensure 'cart' exists and is not empty
          const { totalPriceWithDiscount,amountPromo, deliveryFee, cart, customerEmail, customerName, address, phone } = data;

          if (!cart || cart.length === 0) {
            setError('Informations de commande manquantes.');
            setLoading(false);
            return;
          }

          const orderData = {
            email: customerEmail,
            name: customerName,
            address: address,
            phone: phone,
            deliveryFee: deliveryFee,
            amountPromo:amountPromo,
            total_amount: totalPriceWithDiscount,  // Already in the correct format
            cart,  // The array of cart items with product details (including code, size, etc.)
          };

          // Send the order details to save and send email confirmation
          const saveResponse = await fetch('/api/saveOrderAndSendMail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
          });

          const result = await saveResponse.json();
          if (saveResponse.ok) {
            setLoading(false);
          } else {
            setError(result.message || 'Une erreur est survenue lors du traitement de votre commande.');
          }
        } else {
          setError('Le paiement a échoué. Veuillez réessayer.');
          router.push('/echec?status=failed'); // Redirect to the failure page
        }
      } catch (err) {
        console.error('Error while fetching session details:', err);
        setError('Erreur lors de la récupération des détails de la session de paiement.');
      }
    };

    fetchSessionDetails();
  }, [router.query]);

  return (
    <>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '20px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress />
              <Typography variant="h6" align="center" style={{ marginTop: '20px' }}>
                Vérification du paiement...
              </Typography>
            </div>
          ) : (
            <div>
              {error ? (
                <Typography variant="h6" align="center" color="error">{error}</Typography>
              ) : (
                <div>
                  <Typography variant="h4" align="center" color="green">Paiement réussi !</Typography>
                  <Typography variant="h6" align="center">Merci pour votre commande, votre paiement a été effectué avec succès. Vous allez recevoir un mail de confirmation.</Typography>
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button variant="contained" color="primary" onClick={() => router.push('/')}>
                  Retour à la page d'accueil
                </Button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Success;
