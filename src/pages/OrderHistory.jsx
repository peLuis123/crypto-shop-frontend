import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { useCart } from '../context/CartContext';
import orderService from '../api/orderService';

const OrderHistory = () => {
    const { showToast } = useToast();
    const { onTransactionConfirmed } = useSocket();
    const { refreshWallet } = useCart();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [statusStats, setStatusStats] = useState({ total: 0, completed: 0, pending: 0, refunded: 0 });
    const [totalSpentValue, setTotalSpentValue] = useState(0);
    const itemsPerPage = 10;

    const tabs = [
        { id: 'all', label: 'All Transactions' },
        { id: 'completed', label: 'Completed' },
        { id: 'pending', label: 'Pending' },
        { id: 'refunded', label: 'Refunded' },
        { id: 'cancelled', label: 'Cancelled' }
    ];

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const statusParam = activeTab !== 'all' ? activeTab : undefined;
            const response = await orderService.getUserOrders({
                page: currentPage,
                limit: itemsPerPage,
                status: statusParam
            });
            const ordersData = response.orders || response;
            const paginationData = response.pagination || { total: ordersData.length, page: 1, pages: 1 };
            setOrders(ordersData);
            setPagination(paginationData);
            setStatusStats(response.stats || {
                total: paginationData.total,
                completed: 0,
                pending: 0,
                refunded: 0
            });

            if (activeTab === 'all') {
                let sourceOrders = ordersData;
                if ((paginationData.total || 0) > ordersData.length) {
                    const allOrdersResponse = await orderService.getUserOrders({ page: 1, limit: paginationData.total });
                    sourceOrders = allOrdersResponse.orders || [];
                }

                const completedAmount = sourceOrders
                    .filter(order => order.status === 'completed')
                    .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
                const refundedAmount = sourceOrders
                    .filter(order => order.status === 'refunded')
                    .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
                setTotalSpentValue(completedAmount - refundedAmount);
            } else {
                const completedAmount = ordersData
                    .filter(order => order.status === 'completed')
                    .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
                const refundedAmount = ordersData
                    .filter(order => order.status === 'refunded')
                    .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
                setTotalSpentValue(completedAmount - refundedAmount);
            }
        } catch (err) {
            showToast('Failed to load orders. Please try again.', 'error');
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [activeTab, currentPage]);

    // Suscribirse a confirmaciones de transacciones
    useEffect(() => {
        if (onTransactionConfirmed) {
            const unsubscribe = onTransactionConfirmed(async (data) => {
                await loadOrders();
                await refreshWallet();
            });

            return () => unsubscribe();
        }
    }, [onTransactionConfirmed]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const filteredOrders = orders.filter(order => {
        const searchValue = searchQuery.toLowerCase();
        if (searchQuery && !(order.orderId || '').toLowerCase().includes(searchValue) && !(order.transactionHash || '').toLowerCase().includes(searchValue)) {
            return false;
        }
        return true;
    });

    const totalOrdersCount = statusStats.total || pagination?.total || orders.length;
    const completedOrdersCount = statusStats.completed || 0;
    const pendingOrdersCount = statusStats.pending || 0;
    const refundedOrdersCount = statusStats.refunded || 0;

    const totalPages = pagination?.pages || 1;
    const currentApiPage = pagination?.page || currentPage;
    const pageStartIndex = pagination?.total === 0 ? 0 : ((currentApiPage - 1) * itemsPerPage) + 1;
    const pageEndIndex = pagination?.total === 0 ? 0 : Math.min((currentApiPage - 1) * itemsPerPage + filteredOrders.length, pagination?.total || 0);

    const getVisiblePages = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, 5];
        }

        if (currentPage >= totalPages - 2) {
            return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    };

    const visiblePages = getVisiblePages();

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'emerald';
            case 'pending':
                return 'orange';
            case 'refunded':
                return 'blue';
            case 'failed':
                return 'red';
            case 'cancelled':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getStatusBadge = (status, color) => {
        const colors = {
            emerald: 'bg-emerald-100 text-emerald-600',
            orange: 'bg-orange-100 text-orange-600',
            blue: 'bg-blue-100 text-blue-600',
            red: 'bg-red-100 text-red-600',
            gray: 'bg-gray-100 text-gray-600'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
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

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const truncateHash = (hash = '') => {
        if (!hash) return '-';
        return `${hash.substring(0, 10)}...${hash.substring(hash.length - 6)}`;
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders & Payments</h1>
                <p className="text-gray-500">Track purchases, payment status, and TRC-20 transaction history in one place.</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{totalOrdersCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Spent (TRX)</p>
                    <p className="text-3xl font-bold text-gray-900">{totalSpentValue.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Order Types</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-600">Completed {completedOrdersCount}</span>
                        <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-600">Pending {pendingOrdersCount}</span>
                        <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-600">Refunded {refundedOrdersCount}</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">TRC-20 Confirmations</p>
                    <p className="text-3xl font-bold text-emerald-500">Active</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 font-semibold text-sm transition-all ${activeTab === tab.id
                                            ? 'text-emerald-500 border-b-2 border-emerald-500'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search Order ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                            <button className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm transition-all">
                                ▼ Filter
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin mb-4">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <p className="text-gray-500">Loading orders...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={loadOrders}
                            className="mt-4 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No orders found.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Network</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tx Hash</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-gray-900">{order.orderId}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {order.products.slice(0, 2).map((product, idx) => (
                                                        <div key={idx} className="flex items-center">
                                                            <span className="text-2xl">📦</span>
                                                            {product.quantity > 1 && (
                                                                <span className="text-xs text-gray-500 ml-1">x{product.quantity}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {order.products.length > 2 && (
                                                        <span className="text-xs text-gray-500">+{order.products.length - 2} more</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-gray-900">{(parseFloat(order.total) || 0).toFixed(2)} TRX</p>
                                                    <p className="text-xs text-gray-400">${(parseFloat(order.total) || 0).toFixed(2)} USD</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-semibold">
                                                    T {order.paymentMethod || 'TRC-20'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.transactionHash ? (
                                                    <a
                                                        href={`https://nile.tronscan.org//#/transaction/${order.transactionHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-mono text-blue-600 hover:underline"
                                                    >
                                                        {truncateHash(order.transactionHash)}
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(order.status, getStatusColor(order.status))}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => handleViewDetails(order)}
                                                    className="text-gray-600 hover:text-emerald-500 font-semibold text-sm flex items-center gap-1"
                                                >
                                                    Details
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-600">Showing <span className="font-semibold">{pageStartIndex} - {pageEndIndex}</span> of <span className="font-semibold">{pagination?.total || 0}</span> orders</p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentApiPage === 1}
                                    className="w-10 h-10 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-40"
                                >
                                    ‹
                                </button>
                                {visiblePages.map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`w-10 h-10 font-semibold rounded-lg transition-all ${
                                            currentApiPage === pageNumber
                                                ? 'bg-emerald-400 text-white hover:bg-emerald-500'
                                                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentApiPage === totalPages}
                                    className="w-10 h-10 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-40"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
 
            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b-4 border-emerald-500 rounded-t-2xl"></div>
                        
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.orderId}</h2>
                                    <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-semibold text-gray-500">Status</span>
                                    {getStatusBadge(selectedOrder.status, getStatusColor(selectedOrder.status))}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                                        <p className="text-2xl font-bold text-gray-900">{selectedOrder.total.toFixed(2)} TRX</p>
                                        <p className="text-xs text-gray-400">${selectedOrder.total.toFixed(2)} USD</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedOrder.paymentMethod || 'TRC-20'}</p>
                                        <p className="text-xs text-gray-400">TRON Network</p>
                                    </div>
                                </div>

                                {selectedOrder.transactionHash && (
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Transaction Hash</p>
                                        <a
                                            href={`https://nile.tronscan.org//#/transaction/${selectedOrder.transactionHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-mono text-blue-600 break-all hover:underline"
                                        >
                                            {selectedOrder.transactionHash}
                                        </a>
                                    </div>
                                )}

                                {selectedOrder.walletAddress && (
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your Wallet</p>
                                            <p className="text-xs font-mono text-gray-900 break-all">{selectedOrder.walletAddress}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Merchant Wallet</p>
                                            <p className="text-xs font-mono text-gray-900 break-all">{selectedOrder.merchantAddress || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="font-bold text-gray-900 mb-4">Products</h3>
                                <div className="space-y-3">
                                    {selectedOrder.products.map((product, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">📦</span>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{product.name}</p>
                                                    {product.color && (
                                                        <p className="text-xs text-gray-500">Color: {product.color}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500">Quantity: {product.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{product.price.toFixed(2)} TRX</p>
                                                <p className="text-xs text-gray-500">x{product.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-emerald-500">{selectedOrder.total.toFixed(2)} TRX</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={closeModal}
                                className="w-full mt-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;