import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

function StockAlert() {
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [showAlert, setShowAlert] = useState(true);
    const [token, setToken] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
            const user = JSON.parse(savedUser);
            if (user.isAdmin === 1) {
                setToken(savedToken);
                setIsAdmin(true);
                checkLowStock(savedToken);
                
                // Check every 30 seconds
                const interval = setInterval(() => {
                    checkLowStock(savedToken);
                }, 30000);
                
                return () => clearInterval(interval);
            }
        }
    }, []);

    const checkLowStock = async (authToken) => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/stats', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setLowStockProducts(res.data.lowStockProducts || []);
            setShowAlert(true);
        } catch (error) {
            console.error('Error checking stock:', error);
        }
    };

    if (!isAdmin || lowStockProducts.length === 0 || !showAlert) {
        return null;
    }

    return (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <div className="toast show" role="alert" style={{ minWidth: '300px' }}>
                <div className="toast-header bg-danger text-white">
                    <FaExclamationTriangle className="me-2" />
                    <strong className="me-auto">Low Stock Alert</strong>
                    <small>{lowStockProducts.length} product(s)</small>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowAlert(false)}></button>
                </div>
                <div className="toast-body">
                    {lowStockProducts.map(product => (
                        <div key={product.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                            <span>{product.name}</span>
                            <span className="badge bg-danger">Stock: {product.stock}</span>
                        </div>
                    ))}
                    <div className="mt-2">
                        <small className="text-muted">Please restock these items soon.</small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StockAlert;