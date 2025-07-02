// components/Footer.js
import { Typography, Container, Box, IconButton, Link, Grid } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import { FaTiktok, FaSnapchatSquare } from 'react-icons/fa';

// Styles constants pour éviter les re-renders
const styles = {
  footer: {
    backgroundColor: '#F8F8F8',
    zIndex: 1000,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    mt: 'auto',
    py: { xs: 2, md: 3 }
  },
  sectionTitle: {
    fontWeight: 'bold',
    mb: 1,
    fontSize: { xs: '0.85rem', md: '0.9rem' }
  },
  bodyText: {
    fontSize: { xs: '0.7rem', md: '0.75rem' }
  },
  link: {
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline', color: 'primary.main' }
  },
  iconButton: {
    '&:hover': { transform: 'scale(1.1)', transition: 'transform 0.2s' }
  },
  copyright: {
    fontWeight: 'bold',
    fontSize: { xs: '0.65rem', md: '0.7rem' },
    textAlign: 'center'
  }
};

// Données statiques
const contactInfo = [
  { label: 'Adresse', value: 'Chogan by Ikram\n68 rue Louis Roussel\n34070 Montpellier' },
  { label: 'Email', value: 'choganbyikram.contact@gmail.com', isLink: true },
  { label: 'RCS', value: '943 461 939 R.C.S. Montpellier' }
];

const links = [
  { href: '/about', text: 'À propos' },
  { href: '/privacy-policy', text: 'Politique de confidentialité' },
  { href: '/terms', text: 'Conditions générales' }
];

const socialMedia = [
  { 
    href: 'https://www.snapchat.com/add/ikramou-anass',
    label: 'SnapChat',
    icon: FaSnapchatSquare,
    color: '#FFFC00'
  },
  {
    href: 'https://www.instagram.com/ikram_nahyl_amir',
    label: 'Instagram', 
    icon: InstagramIcon,
    color: '#E4405F',
    isMui: true
  },
  {
    href: 'https://www.tiktok.com/@ikrams.chogan',
    label: 'TikTok',
    icon: FaTiktok,
    color: '#000000'
  }
];

const Footer = () => (
  <Box component="footer" sx={styles.footer}>
    <Container maxWidth="lg">
      <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="space-between">
        
        {/* Contact Section */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography color="textPrimary" sx={styles.sectionTitle}>Contact</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {contactInfo.map(({ label, value, isLink }) => (
              <Typography key={label} variant="body2" color="textSecondary" sx={styles.bodyText}>
                <strong>{label}:</strong><br />
                {isLink ? (
                  <Link href={`mailto:${value}`} color="inherit" sx={styles.link}>
                    {value}
                  </Link>
                ) : (
                  value.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < value.split('\n').length - 1 && <br />}</span>
                  ))
                )}
              </Typography>
            ))}
          </Box>
        </Grid>

        {/* Links Section */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography color="textPrimary" sx={styles.sectionTitle}>Liens utiles</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {links.map(({ href, text }) => (
              <Link key={href} href={href} color="textSecondary" sx={{...styles.bodyText, ...styles.link}}>
                {text}
              </Link>
            ))}
          </Box>
        </Grid>

        {/* Social Media Section */}
        <Grid item xs={12} md={3}>
          <Typography 
            color="textPrimary" 
            sx={{...styles.sectionTitle, textAlign: { xs: 'center', md: 'left' }}}
          >
            Suivez-nous
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1 }}>
            {socialMedia.map(({ href, label, icon: Icon, color, isMui }) => (
              <IconButton
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                sx={styles.iconButton}
              >
                <Icon 
                  {...(isMui ? { sx: { fontSize: '1.4rem', color } } : { style: { fontSize: '1.4rem', color } })}
                />
              </IconButton>
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Copyright */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, md: 3 }, pt: 2, borderTop: '1px solid #ddd' }}>
        <Typography color="textSecondary" sx={styles.copyright}>
          © 2025 Chogan by Ikram - Site indépendant d'un consultant Chogan Group
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default Footer;