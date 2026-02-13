import { useState } from 'react';

const OrderHistory = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const stats = [
        { label: 'Total Orders', value: '128', color: 'text-gray-900' },
        { label: 'Pending Payment', value: '2', color: 'text-orange-500' },
        { label: 'TRC-20 Confirmations', value: 'Active', color: 'text-emerald-500' },
        { label: 'Account Health', value: '99%', color: 'text-gray-900' }
    ];

    const orders = [
        {
            id: '#TRX-94820',
            date: 'Oct 22, 2023 • 14:20 PM',
            products: [{ image: '🎧', count: 2 }],
            amount: '450.00',
            network: 'TRC-20',
            status: 'completed',
            statusColor: 'emerald'
        },
        {
            id: '#TRX-94819',
            date: 'Oct 21, 2023 • 09:45 AM',
            products: [{ image: '👟', count: 1 }],
            amount: '125.50',
            network: 'TRC-20',
            status: 'pending',
            statusColor: 'orange'
        },
        {
            id: '#TRX-94815',
            date: 'Oct 21, 2023 • 11:12 AM',
            products: [{ image: '🎮', count: 1 }],
            amount: '2,100.00',
            network: 'TRC-20',
            status: 'failed',
            statusColor: 'red'
        },
        {
            id: '#TRX-94812',
            date: 'Oct 18, 2023 • 16:05 PM',
            products: [{ image: '🎧', count: 1 }],
            amount: '88.20',
            network: 'TRC-20',
            status: 'completed',
            statusColor: 'emerald'
        }
    ];

    const tabs = [
        { id: 'all', label: 'All Transactions' },
        { id: 'completed', label: 'Completed' },
        { id: 'pending', label: 'Pending' },
        { id: 'cancelled', label: 'Cancelled' }
    ];

    const getStatusBadge = (status, color) => {
        const colors = {
            emerald: 'bg-emerald-100 text-emerald-600',
            orange: 'bg-orange-100 text-orange-600',
            red: 'bg-red-100 text-red-600'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
                ● {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                <p className="text-gray-500">Manage and track your TRC-20 transactions.</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-100 p-6">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
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

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Network</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-gray-900">{order.id}</p>
                                            <p className="text-xs text-gray-500">{order.date}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {order.products.map((product, idx) => (
                                                <div key={idx} className="flex items-center">
                                                    <span className="text-2xl">{product.image}</span>
                                                    {product.count > 1 && (
                                                        <span className="text-xs text-gray-500 ml-1">+{product.count - 1}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-gray-900">{order.amount} USDT</p>
                                            <p className="text-xs text-gray-400">${order.amount} USD</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-semibold">
                                            T {order.network}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(order.status, order.statusColor)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-gray-600 hover:text-emerald-500 font-semibold text-sm flex items-center gap-1">
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
                    <p className="text-sm text-gray-600">Showing <span className="font-semibold">1 - 10</span> of <span className="font-semibold">128</span> orders</p>
                    <div className="flex items-center gap-2">
                        <button className="w-10 h-10 bg-emerald-400 text-white font-semibold rounded-lg hover:bg-emerald-500 transition-all">1</button>
                        <button className="w-10 h-10 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-all">2</button>
                        <button className="w-10 h-10 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-all">3</button>
                        <button className="w-10 h-10 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-all">›</button>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-gray-900 rounded-2xl p-8 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Secure USDT Payments</h3>
                    <p className="text-gray-400 text-sm">Our platform uses the TRON Network (TRC-20) for lightning-fast transactions and minimal fees. Need help with a transaction?</p>
                </div>
                <button className="px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all">
                    Contact Support
                </button>
            </div>
        </div>
    );
};

export default OrderHistory;
