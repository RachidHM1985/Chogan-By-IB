import { supabase } from '../../supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { code, totalAmount } = req.body;

    try {
      // Chercher le code promo dans la base de données
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .lte('start_date', new Date()) // La date de début doit être passée
        .gte('end_date', new Date()) // La date de fin doit être dans le futur
        .single(); // Nous nous attendons à un seul résultat

      // Vérifier si un code promo a été trouvé et s'il est valide
      if (error || !data) {
        return res.status(400).json({ valid: false, message: 'Code promo invalide ou expiré.' });
      }

      // Vérifier le montant minimum d'achat (si applicable)
      if (data.min_purchase_amount && totalAmount < data.min_purchase_amount) {
        return res.status(400).json({ valid: false, message: `Le montant minimum d'achat est ${data.min_purchase_amount} €.` });
      }

      // Appliquer la réduction
      let discount = 0;
      if (data.discount_type === 'percent') {
        discount = (totalAmount * data.discount_value) / 100;
      } else if (data.discount_type === 'fixed') {
        discount = data.discount_value;
      }

      // Retourner la réduction
      return res.status(200).json({ valid: true, discount });
    } catch (error) {
      console.error('Error validating promo code:', error);
      return res.status(500).json({ valid: false, message: 'Erreur lors de la vérification du code promo.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
