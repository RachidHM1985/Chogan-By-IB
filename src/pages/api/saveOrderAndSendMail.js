import { supabase } from '../../supabaseClient';  // Ensure your Supabase client is correctly configured
import sgMail from '@sendgrid/mail';  // Corrected import

// Set up SendGrid API key from the environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const router = useRouter();


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, name, total_amount, amount_promo, user_phone, user_address, deliveryFee, cart } = req.body;
  
    if (!cart || !total_amount) {
      return res.status(400).json({ message: 'Données manquantes' });
    }

    try {
      // Parse the cart if it's a string
      const parsedCart = Array.isArray(cart) ? cart : JSON.parse(cart);

      // Filter out 'deliveryFee' items from the cart
      const filteredCart = parsedCart.filter(item => item.nom_produit !== 'deliveryFee');
      const filteredCartText = JSON.stringify(filteredCart);

      // S'assurer que total_amount est un nombre
const totalAmountNumber = parseFloat(total_amount);
const formatted = totalAmountNumber;
console.log(totalAmountNumber)
      // Insert order into Supabase database
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            user_name: name,
            user_email: email,
            user_phone: user_phone,
            user_address: user_address,
            amount_promo: amount_promo,
            details: filteredCartText,  
            delivery_fee: deliveryFee,
            total_amount: totalAmountNumber,
            order_status: 'completed',  // Set initial order status
          },
        ]);

      if (error) {
        console.error('Error during order insertion into Supabase:', error);
        return res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la commande', error: error.message });
      }

      // Prepare email for the user
      const userMailOptions = {
        to: email,
        from: 'choganbyikram.contact@gmail.com',  // Ensure this email is verified with SendGrid
        subject: 'Confirmation de votre commande Chogan',
        text: `Bonjour ${name},\n\nMerci pour votre commande ! Voici les détails :\n\n${filteredCart.map(item => `${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}`).join('\n')}\nFrais de livraison: ${deliveryFee}\n${amount_promo > 0 ? `Réduction: ${amount_promo}€\n` : ''}\n\nTotal : ${totalAmountNumber}€.\n\nNous allons traiter votre commande et nous reviendrons vers vous pour vous indiquer les modalités de paiement et de livraison.\n\nCordialement,\n\nIkram B.`,
        html: `
          <h1>Confirmation de votre commande</h1>
          <p>Bonjour ${name},</p>
          <p>Merci pour votre commande ! Voici les détails :</p>
          <ul>
            ${filteredCart.map(item => `<li>${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}</li>`).join('')}
          </ul>
          <ul>
          Frais de livraison: ${deliveryFee}€
          </ul>
           <ul>
          ${amount_promo > 0 ? `Réduction: ${amount_promo}€` : ''}
          </ul>
          <p><strong>Total : ${formatted}€</strong></p>
          <p>Nous vous confirmons que nous avons enregistré votre commande et que nous allons la traiter.<br>Prochainement, nous allons vous contacter pour vous indiquer les modalités de paiement et de livraison.</p>
          <p>Cordialement,<br>Ikram B.</p>
        `,
      };

      // Prepare email for the admin
      const adminMailOptions = {
        to: 'choganbyikram.contact@gmail.com',
        from: 'hachem.rach@gmail.com',
        subject: `Nouvelle commande de ${name}`,
        text: `Nouvelle commande reçue :\n\nNom: ${name}\nEmail: ${email}\n\nDétails de la commande:\n${filteredCart.map(item => `${item.code} - ${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}`).join('\n')}\nFrais de livraison: ${deliveryFee}€\n\n${amount_promo > 0 ? `Réduction: ${amount_promo}€\n` : ''}\n\nTotal : ${formatted}€.\n\nMerci de traiter cette commande.`,
      };

      try {
        // Send email to the user and the admin
        await sgMail.send(userMailOptions);
        await sgMail.send(adminMailOptions);

        return res.status(200).json({ message: 'Commande enregistrée et mails envoyés avec succès' });
      } catch (emailError) {
        console.error('Error during email sending:', emailError);
        return res.status(500).json({ message: 'Erreur d\'envoi de l\'email', error: emailError.message });
      }

    } catch (err) {
      console.error('Error processing the request:', err);
      return res.status(500).json({ message: 'Erreur lors du traitement de la commande', error: err.message });
    }
  } else {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
}
