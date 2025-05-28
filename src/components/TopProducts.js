'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Grid, Typography, Button } from '@mui/material'
import { getTopProducts } from '../lib/utils/getTopProducts'
import ProductCard from './ProductCard'

export default function TopProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const top = await getTopProducts()
        setProducts(top)
      } catch (err) {
        console.error('Erreur lors de la récupération des produits :', err)
      } finally {
        setIsLoading(false)
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
    <section className="px-3 py-6 max-w-6xl mx-auto sm:px-4 md:px-6">
      {/* Titre avec animations et style amélioré */}
      <Box
        sx={{
          textAlign: 'center',
          mb: { xs: 1, md: 1.5 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '120px', sm: '150px', md: '180px' },
            height: { xs: '120px', sm: '150px', md: '180px' },
            background: 'radial-gradient(circle, rgba(166,124,82,0.1) 0%, rgba(166,124,82,0.05) 50%, transparent 70%)',
            borderRadius: '50%',
            animation: 'pulse 3s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.3 },
              '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 0.6 }
            }
          }
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: '800',
            color: 'transparent',
            background: 'linear-gradient(135deg, #a67c52 0%, #d4a574 50%, #a67c52 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '1px',
            textShadow: '0 4px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 1,
            marginTop: '30px',
            animation: 'fadeInDown 1s ease-out',
            '@keyframes fadeInDown': {
              '0%': { opacity: 0, transform: 'translateY(-30px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          ✨ NOS BEST-SELLERS ✨
        </Typography>
        
        {/* Ligne décorative animée */}
        <Box
          sx={{
            width: { xs: '80px', sm: '100px', md: '120px' },
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #a67c52, transparent)',
            margin: '8px auto 0',
            borderRadius: '2px',
            animation: 'expandLine 1.5s ease-out 0.5s both',
            '@keyframes expandLine': {
              '0%': { width: '0px', opacity: 0 },
              '100%': { width: { xs: '80px', sm: '100px', md: '120px' }, opacity: 1 }
            }
          }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Chargement des produits...
          </Typography>
        </Box>
      ) : products.length > 0 ? (
        <Box
          sx={{
            maxHeight: { xs: '70vh', md: 'calc(100vh - 250px)' },
            overflowY: 'auto',
            padding: '5px',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#a67c52',
              borderRadius: '3px',
              '&:hover': {
                background: '#8b6544',
              },
            },
          }}
        >
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
            {products.map((product, index) => (
              <Grid
                item
                xs={6}
                sm={6}
                md={4}
                lg={3}
                key={`${product.type}-${product.id}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
                  '@keyframes slideUp': {
                    '0%': { opacity: 0, transform: 'translateY(30px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    backgroundColor: '#fff',
                    borderRadius: { xs: 2, md: 3 },
                    padding: { xs: 1.5, sm: 2 },
                    boxShadow: '0 4px 12px rgba(166,124,82,0.15)',
                    border: '1px solid rgba(166,124,82,0.1)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(166,124,82,0.1), transparent)',
                      transition: 'left 0.6s ease',
                    },
                    '&:hover': {
                      transform: { xs: 'translateY(-4px)', md: 'translateY(-8px)' },
                      boxShadow: '0 12px 24px rgba(166,124,82,0.25)',
                      borderColor: 'rgba(166,124,82,0.3)',
                      '&::before': {
                        left: '100%',
                      },
                    },
                  }}
                >
                  <ProductCard product={product} onClick={() => handleClick(product)}/>
                  <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      sx={{
                        fontWeight: '600',
                        borderRadius: { xs: 1.5, md: 2 },
                        width: '50%',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        padding: { xs: '6px 12px', sm: '8px 16px' },
                        background: 'linear-gradient(135deg, #EFE7DB 0%, #e6dcc7 100%)',
                        color: '#2c2c2c',
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(166,124,82,0.2)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #e6dcc7 0%, #d9d0bb 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(166,124,82,0.3)',
                        },
                        '&:active': {
                          transform: 'translateY(0px)',
                          boxShadow: '0 2px 6px rgba(166,124,82,0.3)',
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClick(product)
                      }}
                    >
                      Acheter
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            animation: 'fadeIn 0.8s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 }
            }
          }}
        >
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Aucun produit à afficher pour l'instant.
          </Typography>
        </Box>
      )}
    </section>
  )
}