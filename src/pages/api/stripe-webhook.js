// pages/api/stripe-webhook.js

import { buffer } from 'micro';
import Stripe from 'stripe';
import mysql from 'mysql2/promise';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01',
});

// Configuration pour gérer les données en tant que buffer
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Clé secrète de votre webhook
  let event;

  try {
    // Récupérer le corps de la requête en tant que buffer
    const buf = await buffer(req);

    // Vérifier la signature de Stripe
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error('Erreur de signature du webhook Stripe:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Traitement de l'événement 'checkout.session.completed'
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Récupérer les informations de la commande depuis la session
    const { metadata, amount_total, shipping, line_items } = session;

    // Récupérer les informations sur la commande et l'utilisateur
    const user_name = metadata.name || 'Nom non fourni';
    const user_email = metadata.email || 'Email non fourni';
    const user_phone = metadata.phone || 'Téléphone non fourni';
    const user_address = metadata.address || 'Adresse non fournie';
    
    let total_amount = amount_total / 100;  // Convertir en euros

    const delivery_fee = shipping && shipping.address ? shipping.address.city : 0; // Ajustez selon votre logique

    // S'assurer que `line_items` existe et est bien formaté
    if (!line_items || !line_items.data || line_items.data.length === 0) {
      return res.status(400).send('Aucun article dans la commande');
    }

    // Construire les détails de la commande
    const order_details = line_items.data.map(item => {
      return {
        product_name: item.description || 'Produit inconnu',
        quantity: item.quantity,
        price: item.amount_total / 100, // Convertir en euros
      };
    });

    // Connexion à la base de données MySQL (modifiez les paramètres selon votre configuration)
    let connection;
    try {
      // Connexion à la base de données MySQL
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      // Insérer la commande dans la base de données
      const [result] = await connection.execute(
        'INSERT INTO orders (user_name, user_email, user_phone, user_address, total_amount, delivery_fee, order_status, detail_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          user_name,
          user_email,
          user_phone,
          user_address,
          total_amount,
          delivery_fee,
          'paid', // Statut de la commande
          JSON.stringify(order_details), // Détails de la commande au format JSON
        ]
      );
      console.log('Commande insérée avec succès:', result);

    } catch (error) {
      console.error('Erreur lors de l\'insertion de la commande dans la base de données:', error);
      return res.status(500).send('Erreur interne du serveur');
    } finally {
      if (connection) {
        // Assurez-vous de fermer la connexion à la base de données
        await connection.end();
      }
    }
  }

  // Répondre à Stripe pour confirmer que l'événement a été bien reçu
  res.status(200).send('Event received');
}
