// pages/api/getSessionDetails.js

import Stripe from 'stripe';

// Initialisation de Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: 'session_id manquant' });
    }

    try {
      // Récupérer la session Stripe à l'aide de l'ID de session
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items'], // Vous pouvez obtenir des détails supplémentaires sur les articles du panier
      });

      // Vous pouvez adapter ici les informations que vous souhaitez renvoyer
      const { customer_email, customer_name, amount_total, shipping, metadata, line_items } = session;

      // Formatage des informations de la commande pour l'email et la base de données
      const cart = line_items.data.map(item => ({
        nom_produit: item.description,
        size: item.metadata?.size || 'N/A',  // Si vous avez un champ de taille dans les métadonnées
        prix: item.amount_total / 100,  // Prix en dollars (le montant total de chaque article en cents)
        quantity: item.quantity,
      }));

      // Retourner les données nécessaires
      return res.status(200).json({
        customer_email,
        customer_name,
        amount_total,
        shipping,
        metadata,
        cart,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la session Stripe:', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération de la session Stripe', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
}
