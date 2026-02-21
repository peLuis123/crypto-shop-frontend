import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const CartModal = ({ isOpen, onClose, cartItems, onCheckout }) => {
    const { updateQuantity: updateCartQuantity, removeFromCart } = useCart();
    const { showToast } = useToast();
    if (!isOpen) return null;

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updateQuantity = (itemId, delta) => {
        updateCartQuantity(itemId, delta);
        if (delta > 0) {
            showToast('Quantity updated', 'info');
        }
    };

    const removeItem = (itemId) => {
        removeFromCart(itemId);
        showToast('Item removed from cart', 'error');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                        <span className="text-emerald-500 font-semibold text-sm">{cartItems.length} ITEMS</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {cartItems.length === 0 ? (
                        <div className="col-span-3 text-center py-16">
                            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                            <p className="text-gray-500 mb-6">Add some products to get started!</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <>
                    <div className="col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item._id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-white" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                                    <p className="text-xs text-gray-500">Color: {item.color || 'N/A'}</p>
                                    <button onClick={() => removeItem(item._id)} className="text-xs text-red-500 hover:text-red-600 font-semibold mt-1">
                                        🗑 REMOVE
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity(item._id, -1)} className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100">-</button>
                                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item._id, 1)} className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100">+</button>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">{item.price.toFixed(2)} USDT</p>
                                    <p className="text-xs text-gray-400">TRC-20 Network</p>
                                </div>
                            </div>
                        ))}

                        <button onClick={onClose} className="flex items-center gap-2 text-emerald-500 hover:text-emerald-600 font-semibold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Continue Shopping
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 h-fit">
                        <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                        
                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-900">Total Amount</span>
                                <span className="text-2xl font-bold text-emerald-500">{total.toFixed(2)} USDT</span>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                TRON (TRC-20) INSTANT CONFIRMATION
                            </p>
                        </div>

                        <button
                            onClick={onCheckout}
                            disabled={cartItems.length === 0 || total === 0}
                            className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-400"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Proceed to Checkout
                        </button>

                        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                SECURE
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                AES-256
                            </span>
                        </div>

                        <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">PURCHASE PROTECTION</h4>
                                    <p className="text-xs text-gray-600">Your payment is protected by our decentralized escrow system. Funds are only released after delivery confirmation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartModal;
