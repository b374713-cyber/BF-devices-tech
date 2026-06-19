import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function StripeCheckout() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (!savedToken) {
            navigate('/login');
            return;
        }
        setToken(savedToken);
        loadCart(savedToken);
    }, []);

    const loadCart = async (authToken) => {
        try {
            const res = await axios.get('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setCart(res.data);
            const totalAmount = res.data.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            setTotal(totalAmount);
            setLoading(false);
        } catch (error) {
            console.error('Error loading cart:', error);
            setError('Failed to load cart');
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/payment/create-checkout-session', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Redirect to Stripe Checkout
            window.location.href = response.data.url;
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create checkout session');
            setLoading(false);
        }
    };

    if (loading && cart.length === 0) {
        return (
            <div>
                <Navbar cartCount={0} wishlistCount={0} />
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p>Loading checkout...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar cartCount={cart.length} wishlistCount={0} />
            <div className="container py-5" style={{ minHeight: '60vh' }}>
                <h2 className="fw-bold mb-4">💳 Checkout with Stripe</h2>

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                <div className="row">
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0 rounded-4 p-4">
                            <h5 className="fw-bold mb-4">Order Summary</h5>
                            {cart.map(item => (
                                <div key={item.id} className="d-flex justify-content-between border-bottom py-2">
                                    <div>
                                        <span className="fw-semibold">{item.name}</span>
                                        <br />
                                        <small className="text-muted">Qty: {item.quantity}</small>
                                    </div>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between">
                                <strong>Total</strong>
                                <strong className="text-primary fs-4">${total.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 rounded-4 p-4">
                            <h5 className="fw-bold mb-3">Payment</h5>
                            <p className="text-muted">You will be redirected to Stripe's secure payment page.</p>
                            <button 
                                className="btn btn-primary btn-lg w-100 rounded-pill"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? 'Redirecting...' : `Pay $${total.toFixed(2)} with Stripe`}
                            </button>
                            <Link to="/cart" className="btn btn-outline-secondary w-100 rounded-pill mt-2">
                                ← Back to Cart
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default StripeCheckout;