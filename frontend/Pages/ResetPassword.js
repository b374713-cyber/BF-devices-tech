import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validToken, setValidToken] = useState(true);

    useEffect(() => {
        // Verify token is valid
        const verifyToken = async () => {
            try {
                await axios.post('http://localhost:5000/api/auth/verify-reset-token', { token });
                setValidToken(true);
            } catch (err) {
                setValidToken(false);
                setError('Invalid or expired reset link. Please request a new one.');
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
                token,
                password
            });
            setMessage(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error resetting password');
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
                                <h2 className="text-center fw-bold mb-4">Reset Password</h2>
                                <p className="text-center text-muted mb-4">
                                    Enter your new password below.
                                </p>
                                
                                {!validToken && (
                                    <div className="alert alert-danger text-center">
                                        {error}
                                        <br />
                                        <Link to="/forgot-password" className="btn btn-primary mt-3 rounded-pill">
                                            Request New Reset Link
                                        </Link>
                                    </div>
                                )}
                                
                                {message && (
                                    <div className="alert alert-success text-center">{message}</div>
                                )}
                                
                                {error && !message && validToken && (
                                    <div className="alert alert-danger text-center">{error}</div>
                                )}
                                
                                {validToken && (
                                    <form onSubmit={handleSubmit}>
                                        <input 
                                            type="password" 
                                            className="form-control form-control-lg mb-3 rounded-pill" 
                                            placeholder="New Password (min 6 characters)" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required 
                                        />
                                        <input 
                                            type="password" 
                                            className="form-control form-control-lg mb-3 rounded-pill" 
                                            placeholder="Confirm New Password" 
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                            required 
                                        />
                                        <button 
                                            type="submit" 
                                            className="btn btn-dark btn-lg w-100 rounded-pill"
                                            disabled={loading}
                                        >
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </form>
                                )}
                                
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

export default ResetPassword;