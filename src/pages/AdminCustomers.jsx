import { useState, useEffect } from 'react';
import adminService from '../api/adminService';
import { useToast } from '../context/ToastContext';
import { Search, Download, Eye, Ban, ChevronLeft, ChevronRight, Users, Zap, Shield, AlertCircle } from 'lucide-react';

const AdminCustomers = () => {
    const { showToast } = useToast();
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState(null); // 'view', 'block'

    useEffect(() => {
        loadCustomers();
    }, [page, searchQuery]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getCustomers(searchQuery, page, 10);
            setCustomers(response.users || []);
            setStats(response.stats);
            setPagination(response.pagination);
        } catch (error) {
            showToast('Failed to load customers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const filteredCustomers = customers;

    const handleViewCustomer = (customer) => {
        setSelectedCustomer(customer);
        setActionType('view');
        setShowModal(true);
    };

    const handleBlockCustomer = (customer) => {
        setSelectedCustomer(customer);
        setActionType('block');
        setShowModal(true);
    };

    const confirmBlockCustomer = async () => {
        try {
            await adminService.blockCustomer(selectedCustomer._id, false);
            showToast('Customer blocked successfully', 'success');
            setShowModal(false);
            loadCustomers();
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to block customer', 'error');
        }
    };

    const copyWalletAddress = (address) => {
        navigator.clipboard.writeText(address);
        showToast('Wallet address copied', 'success');
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading...</div>;
    }

    // Pagination calculations
    const totalPages = pagination?.pages || pagination?.totalPages || 1;
    const currentPage = pagination?.page || page;
    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;
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
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, pagination?.total || 0);

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Page Title and Metrics */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Customer Management</h2>
                        <p className="text-slate-500 mt-1">Monitor user activity and TRON network transaction volume.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 min-w-55">
                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                                <Users size={20} strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Customers</p>
                                <p className="text-xl font-bold text-slate-900">
                                    {(parseFloat(stats?.total) || 0).toLocaleString()}
                                    <span className="text-xs text-emerald-600 font-normal ml-1">+12%</span>
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 min-w-55">
                            <div className="bg-cyan-50 text-cyan-600 p-2 rounded-lg">
                                <Zap size={20} strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TRX Volume</p>
                                <p className="text-xl font-bold text-slate-900">
                                    {(parseFloat(stats?.totalVolume) || 0).toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 0 })}
                                    <span className="text-xs text-emerald-600 font-normal ml-1">+8.2%</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customers Table Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header with Search and Export */}
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4">
                        <div className="flex-1 relative max-w-md">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or TRON wallet address..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors">
                            <Download size={16} />
                            <span>Export List</span>
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">TRON Wallet Address</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Spent (TRX)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joining Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                                                        {getInitials(customer.username)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900 leading-none">{customer.username}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{customer.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 group">
                                                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                                                        {customer.wallet?.address ? `${customer.wallet.address.substring(0, 7)}...${customer.wallet.address.substring(customer.wallet.address.length - 5)}` : '-'}
                                                    </code>
                                                    {customer.wallet?.address && (
                                                        <button
                                                            onClick={() => copyWalletAddress(customer.wallet.address)}
                                                            className="text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold text-slate-900">{(parseFloat(customer.totalSpent) || 0).toFixed(2)}</span>
                                                <span className="text-xs text-slate-400 font-medium ml-1">TRX</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600">
                                                    {new Date(customer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewCustomer(customer)}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleBlockCustomer(customer)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <Ban size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                            No customers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Showing <span className="font-bold text-slate-900">{startIndex}</span> to <span className="font-bold text-slate-900">{endIndex}</span> of <span className="font-bold text-slate-900">{pagination?.total || 0}</span> customers
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={!canGoPrev}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                            >
                                <ChevronLeft size={18} strokeWidth={2} />
                            </button>
                            {visiblePages.map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                                        currentPage === pageNum
                                            ? 'bg-emerald-500 text-white'
                                            : 'hover:bg-slate-100'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            {totalPages > 5 && currentPage < totalPages - 2 && <span className="mx-1 text-slate-400 text-xs">...</span>}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <button
                                    onClick={() => setPage(totalPages)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                                        currentPage === totalPages
                                            ? 'bg-emerald-500 text-white'
                                            : 'hover:bg-slate-100'
                                    }`}
                                >
                                    {totalPages}
                                </button>
                            )}
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={!canGoNext}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                            >
                                <ChevronRight size={18} strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <AlertCircle size={16} className="text-emerald-600" />
                            Data Refresh
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">Transaction totals are calculated in real-time from the TRON blockchain explorer API. Last updated: 2 mins ago.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Shield size={16} className="text-emerald-600" />
                            Security Filter
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">Automatic flagging enabled for transactions exceeding 50,000 TRX within a 24-hour period.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <AlertCircle size={16} className="text-emerald-600" />
                            Admin Support
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">Need custom reporting? Contact our engineering team at dev-support@cryptopay.com</p>
                    </div>
                </div>
            </div>

            {/* View Customer Modal */}
            {showModal && actionType === 'view' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Customer Details</h3>
                        <div className="space-y-4 mb-6">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Name</p>
                                <p className="text-sm text-slate-900 mt-1">{selectedCustomer?.username}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                                <p className="text-sm text-slate-900 mt-1">{selectedCustomer?.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Wallet Address</p>
                                <p className="text-xs text-slate-900 mt-1 break-all font-mono">{selectedCustomer?.wallet?.address || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Total Spent</p>
                                <p className="text-sm text-slate-900 mt-1">{(parseFloat(selectedCustomer?.totalSpent) || 0).toFixed(2)} TRX</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Member Since</p>
                                <p className="text-sm text-slate-900 mt-1">
                                    {new Date(selectedCustomer?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Block Customer Modal */}
            {showModal && actionType === 'block' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 border border-slate-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-50 mb-4">
                            <AlertCircle size={24} className="text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Block Customer?</h3>
                        <p className="text-sm text-slate-600 mb-6">
                            Are you sure you want to block <strong>{selectedCustomer?.username}</strong>? They will no longer be able to make purchases.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBlockCustomer}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                            >
                                Block Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
