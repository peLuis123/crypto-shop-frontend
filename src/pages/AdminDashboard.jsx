import { useState, useEffect } from 'react';
import adminService from '../api/adminService';
import { useToast } from '../context/ToastContext';
import { Wallet, ShoppingBag, Users, Layers, Diamond, ShoppingCart, Coins, Download, ExternalLink } from 'lucide-react';

const AdminDashboard = () => {
    const { showToast } = useToast();
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartPeriod, setChartPeriod] = useState('month');
    const [recentSalesPage, setRecentSalesPage] = useState(1);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const response = await adminService.getStats();
            setStats(response.stats || null);
            setChartData(response.chartData || []);
            setRecentSales(response.recentSales || []);
            setTopProducts(response.topProducts || []);
        } catch (error) {
            showToast('Failed to load stats', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredChartData = chartPeriod === 'week'
        ? chartData.slice(-7)
        : chartData.slice(-30);
    const salesPageSize = 8;
    const recentSalesTotalPages = Math.max(1, Math.ceil(recentSales.length / salesPageSize));
    const paginatedRecentSales = recentSales.slice(
        (recentSalesPage - 1) * salesPageSize,
        recentSalesPage * salesPageSize
    );

    const labelStep = Math.max(1, Math.floor(filteredChartData.length / 6));
    const chartLabels = filteredChartData
        .filter((_, index) => index % labelStep === 0)
        .slice(0, 6)
        .map((point) => {
            const date = new Date(point.date);
            return chartPeriod === 'week'
                ? date.toLocaleDateString('en-US', { weekday: 'short' })
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

    const StatCard = ({ icon: Icon, label, value, percentage, isPositive = true, color = 'primary' }) => {
        const colorClasses = {
            primary: 'bg-emerald-50 text-emerald-600',
            blue: 'bg-blue-50 text-blue-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600'
        };

        const percentageClasses = {
            primary: 'bg-emerald-50 text-emerald-600',
            blue: 'bg-blue-50 text-blue-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600',
            red: 'bg-red-50 text-red-600'
        };

        return (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
                        <Icon size={20} strokeWidth={2} />
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? percentageClasses[color] : percentageClasses.red}`}>
                        {percentage}
                    </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900">{value}</h3>
            </div>
        );
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={Wallet}
                        label="Total Revenue (TRX)"
                        value={`${(parseFloat(stats?.totals?.totalRevenue) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                        percentage={`${(parseFloat(stats?.trends?.revenueChange) || 0) >= 0 ? '+' : ''}${(parseFloat(stats?.trends?.revenueChange) || 0).toFixed(1)}%`}
                        color="primary"
                        isPositive={(parseFloat(stats?.trends?.revenueChange) || 0) >= 0}
                    />
                    <StatCard
                        icon={ShoppingBag}
                        label="Total Orders"
                        value={(parseFloat(stats?.totals?.totalOrders) || 0).toLocaleString()}
                        percentage={`${(parseFloat(stats?.trends?.ordersChange) || 0) >= 0 ? '+' : ''}${(parseFloat(stats?.trends?.ordersChange) || 0).toFixed(1)}%`}
                        color="blue"
                        isPositive={(parseFloat(stats?.trends?.ordersChange) || 0) >= 0}
                    />
                    <StatCard
                        icon={Users}
                        label="Active Users"
                        value={(parseFloat(stats?.totals?.activeUsers) || 0).toLocaleString()}
                        percentage={`${(parseFloat(stats?.trends?.usersChange) || 0) >= 0 ? '+' : ''}${(parseFloat(stats?.trends?.usersChange) || 0).toFixed(1)}%`}
                        color="purple"
                        isPositive={(parseFloat(stats?.trends?.usersChange) || 0) >= 0}
                    />
                    <StatCard
                        icon={Layers}
                        label="Network Fees (TRC-20)"
                        value={`${(parseFloat(stats?.totals?.networkFees) || 0).toFixed(2)} TRX`}
                        percentage={`${(parseFloat(stats?.trends?.feesChange) || 0) >= 0 ? '+' : ''}${(parseFloat(stats?.trends?.feesChange) || 0).toFixed(1)}%`}
                        color="orange"
                        isPositive={(parseFloat(stats?.trends?.feesChange) || 0) >= 0}
                    />
                </div>

                {/* Charts and Top Products */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Revenue Over Time</h3>
                                <p className="text-sm text-slate-500 font-medium">Performance tracking for TRX sales ({chartPeriod === 'week' ? 'Last 7 days' : 'Last 30 days'})</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setChartPeriod('week')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                                        chartPeriod === 'week'
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => setChartPeriod('month')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                                        chartPeriod === 'month'
                                            ? 'bg-emerald-500 text-white border-emerald-500'
                                            : 'border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    Month
                                </button>
                            </div>
                        </div>
                        <div className="h-64 relative">
                            {filteredChartData.length > 0 ? (
                                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                                    <defs>
                                        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#13ec5b" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#13ec5b" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {(() => {
                                        const data = filteredChartData;
                                        const maxRevenue = Math.max(...data.map(d => parseFloat(d.revenue) || 0), 1);
                                        const pathData = data.map((point, i) => {
                                            const x = (i / (data.length - 1)) * 100;
                                            const y = 40 - ((parseFloat(point.revenue) || 0) / maxRevenue) * 35;
                                            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                                        }).join(' ');
                                        return (
                                            <>
                                                <path d={`${pathData} L100,40 L0,40 Z`} fill="url(#gradient)" />
                                                <path d={pathData} fill="none" stroke="#13ec5b" strokeWidth="0.5" />
                                            </>
                                        );
                                    })()}
                                </svg>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">No chart data available</div>
                            )}
                            <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 pt-4">
                                {chartLabels.map((label) => (
                                    <span key={label} className="text-[10px] text-slate-400 font-medium">{label}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Selling Products */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Top Selling</h3>
                            <p className="text-sm text-slate-500 font-medium">Best performers by volume</p>
                        </div>
                        <div className="space-y-4">
                            {topProducts.slice(0, 3).map((product, index) => {
                                const icons = [Diamond, ShoppingCart, Coins];
                                const Icon = icons[index % 3];
                                return (
                                    <div key={product._id || index} className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-slate-400">
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{product.name?.substring(0, 20) || 'Product'}</p>
                                            <p className="text-xs text-slate-500">{parseInt(product.quantitySold) || 0} Sold</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-slate-900">{(parseFloat(product.revenue) || 0).toLocaleString()} TRX</p>
                                            <p className={`text-xs font-bold ${(parseFloat(product.trend) || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {(parseFloat(product.trend) || 0) >= 0 ? '+' : ''}{(parseFloat(product.trend) || 0).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="w-full mt-6 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                            View All Products
                        </button>
                    </div>
                </div>

                {/* Recent Transactions Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-slate-900">Recent Transactions</h3>
                        <button className="flex items-center gap-2 text-sm font-bold text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors">
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (TRX)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">TXID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedRecentSales.map((sale, index) => (
                                    <tr key={sale._id || index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-sm text-slate-900">{sale._id?.substring(0, 8)?.toUpperCase() || `#ORD-${9023 - index}`}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                            {sale.createdAt 
                                                ? new Date(sale.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' • ' + new Date(sale.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                                : 'N/A'
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{(parseFloat(sale.totalAmount || sale.total) || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                sale.status === 'completed' 
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : sale.status === 'pending'
                                                    ? 'bg-amber-500/10 text-amber-600'
                                                    : sale.status === 'refunded'
                                                    ? 'bg-red-500/10 text-red-600'
                                                    : 'bg-slate-500/10 text-slate-600'
                                            }`}>
                                                {(sale.status || 'Pending').charAt(0).toUpperCase() + (sale.status || 'Pending').slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {sale.transactionHash || sale.txHash ? (
                                                <a href={`https://nile.tronscan.org//#/transaction/${sale.transactionHash || sale.txHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-500 font-medium hover:underline">
                                                    <span>{(sale.transactionHash || sale.txHash).substring(0, 8)}...{(sale.transactionHash || sale.txHash).substring((sale.transactionHash || sale.txHash).length - 4)}</span>
                                                    <ExternalLink size={14} />
                                                </a>
                                            ) : (
                                                <span className="text-sm text-slate-400 font-medium">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium">Showing {paginatedRecentSales.length} of {recentSales.length} transactions</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setRecentSalesPage((prev) => Math.max(1, prev - 1))}
                                disabled={recentSalesPage === 1}
                                className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setRecentSalesPage((prev) => Math.min(recentSalesTotalPages, prev + 1))}
                                disabled={recentSalesPage === recentSalesTotalPages}
                                className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
