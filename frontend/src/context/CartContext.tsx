import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  brandName?: string;
  stock: number; // Tồn kho thực tế
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any) => {
    let isNew = false;
    let overStock = false;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // Kiểm tra tồn kho
        if (existingItem.quantity + 1 > (product.currentStock ?? existingItem.stock)) {
          overStock = true;
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      if ((product.currentStock ?? 0) <= 0) {
        overStock = true;
        return prevCart;
      }

      isNew = true;
      return [...prevCart, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.image,
        brandName: product.brand?.name,
        quantity: 1,
        stock: product.currentStock
      }];
    });

    if (overStock) {
      message.error(`Sản phẩm ${product.name} đã đạt giới hạn tồn kho!`);
      return;
    }

    if (isNew) {
      message.success(`Đã thêm ${product.name} vào giỏ hàng`);
    } else {
      message.success(`Đã tăng số lượng ${product.name}`);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    message.info(' Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          if (quantity > item.stock) {
            message.warning(`Sản phẩm ${item.name} chỉ còn ${item.stock} trong kho!`);
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
