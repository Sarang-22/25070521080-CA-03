import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("electro_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("electro_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.quantity || 99) }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateQty = (productId, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product._id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: Math.min(newQty, item.product.quantity || 99) };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product._id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal > 4999 || subtotal === 0 ? 0 : 499;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      subtotal,
      shipping,
      total,
      totalItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

