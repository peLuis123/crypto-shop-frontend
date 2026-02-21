import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import CartModal from '../components/CartModal';
import CheckoutModal from '../components/CheckoutModal';
import productService from '../api/productService';

const Shop = () => {
    const { cartItems, addToCart, removeFromCart, cartItemCount, cartTotal } = useCart();
    const { showToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [checkoutAmount, setCheckoutAmount] = useState(0);
    const [buyNowProductId, setBuyNowProductId] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const categories = [
        { id: 'all', label: 'All Products' },
        { id: 'electronics', label: 'Electronics' },
        { id: 'fashion', label: 'Fashion' },
        { id: 'home', label: 'Home & Garden' },
        { id: 'sports', label: 'Sports' }
    ];

    const getMockProducts = () => [
        {
            _id: '1',
            name: 'Wireless Headphones Pro',
            category: 'electronics',
            price: 145.00,
            rating: 4.8,
            reviews: 234,
            image: '🎧',
            color: 'Midnight Black'
        },
        {
            _id: '2',
            name: 'Smart Watch Series 5',
            category: 'electronics',
            price: 299.50,
            rating: 4.9,
            reviews: 512,
            image: '⌚',
            color: 'Titanium Silver'
        },
        {
            _id: '3',
            name: 'Running Shoes Elite',
            category: 'sports',
            price: 125.00,
            rating: 4.7,
            reviews: 189,
            image: '👟',
            color: 'Crimson Red'
        },
        {
            _id: '4',
            name: 'Gaming Console X',
            category: 'electronics',
            price: 499.99,
            rating: 5.0,
            reviews: 1024,
            image: '🎮',
            color: 'Matte Black'
        },
        {
            _id: '5',
            name: 'Designer Backpack',
            category: 'fashion',
            price: 89.99,
            rating: 4.6,
            reviews: 156,
            image: '🎒',
            color: 'Navy Blue'
        },
        {
            _id: '6',
            name: 'Coffee Maker Deluxe',
            category: 'home',
            price: 179.00,
            rating: 4.8,
            reviews: 342,
            image: '☕',
            color: 'Stainless Steel'
        }
    ];

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                let response;
                if (selectedCategory === 'all') {
                    response = await productService.getProducts();
                } else {
                    response = await productService.getProductsByCategory(selectedCategory);
                }
                setProducts(response.products || response);
            } catch (err) {
                showToast('Failed to load products. Using fallback data.', 'error');
                setError('Failed to load products. Please try again.');
                setProducts(getMockProducts());
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [selectedCategory]);

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory]);

    const buyNow = (product) => {
        addToCart(product);
        setBuyNowProductId(product._id);
        setCheckoutAmount(product.price);
        setIsCheckoutOpen(true);
    };

    const handleCheckoutClose = () => {
        if (buyNowProductId) {
            removeFromCart(buyNowProductId);
            setBuyNowProductId(null);
        }
        setIsCheckoutOpen(false);
    };

    const handleCheckoutSuccess = () => {
        setBuyNowProductId(null);
    };

    const handleCartCheckout = () => {
        if (cartItemCount === 0 || cartTotal === 0) {
            showToast('Your cart is empty or has invalid amount', 'error');
            return;
        }
        setBuyNowProductId(null);
        setCheckoutAmount(cartTotal);
        setIsCartOpen(false);
        setIsCheckoutOpen(true);
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
                    <p className="text-gray-500">Browse our collection of premium products</p>
                </div>
                <button
                    onClick={() => {
                        if (cartItemCount === 0) {
                            showToast('Your cart is empty', 'warning');
                        } else {
                            setIsCartOpen(true);
                        }
                    }}
                    className="relative px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    View Cart
                    {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {cartItemCount}
                        </span>
                    )}
                </button>
            </div>

            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-6 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${selectedCategory === category.id
                            ? 'bg-emerald-400 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'
                            }`}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="text-center py-16">
                    <div className="inline-block animate-spin">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <p className="text-gray-500 mt-4">Loading products...</p>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {paginatedProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300">
                        <div className="aspect-square bg-linear-to-br from-emerald-50 to-gray-50 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400 text-4xl">📦</span>
                            )}
                        </div>

                        <div className="p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                                {product.category.toUpperCase()} • TRC-20
                            </p>
                            <h3 className="font-bold text-gray-900 mb-1 text-sm">{product.name}</h3>
                            <p className="text-[10px] text-gray-500 mb-2">Color: {product.color || 'Standard'}</p>

                            <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-bold text-gray-900">
                                    {product.price.toFixed(2)} <span className="text-xs text-emerald-600">USDT</span>
                                </span>
                                <div className="flex items-center gap-0.5">
                                    <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-xs font-semibold text-gray-700">{product.rating || 4.5}</span>
                                </div>
                            </div>

                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => buyNow(product)}
                                    className="flex-1 py-1.5 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all text-xs"
                                >
                                    Buy Now
                                </button>
                                <button
                                    onClick={() => {
                                        addToCart(product);
                                        showToast(`${product.name} added to cart`, 'success');
                                    }}
                                    className="px-2 py-1.5 border-2 border-emerald-400 hover:bg-emerald-50 text-emerald-600 font-semibold rounded-lg transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No products found in this category.</p>
                </div>
            )}

            {!loading && filteredProducts.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                                    currentPage === page
                                        ? 'bg-emerald-400 text-white'
                                        : 'border border-gray-300 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <span className="ml-4 text-sm text-gray-600">
                        Page {currentPage} of {totalPages} ({filteredProducts.length} products)
                    </span>
                </div>
            )}

            <CartModal
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onCheckout={handleCartCheckout}
            />

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={handleCheckoutClose}
                amount={checkoutAmount}
                onSuccess={handleCheckoutSuccess}
            />
        </div>
    );
};

export default Shop;
