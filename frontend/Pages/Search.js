import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaFilter, FaTimes, FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function Search() {
    const location = useLocation();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [wishlist, setWishlist] = useState([]);
    const [token, setToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'newest'
    });

    // Get search query from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('q') || '';
        const categoryQuery = params.get('category') || '';
        const brandQuery = params.get('brand') || '';
        const minPriceQuery = params.get('minPrice') || '';
        const maxPriceQuery = params.get('maxPrice') || '';

        setFilters({
            search: searchQuery,
            category: categoryQuery,
            brand: brandQuery,
            minPrice: minPriceQuery,
            maxPrice: maxPriceQuery,
            sortBy: 'newest'
        });

        loadData(searchQuery, categoryQuery, brandQuery, minPriceQuery, maxPriceQuery);
    }, [location.search]);

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

    const loadData = async (search, category, brand, minPrice, maxPrice) => {
        setLoading(true);
        try {
            // Load categories
            const categoriesRes = await axios.get('http://localhost:5000/api/categories');
            setCategories(categoriesRes.data);

            // Load products with filters
            let url = 'http://localhost:5000/api/products?';
            const params = [];

            if (search) params.push(`search=${encodeURIComponent(search)}`);
            if (category) params.push(`category=${encodeURIComponent(category)}`);

            // We'll filter brand, price on client side since backend doesn't support them yet
            url += params.join('&');

            const productsRes = await axios.get(url);
            let productsData = productsRes.data;

            // Apply brand filter (client side)
            if (brand) {
                productsData = productsData.filter(p => 
                    p.brand?.toLowerCase().includes(brand.toLowerCase())
                );
            }

            // Apply price filter (client side)
            if (minPrice) {
                productsData = productsData.filter(p => p.price >= parseFloat(minPrice));
            }
            if (maxPrice) {
                productsData = productsData.filter(p => p.price <= parseFloat(maxPrice));
            }

            // Apply sorting
            switch (filters.sortBy) {
                case 'price-low':
                    productsData.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    productsData.sort((a, b) => b.price - a.price);
                    break;
                case 'name':
                    productsData.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                default: // newest
                    productsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }

            setProducts(productsData);
            setFilteredProducts(productsData);
        } catch (error) {
            console.error('Error loading search data:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const toggleWishlist = async (product) => {
        if (!token) {
            alert('Please login first');
            navigate('/login');
            return;
        }

        const isInWishlist = wishlist.some(item => item.product_id === product.id);

        try {
            if (isInWishlist) {
                await axios.delete(`http://localhost:5000/api/wishlist/${product.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWishlist(wishlist.filter(item => item.product_id !== product.id));
                setWishlistCount(wishlistCount - 1);
            } else {
                await axios.post('http://localhost:5000/api/wishlist', 
                    { product_id: product.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                loadWishlist(token);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating wishlist');
        }
    };

    const addToCart = async (product) => {
        if (!token) {
            alert('Please login first');
            navigate('/login');
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

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.product_id === productId);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filters.search) params.append('q', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        navigate(`/search?${params.toString()}`);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            brand: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'newest'
        });
        navigate('/search');
        setShowFilters(false);
    };

    const handleSearch = (term) => {
        navigate(`/search?q=${encodeURIComponent(term)}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        setToken(null);
        navigate('/');
        window.location.reload();
    };

    // Get unique brands from products
    const getBrands = () => {
        const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
        return brands;
    };

    // Extract search term from URL for display
    const getSearchTerm = () => {
        const params = new URLSearchParams(location.search);
        return params.get('q') || '';
    };

    const searchTerm = getSearchTerm();

    return (
        <div>
            <Navbar
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                isLoggedIn={isLoggedIn}
                user={user}
                onLogout={handleLogout}
                onSearch={handleSearch}
            />

            <div className="container py-5">
                {/* Search Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold">
                            <FaSearch className="me-2 text-primary" />
                            {searchTerm ? `Results for "${searchTerm}"` : 'All Products'}
                        </h2>
                        <p className="text-muted">{filteredProducts.length} products found</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-primary rounded-pill"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FaFilter className="me-2" /> Filters
                        </button>
                        <select
                            className="form-select rounded-pill"
                            name="sortBy"
                            value={filters.sortBy}
                            onChange={handleFilterChange}
                            style={{ width: 'auto' }}
                        >
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name A-Z</option>
                        </select>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="card shadow-sm border-0 rounded-4 mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="fw-bold mb-0">Advanced Filters</h5>
                                <button
                                    className="btn btn-sm btn-outline-danger rounded-pill"
                                    onClick={clearFilters}
                                >
                                    <FaTimes className="me-1" /> Clear All
                                </button>
                            </div>
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label fw-semibold">Category</label>
                                    <select
                                        className="form-select rounded-pill"
                                        name="category"
                                        value={filters.category}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-semibold">Brand</label>
                                    <select
                                        className="form-select rounded-pill"
                                        name="brand"
                                        value={filters.brand}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Brands</option>
                                        {getBrands().map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-semibold">Min Price ($)</label>
                                    <input
                                        type="number"
                                        className="form-control rounded-pill"
                                        name="minPrice"
                                        placeholder="0"
                                        value={filters.minPrice}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-semibold">Max Price ($)</label>
                                    <input
                                        type="number"
                                        className="form-control rounded-pill"
                                        name="maxPrice"
                                        placeholder="10000"
                                        value={filters.maxPrice}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <button
                                    className="btn btn-primary rounded-pill px-4"
                                    onClick={applyFilters}
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2">Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="display-1 mb-3">🔍</div>
                        <h4>No products found</h4>
                        <p className="text-muted">Try adjusting your filters or search terms</p>
                        <button
                            className="btn btn-primary rounded-pill px-4"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="col-md-6 col-lg-4">
                                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden product-card">
                                    <Link to={`/product/${product.id}`}>
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
                )}
            </div>

            <Footer />
        </div>
    );
}

export default Search;