import React, { createContext, useState, useEffect } from 'react';
import { getProducts, init } from '../database/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [isDbInitialized, setIsDbInitialized] = useState(false);

    // Refresh products from DB
    const refreshProducts = async () => {
        if (!isDbInitialized) return;
        const data = await getProducts();
        setProducts(data);
    };

    useEffect(() => {
        init().then(() => {
            setIsDbInitialized(true);
        });
    }, []);

    useEffect(() => {
        if (isDbInitialized) {
            refreshProducts();
        }
    }, [isDbInitialized]);

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === product.id);
            if (existing) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, qty: 1 }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const updateCartQty = (productId, qty) => {
        if (qty <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prevCart) => prevCart.map(item => item.id === productId ? { ...item, qty } : item));
    }

    const clearCart = () => {
        setCart([]);
    };

    if (!isDbInitialized) {
        return null; // Or return a loading spinner
    }

    return (
        <AppContext.Provider
            value={{
                products,
                refreshProducts,
                cart,
                addToCart,
                removeFromCart,
                updateCartQty,
                clearCart,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
