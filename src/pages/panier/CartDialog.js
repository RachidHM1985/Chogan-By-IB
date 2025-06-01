import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Grid, 
  IconButton, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel,
  Alert
} from "@mui/material";
import { Add, Remove, Delete as DeleteIcon } from "@mui/icons-material";
import OrderConfirmationDialog from "../../pages/order/OrderConfirmationDialog ";
import { loadStripe } from '@stripe/stripe-js';

const CartDialog = ({
  open,
  handleCloseCart,
  cartItems,
  handleQuantityChange,
  removeFromCart,
  updateCartItems,
}) => {
  // États principaux
  const [delivery, setDelivery] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  // Configuration des poids et tarifs de livraison
  const SHIPPING_CONFIG = useMemo(() => ({
    FREE_SHIPPING_THRESHOLD: 80,
    WEIGHT_BY_SIZE: {
      "30ml": 200,
      "50ml": 250,
      "70ml": 300,
      "75ml": 300,
      "80ml": 320,
      "100ml": 320,      
      "150ml": 320,
      "200ml": 320,
      "250ml": 320,
      "260ml": 320,
    },
    SHIPPING_RATES: [
      { maxWeight: 500, price: 4.99 },
      { maxWeight: 1000, price: 6.99 },
      { maxWeight: 2000, price: 9.99 },
      { maxWeight: 5000, price: 14.99 },
      { maxWeight: Infinity, price: 20.99 },
    ]
  }), []);

  // Calcul du sous-total
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const basePrice = item.product?.prix !== undefined ? 
                      item.product.prix : 
                      item.product[`prix_${item.size}`] || 0;
      return acc + (basePrice * item.quantity);
    }, 0);
  }, [cartItems]);

  // Calcul des frais de livraison
  const deliveryFee = useMemo(() => {
    if (!delivery || subtotal > SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
      return 0;
    }

    // Calcul du poids total
    const totalWeight = cartItems.reduce((weight, item) => {
      const size = item.size || item.product.contenance;
      const itemWeight = SHIPPING_CONFIG.WEIGHT_BY_SIZE[size] || 320;
      return weight + (itemWeight * item.quantity);
    }, 0);

    // Détermination du tarif en fonction du poids
    const rate = SHIPPING_CONFIG.SHIPPING_RATES.find(rate => totalWeight <= rate.maxWeight);
    return rate ? rate.price : SHIPPING_CONFIG.SHIPPING_RATES[SHIPPING_CONFIG.SHIPPING_RATES.length - 1].price;
  }, [cartItems, delivery, subtotal, SHIPPING_CONFIG]);

  // Total final
  const totalPrice = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  // Gestion optimisée de la quantité
  const handleQuantityChangeMemoized = useCallback((index, newQuantity) => {
    if (typeof index !== "number" || typeof newQuantity !== "number" || newQuantity < 0) {
      return;
    }

    const item = cartItems[index];
    if (!item) return;

    if (newQuantity === 0) {
      removeFromCart(item.product.id, item.size);
    } else {
      handleQuantityChange(index, newQuantity);
    }
  }, [handleQuantityChange, removeFromCart, cartItems]);

  // Suppression optimisée d'un article
  const removeFromCartMemoized = useCallback((id, size) => {
    removeFromCart(id, size);
  }, [removeFromCart]);

  // Réinitialisation lors de la fermeture
  useEffect(() => {
    if (!open) {
      setDelivery(false);
    }
  }, [open]);

  // Gestion de la confirmation de commande
  const handleConfirmOrder = useCallback(() => {
    setOpenConfirmationDialog(true);
  }, []);

  // Paiement Stripe optimisé
  const handleStripePayment = useCallback(async (formData) => {
    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
      
      // Création des articles Stripe simplifiée (sans promo)
      const stripeLineItems = cartItems.map(item => {
        const basePrice = item.product?.prix !== undefined ? 
                        item.product.prix : 
                        item.product[`prix_${item.size}`] || 0;

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Chogan: ${item.product?.code_produit}`,
              description: item.size,
            },
            unit_amount: Math.round(basePrice * 100),
          },
          quantity: item.quantity,
        };
      });

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          deliveryFee,
          amountPromo: 0, // Codes promo suspendus
          totalPrice: totalPrice,
          lineItems: stripeLineItems,
          isDelivery: delivery,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Erreur lors de la création de la session Stripe.");
      }

      if (responseData.sessionId) {
        await stripe.redirectToCheckout({ sessionId: responseData.sessionId });
        updateCartItems([]);
      } else {
        console.error("Aucun session ID reçu de Stripe.");
      }
    } catch (error) {
      console.error("Erreur de paiement Stripe:", error.message);
    }
  }, [cartItems, deliveryFee, totalPrice, delivery, updateCartItems]);

  // Fonction pour obtenir le nom d'affichage du produit
  const getProductDisplayName = useCallback((product) => {
    if (product?.nom_produit?.startsWith("Diffuseur")) {
      return product.categorie;
    }
    return product?.nom_marque || product?.sous_categorie || product?.nom_produit;
  }, []);

  // Rendu conditionnel pour panier vide
  if (!cartItems || cartItems.length === 0) {
    return (
      <Dialog open={open} onClose={handleCloseCart} fullWidth maxWidth="md">
        <DialogTitle>Votre panier</DialogTitle>
        <DialogContent>
          <Typography variant="h6" align="center">
            Votre panier est vide.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="secondary" onClick={handleCloseCart}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const isFreeShipping = subtotal > SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD;

  return (
    <Dialog open={open} onClose={handleCloseCart} fullWidth maxWidth="md">
      <DialogTitle>Récapitulatif de votre panier</DialogTitle>
      <DialogContent>

        {/* Liste des articles */}
        {cartItems.map((item, index) => {
          const basePrice = item.product?.prix !== undefined ? 
                          item.product.prix : 
                          item.product[`prix_${item.size}`] || 0;
          const itemTotal = basePrice * item.quantity;

          return (
            <Grid
              container
              key={`${item.product.id}-${item.size}-${index}`}
              spacing={2}
              sx={{ 
                mb: 2, 
                pb: 2, 
                borderBottom: "1px solid #ddd", 
                alignItems: "center" 
              }}
            >
              {/* Informations du produit */}
              <Grid item xs={12} sm={8}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Chogan: {item.product?.code_produit}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {getProductDisplayName(item.product)} - {item.size}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                  Prix unitaire: {basePrice.toFixed(2)}€ | Total: {itemTotal.toFixed(2)}€
                </Typography>
              </Grid>

              {/* Contrôles de quantité */}
              <Grid
                item
                xs={12}
                sm={4}
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "flex-end",
                  gap: 1
                }}
              >
                <IconButton 
                  onClick={() => handleQuantityChangeMemoized(index, item.quantity - 1)}
                  size="small"
                  disabled={item.quantity <= 1}
                >
                  <Remove />
                </IconButton>
                
                <TextField
                  value={item.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value > 0) {
                      handleQuantityChangeMemoized(index, value);
                    }
                  }}
                  variant="outlined"
                  size="small"
                  type="number"
                  inputProps={{ min: 1, max: 99, style: { textAlign: 'center' } }}
                  sx={{ width: "60px" }}
                />
                
                <IconButton 
                  onClick={() => handleQuantityChangeMemoized(index, item.quantity + 1)}
                  size="small"
                >
                  <Add />
                </IconButton>
                
                <IconButton 
                  color="error" 
                  onClick={() => removeFromCartMemoized(item.product.id, item.size)}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          );
        })}

        {/* Options de livraison */}
        <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          {isFreeShipping ? (
            <Typography sx={{ color: "success.main", fontWeight: 500 }}>
              🚚 Livraison offerte via Mondial Relay 🎉
            </Typography>
          ) : (
            <>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={delivery} 
                    onChange={(e) => setDelivery(e.target.checked)} 
                  />
                }
                label="Souhaitez-vous une livraison ?"
              />
              <Typography variant="body2" color="textSecondary">
                {delivery ? "Livraison via Mondial Relay" : "Commande à récupérer en main propre"}
              </Typography>
            </>
          )}
        </Box>

        {/* Récapitulatif des prix */}
        <Box sx={{ mt: 3, p: 2, bgcolor: "primary.light", borderRadius: 1 }}>
          <Typography align="right" variant="body1">
            Sous-total: {subtotal.toFixed(2)}€
          </Typography>
          <Typography align="right" variant="body1">
            Frais de livraison: {deliveryFee.toFixed(2)}€
          </Typography>
          <Typography align="right" variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
            Total: {totalPrice.toFixed(2)}€
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" color="secondary" onClick={handleCloseCart}>
          Annuler
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleConfirmOrder}
          size="large"
        >
          Confirmer la commande
        </Button>
      </DialogActions>

      {/* Dialog de confirmation */}
      <OrderConfirmationDialog
        open={openConfirmationDialog}
        handleClose={() => setOpenConfirmationDialog(false)}
        handlePayment={handleStripePayment}
      />
    </Dialog>
  );
};

export default CartDialog;