import express from 'express';
import sgMail from '@sendgrid/mail';

const app = express();

// Définir la clé API de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  // Si la méthode est POST, nous traitons l'envoi de l'email
  if (req.method === 'POST') {
    const { name, email, phone, message } = req.body;

    // Vérifier que toutes les données nécessaires sont présentes
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Construire le contenu de l'email
    const emailContent = {
      to: 'ikram.bakmou@outlook.fr',  // L'email auquel vous voulez envoyer le formulaire
      from: email,                   // L'email de l'utilisateur
      subject: `Nouvelle candidature pour devenir consultant - ${name}`,
      text: `
        Vous avez reçu une nouvelle candidature pour devenir consultant.\n\n
        Nom : ${name}\n
        Email : ${email}\n
        Téléphone : ${phone}\n\n
        Message :\n
        ${message}
      `,
    };

    try {
      // Envoi de l'email via SendGrid
      await sendGridMail.send(emailContent);
      return res.status(200).json({ message: 'Votre message a été envoyé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.' });
    }
  } else {
    // Méthode non autorisée
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
