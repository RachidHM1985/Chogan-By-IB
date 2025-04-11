import Stripe from 'stripe';
import { supabase } from '../../lib/supabaseClient';

// Initialize Stripe with the secret key and API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01', // Ensure you are using the correct version
});

const handleError = (res, error) => {
  console.error(error);
  if (error.type === 'StripeInvalidRequestError') {
    return res.status(400).json({ message: 'Données invalides envoyées à Stripe', error: error.message });
  } else if (error.type === 'StripeAPIError') {
    return res.status(500).json({ message: 'Erreur de l\'API Stripe', error: error.message });
  } else {
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la session', error: error.message });
  }
};

export default async function handler(req, res) {
  const { session_id } = req.query;

  // Check if session_id is provided
  if (!session_id) {
    return res.status(400).json({ message: 'session_id manquant' });
  }

  try {
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'], // Expanding relevant fields like line items
    });
    const metadata = session.metadata;

    console.log('metadata :', metadata)
    console.log(session.line_items.data)
    // Format the cart items from the session's line_items
    const cartItems = session.line_items?.data.map(item => ({
      nom_produit:item.description,  
      prix: item.amount_total / 100,  // Total amount in euros (converted from cents)
      quantity: item.quantity,       // Quantity of the product
      code:'',                       // Placeholder for the product code
      size:'',                       // Placeholder for the product size
    })) || [];

    const products = JSON.parse(metadata.products);  // Convertit la chaîne JSON en tableau
    if (Array.isArray(products) && Array.isArray(cartItems)) {
      // Parcourez chaque produit
      for (const product of products) {
        // Pour chaque produit, vérifiez s'il correspond à un produit dans le panier
        for (const cartItem of cartItems) {
          console.log(cartItem);
          if (cartItem.nom_produit === product.name) {
            cartItem.code = product.code;
            cartItem.size = product.size;
            try {
              // Effectuer une requête à Supabase pour récupérer le prix par code
              const { data, error } = await supabase
                .from('parfums')
                .select('*')
                .eq('code_produit', product.code)
                .single();  // On s'attend à un seul résultat pour le produit
            
              if (error) {
                console.error('Erreur lors de la récupération du produit:', error.message);
                continue;  // Passer au produit suivant
              }
              
              // Convertir le prix de cartItem en float
              const prix = parseFloat(cartItem.prix);
            
              if (data) {
                // Appliquer les prix en fonction de la taille du produit dans cartItem
                switch (prix) {
                  case parseFloat(data.prix_30ml):
                    cartItem.size = "30ml";  // Utiliser prix_30ml, s'il est disponible
                    break;
                  case parseFloat(data.prix_50ml):
                    cartItem.size = "50ml";  // Utiliser prix_50ml, s'il est disponible
                    break;
                  case parseFloat(data.prix_70ml):
                    cartItem.size = "70ml";  // Utiliser prix_70ml, s'il est disponible
                    break;
                  default:
                    console.log(`Taille ${cartItem.size} non définie dans les données produits`);
                    break;
                }
              } else {
                console.log('Produit non trouvé pour le code:', product.code);
              }
            } catch (err) {
              console.error('Erreur lors de l\'exécution de la requête Supabase:', err.message);
            }
          }
        }
      }
    } else {
      // Si les produits ou le panier ne sont pas sous forme de tableau
      console.error('Les produits ou le panier ne sont pas sous forme de tableau.');
    }
    
    const filteredCartItems = cartItems.filter(item => item.nom_produit !== 'Frais de livraison');
    console.log("filteredCartItems:", filteredCartItems)
    // Format session data
    const sessionData = {
      cart: filteredCartItems,
      amountPromo: session.metadata.amount_discount,
      totalPriceWithDiscount: session.metadata.totalPriceWithDiscount || 0, // Total price with discount
      deliveryFee: session.metadata.deliveryFee || 0, // Delivery fee
      customerEmail: session.customer_details.email, // Customer email
      customerName: session.customer_details.name , // Customer name
      address: session.metadata.address , // Customer address
      phone: session.metadata.phone, // Customer phone number
    };
console.log("product :", session.metadata)

    console.log('sessionData:', sessionData);
    
    // Return the session data in the response
    return res.status(200).json(sessionData);

  } catch (error) {
    return handleError(res, error);  // Handle error using the helper function
  }
}
 