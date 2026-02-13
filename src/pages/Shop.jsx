const Shop = () => {
    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
                <p className="text-gray-500">Pay instantly with USDT on TRC-20 Network.</p>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <button className="px-4 py-2 bg-emerald-400 text-white font-semibold rounded-lg">
                    All Products
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    Electronics
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    Fashion
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    Home Decor
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    Gaming
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    Software
                </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700">
                    <span className="font-semibold">🎉 Coming Soon!</span> Product catalog will be available once the backend API is connected.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">ELECTRONICS • TRC-20</p>
                            <h3 className="font-bold text-gray-900 mb-2">Product Name</h3>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-bold text-gray-900">0.00 <span className="text-sm text-emerald-600">USDT</span></span>
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-sm text-gray-600">4.5</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all text-sm">
                                    Buy Now
                                </button>
                                <button className="px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shop;
