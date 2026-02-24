import { useState, useEffect } from 'react';
import adminService from '../api/adminService';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Edit2, Trash2, MoreVertical, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const AdminProducts = () => {
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null); // 'create', 'edit', 'delete'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: '',
        description: '',
        image: ''
    });

    const categories = ['digital', 'physical', 'service'];
    const stockStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];

    useEffect(() => {
        loadProducts();
    }, [page, categoryFilter, searchQuery]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAdminProducts(searchQuery, categoryFilter !== 'all' ? categoryFilter : '', page, 10);
            setProducts(response.products || []);
            setPagination(response.pagination);
        } catch (error) {
            showToast('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (stock) => {
        if (stock > 10) return 'In Stock';
        if (stock > 0) return 'Low Stock';
        return 'Out of Stock';
    };

    const getStockColor = (stock) => {
        if (stock > 10) return 'bg-emerald-50 text-emerald-600';
        if (stock > 0) return 'bg-orange-50 text-orange-600';
        return 'bg-red-50 text-red-600';
    };

    const getStockBg = (stock) => {
        if (stock > 10) return 'bg-emerald-400';
        if (stock > 0) return 'bg-orange-400';
        return 'bg-red-400';
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = !searchQuery || 
            product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStock = stockFilter === 'all' || getStockStatus(parseInt(product.stock) || 0) === stockFilter;
        
        return matchesSearch && matchesStock;
    });

    const handleOpenCreate = () => {
        setSelectedProduct(null);
        setModalType('create');
        setFormData({
            name: '',
            price: '',
            stock: '',
            category: '',
            description: '',
            image: ''
        });
        setShowModal(true);
    };

    const handleOpenEdit = (product) => {
        setSelectedProduct(product);
        setModalType('edit');
        setFormData({
            name: product.name || '',
            price: product.price || '',
            stock: product.stock || '',
            category: product.category || '',
            description: product.description || '',
            image: product.image || ''
        });
        setShowModal(true);
    };

    const handleOpenDelete = (product) => {
        setSelectedProduct(product);
        setModalType('delete');
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (modalType === 'edit') {
                await adminService.updateAdminProduct(selectedProduct._id, formData);
                showToast('Product updated successfully', 'success');
            } else if (modalType === 'create') {
                await adminService.createAdminProduct(formData);
                showToast('Product created successfully', 'success');
            }
            setShowModal(false);
            loadProducts();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save product', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await adminService.deleteAdminProduct(selectedProduct._id);
            showToast('Product deleted successfully', 'success');
            setShowModal(false);
            loadProducts();
        } catch (error) {
            showToast('Failed to delete product', 'error');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading...</div>;
    }

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
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Products</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Manage your digital and physical inventory across chains</p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors"
                    >
                        <Plus size={20} />
                        Add New Product
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-sm relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products by name, SKU, or ID..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setPage(1);
                            }}
                            className="bg-slate-100 border-none rounded-lg text-sm font-medium py-2 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Stock Status Filter */}
                        <select
                            value={stockFilter}
                            onChange={(e) => {
                                setStockFilter(e.target.value);
                                setPage(1);
                            }}
                            className="bg-slate-100 border-none rounded-lg text-sm font-medium py-2 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                            <option value="all">All Stock Status</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Product Info</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Category</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Price (TRX)</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Inventory</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => {
                                        const stock = parseInt(product.stock) || 0;
                                        const status = getStockStatus(stock);
                                        const colorClass = getStockColor(stock);
                                        const bgColor = getStockBg(stock);

                                        return (
                                            <tr key={product._id} className="hover:bg-emerald-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        {product.image ? (
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                                <span className="text-slate-400 text-xs">No image</span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                                                            <p className="text-xs text-slate-500">SKU: {product.sku || product._id.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                                                        {product.category || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-bold text-slate-900">{(parseFloat(product.price) || 0).toFixed(2)}</span>
                                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1 rounded">TRX</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center gap-1.5 ${colorClass} px-3 py-1 rounded-full text-xs font-bold`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${bgColor} ${stock > 0 ? 'animate-pulse' : ''}`}></span>
                                                        {status} {stock > 0 && `(${stock} left)`}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenEdit(product)}
                                                            className="p-1.5 hover:bg-white rounded border border-slate-200 text-slate-600 hover:text-emerald-600 transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenDelete(product)}
                                                            className="p-1.5 hover:bg-white rounded border border-slate-200 text-slate-600 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button className="p-1.5 hover:bg-white rounded border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors">
                                                            <MoreVertical size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                            No products found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Showing <span className="font-bold text-slate-900">{startIndex}</span> to <span className="font-bold text-slate-900">{endIndex}</span> of <span className="font-bold text-slate-900">{pagination?.total || 0}</span> products
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={!canGoPrev}
                                className="p-1 rounded hover:bg-slate-200 text-slate-400 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {visiblePages.map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                                        currentPage === pageNum
                                            ? 'bg-emerald-500 text-white'
                                            : 'hover:bg-slate-200'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            {totalPages > 5 && currentPage < totalPages - 2 && <span className="text-slate-400 text-xs">...</span>}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <button
                                    onClick={() => setPage(totalPages)}
                                    className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                                        currentPage === totalPages
                                            ? 'bg-emerald-500 text-white'
                                            : 'hover:bg-slate-200'
                                    }`}
                                >
                                    {totalPages}
                                </button>
                            )}
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={!canGoNext}
                                className="p-1 rounded hover:bg-slate-200 text-slate-400 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Product Modal */}
            {showModal && (modalType === 'create' || modalType === 'edit') && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {modalType === 'create' ? 'Add New Product' : 'Edit Product'}
                        </h3>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Price (TRX) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Stock *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Product description"
                                    rows="3"
                                    className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Image URL</label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors"
                            >
                                {modalType === 'create' ? 'Create' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showModal && modalType === 'delete' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 border border-slate-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-50 mb-4">
                            <AlertCircle size={24} className="text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Product?</h3>
                        <p className="text-sm text-slate-600 mb-6">
                            Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
