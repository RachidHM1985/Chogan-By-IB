import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Grid,
  Badge,
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import Sidebar from './SideBar';
import { useCart } from '../context/CartContext';
import SearchOverlay from '../pages/SearchOverlay';
import CartDialog from '../pages/CartDialog';
import ScrollingBanner from './ScrollingBanner';

const Header = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const router = useRouter();
  const { getTotalQuantity, cartItems, updateCart, setCartItems, removeFromCart } = useCart();

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
    const updatedCartItems = [...cartItems];
    if (updatedCartItems[index]) {
      updatedCartItems[index].quantity = newQuantity;
      updateCart(updatedCartItems);
    }
  };
  const handleSearchClick = () => {
    setOpenSearch(true);
  };
  const updateCartItems = (newCartItems) => {
    updateCart(newCartItems);
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
        height: showBanner ? '95px' : '75px',
        transition: 'height 0.3s ease',
      }}
    >
      {showBanner && <ScrollingBanner />}
      <Toolbar>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '20px' }}>
            <IconButton
              aria-label="menu"
              edge="start"
              onClick={() => setOpenSidebar(prev => !prev)}
              sx={{ color: 'black' }}
            >
              <MenuIcon />
            </IconButton>
          </Grid>

          <Grid item xs={6} sm={4} md={2} sx={{ display: 'flex', justifyContent: 'center', paddingTop: '18px' }}>
            <Link href="/" passHref>
              <IconButton edge="start" color="inherit" aria-label="logo">
                <Image
                  src="/images/By_Ikram_logo.png"
                  alt="Logo"
                  width={80}
                  height={60}
                />
              </IconButton>
            </Link>
          </Grid>

          <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '20px' }}>
            <IconButton
              color="inherit"
              sx={{ color: 'black' }}
              onClick={handleSearchClick}
            >
              <SearchIcon />
            </IconButton>
            <IconButton color="inherit" sx={{ color: 'black' }} onClick={() => setOpenCart(true)}>
              <Badge badgeContent={getTotalQuantity()} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>

      <Drawer sx={{ width: '100%' }} anchor="left" open={openSidebar} onClose={() => setOpenSidebar(false)}>
        <Sidebar />
      </Drawer>

      {openSearch && <SearchOverlay open={openSearch} onClose={() => setOpenSearch(false)} />}

      <CartDialog 
        open={openCart}
        handleCloseCart={() => setOpenCart(false)}
        cartItems={cartItems}
        handleQuantityChange={handleQuantityChange}
        removeFromCart={removeFromCart}
        handleConfirmOrder={() => console.log("Commande confirmée !")}
        updateCartItems={updateCartItems} // Assurez-vous que updateCartItems est passé ici
        />
    </AppBar>
  );
};

export default Header;
