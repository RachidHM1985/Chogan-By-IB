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
console.log(cartItems)
  // Gestion du code promo avec debounce
  const debouncedPromoCode = useDebounce(promoCode, 500);


  const calculerFraisLivraison = (cartItems, totalPrice) => {
    const poidsProduit = {
      "30ml": 200,
      "50ml": 250,
      "70ml": 300,
      "75ml":300,
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
    cartItems.forEach((item) => {
      poidsTotal += (item.size ? poidsProduit[item.size] : poidsProduit[item.product.contenance]) * item.quantity;
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

  // Fonction d'application du code promo
  const applyPromoCode = () => {
    try {
      if (promoCode === "CHOGAN50") {
        let totalDiscount = 0;
        let newCartItems = [...cartItems];
  
        // Vérifier si le panier est vide
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
          throw new Error("Le panier est vide ou mal formaté.");
        }
  
        // Étendre les articles en unités distinctes
        let expandedCartItems = [];
        cartItems.forEach(item => {
          for (let i = 0; i < item.quantity; i++) {
            expandedCartItems.push({
              ...item,
              uniqueId: `${item.product.id}-${i}`,
              discounted: false, // Marquer l'article comme non réduit
            });
          }
        });
  
        console.log("Total d'articles commandés:", expandedCartItems.length);
  
        // Vérifier s'il y a au moins 2 articles pour appliquer la promo
        if (expandedCartItems.length < 2) {
          setAmountPromo(totalDiscount);
          setErrorMessage("Ajoutez au moins 2 articles pour appliquer la promotion.");
          return;
        }
  
        // Trier les articles par prix croissant (du moins cher au plus cher)
        expandedCartItems.sort((a, b) => {
          let prixA = a.product?.prix ? a.product.prix : a.product[`prix_${a.size}`] || 0;
          let prixB = b.product?.prix ? b.product.prix : b.product[`prix_${b.size}`] || 0;
          return prixA - prixB; // Tri ascendant (du moins cher au plus cher)
        });         
  
        // Déterminer combien d'articles seront réduits (toujours la moitié du total, arrondi à l'entier inférieur)
        let discountCount = Math.floor(expandedCartItems.length / 2);
        console.log("Nombre d'articles à réduire :", discountCount);
  
        let discountedItems = new Set();
        let discountApplied = 0;
  
        // Appliquer la réduction sur les articles les MOINS chers
        for (let i = 0; i < discountCount; i++) {
          let item = expandedCartItems[i];
          let prix = item.product?.prix ? item.product.prix : item.product[`prix_${item.size}`];
  
          // Vérifier si cet article peut être réduit
          if (!discountedItems.has(item.uniqueId)) {
            let discountedPrice = prix * 0.5; // 50% de réduction
            totalDiscount += prix - discountedPrice;
  
            // Marquer l'article comme réduit
            item.discounted = true;
            item.discountedPrice = discountedPrice;
            discountedItems.add(item.uniqueId);
            discountApplied++;
          }
        }
  
        console.log("Montant total de la réduction :", totalDiscount);
  
        // Mettre à jour les articles dans le panier avec les réductions
        let updatedCart = cartItems.map(item => {
          let discountedQty = 0;
  
          // Vérifier combien d'unités de cet article ont été réduites
          expandedCartItems.forEach(expItem => {
            if (expItem.product.id === item.product.id && discountedItems.has(expItem.uniqueId)) {
              discountedQty++;
            }
          });
  
          // Appliquer le prix réduit uniquement sur les articles éligibles
          return {
            ...item,
            discountedPrice: discountedQty > 0 ? item.product.prix * 0.5 : null,
            discountedQty: discountedQty
          };
        });
  
        setAmountPromo(totalDiscount);
        updateCartItems(updatedCart);
        setErrorMessage("");
      } else {
        setErrorMessage("Code promo invalide.");
      }
    } catch (error) {
      console.error("Erreur dans l'application du code promo:", error.message);
      setErrorMessage("Une erreur est survenue lors de l'application du code promo.");
    }
  };

      // Optimisation de la suppression d'article
    // Optimisation de la suppression d'article
    const removeFromCartMemoized = useCallback((id, size) => {
      removeFromCart(id, size);
      setAmountPromo(0)
    }, [removeFromCart]);
 
  // Calcul du total avec livraison et promo
useEffect(() => {
  let newTotalPrice = cartItems.reduce(
    (acc, item) => {
      const price = item.discountedPrice ?? item.product?.prix ? (item.product.prix).toFixed(2) : (item.product[`prix_${item.size}`]);
      return acc + (price * item.quantity);
    },
    0
  );

  let fraisLivraison = delivery ? calculerFraisLivraison(cartItems, newTotalPrice) : 0; // Si livraison non sélectionnée, frais à 0
  setDeliveryFee(fraisLivraison);
  setTotalPriceWithDelivery(newTotalPrice - amountPromo + fraisLivraison);
}, [cartItems, delivery, amountPromo]);

  // Optimisation du changement de quantité
  const handleQuantityChangeMemoized = useCallback((index, newQuantity) => {
    if (typeof index !== "number" || typeof newQuantity !== "number") {
      return;
    }
  
    const item = cartItems[index];
    if (!item) return; // Vérifie si l'élément existe
  
    if (newQuantity === 0) {
      removeFromCartMemoized(item.product.id, item.size);
      applyPromoCode();
      return;
    }
  
    handleQuantityChange(index, newQuantity);
    applyPromoCode();
  
    // Nettoyer l'erreur uniquement si le champ promo est vide
    if ((errorMessage === "Code promo invalide." || errorMessage === "") && !promoCode.trim()) {
      setErrorMessage("");
    }
  }, [handleQuantityChange, removeFromCartMemoized, cartItems, errorMessage, promoCode]);
  
  useEffect(() => {   
    if (!open) {
      // Réinitialiser le code promo et la réduction
      setPromoCode("");
      setAmountPromo(0);
      setErrorMessage(""); // Optionnellement, supprimer aussi le message d'erreur
    }
  }, [open]);

  const handleConfirmOrder = () => {
    setOpenConfirmationDialog(true);
  };  

  const handleStripePayment = async (formData) => {
    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
      let total = totalPriceWithDelivery - amountPromo;
  
      // Création des articles Stripe
      const stripeLineItems = cartItems.map((item) => {
        const price = item.discountedPrice || item.product?.prix || item.product?.[`prix_${item.size}`];
  
        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Chogan n°${item.product?.code_produit}`,
              code: item.product?.code_produit,
              size: item.size,
              
            },
            unit_amount: Math.round(price * 100), // Correction du calcul du prix
          },
          quantity: item.quantity,
        };
      });
  
      // Envoi des données à l'API backend
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          deliveryFee,
          amountPromo,
          totalPrice: total,
          lineItems: stripeLineItems,
        }),
      });
  
      const { sessionId } = await response.json();
      if (sessionId) {
        await stripe.redirectToCheckout({ sessionId });
      } else {
        console.error("No session ID received from Stripe.");
      }
    } catch (error) {
      console.error("Erreur de paiement Stripe:", error);
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
