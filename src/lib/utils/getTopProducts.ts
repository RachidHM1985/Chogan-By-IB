import { supabase } from '../supabaseClient'

export async function getTopProducts() {
  const tables = ['parfums', 'aurodhea', 'brilhome', 'parfumerie_interieur', 'peptilux']
  const topProducts: any[] = []

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('note', { ascending: false })
      .limit(3)

    if (!error && data) {
      data.forEach(product => {
        topProducts.push({ ...product, type: table }) // "type" au lieu de "table" pour cohérence avec ProductCard
      })
    }
  }

  // Tri global et retour des 3 meilleurs
  return topProducts.sort((a, b) => b.note - a.note).slice(0, 3)
}
