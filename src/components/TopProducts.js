'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Grid, Typography, Button } from '@mui/material'
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
    <section className="p-4 max-w-7xl mx-auto">
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{
          fontWeight: '700',
          mb: 6,
          color: '#a67c52',
          textShadow: '1px 1px 4px rgba(0,0,0,0.15)',
          fontFamily: "'Playfair Display', serif",
        }}
      >
        Nos Best-Sellers
      </Typography>

      {products.length > 0 ? (
        <Box
          sx={{
            maxHeight: 'calc(100vh - 250px)',
            overflowY: 'auto',
            padding: '5px',
          }}
        >
          <Grid container spacing={4} justifyContent="center">
            {products.map((product) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={`${product.type}-${product.id}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(166,124,82,0.2)',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(166,124,82,0.4)',
                    cursor: 'pointer',
                  },
                  backgroundColor: '#fff',
                  padding: 2,
                  height: '100%',
                }}
              >
                <ProductCard product={product} />
                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    fontWeight: '700',
                    borderRadius: 2,
                    alignSelf: 'stretch',
                    backgroundColor: '#EFE7DB',
                    color: '#000',
                    '&:hover': {
                      backgroundColor: '#e6dcc7',
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClick(product)
                  }}
                >
                  Voir le produit
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Typography variant="body1" align="center" color="text.secondary">
          Aucun produit à afficher pour l’instant.
        </Typography>
      )}
    </section>
  )
}
