import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Pagination from '../Components/Pagination';

function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [wishlist, setWishlist] = useState([]);
    const [token, setToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 6
    });

    // Get token and user from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
            loadWishlist(savedToken);
            loadCartCount(savedToken);
        }
    }, []);

    // Load wishlist from backend
    const loadWishlist = async (authToken) => {
        try {
            const res = await axios.get('http://localhost:5000/api/wishlist', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setWishlist(res.data);
            setWishlistCount(res.data.length);
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    };

    // Load cart count from backend
    const loadCartCount = async (authToken) => {
        try {
            const res = await axios.get('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setCartCount(res.data.length);
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    // Load products with pagination
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const searchParam = params.get('search');
        const categoryParam = params.get('category');
        const pageParam = params.get('page') || 1;
        
        let url = `http://localhost:5000/api/products?page=${pageParam}&limit=6`;
        
        if (searchParam) {
            url += `&search=${searchParam}`;
            setSearchTerm(searchParam);
        }
        if (categoryParam) {
            url += `&category=${categoryParam}`;
            setSelectedCategory(categoryParam);
        }
        
        axios.get(url)
            .then(res => {
                setProducts(res.data.products);
                setFilteredProducts(res.data.products);
                setPagination({
                    currentPage: res.data.pagination.page,
                    totalPages: res.data.pagination.totalPages,
                    total: res.data.pagination.total,
                    limit: res.data.pagination.limit
                });
            })
            .catch(err => console.error(err));
    }, [window.location.search]);

    // Load categories
    useEffect(() => {
        axios.get('http://localhost:5000/api/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error(err));
    }, []);

    // Filter products when category or search changes
    useEffect(() => {
        let filtered = products;
        
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category_slug === selectedCategory);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredProducts(filtered);
    }, [selectedCategory, searchTerm, products]);

    // Handle page change
    const handlePageChange = (page) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page);
        window.location.search = params.toString();
    };

    // Add to cart (backend)
    const addToCart = async (product) => {
        if (!token) {
            alert('Please login first');
            window.location.href = '/login';
            return;
        }
        
        try {
            await axios.post('http://localhost:5000/api/cart', 
                { product_id: product.id, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`${product.name} added to cart!`);
            loadCartCount(token);
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding to cart');
        }
    };

    // Toggle wishlist (backend)
    const toggleWishlist = async (product) => {
        if (!token) {
            alert('Please login first');
            window.location.href = '/login';
            return;
        }
        
        const isInWishlist = wishlist.some(item => item.product_id === product.id);
        
        try {
            if (isInWishlist) {
                await axios.delete(`http://localhost:5000/api/wishlist/${product.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert(`${product.name} removed from wishlist`);
                setWishlist(wishlist.filter(item => item.product_id !== product.id));
                setWishlistCount(wishlistCount - 1);
            } else {
                await axios.post('http://localhost:5000/api/wishlist', 
                    { product_id: product.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert(`${product.name} added to wishlist`);
                loadWishlist(token);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating wishlist');
        }
    };

    // Check if product is in wishlist
    const isInWishlist = (productId) => {
        return wishlist.some(item => item.product_id === productId);
    };

    // Handle category filter
    const handleCategoryClick = (slug) => {
        const params = new URLSearchParams(window.location.search);
        if (slug) {
            params.set('category', slug);
        } else {
            params.delete('category');
        }
        params.delete('page');
        window.location.search = params.toString();
    };

    // Handle search
    const handleSearchSubmit = (term) => {
        const params = new URLSearchParams(window.location.search);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        params.delete('page');
        window.location.search = params.toString();
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        setToken(null);
        setCartCount(0);
        setWishlistCount(0);
        setWishlist([]);
        window.location.href = '/';
    };

    return (
        <div>
            <Navbar 
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                isLoggedIn={isLoggedIn}
                user={user}
                onLogout={handleLogout}
                onSearch={handleSearchSubmit}
            />
            
            <div className="container py-5">
                <div className="row">
                    {/* Sidebar - Categories */}
                    <div className="col-md-3 mb-4">
                        <div className="card shadow-sm border-0 rounded-4 p-3">
                            <h5 className="fw-bold mb-3">Categories</h5>
                            <div className="list-group list-group-flush">
                                <button 
                                    className={`list-group-item list-group-item-action ${!selectedCategory ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick('')}
                                >
                                    All Products
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        className={`list-group-item list-group-item-action ${selectedCategory === cat.slug ? 'active' : ''}`}
                                        onClick={() => handleCategoryClick(cat.slug)}
                                    >
                                        {cat.icon} {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="fw-bold">
                                {selectedCategory 
                                    ? categories.find(c => c.slug === selectedCategory)?.name || 'Products'
                                    : searchTerm 
                                        ? `Search: "${searchTerm}"` 
                                        : 'All Products'}
                            </h2>
                            <div className="input-group" style={{ width: '250px' }}>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search..." 
                                    value={searchTerm}
                                    onChange={(e) => handleSearchSubmit(e.target.value)}
                                />
                                <span className="input-group-text">🔍</span>
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-5">
                                <h4>No products found</h4>
                                <p className="text-muted">Try a different category or search term</p>
                                <button 
                                    className="btn btn-primary rounded-pill px-4"
                                    onClick={() => {
                                        window.location.search = '';
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="row g-4">
                                    {filteredProducts.map(product => (
                                        <div key={product.id} className="col-md-6 col-lg-4">
                                            <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden product-card">
                                                <Link to={`/product/${product.id}`} className="text-decoration-none">
                                                    <img 
                                                        src={product.image_url || 'https://via.placeholder.com/300'} 
                                                        className="card-img-top" 
                                                        alt={product.name} 
                                                        style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }} 
                                                    />
                                                </Link>
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <span className="badge bg-primary">{product.category_name || 'Electronics'}</span>
                                                        <span className="badge bg-warning text-dark">{product.brand || 'Brand'}</span>
                                                    </div>
                                                    <Link to={`/product/${product.id}`} className="text-decoration-none">
                                                        <h5 className="card-title text-dark">{product.name}</h5>
                                                    </Link>
                                                    <p className="card-text text-muted small">{product.description?.substring(0, 60)}...</p>
                                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                                        <span className="h4 text-primary fw-bold">${product.price}</span>
                                                        <div className="d-flex gap-2">
                                                            <button 
                                                                className={`btn rounded-pill ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                                                                onClick={() => toggleWishlist(product)}
                                                            >
                                                                {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                                                            </button>
                                                            <button 
                                                                className="btn btn-dark rounded-pill px-3"
                                                                onClick={() => addToCart(product)}
                                                            >
                                                                <FaShoppingCart className="me-1" /> Buy
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <Pagination 
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
}

export default Products;