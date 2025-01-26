import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Grid,
  TextField,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchOverlay from '../pages/SearchOverlay';
import Sidebar from './SideBar';
import { useCart } from '../pages/CartContext';
import { loadStripe } from '@stripe/stripe-js';

const Header = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [delivery, setDelivery] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalPriceWithDelivery, setTotalPriceWithDelivery] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { getTotalQuantity, cartItems, removeFromCart, totalPrice } = useCart();
  const [quantities, setQuantities] = useState({});

  const isAboutPage = router.pathname === '/about';
  const isBecomeConsultantPage = router.pathname === '/BecomeConsultant';


  const toggleSidebar = () => {
    setOpenSidebar(!openSidebar);
  };

  const handleOpenCart = () => {
    setOpenCart(true);
  };

  const handleCloseCart = () => {
    setOpenCart(false);
  };

  const handleConfirmOrder = () => {
    setOpenCart(false);
    setOpenConfirmation(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.name) errors.name = 'Name is required';
    if (!data.email) errors.email = 'Email is required';
    if (!data.address) errors.address = 'Address is required';
    if (!data.phone) errors.phone = 'Phone number is required';
    return errors;
  };

  const handleStripePayment = async () => {
    const errors = validateForm(formData);
    setFormErrors(errors);
  
    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData, cartItems, totalPrice: totalPriceWithDelivery }),
        });
  
        const { sessionId } = await response.json();
  
        if (sessionId) {
          const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
          const { error } = await stripe.redirectToCheckout({ sessionId });
  
          if (error) {
            console.error('Stripe redirect error:', error);
          }
        } else {
          console.error('No Stripe session returned.');
        }
      } catch (error) {
        console.error('Error creating Stripe session:', error);
      }
    }
  };
  

  const handleDeliveryChange = (event) => {
    setDelivery(event.target.checked);
  };

  const handleEdit = () => {
    setIsEditing((prevState) => !prevState);
    calculateTotalPrice()    
  };

  const handleQuantityChange = (index, newQuantity) => {
    // Update the quantity in the cartItems array
    const updatedCartItems = [...cartItems];
    updatedCartItems[index].quantity = newQuantity;
  
    // Update the quantities object (in the context or local state)
    const { productId, size } = updatedCartItems[index]; // Assuming productId and size exist in cartItems
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: {
        ...prevQuantities[productId],
        [size]: newQuantity,
      },
    }));
  
  };
  

  const calculerFraisLivraison = (cartItems, totalPrice) => {
    const poidsParfum = {
      "30ml": 200,
      "50ml": 250,
      "70ml": 300
    };

    const tarifs = [
      { maxPoids: 500, prix: 4.99 },
      { maxPoids: 1000, prix: 6.99 },
      { maxPoids: 2000, prix: 9.99 },
      { maxPoids: 5000, prix: 14.99 },
      { maxPoids: Infinity, prix: 20.99 }
    ];

    let poidsTotal = 0;
    cartItems.forEach(item => {
      poidsTotal += poidsParfum[item.size] * item.quantity;
    });

    let fraisLivraison = 0;
    if (totalPrice > 150) {
      return fraisLivraison; // No delivery fee if the total price exceeds 150
    } else {
      for (let tarif of tarifs) {
        if (poidsTotal <= tarif.maxPoids) {
          fraisLivraison = tarif.prix;
          break;
        }
      }
    }
    return fraisLivraison;
  };

  const calculateTotalPrice = () => {
    let total = cartItems.reduce((acc, item) => acc + item.product[`prix_${item.size}`] * item.quantity, 0);
    if (delivery && total < 150) {
      const fraisLivraison = calculerFraisLivraison(cartItems, total);
      console.log(fraisLivraison)
      setDeliveryFee(fraisLivraison);
      total += fraisLivraison; // Add delivery fee to the total price if applicable
    }
    setTotalPriceWithDelivery(total);
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [cartItems, delivery, totalPrice]);

  useEffect(() => {
    const handleRouteChange = () => {
      setOpenSidebar(false);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <AppBar
      position="fixed"
      sx={{
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        backgroundColor: '#F8C8D8',
        boxShadow: 'none',
        height: '65px',
      }}
    >
      <Toolbar>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '20px' }}>
            <IconButton
              aria-label="menu"
              edge="start"
              onClick={toggleSidebar}
              sx={{ color: 'black' }}
            >
              <MenuIcon />
            </IconButton>
          </Grid>

          <Grid item xs={6} sm={4} md={2} sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', paddingTop: isAboutPage || isBecomeConsultantPage ? '10px' : '50px' }}>
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
            <SearchOverlay />
          </Grid>

          <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '20px' }}>
            <IconButton color="inherit" sx={{ color: 'black' }} onClick={handleOpenCart}>
              <Badge badgeContent={getTotalQuantity()} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>

      <Drawer
        anchor="left"
        open={openSidebar}
        onClose={toggleSidebar}
      >
        <Sidebar />
      </Drawer>
      <Dialog open={openCart} onClose={handleCloseCart} maxWidth="md" fullWidth>
        <DialogTitle>Mon Panier</DialogTitle>
        <DialogContent>
          {cartItems.length === 0 ? (
             <Typography variant="h6" align="center">Votre panier est vide.</Typography>
            ) : (
             <>
              {cartItems.map((item, index) => (
                <Grid container key={index} spacing={2} sx={{ marginBottom: 2 }}>
                  <Grid item xs={12} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center" style={{ borderBottom: '1px solid #ccc',  paddingBottom: '8px', marginBottom: '8px', width: '100%' }}>
                      <Typography variant="body1" sx={{ marginRight: 2 }}>
                        {item.product.nom_produit} - {item.product.nom_marque} - {item.size}
                        </Typography>
                        <Typography variant="body1">Quantité:</Typography>
                        {isEditing ? (
                          <TextField
                          value={quantities[item.product.id]?.[item.size] || item.quantity} 
                            onChange={(e) => handleQuantityChange(index, Math.max(Number(e.target.value), 1))}
                            variant="outlined"
                            size="small"
                            type="number"
                            style={{ marginLeft: '10px', width: '60px' }}
                          />
                        ) : (
                          <Typography variant="body1" sx={{ marginRight: 2 }}>
                           {item.quantity}
                          </Typography>
                        )}        
                     
                      <Typography variant="body1" color="textSecondary" sx={{ marginRight: 2, textAlign: 'right', flexGrow: 1 }}>
                        Prix: {(item.product[`prix_${item.size}`] * item.quantity).toFixed(2)}€
                      </Typography>
                      <IconButton onClick={handleEdit}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(item.product.id, item.size)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </Grid>
                </Grid>
              ))}
              {totalPriceWithDelivery < 150 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={delivery}
                      onChange={handleDeliveryChange}
                      color="primary"
                    />
                  }
                  label="Souhaitez-vous une livraison ?"
                  sx={{ mt: 2 }}
                />
              )}
              {delivery && totalPriceWithDelivery < 150 && (
                <Typography sx={{ mt: 2 }} align="right">
                  Frais de livraison : {deliveryFee}€
                </Typography>
              )}
              {!delivery && totalPriceWithDelivery < 150 && (
                <Typography sx={{ mt: 2, color: 'red' }}>
                  Si vous n'optez pas pour la livraison, vous devez récupérer votre commande physiquement.
                </Typography>
              )}
              {totalPriceWithDelivery >= 150 && (
                <Typography sx={{ mt: 2, color: 'red' }}>
                  La livraison vous est offerte.
                </Typography>
              )}
              <Typography variant="h5" sx={{ marginTop: 2 }} align="right">
                Total: {totalPriceWithDelivery.toFixed(2)}€
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" color="secondary" onClick={handleCloseCart}>
            Annuler
          </Button>
          {cartItems.length > 0 && (
            <Button variant="outlined" onClick={handleConfirmOrder} color="primary">
              Confirmer la commande
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={openConfirmation} onClose={() => setOpenConfirmation(false)} maxWidth="md" fullWidth>
        <DialogTitle>Confirmation de Commande</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Merci pour votre commande !</Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            Veuillez remplir vos informations pour confirmer votre commande :
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Nom"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Adresse"
            name="address"
            value={formData.address}
            onChange={handleFormChange}
            error={!!formErrors.address}
            helperText={formErrors.address}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Téléphone"
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmation(false)} color="secondary">
            Fermer
          </Button>
          <Button onClick={handleStripePayment} color="primary">
            Payer
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Header;