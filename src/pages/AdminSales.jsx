import { useState, useEffect } from 'react';
import adminService from '../api/adminService';
import { useToast } from '../context/ToastContext';
import { Search, ChevronLeft, ChevronRight, Eye, TrendingUp, TrendingDown, DollarSign, RotateCw, AlertCircle } from 'lucide-react';

const AdminSales = () => {
    const { showToast } = useToast();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSales();
    }, [status, page]);

    const loadSales = async () => {
        try {
            setLoading(true);
            const response = await adminService.getSales(status, page, 10);
            setSales(response.sales || []);
            setPagination(response.pagination);
        } catch (error) {
            showToast('Failed to load sales', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async () => {
        try {
            await adminService.updateOrderStatus(selectedOrder._id, newStatus);
            showToast('Order status updated', 'success');
            setShowModal(false);
            loadSales();
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to update status', 'error');
        }
    };

    const handleRefund = async () => {
        try {
            await adminService.refundOrder(selectedOrder._id);
            showToast('Refund initiated', 'success');
            setShowModal(false);
            loadSales();
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to process refund', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500/20 text-emerald-600';
            case 'pending':
                return 'bg-amber-500/20 text-amber-600';
            case 'refunded':
                return 'bg-red-500/20 text-red-600';
            default:
                return 'bg-slate-500/20 text-slate-600';
        }
    };

    const filteredSales = sales.filter(sale =>
        sale.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSales = sales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
    const averageOrderValue = sales.length > 0 ? totalSales / sales.length : 0;
    const refundCount = sales.filter(s => s.status === 'refunded').length;
    const totalPages = pagination?.pages || pagination?.totalPages || 1;
    const currentPage = pagination?.page || page;
    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    const getVisiblePages = () => {
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 2) {
            return [1, 2, 3];
        }

        if (currentPage >= totalPages - 1) {
            return [totalPages - 2, totalPages - 1, totalPages];
        }

        return [currentPage - 1, currentPage, currentPage + 1];
    };

    const visiblePages = getVisiblePages();

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Live Monitoring</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Sales Overview</h2>
                        <p className="text-slate-500 mt-2 text-sm">Real-time tracking of TRX transaction volume and status.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium">
                            <span>Today</span>
                        </div>
                    </div>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500">Total Sales</p>
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-900">${totalSales.toFixed(2)} <span className="text-sm font-medium text-slate-400">TRX</span></p>
                        <div className="flex items-center gap-1 mt-2 text-sm font-bold text-emerald-600">
                            <TrendingUp size={16} />
                            <span>+12.5%</span>
                            <span className="text-slate-400 font-normal ml-1">vs last month</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500">Average Order Value</p>
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-900">${averageOrderValue.toFixed(2)} <span className="text-sm font-medium text-slate-400">TRX</span></p>
                        <div className="flex items-center gap-1 mt-2 text-sm font-bold text-red-500">
                            <TrendingDown size={16} />
                            <span>-2.4%</span>
                            <span className="text-slate-400 font-normal ml-1">vs last month</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500">Refunds</p>
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                <RotateCw size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{refundCount} <span className="text-sm font-medium text-slate-400">Transactions</span></p>
                        <div className="flex items-center gap-1 mt-2 text-sm font-bold text-emerald-600">
                            <TrendingUp size={16} />
                            <span>+1.2%</span>
                            <span className="text-slate-400 font-normal ml-1">efficiency</span>
                        </div>
                    </div>
                </div>

                {/* Filters and Table Container */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Filter Bar */}
                    <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 w-64 outline-none"
                                    placeholder="Search Wallet or ID..."
                                    type="text"
                                />
                            </div>
                            <select
                                value={status || ''}
                                onChange={(e) => {
                                    setStatus(e.target.value || null);
                                    setPage(1);
                                }}
                                className="px-4 py-2 rounded-lg bg-slate-50 border-none text-sm font-medium hover:bg-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                            >
                                <option value="">Status: All</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
                                Displaying {sales.length} of {pagination?.total || 0}
                            </span>
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={!canGoPrev}
                                className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 disabled:opacity-50"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={!canGoNext}
                                className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 disabled:opacity-50"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Sales Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-widest">
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Customer Wallet</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900">
                                            {sale.orderId || `#TX-${Math.random().toString(36).substr(2, 7).toUpperCase()}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900">{new Date(sale.createdAt).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-400">{new Date(sale.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                                                    {sale.userId?.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-mono truncate w-32">
                                                    {(sale.userId?.wallet?.address?.substring(0, 8) || 'Unknown')}...
                                                    {(sale.userId?.wallet?.address?.substring((sale.userId?.wallet?.address?.length || 0) - 4) || '')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-900">${(parseFloat(sale.total) || 0).toFixed(2)}</span>
                                            <span className="text-[10px] font-bold text-slate-400 ml-1">TRX</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${getStatusColor(sale.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sale.status === 'completed' ? 'bg-emerald-600' : sale.status === 'pending' ? 'bg-amber-600' : 'bg-red-600'}`} />
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(sale);
                                                    setActionType('view');
                                                    setShowModal(true);
                                                }}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Pagination */}
                    <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-sm text-slate-500 font-medium">
                            Showing <span className="text-slate-900">{filteredSales.length}</span> transactions out of{' '}
                            <span className="text-slate-900">{pagination?.total || 0}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={!canGoPrev}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {visiblePages.map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg font-bold text-sm ${
                                            currentPage === pageNum
                                                ? 'bg-emerald-500 text-white'
                                                : 'hover:bg-slate-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                                {totalPages > 3 && currentPage < totalPages - 1 && (
                                    <>
                                        <span className="px-1">...</span>
                                        <button
                                            onClick={() => setPage(totalPages)}
                                            className="w-8 h-8 rounded-lg hover:bg-slate-100 font-bold text-sm"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={!canGoNext}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Order Details</h3>

                        {actionType === 'view' && (
                            <div className="space-y-3 mb-6">
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Order ID</p>
                                    <p className="text-sm font-bold text-slate-900">{selectedOrder.orderId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Amount</p>
                                    <p className="text-sm font-bold text-slate-900">${(parseFloat(selectedOrder.total) || 0).toFixed(2)} TRX</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Status</p>
                                    <p className={`text-sm font-bold ${
                                        selectedOrder.status === 'completed' ? 'text-emerald-600' :
                                        selectedOrder.status === 'pending' ? 'text-amber-600' :
                                        'text-red-600'
                                    }`}>
                                        {selectedOrder.status}
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    {selectedOrder.status !== 'refunded' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setActionType('status');
                                                    setNewStatus(selectedOrder.status);
                                                }}
                                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-200"
                                            >
                                                Change Status
                                            </button>
                                            {selectedOrder.status === 'completed' && (
                                                <button
                                                    onClick={() => setActionType('refund')}
                                                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100"
                                                >
                                                    Refund
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {actionType === 'status' && (
                            <div className="space-y-4 mb-6">
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        )}

                        {actionType === 'refund' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
                                <AlertCircle className="text-red-600 shrink-0" size={20} />
                                <p className="text-sm text-red-600">This action will initiate a refund to the customer's wallet.</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            {actionType !== 'view' && (
                                <button
                                    onClick={actionType === 'status' ? handleChangeStatus : handleRefund}
                                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600"
                                >
                                    {actionType === 'status' ? 'Update Status' : 'Confirm Refund'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSales;
