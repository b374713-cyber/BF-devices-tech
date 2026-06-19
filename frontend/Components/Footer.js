import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-dark text-white pt-5 pb-4 mt-5">
            <div className="container">
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <h3 className="fw-bold mb-3">BF Devices Tech</h3>
                        <p className="text-secondary">Your one-stop shop for the latest tech gadgets, smartphones, laptops, and accessories in Lebanon.</p>
                        <div className="d-flex gap-3 mt-3">
                            <a href="#" className="text-white text-decoration-none fs-4">📘</a>
                            <a href="#" className="text-white text-decoration-none fs-4">📷</a>
                            <a href="#" className="text-white text-decoration-none fs-4">🐦</a>
                            <a href="#" className="text-white text-decoration-none fs-4">📹</a>
                        </div>
                    </div>
                    <div className="col-md-2 mb-4">
                        <h5 className="fw-bold mb-3">Shop</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/products" className="text-secondary text-decoration-none">All Products</Link></li>
                            <li className="mb-2"><Link to="/categories/phones" className="text-secondary text-decoration-none">Phones</Link></li>
                            <li className="mb-2"><Link to="/categories/laptops" className="text-secondary text-decoration-none">Laptops</Link></li>
                            <li className="mb-2"><Link to="/categories/accessories" className="text-secondary text-decoration-none">Accessories</Link></li>
                        </ul>
                    </div>
                    <div className="col-md-3 mb-4">
                        <h5 className="fw-bold mb-3">Support</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/contact" className="text-secondary text-decoration-none">Contact Us</Link></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Delivery Policy</a></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Returns & Refunds</a></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div className="col-md-3 mb-4">
                        <h5 className="fw-bold mb-3">Newsletter</h5>
                        <p className="text-secondary">Subscribe for exclusive offers!</p>
                        <div className="input-group">
                            <input type="email" className="form-control" placeholder="Your email" />
                            <button className="btn btn-primary">Subscribe</button>
                        </div>
                    </div>
                </div>
                <hr className="my-3" />
                <div className="text-center text-secondary">
                    <p>© 2026 BF Devices Tech. All rights reserved. Built with ❤️</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;