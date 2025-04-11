import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { promoCode	 } = req.body; // Recevoir seulement le promoCode	 promo

    // Validation de la structure du promoCode	 promo
    if (!promoCode	 || typeof promoCode	 !== 'string' || promoCode	.trim() === '') {
      return res.status(400).json({ error: 'promoCode	 promo manquant ou invalide' });
    }
    console.error('Erreur Supabase:{}', promoCode	); // Log l'erreur pour plus de détails
    // Vérifier si le promoCode	 promo existe et est actif dans la base de données
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode	)
      .eq('active', true)
      .single();

    if (error || !data) {
      console.error('Erreur Supabase:{}', data); // Log l'erreur pour plus de détails
      return res.status(400).json({ error: 'promoCode	 promo invalide ou inactif' });
    }

    // Si le promoCode	 promo est valide et actif, renvoyer une réponse de succès
    return res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
