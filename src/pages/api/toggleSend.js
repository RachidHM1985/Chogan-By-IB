import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Le champ "enabled" est requis et doit être un booléen.' });
    }

    const configDir = path.join(process.cwd(), 'config');
    const controlFile = path.join(configDir, 'sendControl.json');

    // Crée le dossier config s’il n’existe pas
    await fs.mkdir(configDir, { recursive: true });

    // Écrit le fichier avec le flag
    const newData = JSON.stringify({ enabled }, null, 2);
    await fs.writeFile(controlFile, newData, 'utf8');

    return res.status(200).json({ message: `Envoi ${enabled ? 'activé' : 'désactivé'} avec succès.` });
  } catch (err) {
    console.error('Erreur dans toggleSend:', err);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour du statut d’envoi.' });
  }
}
