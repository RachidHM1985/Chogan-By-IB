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
  Checkbox, InputAdornment 
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchOverlay from '../pages/SearchOverlay';
import SearchIcon from '@mui/icons-material/Search';  // Correct import path
import Sidebar from './SideBar';
import { useCart } from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';     
import { Add, Remove } from '@mui/icons-material'; // Importer les icônes

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
  const { getTotalQuantity, cartItems,setCartItems, removeFromCart, totalPrice } = useCart();
  const [quantities, setQuantities] = useState({});
  const [openSearch, setOpenSearch] = useState(false); // Updated state for search modal
  const [promoCode, setPromoCode] = useState('');
  const handleOpenSearch = () => setOpenSearch(true); // Open Search Overlay
  const handleCloseSearch = () => setOpenSearch(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [codePromoValid, setCodePromoValid] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const[amountPromo, setAmountPromo] = useState('');

  const toggleSidebar = () => {
    setOpenSidebar(!openSidebar);
};

const handleOpenCart = () => {
    calculateTotalPrice();
    setOpenCart(true);
};

const handleCloseCart = () => {
  // Réinitialiser tous les messages
  setSuccessMessage('');
  setErrorMessage('');
  
  // Arrêter l'édition des quantités et réinitialiser les quantités
  setIsEditing(false);  
  setQuantities({});

  // Réinitialiser le code promo et les valeurs associées
  setAmountPromo('');
  setPromoCode('');
  setCodePromoValid(false);  // Réinitialiser la validation du code promo
  setDeliveryFee(0);  // Réinitialiser les frais de livraison
  
  // Réinitialiser les valeurs liées à l'affichage du panier
  setTotalPriceWithDelivery(0);  // Réinitialiser le total avec livraison
  
  
  // Si vous avez un formulaire à réinitialiser, vous pouvez le faire ici
  setFormData({
      name: '',
      email: '',
      address: '',
      phone: ''
  });

  // Calculer le total après réinitialisation, s'il y a des calculs à refaire
  calculateTotalPrice();
  
  // Fermer le panier
  setOpenCart(false);
};


const handleConfirmOrder = () => {
    setIsEditing(false);
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
      // Calculate total price after applying promo discount
      let total = totalPriceWithDelivery - amountPromo; // Apply promo discount
      total = total <= 0 ? 0 : total;

      // Create line items for Stripe including perfume size in the description
      const stripeLineItems = cartItems.map(item => ({
        price_data: {
          currency: 'eur',  // Currency should match your setup
          product_data: {
            name: item.product.nom_produit,
            size: item.size,
            code: item.product.code,
          },
          unit_amount: Math.round((item.discountedPrice || item.product[`prix_${item.size}`]) * 100),  // Convert to cents
        },
        quantity: item.quantity,
      }));
        console.log("stripeLineItems:", stripeLineItems)
      // Send a request to create a Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          cartItems,
          deliveryFee,
          amountPromo,
          totalPrice: total,
          lineItems: stripeLineItems,  // Send line items with sizes and shipping fee
        }),
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
};

const handleQuantityChange = (index, newQuantity) => {
  const quantity = Number(newQuantity);

  // Vérifier si la quantité est valide (nombre > 0)
  if (quantity <= 0 || isNaN(quantity)) {
    console.log(quantity);
    removeFromCart(cartItems[index].product.id, cartItems[index].size);
  } else {
    // Mettre à jour la quantité de l'article dans le panier
    const updatedCartItems = cartItems.map((item, i) =>
      i === index ? { ...item, quantity } : item
    );

    // Mettre à jour l'état du panier avec la nouvelle copie
    setCartItems(updatedCartItems);

    // Mettre à jour les quantités dans l'état
    setQuantities((prev) => ({
      ...prev,
      [cartItems[index].product.id]: {
        ...prev[cartItems[index].product.id],
        [cartItems[index].size]: quantity,
      },
    }));

    // Calculer et mettre à jour le montant du code promo
    if (codePromoValid) {
      calculateDiscount(updatedCartItems);
    }
  }
};

const calculateDiscount = (cartItems) => {
  let totalDiscount = 0;

  // Vérifier si le code promo est appliqué
  if (promoCode === 'CHOGAN50') {
    // Réinitialiser les prix réduits
    const resetCartItems = cartItems.map(item => ({ ...item, discountedPrice: null }));

    // Étendre les articles en fonction de leur quantité
    const expandedCartItems = [];
    resetCartItems.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
            expandedCartItems.push({ ...item, quantity: 1 });
        }
    });

    // Trier les articles par prix croissant
    const sortedCartItems = expandedCartItems.sort((a, b) => {
        const priceA = a.product[`prix_${a.size}`];
        const priceB = b.product[`prix_${b.size}`];
        return priceA - priceB;
    });

    const itemsToDiscount = Math.floor(sortedCartItems.length / 2);

    // Appliquer la réduction de 50% sur les articles les moins chers
    sortedCartItems.forEach((item, index) => {
        if (index < itemsToDiscount) {
            const originalPrice = item.product[`prix_${item.size}`];
            const discountedPrice = originalPrice * 0.5;

            // Calculer le montant de la réduction
            const discountAmount = originalPrice - discountedPrice;
            totalDiscount += discountAmount;

            // Mettre à jour l'article avec le prix réduit
            item.discountedPrice = discountedPrice;
        }
    });

    // Mettre à jour l'état du panier avec les prix réduits
    const finalUpdatedCartItems = resetCartItems.map((originalItem) => {
        const updatedItems = sortedCartItems.filter(
            (updatedItem) =>
                updatedItem.product.id === originalItem.product.id &&
                updatedItem.size === originalItem.size
        );
        if (updatedItems.length > 0) {
            const totalDiscountedPrice = updatedItems.reduce((acc, item) => acc + (item.discountedPrice || item.product[`prix_${item.size}`]), 0);
            return { ...originalItem, discountedPrice: totalDiscountedPrice / updatedItems.length };
        }
        return originalItem;
    });

    setCartItems(finalUpdatedCartItems);
    setAmountPromo(totalDiscount.toFixed(2)); // Mettre à jour le montant du code promo
  }
};

const calculerFraisLivraison = (cartItems, totalPrice) => {
  const poidsParfum = {
    "30ml": 200,
    "50ml": 250,
    "70ml": 300,
  };

  const tarifs = [
    { maxPoids: 500, prix: 4.99 },
    { maxPoids: 1000, prix: 6.99 },
    { maxPoids: 2000, prix: 9.99 },
    { maxPoids: 5000, prix: 14.99 },
    { maxPoids: Infinity, prix: 20.99 },
  ];

  let poidsTotal = 0;
  cartItems.forEach((item) => {
    poidsTotal += poidsParfum[item.size] * item.quantity;
  });

  let fraisLivraison = 0;
  if (totalPrice > 80) {
    return fraisLivraison; // Pas de frais de livraison si le total est supérieur à 80
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

useEffect(() => {
    const handleRouteChange = () => {
        setOpenSidebar(false);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
    };
}, [router.events]);

const handlePromoCodeSubmit = async (e) => {
  if (e) e.preventDefault();

  // Vérifier si le code promo est vide
  if (!promoCode.trim() && promoCode === '') {
      setCodePromoValid(false);
      setErrorMessage('Veuillez entrer un code promo');
      setSuccessMessage('');
      return;
  }

  setLoading(true);
  try {
      // Appeler l'API pour vérifier la validité du code promo
      const response = await fetch('/api/validate-promo-code', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ promoCode }),
      });

      const data = await response.json();

      if (data.success) {
          setErrorMessage('');
          setCodePromoValid(true);

          // Calculer le nombre total d'articles
          const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

          // Si le code promo est "CHOGAN50" et qu'il y a plus d'un article au total
          if (promoCode === 'CHOGAN50' && totalItems > 1) {
              console.log('Code promo CHOGAN50 détecté. Application de la réduction de 50% sur les paires.');

              // Réinitialiser les prix réduits
              const resetCartItems = cartItems.map(item => ({ ...item, discountedPrice: null }));

              // Étendre les articles en fonction de leur quantité
              const expandedCartItems = [];
              resetCartItems.forEach(item => {
                  for (let i = 0; i < item.quantity; i++) {
                      expandedCartItems.push({ ...item, quantity: 1 });
                  }
              });

              // Trier les articles par prix croissant
              const sortedCartItems = expandedCartItems.sort((a, b) => {
                  const priceA = a.product[`prix_${a.size}`];
                  const priceB = b.product[`prix_${b.size}`];
                  return priceA - priceB;
              });

              let totalDiscount = 0;
              const itemsToDiscount = Math.floor(sortedCartItems.length / 2);

              // Appliquer la réduction de 50% sur les articles les moins chers
              sortedCartItems.forEach((item, index) => {
                  if (index < itemsToDiscount) {
                      const originalPrice = item.product[`prix_${item.size}`];
                      const discountedPrice = originalPrice * 0.5;

                      // Calculer le montant de la réduction
                      const discountAmount = originalPrice - discountedPrice;
                      totalDiscount += discountAmount;

                      // Mettre à jour l'article avec le prix réduit
                      item.discountedPrice = discountedPrice;
                  }
              });

              // Réordonner les articles en fonction du panier original
              const finalUpdatedCartItems = resetCartItems.map((originalItem) => {
                  const updatedItems = sortedCartItems.filter(
                      (updatedItem) =>
                          updatedItem.product.id === originalItem.product.id &&
                          updatedItem.size === originalItem.size
                  );
                  if (updatedItems.length > 0) {
                      const totalDiscountedPrice = updatedItems.reduce((acc, item) => acc + (item.discountedPrice || item.product[`prix_${item.size}`]), 0);
                      return { ...originalItem, discountedPrice: totalDiscountedPrice / updatedItems.length };
                  }
                  return originalItem;
              });

              // Mettre à jour l'état du panier
              setCartItems(finalUpdatedCartItems);
              // Afficher le montant total de la réduction
              setAmountPromo(totalDiscount.toFixed(2))
          } else {
              setErrorMessage("Code promo valable uniquement pour plus de 1 article");
              setSuccessMessage('');
              setCodePromoValid(false);
          }
      } else {
          setErrorMessage(data.message || 'Code promo invalide');
          setSuccessMessage('');
          setCodePromoValid(false);
      }
  } catch (error) {
      console.error('Erreur de validation du code promo:', error);
      setErrorMessage('Erreur lors de la validation du code promo');
      setSuccessMessage('');
  } finally {
      setLoading(false);
  }
};

const calculateTotalPrice = () => {
  let total = cartItems.reduce((acc, item) => {
      return acc + (item.discountedPrice || item.product[`prix_${item.size}`]) * item.quantity;
  }, 0);

  // Si la livraison est activée et que le total est inférieur à 80, appliquer des frais de livraison
  if (delivery && total < 80) {
      const fraisLivraison = calculerFraisLivraison(cartItems, total);
      setDeliveryFee(fraisLivraison);
      total += fraisLivraison;
  } else {
      setDeliveryFee(0); // Réinitialiser les frais de livraison si le total est supérieur à 80
  }
    setTotalPriceWithDelivery(total);
};

// Utiliser useEffect pour recalculer le prix total à chaque modification de cartItems ou delivery
useEffect(() => {
  calculateTotalPrice();
}, [cartItems, delivery]);
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

          <Grid item xs={6} sm={4} md={2} sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', alignItems: 'center', paddingTop:'10px' }}>
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
            <IconButton color="inherit" onClick={handleOpenSearch}>
              <SearchIcon sx={{ color: 'black' }} />
            </IconButton>
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

      <Drawer sx={{  width: '100%' }}
        anchor="left"
        open={openSidebar}
        onClose={toggleSidebar}
      >
        <Sidebar />
      </Drawer>
        
        {/* Search Overlay */}
        {openSearch && <SearchOverlay open={openSearch} onClose={handleCloseSearch} />}     
        <Dialog 
          open={openCart} 
          onClose={handleCloseCart}   
          maxWidth="none" 
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              width: '95%',   // Largeur à 90% de l'écran
              maxWidth: 'none', // Empêche la limite de largeur maximale par défaut
              margin: 'auto', // Centre la modal horizontalement et verticalement
            },
          }}
        >
          <DialogTitle>Récapitulatif de votre panier</DialogTitle>
          <DialogContent sx={{ overflowY: 'auto' }}>
            {cartItems.length === 0 ? (
              <Typography variant="h6" align="center">Votre panier est vide.</Typography>
            ) : (
              <>
                {cartItems.map((item, index) => (
          <Grid container key={index} spacing={2} sx={{ marginBottom: 2, paddingBottom: 2, borderBottom: '1px solid #ddd' }}>
            {/* Informations sur le produit */}
            <Grid item xs={12} sm={8} md={9} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.775rem', sm: '1rem' } }}>
                {item.product.nom_produit} - {item.product.nom_marque} - {item.size}
              </Typography>
            </Grid>

            {/* Quantité, Prix et Boutons */}
            <Grid item xs={12} sm={4} md={3} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ fontSize: { xs: '0.775rem', sm: '1rem' } }}>
                Quantité :
              </Typography>

              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    onClick={() => handleQuantityChange(index, (quantities[item.product.id]?.[item.size] || item.quantity) - 1)}
                    sx={{ padding: '0 8px' }}
                  >
                    <Remove />
                  </IconButton>

                  <TextField
                    value={quantities[item.product.id]?.[item.size] || item.quantity}
                    onChange={(e) => handleQuantityChange(index, Math.max(Number(e.target.value), 1))}
                    onBlur={() => {
                      if (quantities[item.product.id]?.[item.size] <= 0 || item.quantity <= 0) {
                        removeFromCart(item.product.id, item.size);
                      }
                      setIsEditing(false);
                    }}
                    variant="outlined"
                    size="small"
                    type="number"
                    sx={{
                      marginRight: 0,
                      marginLeft: 0,
                      width: '80px',
                      textAlign: 'center',
                    }}
                  />

                  <IconButton
                    onClick={() => handleQuantityChange(index, (quantities[item.product.id]?.[item.size] || item.quantity) + 1)}
                    sx={{ padding: '0 8px' }}
                  >
                    <Add />
                  </IconButton>
                </div>
              ) : (
                <Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                  {item.quantity}
                </Typography>
              )}

              {/* Prix */}
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{
                  textAlign: 'right',
                  flexGrow: 1,
                  fontSize: { xs: '0.8rem', sm: '1rem' },
                }}
              >
                Prix: {(item.product[`prix_${item.size}`] * item.quantity).toFixed(2)}€
              </Typography>

              {/* Boutons Modifier / Supprimer */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleEdit} sx={{ padding: 0, marginRight: 1 }}>
                  <EditIcon />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => removeFromCart(item.product.id, item.size)}
                  sx={{ padding: 0 }}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </Grid>
          </Grid>
        ))}
       
          <Grid
            container
            justifyContent="flex-end"
            sx={{
              flexDirection: 'column',
              marginTop: 2,
              alignItems: 'flex-end', // Aligne les éléments à droite
            }}
          >
        <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <TextField
            label="Code promo"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              width: '60%', // Utilise 100% de la largeur du conteneur
              maxWidth: '300px', // Limite la largeur maximale sur les grands écrans
            }}
          />
        </Grid>
        
        <Grid item sx={{ paddingTop: 1, display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={handlePromoCodeSubmit} sx={{ marginTop: '10px' }}>
            Appliquer
          </Button>
        </Grid>
      </Grid>

        {/* Livraison */}
        {totalPriceWithDelivery < 80 && (
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
        {delivery && totalPriceWithDelivery < 80 && (
          <Typography sx={{ mt: 2 }} align="right">
            Frais de livraison : {deliveryFee}€
          </Typography>
        )}
        {!delivery && totalPriceWithDelivery < 80 && (
          <Typography sx={{ mt: 2, color: 'red' }}>
            Si vous n'optez pas pour la livraison, vous devez récupérer votre commande physiquement.
          </Typography>
        )}
        {totalPriceWithDelivery >= 80 && (
          <Typography sx={{ mt: 2, color: 'red' }}>
            La livraison vous est offerte.
          </Typography>
        )}
        {amountPromo > 0 && (
          <Typography variant="body1" sx={{ marginTop: 2 }} align="right">
            reduction: -{amountPromo}€
          </Typography>
        )}
        {/* Total */}
        <Typography variant="h5" sx={{ marginTop: 2 }} align="right">
          Total: {totalPriceWithDelivery.toFixed(2)}€
        </Typography>
      </>
    )}
    {errorMessage && !codePromoValid && <Typography color="error" variant="body2">{errorMessage}</Typography>}
    {successMessage && <Typography color="success" variant="body2">{successMessage}</Typography>}

  </DialogContent>
  <DialogActions sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
    <Button variant="outlined" color="secondary" onClick={handleCloseCart}>
      Annuler
    </Button>
    {cartItems.length > 0 && (
      <Button variant="outlined" onClick={handleConfirmOrder} color="primary">
        Confirmer votre panier
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