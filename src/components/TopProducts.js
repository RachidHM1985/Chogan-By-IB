'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Grid, Typography, Button, CircularProgress, Container } from '@mui/material'
import { getTopProducts } from '../lib/utils/getTopProducts'
import ProductCard from './ProductCard'

export default function TopProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getTopProducts()
        setProducts(result)
      } catch (error) {
        console.error('Erreur lors de la récupération des produits :', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const navigateToProduct = (product) => {
    const pathMap = {
      parfums: `/perfumes/${product.genre || 'All'}/${product.code_produit}`,
      aurodhea: `/beauty/all/${product.code_produit}`,
      brilhome: `/brilhome/all/${product.code_produit}`,
      parfumerie_interieur: `/parfumerieInterieur/all/${product.code_produit}`,
      peptilux: `/peptilux/all/${product.code_produit}`,
    }
    router.push(pathMap[product.type])
  }

  return (
    <Box 
      sx={{ 
        backgroundColor: '#fafafa',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden', // Empêche le débordement
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: { xs: 3, sm: 4, md: 6 },
          px: { xs: 2, sm: 3 }, // Padding responsive
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <Box 
          textAlign="center" 
          position="relative" 
          mb={{ xs: 3, sm: 4 }}
          sx={{
            overflow: 'hidden', // Empêche le débordement du titre
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: 100, sm: 130, md: 160 }, // Réduit les tailles
              height: { xs: 100, sm: 130, md: 160 },
              background: 'radial-gradient(circle, rgba(166,124,82,0.1) 0%, rgba(166,124,82,0.05) 50%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 3s ease-in-out infinite',
              zIndex: 0,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: 'transparent',
              background: 'linear-gradient(135deg, #a67c52 0%, #d4a574 50%, #a67c52 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2.2rem' }, // Réduit la taille mobile
              fontFamily: 'Playfair Display, serif',
              letterSpacing: { xs: 0.5, sm: 1 }, // Réduit l'espacement sur mobile
              textShadow: '0 4px 8px rgba(0,0,0,0.1)',
              zIndex: 1,
              position: 'relative',
              wordBreak: 'keep-all', // Empêche la coupure de mots
              whiteSpace: { xs: 'nowrap', sm: 'normal' }, // Pas de retour ligne sur mobile
              overflow: 'hidden',
            }}
          >
            ✨ NOS BEST-SELLERS ✨
          </Typography>
          <Box
            sx={{
              width: { xs: 60, sm: 80, md: 100 }, // Réduit la largeur
              height: 3,
              background: 'linear-gradient(90deg, transparent, #a67c52, transparent)',
              borderRadius: 2,
              mx: 'auto',
              mt: 1.5,
              animation: 'expandLine 1.5s ease-out 0.5s both',
            }}
          />
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress color="inherit" thickness={4} size={40} />
          </Box>
        ) : products.length > 0 ? (
          <Grid 
            container 
            spacing={{ xs: 1.5, sm: 2, md: 3 }} // Réduit l'espacement
            justifyContent="center"
            sx={{
              width: '100%',
              margin: 0, // Supprime les marges par défaut
              '& > .MuiGrid-item': {
                paddingLeft: { xs: '6px', sm: '8px', md: '12px' }, // Contrôle précis du padding
                paddingTop: { xs: '6px', sm: '8px', md: '12px' },
              }
            }}
          >
            {products.map((product, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                key={product.id}
                sx={{
                  display: 'flex',
                  width: '100%',
                  minWidth: 0, // Permet la compression
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    backgroundColor: '#FFFFFF00',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(166,124,82,0.15)',
                    border: '1px solid rgba(166,124,82,0.1)',
                    transition: '0.3s ease',
                    overflow: 'hidden', // Empêche le débordement du contenu
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(166,124,82,0.25)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <ProductCard 
                    product={product} 
                    onClick={() => navigateToProduct(product)} 
                  />
                  <Box 
                    mt="auto" 
                    pt={2} 
                    px={2} // Ajoute du padding horizontal
                    pb={2} // Ajoute du padding bottom
                    display="flex" 
                    justifyContent="center" 
                    backgroundColor='#FFFFFF00'
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        fontWeight: 600,
                        borderRadius: 2,
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }, // Taille responsive
                        py: { xs: 1, sm: 1.5 }, // Padding vertical responsive
                        background: 'linear-gradient(135deg, #EFE7DB 0%, #e6dcc7 100%)',
                        color: '#2c2c2c',
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(166,124,82,0.2)',
                        minWidth: 0, // Permet la compression
                        '&:hover': {
                          background: 'linear-gradient(135deg, #e6dcc7 0%, #d9d0bb 100%)',
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateToProduct(product)
                      }}
                    >
                      Acheter
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box textAlign="center" py={6}>
            <Typography variant="body1" color="text.secondary">
              Aucun produit à afficher pour l'instant.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}