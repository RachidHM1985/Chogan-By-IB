import Stripe from 'stripe';

// Initialize Stripe with the secret key and API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01', // Make sure you are using the correct version
});

export default async function handler(req, res) {
  const { session_id } = req.query;

  // Check if session_id is provided
  if (!session_id) {
    return res.status(400).json({ message: 'session_id manquant' });
  }

  try {
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer', 'line_items'], // Expanding relevant fields like customer and line items
    });

    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }

    // Format the cart items from the session's line_items
    const cartItems = session.line_items?.data.map(item => ({
      nom_produit: item.description,  // Product name/description
      prix: item.amount_total / 100,  // Total amount in euros (converted from cents)
      quantity: item.quantity,       // Quantity of the product
      size: item.description.split('Taille: ')[1] || 'N/A', // Extract the size if it's part of the description
      codeParfum: item.description.split('Code Parfum: ')[1] || 'N/A', // Extract the perfume code if available
    })) || [];

    // Creating the session data object
    const sessionData = {
      amount_total: session.amount_total / 100,  // Total amount in euros
      shipping: session.shipping || {},          // Shipping information (if available)
      metadata: session.metadata || {},          // Metadata for extra information (like promo codes, etc.)
      cart: cartItems,                           // Formatted cart items
      customer_email: session.customer_email,    // Customer email (for further communication)
    };

    // Return the session data in the response
    return res.status(200).json(sessionData);

  } catch (error) {
    console.error('Erreur lors de la récupération de la session Stripe:', error);

    // Handle various types of errors gracefully
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ message: 'Données invalides envoyées à Stripe', error: error.message });
    } else if (error.type === 'StripeAPIError') {
      return res.status(500).json({ message: 'Erreur de l\'API Stripe', error: error.message });
    } else {
      return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la session', error: error.message });
    }
  }
}