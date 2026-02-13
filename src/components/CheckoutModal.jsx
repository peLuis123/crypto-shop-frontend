import { useState, useEffect } from 'react';
import axios from '../api/axios';

const CheckoutModal = ({ isOpen, onClose, amount, onSuccess }) => {
    const [walletBalance, setWalletBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('waiting');
    const [timeLeft, setTimeLeft] = useState(14 * 60);
    const merchantAddress = 'TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9v';
    const exactAmount = amount;

    useEffect(() => {
        if (isOpen) {
            fetchWalletBalance();
            const timer = setInterval(() => {
                setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    const fetchWalletBalance = async () => {
        try {
            setLoading(true);
            const userWallet = 'TXyBj...kK9zw4pXQv';
            const response = await axios.get(`/wallet/balance/${userWallet}`);
            setWalletBalance(response.data);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    if (!isOpen) return null;

    const hasEnoughBalance = walletBalance && walletBalance.usdt >= amount;

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
                            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
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
                            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-400">QR CODE</span>
                            </div>
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

                    {walletBalance && (
                        <div className={`mb-6 p-4 rounded-lg border ${hasEnoughBalance ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700">Your Wallet Balance:</span>
                                <span className={`text-lg font-bold ${hasEnoughBalance ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {walletBalance.usdt.toFixed(2)} USDT
                                </span>
                            </div>
                            {!hasEnoughBalance && (
                                <p className="text-xs text-red-600 mt-2">Insufficient balance. Please add funds to your wallet.</p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Waiting for payment...</span>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-xs text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            SSL ENCRYPTED
                        </span>
                    </div>

                    <div className="flex gap-3 text-xs">
                        <button className="flex-1 py-2 text-blue-500 hover:text-blue-600 font-semibold">
                            SUPPORT CENTER
                        </button>
                        <button className="flex-1 py-2 text-blue-500 hover:text-blue-600 font-semibold">
                            TRANSACTION DETAILS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
