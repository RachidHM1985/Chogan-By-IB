import express from 'express';
import sgMail from '@sendgrid/mail';
import cors from 'cors';  // Importer le module cors
import bodyParser from 'body-parser';  // Importer body-parser

const app = express();

// Définir la clé API de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Utiliser CORS
app.use(cors());

// Utiliser body-parser pour analyser les données JSON dans les requêtes
app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
  const { email, name, prenom, cart, total } = req.body;

  // Vérifier les données
  if (!email || !name || !prenom || !cart || !total) {
    return res.status(400).json({ message: 'Données manquantes' });
  }

  // Email à l'utilisateur
  const userMailOptions = {
    to: email,
    from: 'ikram.bakmou@outlook.fr', // Utilisez un email validé dans SendGrid
    subject: 'Confirmation de votre commande Chogan',
    text: `Bonjour ${prenom} ${name},\n\nMerci pour votre commande ! Voici les détails :\n\n${cart.map(item => `${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}`).join('\n')}\n\nTotal : ${total}€.\n\nNous allons traiter votre commande et nous reviendrons vers vous pour vous indiquer les modalités de paiement et de livraison.\n\nCordialement,\n\nIkram B.`,
    html: `
      <h1>Confirmation de votre commande</h1>
      <p>Bonjour ${prenom} ${name},</p>
      <p>Merci pour votre commande ! Voici les détails :</p>
      <ul>
        ${cart.map(item => `<li>${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}</li>`).join('')}
      </ul>
      <p><strong>Total : ${total}€</strong></p>
      <p>Nous vous confirmons que nous avons enregistré votre commande et que nous allons la traiter.<br>Prochainement, nous allons vous contacter pour vous indiquer les modalités de paiement et de livraison.</p>
      <p>Cordialement,<br>Ikram B.</p>
    `,
  };

  // Email à l'administrateur
  const adminMailOptions = {
    to: 'ikram.bakmou@outlook.fr',
    from: 'hachem.rach@gmail.com',
    subject: `Nouvelle commande de ${prenom} ${name}`,
    text: `Nouvelle commande reçue :\n\nNom: ${prenom} ${name}\nTéléphone: ${req.body.phone}\nEmail: ${email}\n\nDétails de la commande:\n${cart.map(item => `${item.code} - ${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}`).join('\n')}\n\nTotal : ${total}€.\n\nMerci de traiter cette commande.`,
  };

  try {
    // Envoi des emails
    await sgMail.send(userMailOptions);
    await sgMail.send(adminMailOptions);
    return res.status(200).json({ message: 'Emails envoyés avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email', error);
    return res.status(500).json({ message: 'Erreur d\'envoi de l\'email', error: error.message });
  }
});

// Démarrer le serveur Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
