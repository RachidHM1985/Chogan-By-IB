import { Card, Box, Typography, Chip } from '@mui/material'

const getDisplayPrice = (product) => {
  if (product.type === 'parfums') {
    const rawPrices = [product.prix_15ml, product.prix_30ml, product.prix_50ml, product.prix_70ml]
    const validPrices = rawPrices
      .map(price => typeof price === 'string' ? parseFloat(price) : price)
      .filter(price => typeof price === 'number' && !isNaN(price))

    if (validPrices.length === 0) return 'Prix non disponible'
    return `À partir de ${Math.min(...validPrices).toFixed(2)}€`
  } else {
    const prix = typeof product.prix === 'string' ? parseFloat(product.prix) : product.prix
    return prix ? `${prix.toFixed(2)}€` : 'Prix non disponible'
  }
}

const getProductTitle = (product) => {
  if (product.type === 'parfums') return `PARFUM : ${product.code_produit}`
  return product.nom_produit
}

const getCategoryColor = (type) => {
  switch (type) {
    case 'parfums': return '#9c27b0'
    case 'aurodhea': return '#4caf50'
    case 'brilhome': return '#2196f3'
    case 'parfumerie_interieur': return '#ff9800'
    case 'peptilux': return '#e91e63'
    default: return '#9e9e9e'
  }
}

export default function ProductCard({ product, onClick }) {
  return (
    <Card
      sx={{
        borderRadius: '15px',
        border: '1px solid #ddd',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        height: '250px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `url(${product.photo_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={onClick}
    >
      <Box sx={{ mt: 'auto', background: 'rgba(255, 255, 255, 0.85)', p: 2, width: '100%' }}>
        <Chip
          label={product.type}
          size="small"
          color="primary"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: getCategoryColor(product.type),
          }}
        />
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{
            fontSize: '0.9rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: product.type === 'parfums' ? 3 : 1,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {getProductTitle(product)}
        </Typography>

        {product.type !== 'parfums' && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
            {product.nom_marque}
          </Typography>
        )}

        {product.type === 'parfums' && product.genre && (
          <>
            <Typography variant="caption" display="block" sx={{ fontSize: '0.85rem' }}>
              {product.genre}
            </Typography>
            <Typography variant="caption" display="block" sx={{ fontSize: '0.85rem' }}>
              Parfum inspiré par {product.nom_produit} de {product.nom_marque}
            </Typography>
          </>
        )}

        <Typography variant="body2" fontWeight="bold" sx={{ mt: 1, fontSize: '1rem' }}>
          {getDisplayPrice(product)}
        </Typography>
      </Box>
    </Card>
  )
}
