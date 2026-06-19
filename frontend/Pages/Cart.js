import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function Cart() {
    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [shipping, setShipping] = useState(10);
    const [total, setTotal] = useState(0);
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
        
        loadCart(savedToken);
        loadWishlistCount(savedToken);
    }, []);

    const loadCart = async (authToken) => {
        try {
            const res = await axios.get('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setCart(res.data);
            setCartCount(res.data.length);
            
            const subtotalAmount = res.data.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            setSubtotal(subtotalAmount);
            setTotal(subtotalAmount + shipping);
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const loadWishlistCount = async (authToken) => {
        try {
            const res = await axios.get('http://localhost:5000/api/wishlist', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setWishlistCount(res.data.length);
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    };

    const updateQuantity = async (cartId, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity < 1) return;
        
        try {
            await axios.put(`http://localhost:5000/api/cart/${cartId}`, 
                { quantity: newQuantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadCart(token);
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating quantity');
        }
    };

    const removeItem = async (cartId, productName) => {
        if (window.confirm(`Remove ${productName} from cart?`)) {
            try {
                await axios.delete(`http://localhost:5000/api/cart/${cartId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Item removed from cart');
                loadCart(token);
            } catch (error) {
                alert(error.response?.data?.message || 'Error removing item');
            }
        }
    };

    const handleSearch = (term) => {
        window.location.href = `/search?q=${encodeURIComponent(term)}`;
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
                    <p>Please login to view your cart</p>
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

            <div className="container py-5">
                <h2 className="fw-bold mb-4">
                    <FaShoppingCart className="me-2" /> Shopping Cart ({cartCount})
                </h2>

                {cart.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="display-1 mb-3">🛒</div>
                        <h4>Your cart is empty</h4>
                        <p className="text-muted">Add some products to your cart!</p>
                        <Link to="/products" className="btn btn-primary rounded-pill px-4">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 rounded-4">
                                <div className="card-body p-4">
                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Price</th>
                                                    <th>Quantity</th>
                                                    <th>Total</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cart.map(item => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <img 
                                                                    src={item.image_url || 'https://via.placeholder.com/60'} 
                                                                    alt={item.name}
                                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                                                />
                                                                <div>
                                                                    <h6 className="mb-0">{item.name}</h6>
                                                                    <small className="text-muted">Stock: {item.stock}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>${item.price}</td>
                                                        <td>
                                                            <div className="input-group" style={{ width: '120px' }}>
                                                                <button 
                                                                    className="btn btn-outline-secondary"
                                                                    onClick={() => updateQuantity(item.id, item.quantity, -1)}
                                                                >
                                                                    <FaMinus size={10} />
                                                                </button>
                                                                <input 
                                                                    type="text" 
                                                                    className="form-control text-center"
                                                                    value={item.quantity}
                                                                    readOnly
                                                                />
                                                                <button 
                                                                    className="btn btn-outline-secondary"
                                                                    onClick={() => updateQuantity(item.id, item.quantity, 1)}
                                                                >
                                                                    <FaPlus size={10} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger rounded-pill"
                                                                onClick={() => removeItem(item.id, item.name)}
                                                            >
                                                                <FaTrash /> Remove
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

                        <div className="col-lg-4 mt-4 mt-lg-0">
                            <div className="card shadow-sm border-0 rounded-4">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-4">Order Summary</h5>
                                    
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Shipping</span>
                                        <span>${shipping.toFixed(2)}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-3">
                                        <strong>Total</strong>
                                        <strong className="text-primary fs-5">${total.toFixed(2)}</strong>
                                    </div>
                                    
                                    <Link to="/checkout">
                                        <button className="btn btn-dark w-100 rounded-pill py-2 mb-2">
                                            Proceed to Checkout →
                                        </button>
                                    </Link>
                                    <Link to="/stripe-checkout">
                                        <button className="btn btn-primary w-100 rounded-pill py-2 mb-2">
                                            <FaCreditCard className="me-2" /> Pay with Card (Stripe)
                                        </button>
                                    </Link>
                                    <Link to="/products" className="btn btn-outline-secondary w-100 rounded-pill py-2">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default Cart;