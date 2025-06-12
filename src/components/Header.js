import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Grid,
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

const Header = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const router = useRouter();
  const { totalQuantity, cartItems, updateCart, removeFromCart } = useCart();

  useEffect(() => {
    setShowBanner(router.pathname === '/');
  }, [router.pathname]);

  useEffect(() => {
    if (!router.events) return;
    const handleRouteChange = () => setOpenSidebar(false);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const handleQuantityChange = (index, newQuantity) => {
    const updatedCart = [...cartItems];
    if (updatedCart[index]) {
      updatedCart[index].quantity = newQuantity;
      updateCart(updatedCart);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        backgroundColor: '#EFE7DB',
        boxShadow: 'none',
        height: showBanner ? '100px' : '75px',
        transition: 'height 0.3s ease',
        // Empêcher le débordement horizontal
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      {showBanner && <ScrollingBanner />}
      <Toolbar
        sx={{
          // Réduire le padding par défaut de MUI
          padding: { xs: '0 8px', sm: '0 16px' },
          minHeight: '64px !important',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Menu Hamburger */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: showBanner ? '40px' : '0px',
              minWidth: 0, // Permet la compression
            }}
          >
            <IconButton
              aria-label="menu"
              onClick={() => setOpenSidebar(true)}
              sx={{
                color: 'black',
                padding: { xs: '4px', sm: '8px' },
                minWidth: 0,
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: showBanner ? '40px' : '0px',
              flex: 1,
              minWidth: 0,
            }}
          >
            <Link href="/" passHref>
              <IconButton
                color="inherit"
                aria-label="logo"
                sx={{
                  padding: { xs: '4px', sm: '8px' },
                  minWidth: 0,
                }}
              >
                <Image
                  src="/images/By_Ikram_logo.png"
                  alt="Logo"
                  width={60} // Réduit pour mobile
                  height={45} // Réduit pour mobile
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                />
              </IconButton>
            </Link>
          </Box>

          {/* Recherche et Panier */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: showBanner ? '40px' : '0px',
              minWidth: 0,
            }}
          >
            <IconButton
              color="inherit"
              sx={{
                color: 'black',
                padding: { xs: '4px', sm: '8px' },
                minWidth: 0,
              }}
              onClick={() => setOpenSearch(true)}
            >
              <SearchIcon />
            </IconButton>
            <IconButton
              color="inherit"
              sx={{
                color: 'black',
                padding: { xs: '4px', sm: '8px' },
                minWidth: 0,
              }}
              onClick={() => setOpenCart(true)}
            >
              <Badge badgeContent={totalQuantity} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Toolbar>

      {/* Sidebar (Drawer) */}
      <Drawer anchor="left" open={openSidebar} onClose={() => setOpenSidebar(false)}>
        <Sidebar open={openSidebar} onClose={() => setOpenSidebar(false)} />
      </Drawer>

      {/* Overlay de recherche */}
      {openSearch && <SearchOverlay open={openSearch} onClose={() => setOpenSearch(false)} />}

      {/* Panier */}
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