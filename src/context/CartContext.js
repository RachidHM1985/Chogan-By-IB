import React, { createContext, useContext, useState, useEffect } from 'react';

// Création du contexte du panier
const CartContext = createContext();

// Hook personnalisé pour accéder au CartContext
export const useCart = () => useContext(CartContext);

// Fournisseur du contexte pour le panier
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // État du panier
  const [totalPrice, setTotalPrice] = useState(0); // Total du panier
  

  // Ajout d'un produit au panier
  const addToCart = (product, size = null, quantity = 1) => {
    setCartItems((prevCart) => {
      const itemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (itemIndex !== -1) {
        return prevCart.map((item, index) =>
          index === itemIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevCart, { product, size, quantity }];
      }
    });
  };

  const updateCart = (newCartItems) => {
    setCartItems(newCartItems);
  };  

  // Suppression d'un produit du panier
  const removeFromCart = (productId, size = null) => {
    setCartItems((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.size === size))
    );
  };

  // Calcul du total du panier
  useEffect(() => {
    const beautyCategories = [
      "Soins Capillaire",
      "Hygiène bucco-dentaire",
      "Soins Visage",
      "Soins Des Mains",
      "Soins Corporels"
    ];

    const newTotal = cartItems.reduce((total, item) => {
      const isBeautyCategory = beautyCategories.includes(item.product.categorie);
      const itemPrice = isBeautyCategory
        ? item.product.prix ?? 0
        : item.size
        ? item.product[`prix_${item.size}`] ?? 0
        : item.product.prix ?? 0;
      
      return total + itemPrice * item.quantity;
    }, 0);

    setTotalPrice(newTotal);
  }, [cartItems]);

  // Obtention du nombre total d'articles dans le panier
  const getTotalQuantity = () => cartItems.reduce((total, item) => total + item.quantity, 0);

  // Vider le panier
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, updateCart, addToCart, removeFromCart, totalPrice, getTotalQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
