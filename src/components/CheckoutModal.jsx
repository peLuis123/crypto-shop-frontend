import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import walletService from '../api/walletService';
import orderService from '../api/orderService';
import { useCart } from '../context/CartContext';

const CheckoutModal = ({ isOpen, onClose, amount, onSuccess }) => {
    const { walletAddress, walletBalance, refreshWallet, cartItems, clearCart } = useCart();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('waiting');
    const [timeLeft, setTimeLeft] = useState(14 * 60);
    const [merchantAddress, setMerchantAddress] = useState('');
    const [transactionHash, setTransactionHash] = useState('');
    const [error, setError] = useState('');
    const [orderCreated, setOrderCreated] = useState(false);

    const exactAmount = amount;

    useEffect(() => {
        if (isOpen) {
            setMerchantAddress('TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9v');
            refreshWallet();
            const timer = setInterval(() => {
                setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleConfirmPayment = async () => {
        if (!transactionHash.trim()) {
            setError('Please enter the transaction hash');
            return;
        }

        if (amount === 0) {
            setError('Invalid amount. Cannot process payment.');
            showToast('Cannot process payment with zero amount', 'error');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const orderData = {
                products: cartItems.map(item => ({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    color: item.color
                })),
                total: amount,
                paymentMethod: 'TRC-20',
                transactionHash: transactionHash,
                walletAddress: walletAddress,
                merchantAddress: merchantAddress
            };

            const response = await orderService.createOrder(orderData);

            if (response.success) {
                setPaymentStatus('completed');
                setOrderCreated(true);
                clearCart();
                showToast('Order created successfully!', 'success');
                
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to create order. Please try again.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const hasEnoughBalance = walletBalance && walletBalance >= amount;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="border-b-4 border-blue-500 rounded-t-2xl"></div>

                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">USDT Gateway</h3>
                                <p className="text-xs text-gray-500">SECURE CHECKOUT</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-blue-500 text-sm font-semibold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Amount to Pay</p>
                        <h2 className="text-4xl font-bold text-gray-900 mb-1">{amount.toFixed(2)} <span className="text-emerald-500">USDT</span></h2>
                        <p className="text-sm text-gray-400">≈ {amount.toFixed(2)} USD</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1">TRC-20 (TRON) NETWORK ONLY</h4>
                                <p className="text-xs text-gray-600">Sending funds via any other network (like ERC-20, BEP-20) will result in <span className="font-semibold">permanent loss</span> of your assets.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-center">
                            {merchantAddress ? (
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(merchantAddress)}`}
                                    alt="QR Code"
                                    className="w-32 h-32"
                                />
                            ) : (
                                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-400">Loading...</span>
                                </div>
                            )}
                        </div>
                        <p className="text-center text-xs text-gray-500 uppercase tracking-wider mb-3">Scan QR to Pay</p>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">USDT (TRC-20) Wallet Address</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={merchantAddress}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-700"
                                />
                                <button
                                    onClick={() => copyToClipboard(merchantAddress)}
                                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Exact Amount to Send</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={exactAmount.toFixed(2)}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-700"
                                />
                                <button
                                    onClick={() => copyToClipboard(exactAmount.toFixed(2))}
                                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {walletBalance !== null && (
                        <div className={`mb-6 p-4 rounded-lg border ${hasEnoughBalance ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700">Your Wallet Balance:</span>
                                <span className={`text-lg font-bold ${hasEnoughBalance ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {walletBalance } USDT
                                </span>
                            </div>
                            {!hasEnoughBalance && (
                                <p className="text-xs text-red-600 mt-2">Insufficient balance. Please add funds to your wallet.</p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {paymentStatus === 'waiting' && (
                        <>
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Transaction Hash</label>
                                <input
                                    type="text"
                                    value={transactionHash}
                                    onChange={(e) => setTransactionHash(e.target.value)}
                                    placeholder="Enter transaction hash after sending"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-2">You can find the hash in your wallet's transaction history</p>
                            </div>

                            <button
                                onClick={handleConfirmPayment}
                                disabled={loading || !hasEnoughBalance || amount === 0}
                                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                                    loading || !hasEnoughBalance || amount === 0
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                }`}
                            >
                                {loading ? 'Processing...' : 'Confirm Payment'}
                            </button>
                        </>
                    )}

                    {paymentStatus === 'completed' && (
                        <div className="text-center">
                            <div className="mb-4">
                                <svg className="w-12 h-12 text-emerald-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-emerald-600 font-semibold">Payment received!</p>
                            <p className="text-gray-500 text-sm mt-2">Your order has been created</p>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-2 mt-6">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Secure transaction</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;