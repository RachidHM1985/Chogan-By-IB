import React, { createContext, useContext, useState, useEffect } from 'react';

// Création du contexte du panier
const CartContext = createContext();

// Hook pour accéder au CartContext
export const useCart = () => {
  return useContext(CartContext);
};

// Fournisseur du contexte pour le panier
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // État du panier
  const [totalPrice, setTotalPrice] = useState(0); // Total des articles du panier

  // Fonction pour ajouter un produit au panier
  const addToCart = (product, size, quantity) => {
    setCartItems((prevCart) => {
      const updatedCart = [...prevCart];
      const itemIndex = updatedCart.findIndex(item => item.product.id === product.id && item.size === size);
      
      if (itemIndex !== -1) {
        updatedCart[itemIndex].quantity += quantity; // Si l'élément existe, augmenter la quantité
      } else {
        updatedCart.push({ product, size, quantity }); // Sinon, ajouter un nouvel élément
      }
      
      return updatedCart;
    });
  };

  // Fonction pour supprimer un produit du panier
  const removeFromCart = (productId, size) => {
    const updatedCartItems = cartItems.filter((item) => item.product.id !== productId || item.size !== size);
    setCartItems(updatedCartItems); // Mettre à jour les articles du panier
    calculateTotalPrice(updatedCartItems); // Recalculer le total après suppression
  };

  // Calculer le total du panier et mettre à jour l'état totalPrice
  const calculateTotalPrice = (updatedCartItems) => {
    const newTotal = updatedCartItems.reduce((total, item) => {
      if (item.product && item.product[`prix_${item.size}`]) {
        const itemPrice = item.product[`prix_${item.size}`] * item.quantity;
        return total + itemPrice;
      } else {
        console.error(`Prix pour ${item.size} non trouvé pour ${item.product.nom_produit}`);
        return total; // Ignorer l'élément s'il manque un prix
      }
    }, 0);
  
    setTotalPrice(newTotal); // Mettre à jour le total
  };

  // Calculer le nombre total d'articles dans le panier
  const getTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Fonction pour vider le panier
  const clearCart = () => {
    setCartItems([]);
    setTotalPrice(0); // Réinitialiser le total lorsque le panier est vidé
  };

  // Effect qui recalcule le total chaque fois que `cartItems` change
  useEffect(() => {
    calculateTotalPrice(cartItems);
  }, [cartItems]); // Déclenche le calcul à chaque mise à jour du panier

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, totalPrice, getTotalQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
