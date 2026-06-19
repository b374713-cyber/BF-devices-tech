import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaShoppingCart, FaHeart, FaRegHeart, 
    FaStar, FaStarHalfAlt, FaRegStar, FaMinus, FaPlus,
    FaUser, FaTrash 
} from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [inWishlist, setInWishlist] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [token, setToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [activeImage, setActiveImage] = useState(0);

    // Review states
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [userReview, setUserReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, title: '', comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Sample product images
    const productImages = [
        product?.image_url,
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600',
        'https://images.unsplash.com/photo-1592286927505-1def25115558?w=600',
    ];

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
        }
        
        loadProduct();
        loadReviews();
    }, [id]);

    useEffect(() => {
        if (token && product) {
            checkWishlist();
            checkUserReview();
            loadCartCount();
            loadWishlistCount();
        }
    }, [token, product]);

    const loadProduct = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/products/${id}`);
            setProduct(res.data);
        } catch (error) {
            console.error('Error loading product:', error);
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const loadReviews = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reviews/product/${id}`);
            setReviews(res.data.reviews);
            setAverageRating(res.data.averageRating);
            setTotalReviews(res.data.totalReviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    };

    const checkUserReview = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/reviews/check/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserReview(res.data.review);
        } catch (error) {
            console.error('Error checking review:', error);
        }
    };

    const checkWishlist = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/wishlist/check/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInWishlist(res.data.inWishlist);
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const loadCartCount = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartCount(res.data.length);
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const loadWishlistCount = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlistCount(res.data.length);
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    };

    const toggleWishlist = async () => {
        if (!token) {
            alert('Please login first');
            navigate('/login');
            return;
        }

        try {
            if (inWishlist) {
                await axios.delete(`http://localhost:5000/api/wishlist/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInWishlist(false);
                loadWishlistCount();
            } else {
                await axios.post('http://localhost:5000/api/wishlist', 
                    { product_id: id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setInWishlist(true);
                loadWishlistCount();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating wishlist');
        }
    };

    const addToCart = async () => {
        if (!token) {
            alert('Please login first');
            navigate('/login');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/cart', 
                { product_id: id, quantity: quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`${product?.name} added to cart!`);
            loadCartCount();
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding to cart');
        }
    };

    const updateQuantity = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (product?.stock || 99)) {
            setQuantity(newQuantity);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!token) {
            alert('Please login to review');
            navigate('/login');
            return;
        }
        
        setSubmittingReview(true);
        try {
            await axios.post('http://localhost:5000/api/reviews', 
                { product_id: id, ...reviewData },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Review submitted!');
            setShowReviewForm(false);
            setReviewData({ rating: 5, title: '', comment: '' });
            loadReviews();
            checkUserReview();
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const deleteReview = async () => {
        if (!window.confirm('Are you sure you want to delete your review?')) return;
        
        try {
            await axios.delete(`http://localhost:5000/api/reviews/${userReview.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Review deleted');
            setUserReview(null);
            loadReviews();
        } catch (error) {
            alert('Error deleting review');
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

    // Render stars
    const renderStars = (rating = 0) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <>
                {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className="text-warning" />)}
                {hasHalfStar && <FaStarHalfAlt className="text-warning" />}
                {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`empty-${i}`} className="text-warning" />)}
            </>
        );
    };

    if (loading) {
        return (
            <div>
                <Navbar cartCount={cartCount} wishlistCount={wishlistCount} isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} onSearch={handleSearch} />
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p>Loading product details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div>
                <Navbar cartCount={cartCount} wishlistCount={wishlistCount} isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} onSearch={handleSearch} />
                <div className="container py-5 text-center">
                    <h4>Product not found</h4>
                    <Link to="/products" className="btn btn-primary">Back to Products</Link>
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
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                        <li className="breadcrumb-item"><Link to="/products">Products</Link></li>
                        <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
                    </ol>
                </nav>

                <div className="row">
                    {/* Product Images */}
                    <div className="col-md-6 mb-4">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <img 
                                src={productImages[activeImage] || product.image_url || 'https://via.placeholder.com/500'} 
                                className="img-fluid" 
                                alt={product.name}
                                style={{ height: '400px', width: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div className="row mt-3 g-2">
                            {productImages.map((img, idx) => (
                                <div key={idx} className="col-3">
                                    <img 
                                        src={img || product.image_url || 'https://via.placeholder.com/100'} 
                                        className={`img-fluid rounded-3 cursor-pointer ${activeImage === idx ? 'border border-primary border-2' : 'opacity-75'}`}
                                        style={{ height: '80px', width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                        onClick={() => setActiveImage(idx)}
                                        alt={`Product view ${idx + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="col-md-6">
                        <span className="badge bg-primary mb-2">{product.category_name || 'Electronics'}</span>
                        <h1 className="fw-bold mb-2">{product.name}</h1>
                        <div className="d-flex align-items-center mb-3">
                            <div className="me-2">
                                {renderStars(averageRating)}
                            </div>
                            <span className="text-muted">({totalReviews} reviews)</span>
                            <span className="mx-2">|</span>
                            <span className="text-success">In Stock ({product.stock} available)</span>
                        </div>

                        <div className="mb-4">
                            <span className="display-5 fw-bold text-primary">${product.price}</span>
                        </div>

                        <p className="text-muted mb-4">{product.description}</p>

                        <div className="mb-4">
                            <h6 className="fw-bold">Brand:</h6>
                            <p>{product.brand || 'Generic'}</p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mb-4">
                            <h6 className="fw-bold mb-2">Quantity:</h6>
                            <div className="d-flex align-items-center">
                                <div className="input-group" style={{ width: '130px' }}>
                                    <button 
                                        className="btn btn-outline-secondary"
                                        onClick={() => updateQuantity(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        <FaMinus />
                                    </button>
                                    <input 
                                        type="text" 
                                        className="form-control text-center"
                                        value={quantity}
                                        readOnly
                                    />
                                    <button 
                                        className="btn btn-outline-secondary"
                                        onClick={() => updateQuantity(1)}
                                        disabled={quantity >= product.stock}
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                                <span className="ms-3 text-muted">Max: {product.stock} items</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-3 mb-4">
                            <button 
                                className="btn btn-dark btn-lg px-5 rounded-pill flex-grow-1"
                                onClick={addToCart}
                                disabled={product.stock === 0}
                            >
                                <FaShoppingCart className="me-2" /> Add to Cart
                            </button>
                            <button 
                                className={`btn btn-lg rounded-pill px-4 ${inWishlist ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={toggleWishlist}
                            >
                                {inWishlist ? <FaHeart /> : <FaRegHeart />}
                            </button>
                        </div>

                        {product.stock === 0 && (
                            <div className="alert alert-warning">Out of stock</div>
                        )}

                        {/* Product Meta */}
                        <hr />
                        <div className="row">
                            <div className="col-6">
                                <small className="text-muted">SKU: #PD-{product.id}</small>
                            </div>
                            <div className="col-6 text-end">
                                <small className="text-muted">Category: {product.category_name}</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="row mt-5">
                    <div className="col-12">
                        <ul className="nav nav-tabs" id="productTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#description" type="button" role="tab">Description</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" data-bs-toggle="tab" data-bs-target="#specifications" type="button" role="tab">Specifications</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab">Reviews ({totalReviews})</button>
                            </li>
                        </ul>
                        <div className="tab-content p-4 bg-light rounded-3" style={{ borderTopLeftRadius: 0 }}>
                            <div className="tab-pane fade show active" id="description" role="tabpanel">
                                <h5>Product Description</h5>
                                <p>{product.description || 'No description available.'}</p>
                                <h6>Key Features:</h6>
                                <ul>
                                    <li>Premium quality materials</li>
                                    <li>Latest technology</li>
                                    <li>1 year warranty</li>
                                    <li>Free shipping on orders over $50</li>
                                </ul>
                            </div>
                            <div className="tab-pane fade" id="specifications" role="tabpanel">
                                <h5>Technical Specifications</h5>
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr><td style={{ width: '200px' }}><strong>Brand</strong></td><td>{product.brand || 'Generic'}</td></tr>
                                        <tr><td><strong>Model</strong></td><td>{product.name}</td></tr>
                                        <tr><td><strong>Category</strong></td><td>{product.category_name}</td></tr>
                                        <tr><td><strong>Warranty</strong></td><td>1 Year</td></tr>
                                        <tr><td><strong>Availability</strong></td><td>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Reviews Tab */}
                            <div className="tab-pane fade" id="reviews" role="tabpanel">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold mb-0">
                                        Customer Reviews 
                                        {totalReviews > 0 && (
                                            <span className="text-muted fs-6">({totalReviews})</span>
                                        )}
                                    </h5>
                                    {averageRating > 0 && (
                                        <div className="text-end">
                                            <div className="fs-4">
                                                {renderStars(averageRating)}
                                            </div>
                                            <span className="text-muted">{averageRating} out of 5</span>
                                        </div>
                                    )}
                                </div>

                                {/* Write Review Button */}
                                {!userReview && token && (
                                    <button 
                                        className="btn btn-primary rounded-pill mb-3"
                                        onClick={() => setShowReviewForm(!showReviewForm)}
                                    >
                                        {showReviewForm ? 'Cancel' : 'Write a Review'}
                                    </button>
                                )}

                                {userReview && (
                                    <div className="alert alert-success">
                                        You reviewed this product: {userReview.rating}⭐ - {userReview.title}
                                        <button className="btn btn-sm btn-outline-danger ms-3" onClick={deleteReview}>
                                            <FaTrash /> Delete Review
                                        </button>
                                    </div>
                                )}

                                {/* Review Form */}
                                {showReviewForm && !userReview && (
                                    <form onSubmit={submitReview} className="mb-4 p-3 bg-light rounded-4">
                                        <h6>Write Your Review</h6>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Rating *</label>
                                            <div className="d-flex gap-2">
                                                {[1, 2, 3, 4, 5].map(num => (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        className={`btn btn-outline-warning rounded-pill ${reviewData.rating === num ? 'active bg-warning text-dark' : ''}`}
                                                        onClick={() => setReviewData({...reviewData, rating: num})}
                                                    >
                                                        {num}⭐
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                className="form-control rounded-pill"
                                                placeholder="Review title (optional)"
                                                value={reviewData.title}
                                                onChange={(e) => setReviewData({...reviewData, title: e.target.value})}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <textarea
                                                className="form-control rounded-3"
                                                rows="3"
                                                placeholder="Write your review..."
                                                value={reviewData.comment}
                                                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-dark rounded-pill" disabled={submittingReview}>
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                )}

                                {/* Reviews List */}
                                {reviews.length === 0 ? (
                                    <p className="text-muted text-center py-3">No reviews yet. Be the first!</p>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {reviews.map(review => (
                                            <div key={review.id} className="list-group-item border-0 px-0 py-3">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FaUser className="text-secondary" />
                                                            <strong>{review.user_name}</strong>
                                                            <span className="text-warning">{'⭐'.repeat(review.rating)}</span>
                                                            <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                                                        </div>
                                                        {review.title && <h6 className="mt-1">{review.title}</h6>}
                                                        <p className="mb-0">{review.comment}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default ProductDetails;