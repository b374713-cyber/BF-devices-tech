import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function Checkout() {
    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [shipping, setShipping] = useState(10);
    const [total, setTotal] = useState(0);
    const [token, setToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        paymentMethod: 'cod'
    });
    
    const navigate = useNavigate();

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (!savedToken || !savedUser) {
            navigate('/login');
            return;
        }
        
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
        
        setFormData(prev => ({
            ...prev,
            fullName: JSON.parse(savedUser).name || '',
            email: JSON.parse(savedUser).email || ''
        }));
        
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

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePlaceOrder = async () => {
        if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city) {
            alert('Please fill in all fields');
            return;
        }
        
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        // If payment method is card, redirect to Stripe
        if (formData.paymentMethod === 'card') {
            navigate('/stripe-checkout');
            return;
        }
        
        setLoading(true);
        
        try {
            const shipping_address = `${formData.address}, ${formData.city}`;
            const res = await axios.post('http://localhost:5000/api/orders', 
                { 
                    shipping_address, 
                    payment_method: formData.paymentMethod 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (res.data.orderId) {
                alert('Order placed successfully!');
                navigate('/orders');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert(error.response?.data?.message || 'Error placing order. Please try again.');
        } finally {
            setLoading(false);
        }
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

    if (cart.length === 0 && !loading) {
        return (
            <div>
                <Navbar cartCount={0} wishlistCount={wishlistCount} isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} onSearch={handleSearch} />
                <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
                    <div className="display-1 mb-3">🛒</div>
                    <h4>Your cart is empty</h4>
                    <p className="text-muted">Add items to proceed to checkout</p>
                    <Link to="/products" className="btn btn-primary rounded-pill px-4">
                        Continue Shopping
                    </Link>
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
                <h2 className="fw-bold mb-4">Checkout</h2>
                
                <div className="row">
                    <div className="col-lg-7">
                        <div className="card shadow-sm border-0 rounded-4 mb-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4">Billing Information</h5>
                                
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Full Name *</label>
                                        <input 
                                            type="text" 
                                            name="fullName"
                                            className="form-control rounded-pill"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Email *</label>
                                        <input 
                                            type="email" 
                                            name="email"
                                            className="form-control rounded-pill"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Phone *</label>
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            className="form-control rounded-pill"
                                            placeholder="+961 00 000 000"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Address *</label>
                                        <input 
                                            type="text" 
                                            name="address"
                                            className="form-control rounded-pill"
                                            placeholder="Street, Building, Apartment"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">City *</label>
                                        <input 
                                            type="text" 
                                            name="city"
                                            className="form-control rounded-pill"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Payment Method *</label>
                                        <select 
                                            name="paymentMethod"
                                            className="form-select rounded-pill"
                                            value={formData.paymentMethod}
                                            onChange={handleInputChange}
                                        >
                                            <option value="cod">Cash on Delivery</option>
                                            <option value="card">💳 Credit Card (Stripe)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4">Order Summary</h5>
                                
                                <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {cart.map(item => (
                                        <div key={item.id} className="d-flex justify-content-between mb-3">
                                            <div>
                                                <span className="fw-semibold">{item.name}</span>
                                                <br />
                                                <small className="text-muted">Qty: {item.quantity}</small>
                                            </div>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <hr />
                                
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Shipping (Lebanon)</span>
                                    <span>${shipping.toFixed(2)}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-4">
                                    <strong className="fs-5">Total</strong>
                                    <strong className="text-primary fs-4">${total.toFixed(2)}</strong>
                                </div>
                                
                                <button 
                                    className="btn btn-dark w-100 rounded-pill py-2 mb-2"
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                >
                                    {loading ? 'Placing Order...' : 'Place Order →'}
                                </button>
                                
                                <Link to="/cart" className="btn btn-outline-secondary w-100 rounded-pill py-2">
                                    ← Back to Cart
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Checkout;