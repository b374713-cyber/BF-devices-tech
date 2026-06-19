import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setError('No session ID found');
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const res = await axios.post('http://localhost:5000/api/payment/verify-payment', 
                    { sessionId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                if (res.data.success) {
                    setOrderId(res.data.orderId);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Payment verification failed');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [sessionId]);

    if (loading) {
        return (
            <div>
                <Navbar cartCount={0} wishlistCount={0} />
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3">Verifying your payment...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Navbar cartCount={0} wishlistCount={0} />
                <div className="container py-5 text-center">
                    <div className="display-1 text-danger mb-3">❌</div>
                    <h4>Payment Verification Failed</h4>
                    <p className="text-danger">{error}</p>
                    <Link to="/cart" className="btn btn-primary rounded-pill">Back to Cart</Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar cartCount={0} wishlistCount={0} />
            <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
                <div className="display-1 text-success mb-3">
                    <FaCheckCircle />
                </div>
                <h2 className="fw-bold">✅ Payment Successful!</h2>
                <p className="lead">Your order has been placed successfully.</p>
                
                {orderId && (
                    <p className="text-muted">Order #{orderId}</p>
                )}
                
                <div className="mt-4 d-flex gap-3 justify-content-center">
                    <Link to="/orders" className="btn btn-dark rounded-pill px-4">
                        View My Orders
                    </Link>
                    <Link to="/products" className="btn btn-outline-primary rounded-pill px-4">
                        Continue Shopping
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PaymentSuccess;