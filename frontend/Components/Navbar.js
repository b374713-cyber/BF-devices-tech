import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaHeart, FaSearch, FaSignOutAlt, FaCog } from 'react-icons/fa';

function Navbar({ cartCount, wishlistCount, onSearch }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        checkLoginStatus();
        window.addEventListener('storage', checkLoginStatus);
        return () => window.removeEventListener('storage', checkLoginStatus);
    }, []);

    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        setIsLoggedIn(false);
        setUser(null);
        navigate('/');
        window.location.reload();
    };

const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
};

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div className="container">
                <Link className="navbar-brand fw-bold fs-3" to="/">BF Devices Tech</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/products">Products</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/categories">Categories</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>
                    </ul>
                    
                    <form onSubmit={handleSearch} className="d-flex me-3">
                        <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            placeholder="Search products..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '200px' }}
                        />
                        <button type="submit" className="btn btn-outline-light btn-sm ms-1">
                            <FaSearch />
                        </button>
                    </form>

                    <div className="d-flex gap-2">
                        <Link to="/wishlist" className="btn btn-outline-light position-relative">
                            <FaHeart />
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {wishlistCount || 0}
                            </span>
                        </Link>
                        <Link to="/cart" className="btn btn-outline-light position-relative">
                            <FaShoppingCart />
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {cartCount || 0}
                            </span>
                        </Link>
                        
                        {isLoggedIn ? (
                            <div className="dropdown">
                                <button 
                                    className="btn btn-light dropdown-toggle" 
                                    data-bs-toggle="dropdown" 
                                    aria-expanded="false"
                                    style={{ minWidth: '100px' }}
                                >
                                    <FaUser className="me-1" /> {user?.name?.split(' ')[0] || 'User'}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><Link className="dropdown-item" to="/account">📋 My Account</Link></li>
                                    <li><Link className="dropdown-item" to="/orders">📦 My Orders</Link></li>
                                    <li><Link className="dropdown-item" to="/wishlist">❤️ Wishlist</Link></li>
                                    <li><Link className="dropdown-item" to="/account">My Account</Link></li>
                                    {user?.isAdmin === 1 && (
                                        <li><Link className="dropdown-item" to="/admin">
                                            <FaCog className="me-2" /> Admin Panel
                                        </Link></li>
                                    )}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button 
                                            className="dropdown-item text-danger" 
                                            onClick={handleLogout}
                                        >
                                            <FaSignOutAlt className="me-2" /> Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link to="/register" className="btn btn-outline-light">
                                <FaUser className="me-1" /> Register
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;