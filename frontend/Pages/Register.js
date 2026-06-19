import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

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
            const res = await axios.post('http://localhost:5000/api/auth/register', { 
                name, 
                email, 
                password 
            });
            
            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Email may already exist.');
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
                                <h2 className="text-center fw-bold mb-4">Create Account</h2>
                                <p className="text-center text-muted mb-4">Join us for exclusive deals!</p>
                                
                                {error && (
                                    <div className="alert alert-danger text-center">{error}</div>
                                )}
                                
                                {success && (
                                    <div className="alert alert-success text-center">{success}</div>
                                )}
                                
                                <form onSubmit={handleSubmit}>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-lg mb-3 rounded-pill" 
                                        placeholder="Full Name" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                    />
                                    <input 
                                        type="email" 
                                        className="form-control form-control-lg mb-3 rounded-pill" 
                                        placeholder="Email Address" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                    />
                                    <input 
                                        type="password" 
                                        className="form-control form-control-lg mb-3 rounded-pill" 
                                        placeholder="Password (min 6 characters)" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                    />
                                    <input 
                                        type="password" 
                                        className="form-control form-control-lg mb-3 rounded-pill" 
                                        placeholder="Confirm Password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        required 
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-dark btn-lg w-100 rounded-pill"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating Account...' : 'Register'}
                                    </button>
                                </form>
                                
                                <hr className="my-4" />
                                
                                <p className="text-center mb-0">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-primary fw-bold text-decoration-none">
                                        Login here
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

export default Register;