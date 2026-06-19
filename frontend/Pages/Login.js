import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                alert('Login successful!');
                navigate('/');
                window.location.reload();
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
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
                                <h2 className="text-center fw-bold mb-4">Welcome Back</h2>
                                <p className="text-center text-muted mb-4">Login to your account</p>
                                
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
                                    <input 
                                        type="password" 
                                        className="form-control form-control-lg mb-3 rounded-pill" 
                                        placeholder="Password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-dark btn-lg w-100 rounded-pill"
                                        disabled={loading}
                                    >
                                        {loading ? 'Please wait...' : 'Login'}
                                    </button>
                                </form>
                                
                                <hr className="my-4" />
                                
                                <p className="text-center mb-0">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-primary fw-bold text-decoration-none">
                                        Create one here
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

export default Login;