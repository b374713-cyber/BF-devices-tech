import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaShoppingCart, FaApple, FaAndroid } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function Home() {
    const [products, setProducts] = useState([]);
    const [latestProducts, setLatestProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const navigate = useNavigate();

    // Hero slider images - 10 real tech images
    const slides = [
        { id: 1, image: 'https://images.unsplash.com/photo-1701615005357-3d1d6f8ea2e3?w=1200', title: 'iPhone 16 Pro', subtitle: 'Latest iPhone', btnText: 'Shop Now' },
        { id: 2, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200', title: 'Samsung Galaxy S24', subtitle: 'Galaxy AI', btnText: 'Shop Now' },
        { id: 3, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200', title: 'Google Pixel 9', subtitle: 'Google AI', btnText: 'Shop Now' },
        { id: 4, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200', title: 'MacBook Pro', subtitle: 'M3 chip', btnText: 'Shop Now' },
        { id: 5, image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=1200', title: 'Xiaomi 14', subtitle: 'Leica camera', btnText: 'Shop Now' },
        { id: 6, image: 'https://images.unsplash.com/photo-1686932521912-7fdd7f7fe071?w=1200', title: 'Galaxy Z Fold', subtitle: 'Foldable', btnText: 'Shop Now' },
        { id: 7, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200', title: 'Sony Headphones', subtitle: 'Noise cancellation', btnText: 'Shop Now' },
        { id: 8, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200', title: 'iPad Pro', subtitle: 'M4 chip', btnText: 'Shop Now' },
        { id: 9, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200', title: 'Apple Watch', subtitle: 'Series 9', btnText: 'Shop Now' },
        { id: 10, image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=1200', title: 'OnePlus 12', subtitle: 'Flagship killer', btnText: 'Shop Now' }
    ];

    // Features
    const features = [
        { icon: '🚚', text: 'Free Delivery All Over Lebanon' },
        { icon: '💳', text: 'Safe Payment & Cash On Delivery' },
        { icon: '⭐', text: 'Best Prices In The Market' },
        { icon: '🛡️', text: '1 Year Warranty' },
        { icon: '📞', text: '24/7 Customer Support' }
    ];

    // Load products from API
    useEffect(() => {
     axios.get('http://localhost:5000/api/products')
    .then(res => {
        const productData = res.data.products || res.data;
        setProducts(productData);
        setLatestProducts(Array.isArray(productData) ? productData.slice(0, 6) : []);
    })
    .catch(err => console.error(err));
    
    }, []);

    // Load categories from API
    useEffect(() => {
        axios.get('http://localhost:5000/api/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error(err));
    }, []);

    // Auto-slide carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    // Load cart and wishlist counts
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const cart = JSON.parse(savedCart);
            setCartCount(cart.length);
        }
        
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            const wishlist = JSON.parse(savedWishlist);
            setWishlistCount(wishlist.length);
        }
    }, []);

const handleSearch = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
};
    const addToCart = (product) => {
        const savedCart = localStorage.getItem('cart');
        let cart = savedCart ? JSON.parse(savedCart) : [];
        
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        setCartCount(cart.length);
        alert(`${product.name} added to cart!`);
    };

    return (
        <div>
            {/* Navbar Component */}
            <Navbar 
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                onSearch={handleSearch}
            />

            {/* Hero Carousel */}
            <div id="heroCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
                <div className="carousel-indicators">
                    {slides.map((_, idx) => (
                        <button key={idx} type="button" data-bs-target="#heroCarousel" data-bs-slide-to={idx} className={idx === currentSlide ? 'active' : ''} aria-label={`Slide ${idx + 1}`}></button>
                    ))}
                </div>
                <div className="carousel-inner">
                    {slides.map((slide, idx) => (
                        <div key={slide.id} className={`carousel-item ${idx === currentSlide ? 'active' : ''}`}>
                            <img src={slide.image} className="d-block w-100" alt={slide.title} style={{ height: '550px', objectFit: 'cover' }} />
                            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-4 p-4">
                                <h2 className="display-4 fw-bold">{slide.title}</h2>
                                <p className="lead">{slide.subtitle}</p>
                                <button className="btn btn-primary btn-lg px-5 rounded-pill">{slide.btnText}</button>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            {/* Features Bar */}
            <div className="bg-primary text-white py-3 overflow-hidden">
                <div className="container">
                    <div className="d-flex justify-content-around flex-wrap">
                        {features.map((feature, idx) => (
                            <div key={idx} className="text-center px-3">
                                <span className="fs-2 me-2">{feature.icon}</span>
                                <span className="fw-semibold">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Shop by Category Section - From API */}
            <div className="container py-5">
                <h2 className="text-center mb-5 fw-bold">Shop by Category</h2>
                <div className="row g-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="col-md-4 col-lg-2">
                            <Link to={`/categories/${cat.slug}`} className="text-decoration-none">
                                <div className="card text-center border-0 shadow-sm h-100 category-card">
                                    <div className="card-body">
                                        <div className="display-1 mb-3">{cat.icon}</div>
                                        <h5 className="card-title text-dark">{cat.name}</h5>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Brand Banners */}
            <div className="container py-4">
                <div className="row g-4">
                    <div className="col-md-6">
                        <Link to="/categories/phones?brand=Apple" className="text-decoration-none">
                            <div className="card border-0 rounded-4 overflow-hidden shadow-sm banner-card">
                                <div className="card-body text-white p-5 text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                    <FaApple size={60} className="mb-3" />
                                    <h3 className="fw-bold">iPhone Series</h3>
                                    <p className="lead">Starting from $999</p>
                                    <button className="btn btn-light btn-lg rounded-pill px-4">Shop Now →</button>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="col-md-6">
                        <Link to="/categories/phones?brand=Samsung" className="text-decoration-none">
                            <div className="card border-0 rounded-4 overflow-hidden shadow-sm banner-card">
                                <div className="card-body text-white p-5 text-center" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                    <FaAndroid size={60} className="mb-3" />
                                    <h3 className="fw-bold">Samsung Galaxy</h3>
                                    <p className="lead">Starting from $899</p>
                                    <button className="btn btn-light btn-lg rounded-pill px-4">Shop Now →</button>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Latest Products Section */}
            <div className="container py-5">
                <h2 className="text-center mb-5 fw-bold">Latest Arrivals</h2>
                <div className="row g-4">
                    {latestProducts.map(product => (
                        <div key={product.id} className="col-md-4 col-lg-3">
                            <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden product-card">
                                <img 
                                    src={product.image_url || 'https://via.placeholder.com/300'} 
                                    className="card-img-top" 
                                    alt={product.name} 
                                    style={{ height: '250px', objectFit: 'cover' }} 
                                />
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <span className="badge bg-primary">{product.category_name || 'Electronics'}</span>
                                        <span className="badge bg-warning text-dark">{product.brand || 'Brand'}</span>
                                    </div>
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="card-text text-muted small">{product.description?.substring(0, 60)}...</p>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <span className="h4 text-primary fw-bold">${product.price}</span>
                                        <button 
                                            className="btn btn-dark rounded-pill px-4"
                                            onClick={() => addToCart(product)}
                                        >
                                            <FaShoppingCart className="me-2" /> Buy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-5">
                    <Link to="/products">
                        <button className="btn btn-outline-primary btn-lg px-5 rounded-pill">View All Products →</button>
                    </Link>
                </div>
            </div>

            {/* Footer Component */}
            <Footer />
        </div>
    );
}

export default Home;