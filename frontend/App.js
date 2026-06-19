import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Products from './Pages/Products';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Wishlist from './Pages/Wishlist';
import Cart from './Pages/Cart';
import Checkout from './Pages/Checkout';
import Admin from './Pages/Admin';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import ProductDetails from './Pages/ProductDetails';
import MyOrders from './Pages/MyOrders';
import MyAccount from './Pages/MyAccount';
import Search from './Pages/Search';
import StockAlert from './Components/StockAlert';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import StripeCheckout from './Pages/StripeCheckout';
import PaymentSuccess from './Pages/PaymentSuccess';
import PaymentCancel from './Pages/PaymentCancel';

function App() {
    return (
        <Router>
            <StockAlert />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/categories" element={<Products />} />
                <Route path="/categories/:slug" element={<Products />} />
                <Route path="/contact" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/stripe-checkout" element={<StripeCheckout />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/account" element={<MyAccount />} />
                <Route path="/search" element={<Search />} />
            </Routes>
        </Router>
    );
}

export default App;