import { createContext, useContext, useState, useEffect } from 'react';
import walletService from '../api/walletService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [walletBalance, setWalletBalance] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);
    const [walletLoading, setWalletLoading] = useState(false);

    useEffect(() => {
        // Solo cargar wallet info si hay usuario autenticado
        if (isAuthenticated && user) {
            loadWalletInfo();
        } else {
            // Limpiar datos del wallet si no hay usuario
            setWalletBalance(null);
            setWalletAddress(null);
        }
    }, [isAuthenticated, user]);

    const loadWalletInfo = async () => {
        // Verificar que hay usuario antes de hacer la petición
        if (!isAuthenticated) return;
        
        try {
            setWalletLoading(true);
            const wallet = await walletService.getWalletInfo();
            setWalletBalance(wallet.balance);
            setWalletAddress(wallet.address);
        } catch (error) {
        } finally {
            setWalletLoading(false);
        }
    };

    const addToCart = (product) => {
        const existingItem = cartItems.find(item => item._id === product._id);

        if (existingItem) {
            setCartItems(cartItems.map(item =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item._id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCartItems(cartItems.map(item => {
            if (item._id === productId) {
                const newQuantity = item.quantity + delta;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartItemCount,
            cartTotal,
            walletBalance,
            walletAddress,
            walletLoading,
            loadWalletInfo,
            refreshWallet: loadWalletInfo
        }}>
            {children}
        </CartContext.Provider>
    );
};
