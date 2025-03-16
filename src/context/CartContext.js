import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Création du contexte du panier
const CartContext = createContext();

// Hook personnalisé pour accéder au CartContext
export const useCart = () => useContext(CartContext);

// Fournisseur du contexte pour le panier
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // État du panier
  const [totalPrice, setTotalPrice] = useState(0); // Total du panier
  
  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Sauvegarde du panier dans localStorage à chaque mise à jour
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Liste des catégories beauté et Brilhome
  const beautyCategories = [
    "Soins Capillaire",
    "Hygiène bucco-dentaire",
    "Soins Visage",
    "Soins Des Mains",
    "Soins Corporels"
  ];
  
  const brilhomeCategories = [
    "Produits ménagers",
    "Liquide Vaisselle",
    "Lessive",
    "Nettoyants",
    "Désinfectants"
  ];

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

  // Mise à jour du panier entier
  const updateCart = (newCartItems) => {
    setCartItems(newCartItems);
  };

  const removeFromCart = (productId, size = null) => {
    setCartItems((prevCart) => 
      prevCart
        .filter(item => !(item.product.id === productId && (item.size === size || size === null))) // Supprime l'élément avec le bon id et la bonne taille
    );
  };
  

  // Mise à jour directe de la quantité
  const updateItemQuantity = (productId, size, newQuantity) => {
    setCartItems(prevCart => 
      prevCart.map(item =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Calcul du total du panier
  useEffect(() => {
    const newTotal = cartItems.reduce((total, item) => {
      const isBeautyCategory = beautyCategories.includes(item.product.categorie);
      const isBrilhomeCategory = brilhomeCategories.includes(item.product.categorie);

      let itemPrice = 0;

      if (isBeautyCategory) {
        itemPrice = parseFloat(item.product.prix) || 0;
      } else if (isBrilhomeCategory) {
        itemPrice = parseFloat(item.product.prix) || 0;
      } else {
        itemPrice = item.size && item.product[`prix_${item.size}`]
          ? parseFloat(item.product[`prix_${item.size}`]) || 0
          : parseFloat(item.product.prix) || 0;
      }

      return total + itemPrice * item.quantity;
    }, 0);

    setTotalPrice(newTotal);
  }, [cartItems]);

  // Optimisation du calcul du nombre total d'articles
  const totalQuantity = useMemo(() => 
    cartItems.reduce((total, item) => total + item.quantity, 0), 
  [cartItems]);

  // Vider le panier
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{
      cartItems,
      updateCart,
      addToCart,
      removeFromCart,
      updateItemQuantity,
      totalPrice,
      totalQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
