import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Badge,
  Box,
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import Sidebar from './SideBar';
import { useCart } from '../context/CartContext';
import SearchOverlay from '../pages/SearchOverlay';
import CartDialog from '../pages/panier/CartDialog';
import ScrollingBanner from './ScrollingBanner';

// Styles constants pour optimiser les performances
const styles = {
  appBar: {
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1100,
    backgroundColor: '#EFE7DB',
    boxShadow: 'none',
    transition: 'height 0.3s ease',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '100vw'
  },
  toolbar: {
    padding: { xs: '0 8px', sm: '0 16px' }, // Ajout de padding mobile
    minHeight: '64px !important'
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden'
  },
  menuSection: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0
  },
  logoSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    minWidth: 0
  },
  actionsSection: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    gap: { xs: 0.5, sm: 1 }, // Espacement entre les icônes
    paddingRight: { xs: 1, sm: 0 } // Décalage vers la gauche sur mobile
  },
  iconButton: {
    color: 'black',
    padding: { xs: '6px', sm: '8px' },
    minWidth: 0
  },
  logoButton: {
    padding: { xs: '4px', sm: '8px' },
    minWidth: 0
  }
};

const Header = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const router = useRouter();
  const { totalQuantity, cartItems, updateCart, removeFromCart } = useCart();

  // Effects optimisés
  useEffect(() => {
    setShowBanner(router.pathname === '/');
  }, [router.pathname]);

  useEffect(() => {
    if (!router.events) return;
    const handleRouteChange = () => setOpenSidebar(false);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  const handleQuantityChange = (index, newQuantity) => {
    const updatedCart = [...cartItems];
    if (updatedCart[index]) {
      updatedCart[index].quantity = newQuantity;
      updateCart(updatedCart);
    }
  };

  const paddingTop = showBanner ? '40px' : '0px';
  const headerHeight = showBanner ? '100px' : '75px';

  return (
    <AppBar
      position="fixed"
      sx={{
        ...styles.appBar,
        height: headerHeight
      }}
    >
      {showBanner && <ScrollingBanner />}
      
      <Toolbar sx={styles.toolbar}>
        <Box sx={styles.container}>
          {/* Menu Hamburger */}
          <Box sx={{ ...styles.menuSection, paddingTop }}>
            <IconButton
              aria-label="menu"
              onClick={() => setOpenSidebar(true)}
              sx={styles.iconButton}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo */}
          <Box sx={{ ...styles.logoSection, paddingTop }}>
            <Link href="/" passHref>
              <IconButton
                color="inherit"
                aria-label="logo"
                sx={styles.logoButton}
              >
                <Image
                  src="/images/By_Ikram_logo.png"
                  alt="Logo"
                  width={60}
                  height={45}
                  style={{
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </IconButton>
            </Link>
          </Box>

          {/* Recherche et Panier */}
          <Box sx={{ ...styles.actionsSection, paddingTop }}>
            <IconButton
              color="inherit"
              sx={styles.iconButton}
              onClick={() => setOpenSearch(true)}
              aria-label="recherche"
            >
              <SearchIcon />
            </IconButton>
            
            <IconButton
              color="inherit"
              sx={styles.iconButton}
              onClick={() => setOpenCart(true)}
              aria-label="panier"
            >
              <Badge badgeContent={totalQuantity} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Toolbar>

      {/* Sidebar */}
      <Drawer 
        anchor="left" 
        open={openSidebar} 
        onClose={() => setOpenSidebar(false)}
      >
        <Sidebar 
          open={openSidebar} 
          onClose={() => setOpenSidebar(false)} 
        />
      </Drawer>

      {/* Search Overlay */}
      {openSearch && (
        <SearchOverlay 
          open={openSearch} 
          onClose={() => setOpenSearch(false)} 
        />
      )}

      {/* Cart Dialog */}
      <CartDialog
        open={openCart}
        handleCloseCart={() => setOpenCart(false)}
        cartItems={cartItems}
        handleQuantityChange={handleQuantityChange}
        removeFromCart={removeFromCart}
        updateCartItems={updateCart}
      />
    </AppBar>
  );
};

export default Header;