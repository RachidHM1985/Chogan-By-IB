// ContactSection.js
'use client'

import { Box, Typography, Link, Button } from '@mui/material'
import { Headphones, Mail, MessageCircle } from 'lucide-react'

// Styles constants
const styles = {
  section: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '10vh',
    width: '100%',
    maxWidth: '100vw',
    overflow: 'hidden'
  },
  container: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: { xs: '100%', md: '1200px' },
    gap: { xs: 2, md: 0 },
    padding: { xs: 1, sm: 2 },
    backgroundColor: '#f8f9fa',
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  imageContainer: {
    width: { xs: '100%', md: '50%' },
    maxWidth: { xs: '100%', md: '600px' },
    display: 'flex',
    justifyContent: 'center'
  },
  iconCard: {
    width: '100%',
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '10px',
    backgroundColor: '#fff',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  iconWrapper: {
    backgroundColor: '#efe7db',
    borderRadius: '50%',
    padding: '1.5rem',
    marginBottom: '1rem'
  },
  textContainer: {
    padding: { xs: 2, sm: 3, md: 4 },
    width: { xs: '100%', md: '50%' },
    maxWidth: { xs: '100%', md: '500px' },
    textAlign: { xs: 'center', md: 'left' },
    display: 'flex',
    flexDirection: 'column',
    alignItems: { xs: 'center', md: 'flex-start' },
    boxSizing: 'border-box'
  },
  title: {
    fontSize: { xs: '1.1rem', sm: '1.25rem' },
    lineHeight: 1.5,
    textAlign: { xs: 'center', md: 'left' },
    marginBottom: 2,
    fontWeight: 'bold'
  },
  description: {
    marginBottom: 2,
    fontSize: { xs: '0.9rem', sm: '1rem' },
    textAlign: { xs: 'center', md: 'left' }
  },
  subDescription: {
    marginBottom: 3,
    fontSize: { xs: '0.85rem', sm: '0.9rem' },
    textAlign: { xs: 'center', md: 'left' }
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: { xs: 1.5, sm: 2 },
    justifyContent: { xs: 'center', md: 'flex-start' },
    width: '100%',
    maxWidth: '100%'
  },
  button: {
    textTransform: 'none',
    padding: { xs: '8px 12px', sm: '10px 16px' },
    fontSize: { xs: '0.8rem', sm: '0.9rem' },
    backgroundColor: '#efe7db',
    color: '#333',
    width: { xs: '100%', sm: 'auto' },
    minWidth: 0,
    whiteSpace: { xs: 'normal', sm: 'nowrap' },
    '&:hover': {
      backgroundColor: '#e6dcc7'
    }
  }
}

// Contact buttons data
const contactButtons = [
  {
    href: 'https://instagram.com/direct/t/ikram_nahyl_amir/?text=Bonjour,%20j\'aimerais%20acheter%20votre%20produit',
    text: 'Instagram',
    icon: MessageCircle
  },
  {
    href: 'mailto:choganbyikram.contact@gmail.com',
    text: 'Email',
    icon: Mail
  }
]

export function ContactSection() {
  return (
    <section style={styles.section}>
      <Box sx={styles.container}>
        {/* Text Content */}
        <Box sx={styles.textContainer}>
          <div style={styles.iconWrapper}>
              <Headphones size={48} color="#333" />
            </div>
          <Typography variant="h6" sx={styles.title}>
            Nous contacter
          </Typography>

          <Typography variant="body1" sx={styles.description}>
            Pour toute question concernant nos produits ou votre commande, je suis à votre disposition du lundi au samedi, de 9h à 19h, et je vous répondrai personnellement depuis mon bureau à Montpellier.
          </Typography>

          <Typography variant="body2" sx={styles.subDescription}>
            Restez informé(e) des dernières actualités concernant nos produits sur nos réseaux sociaux. Vous y trouverez également un espace pour poser toutes vos questions. Si vous préférez, vous pouvez également nous contacter directement par email.
          </Typography>

          {/* Contact Buttons */}
          <Box sx={styles.buttonContainer}>
            {contactButtons.map(({ href, text, icon: Icon }) => (
              <Button
                key={text}
                component={Link}
                href={href}
                variant="contained"
                startIcon={<Icon size={16} />}
                sx={styles.button}
              >
                {text}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    </section>
  )
}