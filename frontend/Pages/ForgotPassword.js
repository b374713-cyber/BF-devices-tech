import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage(res.data.message);
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error sending reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar cartCount={0} wishlistCount={0} />
            
            <div className="container py-5" style={{ minHeight: '70vh' }}>
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-body p-5">
                                <h2 className="text-center fw-bold mb-4">Forgot Password</h2>
                                <p className="text-center text-muted mb-4">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                                
                                {message && (
                                    <div className="alert alert-success text-center">{message}</div>
                                )}
                                
                                {error && (
                                    <div className="alert alert-danger text-center">{error}</div>
                                )}
                                
                                <form onSubmit={handleSubmit}>
                                    <input 
                                        type="email" 
                                        className="form-control form-control-lg mb-3 rounded-pill" 
                                        placeholder="Email Address" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-dark btn-lg w-100 rounded-pill"
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </form>
                                
                                <hr className="my-4" />
                                
                                <p className="text-center mb-0">
                                    <Link to="/login" className="text-primary fw-bold text-decoration-none">
                                        Back to Login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
}

export default ForgotPassword;