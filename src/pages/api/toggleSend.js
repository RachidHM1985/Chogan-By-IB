import fs from 'fs';
import path from 'path';

const filePath = path.join('/tmp', 'sendControl.json');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Lire l'état actuel
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { enabled } = JSON.parse(content);
      return res.status(200).json({ enabled });
    } catch (err) {
      // Si le fichier n'existe pas encore
      return res.status(200).json({ enabled: false });
    }
  }

  if (req.method === 'POST') {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Le paramètre "enabled" doit être un booléen' });
    }

    try {
      fs.writeFileSync(filePath, JSON.stringify({ enabled }, null, 2));
      return res.status(200).json({ 
        message: enabled 
          ? 'Envoi de newsletter activé' 
          : 'Envoi de newsletter désactivé',
        enabled 
      });
    } catch (err) {
      console.error('Erreur d\'écriture dans /tmp/sendControl.json:', err);
      return res.status(500).json({ message: 'Erreur interne', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}
