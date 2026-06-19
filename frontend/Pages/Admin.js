import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaPlus, FaEdit, FaTrash, FaUsers, FaBox, 
    FaShoppingCart, FaMoneyBill, FaClock, FaExclamationTriangle, 
    FaEye, FaCheckCircle, FaTruck, FaBan, FaUpload 
} from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [token, setToken] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    // Product form state
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        brand: '',
        stock: '',
        image_url: '',
        specifications: '',
        features: '',
        warranty: '1 Year',
        weight: '',
        dimensions: '',
        color: '',
        condition: 'New'
    });

    // Category form state
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        slug: '',
        icon: ''
    });

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (!savedToken || !savedUser) {
            navigate('/login');
            return;
        }
        
        const user = JSON.parse(savedUser);
        if (user.isAdmin !== 1) {
            alert('Admin access required');
            navigate('/');
            return;
        }
        
        setIsAdmin(true);
        setToken(savedToken);
        
        loadAllData();
        loadCounts();
    }, []);

    const loadAllData = async () => {
        try {
            // Load categories and products first
            const [productsRes, categoriesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/products'),
                axios.get('http://localhost:5000/api/categories')
            ]);
            
            // Handle pagination response - products are in productsRes.data.products
            const productData = productsRes.data.products || productsRes.data || [];
            const categoryData = categoriesRes.data || [];
            
            console.log('Products loaded:', productData.length);
            console.log('Categories loaded:', categoryData.length);
            
            setProducts(Array.isArray(productData) ? productData : []);
            setCategories(Array.isArray(categoryData) ? categoryData : []);
            
            // Try loading admin data (may fail if token invalid)
            try {
                const [usersRes, ordersRes, statsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setUsers(usersRes.data || []);
                setOrders(ordersRes.data || []);
                setStats(statsRes.data);
                setLowStockProducts(statsRes.data?.lowStockProducts || []);
            } catch (adminError) {
                console.warn('Admin data not loaded:', adminError.message);
            }
            
        } catch (error) {
            console.error('Error loading data:', error);
            setProducts([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const loadCounts = () => {
        const savedCart = localStorage.getItem('cart');
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedCart) setCartCount(JSON.parse(savedCart).length);
        if (savedWishlist) setWishlistCount(JSON.parse(savedWishlist).length);
    };

    const handleSearch = (term) => {
        navigate(`/search?q=${encodeURIComponent(term)}`);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const res = await axios.post('http://localhost:5000/api/upload/image', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProductForm({...productForm, image_url: res.data.imageUrl});
            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading image: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, productForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Product updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/products', productForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Product added successfully');
            }
            setShowProductModal(false);
            setEditingProduct(null);
            resetProductForm();
            loadAllData();
        } catch (error) {
            alert(error.response?.data?.error || 'Error saving product');
        }
    };

    const resetProductForm = () => {
        setProductForm({
            name: '',
            description: '',
            price: '',
            category_id: '',
            brand: '',
            stock: '',
            image_url: '',
            specifications: '',
            features: '',
            warranty: '1 Year',
            weight: '',
            dimensions: '',
            color: '',
            condition: 'New'
        });
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/categories', categoryForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Category added successfully');
            setShowCategoryModal(false);
            setCategoryForm({ name: '', slug: '', icon: '' });
            loadAllData();
        } catch (error) {
            alert(error.response?.data?.error || 'Error saving category');
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Order status updated to ${status}`);
            loadAllData();
            setShowOrderModal(false);
        } catch (error) {
            alert('Error updating order status');
        }
    };

    const updateStock = async (productId, newStock) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/products/${productId}/stock`, { stock: newStock }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Stock updated');
            loadAllData();
        } catch (error) {
            alert('Error updating stock');
        }
    };

    const deleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete user: ${userName}?`)) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('User deleted');
                loadAllData();
            } catch (error) {
                alert('Error deleting user');
            }
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:5000/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Product deleted');
                loadAllData();
            } catch (error) {
                alert('Error deleting product');
            }
        }
    };

    const deleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await axios.delete(`http://localhost:5000/api/categories/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Category deleted');
                loadAllData();
            } catch (error) {
                alert('Error deleting category');
            }
        }
    };

    const editProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category_id: product.category_id || '',
            brand: product.brand || '',
            stock: product.stock,
            image_url: product.image_url || '',
            specifications: product.specifications || '',
            features: product.features || '',
            warranty: product.warranty || '1 Year',
            weight: product.weight || '',
            dimensions: product.dimensions || '',
            color: product.color || '',
            condition: product.condition || 'New'
        });
        setShowProductModal(true);
    };

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-warning',
            processing: 'bg-info',
            shipped: 'bg-primary',
            delivered: 'bg-success',
            cancelled: 'bg-danger'
        };
        return badges[status] || 'bg-secondary';
    };

    if (!isAdmin || loading) {
        return (
            <div>
                <Navbar cartCount={0} wishlistCount={0} onSearch={handleSearch} />
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p>Loading admin panel...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar 
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                onSearch={handleSearch}
            />

            <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-md-2 mb-4">
                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-body p-3">
                                <h5 className="fw-bold mb-3">Admin Menu</h5>
                                <div className="list-group list-group-flush">
                                    <button className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                                        📊 Dashboard
                                    </button>
                                    <button className={`list-group-item list-group-item-action ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                                        📦 Products
                                    </button>
                                    <button className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                                        🛒 Orders
                                    </button>
                                    <button className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                                        👥 Users
                                    </button>
                                    <button className={`list-group-item list-group-item-action ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
                                        📁 Categories
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-10">
                        {activeTab === 'dashboard' && stats && (
                            <div>
                                <h2 className="fw-bold mb-4">Dashboard</h2>
                                <div className="row g-4 mb-4">
                                    <div className="col-md-3">
                                        <div className="card shadow-sm border-0 rounded-4 text-center p-3">
                                            <FaBox size={40} className="text-primary mx-auto mb-2" />
                                            <h3>{stats.totalProducts}</h3>
                                            <p className="text-muted">Total Products</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card shadow-sm border-0 rounded-4 text-center p-3">
                                            <FaUsers size={40} className="text-success mx-auto mb-2" />
                                            <h3>{stats.totalUsers}</h3>
                                            <p className="text-muted">Total Users</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card shadow-sm border-0 rounded-4 text-center p-3">
                                            <FaShoppingCart size={40} className="text-info mx-auto mb-2" />
                                            <h3>{stats.totalOrders}</h3>
                                            <p className="text-muted">Total Orders</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card shadow-sm border-0 rounded-4 text-center p-3">
                                            <FaMoneyBill size={40} className="text-warning mx-auto mb-2" />
                                            <h3>${stats.totalRevenue?.toFixed(2) || 0}</h3>
                                            <p className="text-muted">Total Revenue</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'products' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="fw-bold">Products Management</h2>
                                    <button className="btn btn-primary rounded-pill" onClick={() => { resetProductForm(); setEditingProduct(null); setShowProductModal(true); }}>
                                        <FaPlus /> Add Product
                                    </button>
                                </div>
                                <div className="card shadow-sm border-0 rounded-4">
                                    <div className="card-body p-4">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Image</th>
                                                        <th>Name</th>
                                                        <th>Category</th>
                                                        <th>Brand</th>
                                                        <th>Price</th>
                                                        <th>Stock</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.isArray(products) && products.map(product => (
                                                        <tr key={product.id}>
                                                            <td>{product.id}</td>
                                                            <td>
                                                                <img src={product.image_url || 'https://via.placeholder.com/40'} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '5px' }} />
                                                            </td>
                                                            <td>{product.name}</td>
                                                            <td>{product.category_name || '-'}</td>
                                                            <td>{product.brand || '-'}</td>
                                                            <td>${product.price}</td>
                                                            <td>
                                                                <input type="number" value={product.stock} style={{ width: '60px' }} onChange={(e) => updateStock(product.id, e.target.value)} className="form-control form-control-sm" />
                                                            </td>
                                                            <td>
                                                                <button className="btn btn-sm btn-outline-warning me-2 rounded-pill" onClick={() => editProduct(product)}>
                                                                    <FaEdit /> Edit
                                                                </button>
                                                                <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => deleteProduct(product.id)}>
                                                                    <FaTrash /> Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="fw-bold mb-4">Orders Management</h2>
                                <div className="card shadow-sm border-0 rounded-4">
                                    <div className="card-body p-4">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Order ID</th>
                                                        <th>Customer</th>
                                                        <th>Total</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.isArray(orders) && orders.map(order => (
                                                        <tr key={order.id}>
                                                            <td>#{order.id}</td>
                                                            <td>{order.user_name || 'Guest'}</td>
                                                            <td>${order.total?.toFixed(2)}</td>
                                                            <td>
                                                                <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
                                                            </td>
                                                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                            <td>
                                                                <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => viewOrderDetails(order)}>
                                                                    <FaEye /> View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div>
                                <h2 className="fw-bold mb-4">Users Management</h2>
                                <div className="card shadow-sm border-0 rounded-4">
                                    <div className="card-body p-4">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Role</th>
                                                        <th>Joined Date</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.isArray(users) && users.map(user => (
                                                        <tr key={user.id}>
                                                            <td>{user.id}</td>
                                                            <td>{user.name}</td>
                                                            <td>{user.email}</td>
                                                            <td>{user.is_admin === 1 ? <span className="badge bg-danger">Admin</span> : <span className="badge bg-secondary">Customer</span>}</td>
                                                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                                            <td>
                                                                {user.is_admin !== 1 && (
                                                                    <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => deleteUser(user.id, user.name)}>
                                                                        <FaTrash /> Delete
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="fw-bold">Categories Management</h2>
                                    <button className="btn btn-success rounded-pill" onClick={() => setShowCategoryModal(true)}>
                                        <FaPlus /> Add Category
                                    </button>
                                </div>
                                <div className="card shadow-sm border-0 rounded-4">
                                    <div className="card-body p-4">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Icon</th>
                                                        <th>Name</th>
                                                        <th>Slug</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.isArray(categories) && categories.map(category => (
                                                        <tr key={category.id}>
                                                            <td>{category.id}</td>
                                                            <td className="fs-3">{category.icon || '📁'}</td>
                                                            <td>{category.name}</td>
                                                            <td>{category.slug}</td>
                                                            <td>
                                                                <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => deleteCategory(category.id)}>
                                                                    <FaTrash /> Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            {showProductModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content rounded-4">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowProductModal(false); setEditingProduct(null); resetProductForm(); }}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleProductSubmit}>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <h6 className="fw-bold text-primary">Basic Information</h6>
                                            <hr />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Product Name *</label>
                                            <input type="text" className="form-control rounded-pill" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Brand *</label>
                                            <input type="text" className="form-control rounded-pill" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} required />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label fw-semibold">Category *</label>
                                            <select 
                                                className="form-select rounded-pill" 
                                                value={productForm.category_id} 
                                                onChange={e => setProductForm({...productForm, category_id: e.target.value})} 
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {Array.isArray(categories) && categories.length > 0 ? (
                                                    categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.icon || '📁'} {cat.name}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="">No categories available</option>
                                                )}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-semibold">Price ($) *</label>
                                            <input type="number" step="0.01" className="form-control rounded-pill" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-semibold">Stock Quantity *</label>
                                            <input type="number" className="form-control rounded-pill" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} required />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Product Image</label>
                                            <div className="d-flex gap-3 align-items-center">
                                                <input 
                                                    type="text" 
                                                    className="form-control rounded-pill" 
                                                    value={productForm.image_url} 
                                                    onChange={e => setProductForm({...productForm, image_url: e.target.value})} 
                                                    placeholder="Image URL or upload" 
                                                />
                                                <div className="position-relative">
                                                    <input 
                                                        type="file" 
                                                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0" 
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        disabled={uploading}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <button className="btn btn-outline-secondary rounded-pill" type="button" disabled={uploading}>
                                                        <FaUpload /> {uploading ? 'Uploading...' : 'Upload'}
                                                    </button>
                                                </div>
                                            </div>
                                            {productForm.image_url && (
                                                <div className="mt-2">
                                                    <img src={productForm.image_url} alt="Preview" style={{ height: '80px', objectFit: 'cover', borderRadius: '5px' }} />
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger mt-1"
                                                        onClick={() => setProductForm({...productForm, image_url: ''})}
                                                        type="button"
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Description</label>
                                            <textarea className="form-control rounded-3" rows="3" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})}></textarea>
                                        </div>

                                        <div className="col-12 mt-3">
                                            <h6 className="fw-bold text-primary">Additional Details</h6>
                                            <hr />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Specifications</label>
                                            <textarea className="form-control rounded-3" rows="2" value={productForm.specifications} onChange={e => setProductForm({...productForm, specifications: e.target.value})} placeholder="e.g., Processor: M3, RAM: 16GB, Storage: 512GB"></textarea>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Key Features</label>
                                            <textarea className="form-control rounded-3" rows="2" value={productForm.features} onChange={e => setProductForm({...productForm, features: e.target.value})} placeholder="e.g., Premium build, Fast charging, Long battery life"></textarea>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Warranty</label>
                                            <select className="form-select rounded-pill" value={productForm.warranty} onChange={e => setProductForm({...productForm, warranty: e.target.value})}>
                                                <option value="1 Year">1 Year</option>
                                                <option value="2 Years">2 Years</option>
                                                <option value="3 Years">3 Years</option>
                                                <option value="No Warranty">No Warranty</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Weight</label>
                                            <input type="text" className="form-control rounded-pill" value={productForm.weight} onChange={e => setProductForm({...productForm, weight: e.target.value})} placeholder="e.g., 1.2 kg" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Dimensions</label>
                                            <input type="text" className="form-control rounded-pill" value={productForm.dimensions} onChange={e => setProductForm({...productForm, dimensions: e.target.value})} placeholder="e.g., 20x15x2 cm" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Color</label>
                                            <input type="text" className="form-control rounded-pill" value={productForm.color} onChange={e => setProductForm({...productForm, color: e.target.value})} placeholder="e.g., Black, White, Silver" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Condition</label>
                                            <select className="form-select rounded-pill" value={productForm.condition} onChange={e => setProductForm({...productForm, condition: e.target.value})}>
                                                <option value="New">New</option>
                                                <option value="Refurbished">Refurbished</option>
                                                <option value="Used">Used</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0 mt-4">
                                        <button type="button" className="btn btn-secondary rounded-pill" onClick={() => { setShowProductModal(false); setEditingProduct(null); resetProductForm(); }}>Cancel</button>
                                        <button type="submit" className="btn btn-primary rounded-pill">
                                            {editingProduct ? 'Update Product' : 'Add Product'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content rounded-4">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">Add Category</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCategorySubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Category Name *</label>
                                        <input type="text" className="form-control rounded-pill" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Slug *</label>
                                        <input type="text" className="form-control rounded-pill" value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})} placeholder="phones, laptops, audio" required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Icon (emoji)</label>
                                        <input type="text" className="form-control rounded-pill" value={categoryForm.icon} onChange={e => setCategoryForm({...categoryForm, icon: e.target.value})} placeholder="📱, 💻, 🎧" />
                                    </div>
                                    <div className="modal-footer border-0 mt-3">
                                        <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary rounded-pill">Save Category</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showOrderModal && selectedOrder && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content rounded-4">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">Order #{selectedOrder.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowOrderModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Customer:</strong> {selectedOrder.user_name || 'Guest'}</p>
                                <p><strong>Email:</strong> {selectedOrder.user_email || 'N/A'}</p>
                                <p><strong>Total:</strong> ${selectedOrder.total?.toFixed(2)}</p>
                                <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Update Status</label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                                            <button key={status} className={`btn btn-sm ${getStatusBadge(status)} text-white rounded-pill`} onClick={() => updateOrderStatus(selectedOrder.id, status)}>
                                                {status === 'pending' && <FaClock />}
                                                {status === 'processing' && <FaCheckCircle />}
                                                {status === 'shipped' && <FaTruck />}
                                                {status === 'delivered' && <FaCheckCircle />}
                                                {status === 'cancelled' && <FaBan />}
                                                {status.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default Admin;