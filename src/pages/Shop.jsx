import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartModal from '../components/CartModal';
import CheckoutModal from '../components/CheckoutModal';

const Shop = () => {
    const { cartItems, addToCart, cartItemCount, cartTotal } = useCart();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [checkoutAmount, setCheckoutAmount] = useState(0);

    const categories = [
        { id: 'all', label: 'All Products' },
        { id: 'electronics', label: 'Electronics' },
        { id: 'fashion', label: 'Fashion' },
        { id: 'home', label: 'Home & Garden' },
        { id: 'sports', label: 'Sports' }
    ];

    const products = [
        {
            id: 1,
            name: 'Wireless Headphones Pro',
            category: 'electronics',
            price: 145.00,
            rating: 4.8,
            reviews: 234,
            image: '🎧',
            color: 'Midnight Black'
        },
        {
            id: 2,
            name: 'Smart Watch Series 5',
            category: 'electronics',
            price: 299.50,
            rating: 4.9,
            reviews: 512,
            image: '⌚',
            color: 'Titanium Silver'
        },
        {
            id: 3,
            name: 'Running Shoes Elite',
            category: 'sports',
            price: 125.00,
            rating: 4.7,
            reviews: 189,
            image: '👟',
            color: 'Crimson Red'
        },
        {
            id: 4,
            name: 'Gaming Console X',
            category: 'electronics',
            price: 499.99,
            rating: 5.0,
            reviews: 1024,
            image: '🎮',
            color: 'Matte Black'
        },
        {
            id: 5,
            name: 'Designer Backpack',
            category: 'fashion',
            price: 89.99,
            rating: 4.6,
            reviews: 156,
            image: '🎒',
            color: 'Navy Blue'
        },
        {
            id: 6,
            name: 'Coffee Maker Deluxe',
            category: 'home',
            price: 179.00,
            rating: 4.8,
            reviews: 342,
            image: '☕',
            color: 'Stainless Steel'
        },
        {
            id: 7,
            name: 'Yoga Mat Premium',
            category: 'sports',
            price: 45.50,
            rating: 4.7,
            reviews: 98,
            image: '🧘',
            color: 'Purple'
        },
        {
            id: 8,
            name: 'Sunglasses Classic',
            category: 'fashion',
            price: 129.00,
            rating: 4.9,
            reviews: 267,
            image: '🕶️',
            color: 'Tortoise Shell'
        }
    ];

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const buyNow = (product) => {
        setCheckoutAmount(product.price);
        setIsCheckoutOpen(true);
    };

    const handleCartCheckout = () => {
        const networkFee = -1.20;
        setCheckoutAmount(cartTotal + networkFee);
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
                    onClick={() => setIsCartOpen(true)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                        <div className="aspect-square bg-gradient-to-br from-emerald-50 to-gray-50 flex items-center justify-center text-8xl">
                            {product.image}
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                {product.category.toUpperCase()} • TRC-20
                            </p>
                            <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                            <p className="text-xs text-gray-500 mb-3">Color: {product.color}</p>

                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-bold text-gray-900">
                                    {product.price.toFixed(2)} <span className="text-sm text-emerald-600">USDT</span>
                                </span>
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                                    <span className="text-xs text-gray-400">({product.reviews})</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => buyNow(product)}
                                    className="flex-1 py-2 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all text-sm"
                                >
                                    Buy Now
                                </button>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="px-3 py-2 border-2 border-emerald-400 hover:bg-emerald-50 text-emerald-600 font-semibold rounded-lg transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No products found in this category.</p>
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
                onClose={() => setIsCheckoutOpen(false)}
                amount={checkoutAmount}
                onSuccess={() => {
                    setIsCheckoutOpen(false);
                }}
            />
        </div>
    );
};

export default Shop;
