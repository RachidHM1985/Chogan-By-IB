import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabase } from '../../../supabaseClient';

// Initialisation de Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

// Configuration pour désactiver le body parser de Next.js afin de recevoir des données brutes
export const config = {
  api: {
    bodyParser: false, // Ne pas parser le corps de la requête
  },
};

const handleWebhook = async (req, res) => {
  if (req.method !== 'POST') {
    console.error(`Méthode non autorisée: ${req.method}`);
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // Récupérer le corps brut de la requête
    const reqBuffer = await buffer(req);
    const sig = req.headers['stripe-signature'];

    // Vérifier la signature Stripe pour valider l'intégrité de la requête
    const event = stripe.webhooks.constructEvent(
      reqBuffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Gérer l'événement checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Récupérer les données pertinentes de la session
      const { customer_email, customer_name, amount_total, shipping, metadata } = session;

      const orderData = {
        user_name: customer_name,
        user_email: customer_email,
        user_phone: shipping.phone,
        user_address: shipping.address.line1,
        total_amount: amount_total / 100, // Montant en cents
        delivery_fee: metadata.deliveryFee || 0, // Si les métadonnées contiennent une livraison
        order_status: 'completed',
      };

      // Enregistrer la commande dans Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            user_name: customer_name,
            user_email: customer_email,
            user_phone: shipping.phone,
            user_address: shipping.address.line1,
            total_amount: amount_total / 100, // Montant en cents
            delivery_fee: metadata.deliveryFee || 0, // Si les métadonnées contiennent une livraison
            order_status: 'completed',
          },
        ]);

      if (error) {
        console.error('Erreur d\'insertion de la commande dans Supabase:', error);
        return res.status(500).send('Erreur d\'insertion');
      }

      console.log('Commande enregistrée avec succès dans Supabase:', data);

      // Faire appel à l'API de notification (e.g., envoi de mail)
      try {
        const response = await fetch('/api/sendMail', {
          method: 'POST',
          body: JSON.stringify(orderData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          console.log('Confirmation de commande envoyée avec succès');
        } else {
          console.error('Erreur lors de l\'envoi de la confirmation');
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi de la commande", error);
        return res.status(500).send("Erreur lors de l'envoi de l'email de confirmation");
      }
    }

    // Répondre à Stripe pour confirmer que l'événement a été traité
    return res.status(200).send('Event received');
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return res.status(400).send('Webhook Error');
  }
};

export default handleWebhook;
