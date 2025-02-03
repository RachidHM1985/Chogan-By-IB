// pages/api/webhook.js
import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabase } from '../../supabaseClient';

// Initialise Stripe avec votre clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

// Définir le type de contenu comme raw pour pouvoir récupérer le body de l'événement Stripe
export const config = {
  api: {
    bodyParser: false, // Ne pas parser le corps
  },
};

const handleWebhook = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // Récupérer le corps brut de la requête
    const reqBuffer = await buffer(req);
    const sig = req.headers['stripe-signature'];

    // Vérifiez la signature de Stripe pour valider l'intégrité de la requête
    const event = stripe.webhooks.constructEvent(
      reqBuffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Récupérez les données de la commande
      const { customer_email, customer_name, amount_total, shipping, metadata } = session;

      // Enregistrer la commande dans Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            user_name: customer_name,
            user_email: customer_email,
            user_phone: shipping.phone,
            user_address: shipping.address.line1,
            total_amount: amount_total / 100, // Stripe retourne le montant en cents
            delivery_fee: metadata.deliveryFee || 0, // Optionnel, si vous avez cette information dans les métadonnées
            order_status: 'completed',
          },
        ]);

      if (error) {
        console.error('Erreur d\'insertion de la commande dans Supabase:', error);
        return res.status(500).send('Erreur d\'insertion');
      }

      console.log('Commande enregistrée avec succès dans Supabase:', data);
    }

    // Répondre à Stripe pour confirmer que l'événement a été traité
    res.status(200).send('Event received');
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    res.status(400).send('Webhook Error');
  }
};

export default handleWebhook;
