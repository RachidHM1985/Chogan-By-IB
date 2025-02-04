import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ message: 'session_id manquant' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }

    // Formater et renvoyer les informations de la session
    const sessionData = {
      customer_email: session.customer_email,
      customer_name: session.customer_name,
      amount_total: session.amount_total,
      shipping: session.shipping,
      metadata: session.metadata,
      cart: session.metadata.cart,  // Supposons que le panier soit dans les métadonnées
    };

    return res.status(200).json(sessionData);

  } catch (error) {
    console.error('Erreur lors de la récupération de la session Stripe:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la session', error: error.message });
  }
}
