import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaTrash, FaHeart } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [token, setToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (!savedToken || !savedUser) {
            window.location.href = '/login';
            return;
        }
        
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
        
        loadWishlist(savedToken);
        loadCartCount(savedToken);
    }, []);

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

    const removeFromWishlist = async (productId) => {
        try {
            await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Product removed from wishlist');
            loadWishlist(token);
        } catch (error) {
            alert(error.response?.data?.message || 'Error removing from wishlist');
        }
    };

    const addToCart = async (product) => {
        try {
            await axios.post('http://localhost:5000/api/cart', 
                { product_id: product.product_id, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`${product.name} added to cart!`);
            loadCartCount(token);
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding to cart');
        }
    };

    const handleSearch = (term) => {
        window.location.href = `/products?search=${term}`;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    if (!isLoggedIn) {
        return (
            <div>
                <Navbar cartCount={0} wishlistCount={0} onSearch={handleSearch} />
                <div className="container py-5 text-center">
                    <p>Please login to view your wishlist</p>
                    <Link to="/login" className="btn btn-primary">Login</Link>
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
                isLoggedIn={isLoggedIn}
                user={user}
                onLogout={handleLogout}
                onSearch={handleSearch}
            />

            <div className="container py-5" style={{ minHeight: '60vh' }}>
                <h2 className="fw-bold mb-4">
                    <FaHeart className="text-danger me-2" /> My Wishlist ({wishlistCount})
                </h2>

                {wishlist.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="display-1 mb-3">💔</div>
                        <h4>Your wishlist is empty</h4>
                        <p className="text-muted">Save your favorite items here!</p>
                        <Link to="/products" className="btn btn-primary rounded-pill px-4">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="row">
                        {wishlist.map(item => (
                            <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm border-0 rounded-4">
                                    <img 
                                        src={item.image_url || 'https://via.placeholder.com/300'} 
                                        className="card-img-top" 
                                        alt={item.name} 
                                        style={{ height: '200px', objectFit: 'cover' }} 
                                    />
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="badge bg-primary">{item.category_name || 'Electronics'}</span>
                                            <button 
                                                className="btn btn-sm btn-outline-danger rounded-pill"
                                                onClick={() => removeFromWishlist(item.product_id)}
                                            >
                                                <FaTrash /> Remove
                                            </button>
                                        </div>
                                        <h5 className="card-title">{item.name}</h5>
                                        <p className="card-text text-muted small">{item.description?.substring(0, 80)}</p>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="h4 text-primary fw-bold">${item.price}</span>
                                            <button 
                                                className="btn btn-dark rounded-pill px-3"
                                                onClick={() => addToCart(item)}
                                            >
                                                <FaShoppingCart className="me-1" /> Add to Cart
                                            </button>
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

export default Wishlist;