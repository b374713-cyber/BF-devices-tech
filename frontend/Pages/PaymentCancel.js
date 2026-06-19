import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function PaymentCancel() {
    return (
        <div>
            <Navbar cartCount={0} wishlistCount={0} />
            <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
                <div className="display-1 text-warning mb-3">
                    <FaTimesCircle />
                </div>
                <h2 className="fw-bold">Payment Cancelled</h2>
                <p className="lead">Your payment was cancelled. No charges were made.</p>
                <div className="mt-4 d-flex gap-3 justify-content-center">
                    <Link to="/cart" className="btn btn-dark rounded-pill px-4">
                        Return to Cart
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

export default PaymentCancel;