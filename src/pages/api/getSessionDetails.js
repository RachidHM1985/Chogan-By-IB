import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ message: 'session_id manquant' });
  }

  try {
    // Récupération des détails de la session Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer', 'line_items'],
    });

    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }

    // Récupérer les informations du panier via 'line_items' ou 'metadata' si nécessaire
    const cartItems = session.line_items ? session.line_items.data.map(item => ({
      nom_produit: item.description,
      prix: item.amount_total / 100, // Montant total en euros
      quantity: item.quantity,
    })) : [];

    // Créer un objet avec les informations de la session
    const sessionData = {
    
      amount_total: session.amount_total / 100,  // Montant total en euros
      shipping: session.shipping || {},
      metadata: session.metadata,
      cart: cartItems,  // Panier formaté
    };

    return res.status(200).json(sessionData);

  } catch (error) {
    console.error('Erreur lors de la récupération de la session Stripe:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la session', error: error.message });
  }
}
