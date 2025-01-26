// pages/api/send-email.js
import sendGridMail from '@sendgrid/mail';

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { order, comment } = req.body;
    

    const message = {
      to: order.user_email,  // Email du client
      from: 'ikram.bakmou@outlook.fr', // Votre email, qui doit être validé dans SendGrid
      subject: `Mise à jour du statut de votre commande ${order.id}`,
      text: `Bonjour ${order.user_name},\n\nVotre commande Chogan n°00${order.id} en date du ${new Date(order.created_at).toLocaleDateString('fr-FR')} est maintenant ${order.order_status}.\n\nCommentaire : ${comment}\n\nMerci pour votre confiance.\n\nCordialement,\nVotre équipe`,
    };

    try {
      await sendGridMail.send(message);
      return res.status(200).json({ message: 'Email envoyé avec succès' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
    }
  } else {
    // Méthode non autorisée
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
