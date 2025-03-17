import React, { useState, useEffect, useCallback } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Grid, IconButton, TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import { Add, Remove, Delete as DeleteIcon } from "@mui/icons-material";
import OrderConfirmationDialog from "../order/OrderConfirmationDialog ";
import { loadStripe } from '@stripe/stripe-js';     

// Hook de debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CartDialog = ({
  open,
  handleCloseCart,
  cartItems,
  handleQuantityChange,
  removeFromCart,
  updateCartItems,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [amountPromo, setAmountPromo] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalPriceWithDelivery, setTotalPriceWithDelivery] = useState(0);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  // Gestion du code promo avec debounce
  const debouncedPromoCode = useDebounce(promoCode, 500);

  // Optimisation de la suppression d'article
  const removeFromCartMemoized = useCallback((id, size) => {
    removeFromCart(id, size);    // Reset promo amount and reapply if there's still a valid promo code
   
  }, [removeFromCart]);

  // Fonction corrigée pour calculer les frais de livraison
  const calculerFraisLivraison = useCallback((cartItems, subtotalPrice) => {
    // Si le sous-total est supérieur à 80€, la livraison est gratuite
    if (subtotalPrice > 80) {
      return 0;
    }
    
    const poidsProduit = {
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
    };
  
    const tarifs = [
      { maxPoids: 500, prix: 4.99 },
      { maxPoids: 1000, prix: 6.99 },
      { maxPoids: 2000, prix: 9.99 },
      { maxPoids: 5000, prix: 14.99 },
      { maxPoids: Infinity, prix: 20.99 },
    ];
  
    let poidsTotal = 0;
    
    // Calcul du poids total en tenant compte des tailles et quantités
    cartItems.forEach((item) => {
      const taille = item.size || item.product.contenance;
      const poids = poidsProduit[taille] || 320; // Valeur par défaut si taille inconnue
      poidsTotal += poids * item.quantity;
    });
    
    // Détermination des frais de livraison en fonction du poids total
    for (let tarif of tarifs) {
      if (poidsTotal <= tarif.maxPoids) {
        return tarif.prix;
      }
    }
    
    // Si le poids dépasse tous les seuils définis, on applique le tarif maximum
    return tarifs[tarifs.length - 1].prix;
  }, []);

  // Fonction d'application du code promo
  const applyPromoCode = useCallback(() => {
    try {
      if (promoCode === "CHOGAN50") {
        let totalDiscount = 0;
  
        // Vérifier si le panier est vide
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
          setAmountPromo(0);
          setErrorMessage("Le panier est vide ou mal formaté.");
          return;
        }
  
        // Étendre les articles en unités distinctes
        let expandedCartItems = [];
        cartItems.forEach(item => {
          for (let i = 0; i < item.quantity; i++) {
            expandedCartItems.push({
              ...item,
              uniqueId: `${item.product.id}-${item.size}-${i}`,
              discounted: false,
            });
          }
        });
  
        // Vérifier s'il y a au moins 2 articles pour appliquer la promo
        if (expandedCartItems.length < 2) {
          setAmountPromo(0);
          setErrorMessage("Ajoutez au moins 2 articles pour appliquer la promotion.");
          return;
        }
  
        // Trier les articles par prix croissant
        expandedCartItems.sort((a, b) => {
          let prixA = a.product?.prix !== undefined ? a.product.prix : a.product[`prix_${a.size}`] || 0;
          let prixB = b.product?.prix !== undefined ? b.product.prix : b.product[`prix_${b.size}`] || 0;
          return prixA - prixB;
        });         
  
        // Déterminer combien d'articles seront réduits
        let discountCount = Math.floor(expandedCartItems.length / 2);
        let discountedItems = new Set();
  
        // Appliquer la réduction sur les articles les MOINS chers
        for (let i = 0; i < discountCount; i++) {
          let item = expandedCartItems[i];
          let prix = item.product?.prix !== undefined ? 
                    item.product.prix : 
                    item.product[`prix_${item.size}`] || 0;
  
          // Appliquer la réduction
          let discountedPrice = prix * 0.5;
          totalDiscount += prix - discountedPrice;
  
          // Marquer l'article comme réduit
          item.discounted = true;
          item.discountedPrice = discountedPrice;
          discountedItems.add(item.uniqueId);
        }
  
        // Mettre à jour les articles dans le panier avec les réductions
        let updatedCart = cartItems.map(item => {
          let discountedQty = 0;
  
          // Vérifier combien d'unités de cet article ont été réduites
          expandedCartItems.forEach(expItem => {
            if (expItem.product.id === item.product.id && 
                expItem.size === item.size && 
                discountedItems.has(expItem.uniqueId)) {
              discountedQty++;
            }
          });
  
          // Calculer le prix correct en fonction du produit
          const basePrice = item.product?.prix !== undefined ? 
                           item.product.prix : 
                           item.product[`prix_${item.size}`] || 0;
          
          // Appliquer le prix réduit uniquement sur les articles éligibles
          return {
            ...item,
            discountedPrice: discountedQty > 0 ? basePrice * 0.5 : null,
            discountedQty: discountedQty
          };
        });
  
        setAmountPromo(totalDiscount);
        updateCartItems(updatedCart);
        setErrorMessage("");
      } else {
        setAmountPromo(0);
        setErrorMessage("Code promo invalide.");
      }
    } catch (error) {
      console.error("Erreur dans l'application du code promo:", error.message);
      setErrorMessage("Une erreur est survenue lors de l'application du code promo.");
      setAmountPromo(0);
    }
  }, [cartItems, promoCode, updateCartItems]);
  
  // Calcul corrigé du total avec livraison et promo
  useEffect(() => {
    // Calcul du sous-total avant réduction et frais de livraison
    let subtotal = cartItems.reduce((acc, item) => {
      // Prix de base (avec ou sans taille)
      const basePrice = item.product?.prix !== undefined ? 
                      item.product.prix : 
                      item.product[`prix_${item.size}`] || 0;
      
      if (item.discountedQty && item.discountedQty > 0) {
        // Articles avec réduction partielle
        const fullPriceQty = item.quantity - item.discountedQty;
        const discountedTotal = item.discountedQty * (basePrice * 0.5);
        const fullPriceTotal = fullPriceQty * basePrice;
        return acc + discountedTotal + fullPriceTotal;
      } else {
        // Articles sans réduction
        return acc + (basePrice * item.quantity);
      }
    }, 0);
    
    // Vérifier si la livraison est gratuite (sous-total > 80€)
    const isFreeShipping = subtotal > 80;
    
    // Calculer les frais de livraison uniquement si la livraison est sélectionnée
    // et que le montant n'est pas éligible à la livraison gratuite
    const shippingCost = delivery ? 
                        (isFreeShipping ? 0 : calculerFraisLivraison(cartItems, subtotal)) : 
                        0;
    
    // Mise à jour des états
    setDeliveryFee(shippingCost);
    setTotalPriceWithDelivery(subtotal + shippingCost);
    
  }, [cartItems, delivery, calculerFraisLivraison]);

  // Réappliquer le code promo quand les articles changent
  useEffect(() => {
    if (promoCode === "CHOGAN50" && cartItems.length > 0) {
      applyPromoCode();
    }
  }, [cartItems, promoCode, applyPromoCode]);

  // Optimisation du changement de quantité
  const handleQuantityChangeMemoized = useCallback((index, newQuantity) => {
    if (typeof index !== "number" || typeof newQuantity !== "number") {
      return;
    }
  
    const item = cartItems[index];
    if (!item) return;
  
    if (newQuantity === 0) {
      removeFromCartMemoized(item.product.id, item.size);
      return;
    }
  
    // Update the quantity
    handleQuantityChange(index, newQuantity);
    
    // Cancel any applied promotion when quantity changes
    if (amountPromo > 0) {
      setAmountPromo(0);
      setErrorMessage("Promotion annulée. Veuillez réappliquer le code promo.");
      
      // Reset the discount information on all cart items
      const updatedCart = cartItems.map(cartItem => ({
        ...cartItem,
        discountedQty: 0
      }));
      updateCartItems(updatedCart);
    }
  }, [handleQuantityChange, removeFromCartMemoized, cartItems, amountPromo, updateCartItems]);

  // Réinitialiser les états quand le panier est fermé
  useEffect(() => {   
    if (!open) {
      setPromoCode("");
      setAmountPromo(0);
      setErrorMessage("");
      setDelivery(false); // Réinitialiser également l'état de livraison
    }
  }, [open]);

  const handleConfirmOrder = () => {
    setOpenConfirmationDialog(true);
  };  

  useEffect(() => {
    if (!open) {
      setAmountPromo(0);  // Réinitialiser le code promo
      setTotalPriceWithDelivery(0);  // Réinitialiser le total avec livraison
  
      // Calculer le sous-total sans la promotion et les frais de livraison
      const subtotal = cartItems.reduce((acc, item) => {
        const basePrice = item.product?.prix !== undefined 
                          ? item.product.prix 
                          : item.product[`prix_${item.size}`] || 0;
        return acc + (basePrice * item.quantity);
      }, 0);
  
      // Réinitialiser le total avec le sous-total uniquement (sans promo ni frais de livraison)
      setTotalPriceWithDelivery(subtotal);
    }
  }, [open, cartItems]);
  
  

  const handleStripePayment = async (formData) => {
    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
      
      // Vérification du code promo
      const validPromoCode = "CHOGAN50";
      const isPromoApplied = promoCode === validPromoCode && amountPromo > 0;
  
      // Si le code promo est incorrect ou non saisi, on annule la promotion
      const promoDiscount = isPromoApplied ? amountPromo : 0;
      const total = Math.max(totalPriceWithDelivery - promoDiscount, 0); // Empêcher un total négatif
  
      // Création des articles Stripe
      const stripeLineItems = [];
  
      cartItems.forEach((item) => {
        const basePrice = item.product?.prix !== undefined 
                          ? item.product.prix 
                          : item.product[`prix_${item.size}`] || 0;
  
        if (isPromoApplied && item.discountedQty && item.discountedQty > 0) {
          // Ajouter les unités à prix réduit si la promo est valide
          stripeLineItems.push({
            price_data: {
              currency: "eur",
              product_data: {
                name: `Chogan n°${item.product?.code_produit} (Promo -50%)`,
                size: `${item.size}`,
              },
              unit_amount: Math.round(basePrice * 0.5 * 100),
            },
            quantity: item.discountedQty,
          });
  
          // Ajouter les unités non réduites au prix normal
          const regularQty = item.quantity - item.discountedQty;
          if (regularQty > 0) {
            stripeLineItems.push({
              price_data: {
                currency: "eur",
                product_data: {
                  name: `Chogan n°${item.product?.code_produit}`,
                  size: `${item.size}`,
                },
                unit_amount: Math.round(basePrice * 100),
              },
              quantity: regularQty,
            });
          }
        } else {
          // Ajouter l'article normalement sans promo
          stripeLineItems.push({
            price_data: {
              currency: "eur",
              product_data: {
                name: `Chogan n°${item.product?.code_produit}`,
                size: `${item.size}`,
              },
              unit_amount: Math.round(basePrice * 100),
            },
            quantity: item.quantity,
          });
        }
      });
  
      // Envoi des données à Stripe via l'API backend
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          deliveryFee,
          amountPromo: isPromoApplied ? amountPromo : 0, // Envoi uniquement si la promo est valide
          totalPrice: total,  // Déduction correcte si promo appliquée
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
        removeFromCart();
        updateCartItems([]);
      } else {
        console.error("Aucun session ID reçu de Stripe.");
      }
    } catch (error) {
      console.error("Erreur de paiement Stripe:", error.message);
    }
  };
  
 // Si le panier est vide
 if (cartItems.length === 0) {
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

return (
<Dialog open={open} onClose={handleCloseCart} fullWidth maxWidth="md">
<DialogTitle>Récapitulatif de votre panier</DialogTitle>
<DialogContent>
  {cartItems.map((item, index) => (
    <Grid
      container
      key={index}
      spacing={2}
      sx={{ mb: 2, pb: 2, borderBottom: "1px solid #ddd", alignItems: "center" }}
    >
      {/* Infos du produit */}
      <Grid item xs={12} sm={9}>
        <Typography variant="body2">
          Chogan n°{item.product?.code_produit} -{" "}
          {item.product?.nom_marque ? item.product?.nom_marque : item.product?.sous_categorie? item.product?.sous_categorie : item.product?.nom_produit} -{" "}
          {item.size}
          <br />
          <Typography variant="body2" color="textSecondary" component="span">
            Prix :{" "}
            {item.product?.prix
              ? (item.product.prix * item.quantity).toFixed(2)
              : (item.product[`prix_${item.size}`] * item.quantity).toFixed(2)}
            €
          </Typography>
        </Typography>
      </Grid>

      {/* Actions (boutons + quantité) */}
      <Grid
        item
        xs={12}
        sm={3}
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <IconButton onClick={() => handleQuantityChangeMemoized(index, item.quantity - 1)}>
          <Remove />
        </IconButton>
        <TextField
          value={item.quantity}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) {
              handleQuantityChangeMemoized(index, value);
            }
          }}
          variant="outlined"
          size="small"
          type="number"
          inputProps={{ min: 1, max: 99 }}
          sx={{ width: "70px", textAlign: "center" }}
        />
        <IconButton onClick={() => handleQuantityChangeMemoized(index, item.quantity + 1)}>
          <Add />
        </IconButton>
        <IconButton color="error" onClick={() => removeFromCartMemoized(item.product.id, item.size)}>
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  ))}

  {/* Code promo */}
  <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
    <Grid item xs={12} sm={6} md={4}>
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
      >
        <TextField
          label="Code promo"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          fullWidth
          sx={{ mb: { xs: 2, sm: 0 }, width: { xs: "100%", sm: "60%" } }}
        />
        <Button variant="outlined" onClick={applyPromoCode} sx={{ ml: { sm: 2 } }}>
          Appliquer
        </Button>
      </Box>
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
    </Grid>
  </Grid>

  {/* Options de livraison */}
  {(totalPriceWithDelivery - deliveryFee) > 80 ? (
    <Typography sx={{ mt: 2 }}>🚚 Livraison offerte via Mondial Relay 🎉</Typography>
  ) : (
    <>
      <FormControlLabel
        control={<Checkbox checked={delivery} onChange={() => setDelivery(!delivery)} />}
        label="Souhaitez-vous une livraison ?"
      />
      <Typography sx={{ mt: 2 }}>
        {delivery ? "Livraison via Mondial Relay" : "Commande à récupérer en main propre"}
      </Typography>
    </>
  )}

  <Typography align="right">Frais de livraison : {deliveryFee.toFixed(2)}€</Typography>

  {/* Affichage de la réduction */}
  {amountPromo > 0 && (
    <Typography align="right" color="primary">
      Réduction : -{amountPromo.toFixed(2)}€
    </Typography>
  )}

  <Typography variant="h5" align="right">
    Total: {totalPriceWithDelivery.toFixed(2)}€
  </Typography>
</DialogContent>

{/* Actions */}
<DialogActions>
  <Button variant="outlined" color="secondary" onClick={handleCloseCart}>
    Annuler
  </Button>
  <Button variant="contained" color="primary" onClick={handleConfirmOrder}>
    Confirmer
  </Button>
</DialogActions>

{/* Confirmation de commande */}
<OrderConfirmationDialog
  open={openConfirmationDialog}
  handleClose={() => setOpenConfirmationDialog(false)}
  handlePayment={handleStripePayment}
/>
</Dialog>

);
};
export default CartDialog;