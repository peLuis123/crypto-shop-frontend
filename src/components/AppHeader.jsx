import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const AppHeader = ({ showSearch = true, showCart = true }) => {
    const { cartItemCount, walletAddress, walletBalance, walletLoading } = useCart();
    const { user } = useAuth();
    const shortWallet = walletAddress
        ? `${walletAddress.substring(0, 5)}...${walletAddress.substring(walletAddress.length - 4)}`
        : 'Wallet not linked';
    const walletBalanceLabel = walletLoading
        ? 'Loading...'
        : `${(parseFloat(walletBalance) || 0).toFixed(2)} TRX`;
    const userName = user?.username || `${user?.role === 'admin' ? 'Admin' : 'TRC-20'} User`;
    const userInitial = userName.charAt(0).toUpperCase();
    const roleLabel = user?.role === 'admin' ? 'Administrator' : 'User';

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200/80 px-8 py-3">
            <div className="flex items-center justify-between gap-4">
                {showSearch ? (
                    <div className="flex-1 max-w-2xl">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search products, brands, or categories..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </div>
                    </div>
                ) : (
                    <div />
                )}

                <div className="flex items-center gap-3 ml-2">
                    <div className="hidden lg:flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 border border-slate-200">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <div className="leading-tight">
                            <p className="text-slate-800 font-bold text-sm">{walletBalanceLabel}</p>
                            <p className="font-mono text-[11px] text-slate-500">{shortWallet}</p>
                        </div>
                    </div>
                    {showCart && (
                        <button className="relative p-2.5 hover:bg-slate-100 rounded-xl border border-slate-200 bg-white transition-all">
                            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    )}
                    <div className="hidden md:flex items-center gap-3 border-l border-slate-200 pl-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                            {userInitial}
                        </div>
                        <div className="leading-tight">
                            <p className="text-slate-800 font-bold text-sm">{userName}</p>
                            <p className="text-emerald-500 text-xs font-semibold">{roleLabel}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
