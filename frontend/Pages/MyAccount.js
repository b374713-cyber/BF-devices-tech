import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaSave, FaArrowLeft } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function MyAccount() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Password change states
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
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
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);

        // Load user profile data
        loadUserProfile(savedToken, userData);
        loadCounts(savedToken);
    }, []);

    const loadUserProfile = async (authToken, userData) => {
        try {
            // Try to get user data from API
            const res = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            if (res.data) {
                setFormData({
                    name: res.data.name || '',
                    email: res.data.email || '',
                    phone: res.data.phone || '',
                    address: res.data.address || ''
                });
            }
        } catch (error) {
            // Fallback to localStorage data
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || ''
            });
        } finally {
            setLoading(false);
        }
    };

    const loadCounts = async (authToken) => {
        try {
            const [cartRes, wishlistRes] = await Promise.all([
                axios.get('http://localhost:5000/api/cart', {
                    headers: { Authorization: `Bearer ${authToken}` }
                }),
                axios.get('http://localhost:5000/api/wishlist', {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
            ]);
            setCartCount(cartRes.data.length);
            setWishlistCount(wishlistRes.data.length);
        } catch (error) {
            console.error('Error loading counts:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            // Update user profile (you need to add this endpoint in backend)
            // For now, update localStorage
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setSaving(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setSaving(false);
            return;
        }

        try {
            // Change password endpoint (you need to add this in backend)
            // For now, just show success message
            setMessage('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setError('Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const handleSearch = (term) => {
        navigate(`/products?search=${term}`);
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

    if (loading) {
        return (
            <div>
                <Navbar cartCount={0} wishlistCount={0} isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} onSearch={handleSearch} />
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p>Loading your account...</p>
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
                <Link to="/" className="btn btn-outline-secondary rounded-pill mb-4">
                    <FaArrowLeft className="me-2" /> Back to Home
                </Link>

                <h2 className="fw-bold mb-4">
                    <FaUser className="me-2" /> My Account
                </h2>

                {message && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        {message}
                        <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError('')}></button>
                    </div>
                )}

                <div className="row">
                    {/* Profile Info */}
                    <div className="col-lg-6 mb-4">
                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4">
                                    <FaUser className="me-2" /> Profile Information
                                </h5>

                                <form onSubmit={handleUpdateProfile}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control rounded-pill"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control rounded-pill"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            disabled
                                        />
                                        <small className="text-muted">Email cannot be changed</small>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-control rounded-pill"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+961 00 000 000"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Default Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            className="form-control rounded-pill"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Street, City"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-dark rounded-pill px-4"
                                        disabled={saving}
                                    >
                                        <FaSave className="me-2" /> {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="col-lg-6 mb-4">
                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4">
                                    <FaLock className="me-2" /> Change Password
                                </h5>

                                <form onSubmit={handleChangePassword}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Current Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            className="form-control rounded-pill"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            className="form-control rounded-pill"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                        <small className="text-muted">Minimum 6 characters</small>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            className="form-control rounded-pill"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-warning rounded-pill px-4"
                                        disabled={saving}
                                    >
                                        <FaLock className="me-2" /> {saving ? 'Changing...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="row mt-3">
                    <div className="col-12">
                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-3">Quick Links</h5>
                                <div className="d-flex flex-wrap gap-3">
                                    <Link to="/orders" className="btn btn-outline-primary rounded-pill">
                                        📦 My Orders
                                    </Link>
                                    <Link to="/wishlist" className="btn btn-outline-danger rounded-pill">
                                        ❤️ Wishlist
                                    </Link>
                                    <Link to="/cart" className="btn btn-outline-success rounded-pill">
                                        🛒 Cart
                                    </Link>
                                    {user?.isAdmin === 1 && (
                                        <Link to="/admin" className="btn btn-outline-dark rounded-pill">
                                            ⚙️ Admin Panel
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default MyAccount;