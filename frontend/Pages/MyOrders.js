import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBox, FaEye, FaBan, FaCheckCircle, FaTruck, FaClock, FaFileInvoice } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [token, setToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

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
        
        loadOrders(savedToken);
        loadCartCount(savedToken);
        loadWishlistCount(savedToken);
    }, []);

    const loadOrders = async (authToken) => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setOrders(res.data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
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

    const viewOrderDetails = async (orderId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedOrder(res.data);
            setShowOrderModal(true);
        } catch (error) {
            alert('Error loading order details');
        }
    };

    const cancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Order cancelled');
                loadOrders(token);
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling order');
            }
        }
    };

    const getStatusSteps = (status) => {
        const steps = ['pending', 'processing', 'shipped', 'delivered'];
        const currentIndex = steps.indexOf(status);
        return steps.map((step, index) => ({
            label: step.charAt(0).toUpperCase() + step.slice(1),
            active: index <= currentIndex,
            completed: index < currentIndex
        }));
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'bg-warning', icon: <FaClock />, text: 'Pending' },
            processing: { class: 'bg-info', icon: <FaCheckCircle />, text: 'Processing' },
            shipped: { class: 'bg-primary', icon: <FaTruck />, text: 'Shipped' },
            delivered: { class: 'bg-success', icon: <FaCheckCircle />, text: 'Delivered' },
            cancelled: { class: 'bg-danger', icon: <FaBan />, text: 'Cancelled' }
        };
        return badges[status] || { class: 'bg-secondary', icon: <FaBox />, text: status };
    };

    const handleSearch = (term) => {
        window.location.href = `/search?q=${encodeURIComponent(term)}`;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div>
                <Navbar cartCount={cartCount} wishlistCount={wishlistCount} isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} onSearch={handleSearch} />
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p>Loading your orders...</p>
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
                    <FaBox className="me-2" /> My Orders
                </h2>

                {orders.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="display-1 mb-3">📦</div>
                        <h4>No orders yet</h4>
                        <p className="text-muted">You haven't placed any orders yet.</p>
                        <Link to="/products" className="btn btn-primary rounded-pill px-4">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="row">
                        {orders.map(order => {
                            const status = getStatusBadge(order.status);
                            const steps = getStatusSteps(order.status);
                            return (
                                <div key={order.id} className="col-12 mb-4">
                                    <div className="card shadow-sm border-0 rounded-4">
                                        <div className="card-body p-4">
                                            <div className="row align-items-center">
                                                <div className="col-md-3">
                                                    <h6 className="text-muted mb-1">Order #</h6>
                                                    <p className="fw-bold mb-0">#{order.id}</p>
                                                </div>
                                                <div className="col-md-3">
                                                    <h6 className="text-muted mb-1">Date</h6>
                                                    <p className="mb-0">{new Date(order.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="col-md-2">
                                                    <h6 className="text-muted mb-1">Total</h6>
                                                    <p className="fw-bold text-primary mb-0">${order.total?.toFixed(2)}</p>
                                                </div>
                                                <div className="col-md-2">
                                                    <h6 className="text-muted mb-1">Status</h6>
                                                    <span className={`badge ${status.class} px-3 py-2`}>
                                                        {status.icon} {status.text}
                                                    </span>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="d-flex gap-2 flex-wrap">
                                                        <button 
                                                            className="btn btn-outline-primary btn-sm rounded-pill"
                                                            onClick={() => viewOrderDetails(order.id)}
                                                        >
                                                            <FaEye /> View
                                                        </button>
                                                        {order.status === 'pending' && (
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm rounded-pill"
                                                                onClick={() => cancelOrder(order.id)}
                                                            >
                                                                <FaBan /> Cancel
                                                            </button>
                                                        )}
                                                        {order.invoice_url && (
                                                            <a 
                                                                href={order.invoice_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="btn btn-sm btn-outline-info rounded-pill"
                                                            >
                                                                <FaFileInvoice className="me-1" /> Invoice
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Tracking Timeline */}
                                            <div className="row mt-3">
                                                <div className="col-12">
                                                    <div className="d-flex justify-content-between align-items-center px-2">
                                                        {steps.map((step, idx) => (
                                                            <div key={idx} className="text-center flex-grow-1">
                                                                <div 
                                                                    className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${step.completed ? 'bg-success' : step.active ? 'bg-primary' : 'bg-secondary'}`} 
                                                                    style={{ width: '30px', height: '30px', color: 'white', fontSize: '13px' }}
                                                                >
                                                                    {step.completed ? '✓' : step.active ? '●' : '○'}
                                                                </div>
                                                                <small className={`d-block mt-1 ${step.active ? 'text-dark fw-bold' : 'text-muted'}`}>
                                                                    {step.label}
                                                                </small>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content rounded-4">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">Order #{selectedOrder.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowOrderModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <p><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                        <p><strong>Status:</strong> <span className={`badge ${getStatusBadge(selectedOrder.status).class}`}>{selectedOrder.status}</span></p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Shipping Address:</strong> {selectedOrder.shipping_address}</p>
                                        <p><strong>Payment Method:</strong> {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : selectedOrder.payment_method}</p>
                                    </div>
                                </div>
                                
                                <h6 className="fw-bold mb-3">Order Items</h6>
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items?.map(item => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <img src={item.image_url || 'https://via.placeholder.com/40'} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '5px' }} />
                                                            <span>{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>{item.quantity}</td>
                                                    <td>${item.price}</td>
                                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr><td colSpan="3" className="text-end fw-bold">Total:</td><td className="fw-bold text-primary">${selectedOrder.total?.toFixed(2)}</td></tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {selectedOrder.invoice_url && (
                                    <div className="mt-3">
                                        <a 
                                            href={selectedOrder.invoice_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-info rounded-pill"
                                        >
                                            <FaFileInvoice className="me-2" /> Download Invoice
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-secondary rounded-pill" onClick={() => setShowOrderModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default MyOrders;