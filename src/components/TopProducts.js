'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Grid } from '@mui/material'
import { getTopProducts } from '../lib/utils/getTopProducts'
import ProductCard from './ProductCard'

export default function TopProducts() {
  const [products, setProducts] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const top = await getTopProducts()
        setProducts(top)
      } catch (err) {
        console.error('Erreur lors de la récupération des produits :', err)
      }
    }
    fetchProducts()
  }, [])

  const handleClick = (product) => {
    switch (product.type) {
      case 'parfums':
        router.push(`/perfumes/${product.genre || 'All'}/${product.code_produit}`)
        break
      case 'aurodhea':
        router.push(`/beauty/all/${product.code_produit}`)
        break
      case 'brilhome':
        router.push(`/brilhome/all/${product.code_produit}`)
        break
      case 'parfumerie_interieur':
        router.push(`/parfumerieInterieur/all/${product.code_produit}`)
        break
      case 'peptilux':
        router.push(`/peptilux/all/${product.code_produit}`)
        break
    }
  }

  return (
    <section className="p-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">Nos Best-Sellers</h2>

      {products.length > 0 ? (
        <Box sx={{
          maxHeight: 'calc(100vh - 250px)',
          overflowY: 'auto',
          padding: '5px',
        }}>
          <Grid container spacing={3} justifyContent="center">
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`${product.type}-${product.id}`}>
                <ProductCard 
                  product={product} 
                  onClick={() => handleClick(product)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <p className="text-center text-gray-500">Aucun produit à afficher pour l’instant.</p>
      )}
    </section>
  )
}
