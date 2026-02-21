import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import walletService from '../api/walletService';

const PaymentHistory = () => {
    const { showToast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await walletService.getWalletTransactions();
            setTransactions(response.transactions || response || []);
        } catch (err) {
            showToast('Failed to load payment history', 'error');
            setError('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = activeFilter === 'all'
        ? transactions
        : transactions.filter(t => t.type === activeFilter);

    const getTransactionIcon = (type) => {
        const icons = {
            purchase: '🛒',
            refund: '↩️',
            deposit: '⬆️',
            withdrawal: '⬇️'
        };
        return icons[type] || '💳';
    };

    const getTransactionColor = (type) => {
        const colors = {
            purchase: 'emerald',
            refund: 'blue',
            deposit: 'green',
            withdrawal: 'orange'
        };
        return colors[type] || 'gray';
    };

    const getStatusBadge = (status, type) => {
        const statusColors = {
            pending: 'bg-orange-100 text-orange-600',
            confirmed: 'bg-emerald-100 text-emerald-600',
            failed: 'bg-red-100 text-red-600'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
                ● {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filterOptions = [
        { id: 'all', label: 'All Transactions' },
        { id: 'purchase', label: 'Purchases' },
        { id: 'refund', label: 'Refunds' },
        { id: 'deposit', label: 'Deposits' },
        { id: 'withdrawal', label: 'Withdrawals' }
    ];

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
                <p className="text-gray-500">View all your USDT transactions on the TRON network.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase mb-1">Total Transactions</p>
                        <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {transactions
                                .filter(t => t.type === 'purchase')
                                .reduce((sum, t) => sum + t.amount, 0)
                                .toFixed(2)} USDT
                        </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase mb-1">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {transactions.filter(t => t.status === 'pending').length}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    {filterOptions.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                activeFilter === filter.id
                                    ? 'bg-emerald-400 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin mb-4">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <p className="text-gray-500">Loading transactions...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={loadTransactions}
                            className="mt-4 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No transactions found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Hash</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                                                <span className="font-semibold text-gray-900 capitalize">{transaction.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{formatDate(transaction.createdAt)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-900">{transaction.amount.toFixed(2)} {transaction.currency || 'USDT'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-mono text-gray-500 truncate max-w-xs">
                                                {transaction.transactionHash ? transaction.transactionHash.substring(0, 12) + '...' : '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(transaction.status, transaction.type)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
