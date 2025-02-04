import { supabase } from '../../supabaseClient';  // Assurez-vous que votre instance Supabase est correctement configurée
import sgMail from '@sendgrid/mail';  // Corrected import

// Charger la clé API de SendGrid depuis l'environnement
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, name, total_amount, user_phone, user_address, cart } = req.body;

    // Vérifier les données
    if (!cart || !total_amount) {
      return res.status(400).json({ message: 'Données manquantes' });
    }

   // Enregistrer la commande dans Supabase
    const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        user_name: name,
        user_email: email,
        user_phone: user_phone,
        user_address: user_address,
        details: typeof cart === 'string' ? JSON.parse(cart) : cart,  // Modifé ici
        delivery_Fee: deliveryFee,
        total_amount: total_amount,
        order_status: 'completed',
      },
    ]);

    if (error) {
      console.error('Erreur lors de l\'enregistrement de la commande:', error);
      return res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la commande' });
    }

    // Envoi d'un e-mail à l'utilisateur via SendGrid
    const userMailOptions = {
      to: customer_email,
      from: 'choganbyikram.contact@gmail.com',  // Assurez-vous que l'adresse email est validée
      subject: 'Confirmation de votre commande Chogan',
      text: `Bonjour ${customer_name},\n\nMerci pour votre commande ! Voici les détails :\n\n${cart.map(item => `${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}`).join('\n')}\n\nTotal : ${total_amount}€.\n\nNous allons traiter votre commande et nous reviendrons vers vous pour vous indiquer les modalités de paiement et de livraison.\n\nCordialement,\n\nIkram B.`,
      html: `
        <h1>Confirmation de votre commande</h1>
        <p>Bonjour ${customer_name},</p>
        <p>Merci pour votre commande ! Voici les détails :</p>
        <ul>
          ${cart.map(item => `<li>${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}</li>`).join('')}
        </ul>
        <p><strong>Total : ${total_amount}€</strong></p>
        <p>Nous vous confirmons que nous avons enregistré votre commande et que nous allons la traiter.<br>Prochainement, nous allons vous contacter pour vous indiquer les modalités de paiement et de livraison.</p>
        <p>Cordialement,<br>Ikram B.</p>
      `,
    };

    // Envoi d'un e-mail à l'administrateur
    const adminMailOptions = {
      to: 'choganbyikram.contact@gmail.com',
      from: 'hachem.rach@gmail.com',
      subject: `Nouvelle commande de ${customer_name}`,
      text: `Nouvelle commande reçue :\n\nNom: ${customer_name}\nEmail: ${customer_email}\n\nDétails de la commande:\n${cart.map(item => `${item.code} - ${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}`).join('\n')}\n\nTotal : ${total_amount}€.\n\nMerci de traiter cette commande.`,
    };

    try {
      // Envoi des e-mails
      await sgMail.send(userMailOptions);
      await sgMail.send(adminMailOptions);
      return res.status(200).json({ message: 'Commande enregistrée et mails envoyés avec succès' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email', error);
      return res.status(500).json({ message: 'Erreur d\'envoi de l\'email', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
}
