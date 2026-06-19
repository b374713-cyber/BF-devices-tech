const express = require('express');
const db = require('../models/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/users', verifyToken, verifyAdmin, (req, res) => {
    db.all(`SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get all orders with user details (admin only)
router.get('/orders', verifyToken, verifyAdmin, (req, res) => {
    db.all(`
        SELECT o.*, u.name as user_name, u.email as user_email 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get single order details with items (admin only)
router.get('/orders/:id', verifyToken, verifyAdmin, (req, res) => {
    db.get(`SELECT o.*, u.name as user_name, u.email as user_email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?`, [req.params.id], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        db.all(`SELECT oi.*, p.name as product_name, p.image_url 
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?`, [req.params.id], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...order, items });
        });
    });
});

// Update order status (admin only)
router.put('/orders/:id/status', verifyToken, verifyAdmin, (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    
    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order status updated', status });
    });
});

// Get dashboard stats (admin only)
router.get('/stats', verifyToken, verifyAdmin, (req, res) => {
    const stats = {};
    
    // Total products
    db.get(`SELECT COUNT(*) as total FROM products`, [], (err, row) => {
        stats.totalProducts = row?.total || 0;
        
        // Total users
        db.get(`SELECT COUNT(*) as total FROM users`, [], (err, row) => {
            stats.totalUsers = row?.total || 0;
            
            // Total orders
            db.get(`SELECT COUNT(*) as total, SUM(total) as revenue FROM orders WHERE status != 'cancelled'`, [], (err, row) => {
                stats.totalOrders = row?.total || 0;
                stats.totalRevenue = row?.revenue || 0;
                
                // Pending orders
                db.get(`SELECT COUNT(*) as total FROM orders WHERE status = 'pending'`, [], (err, row) => {
                    stats.pendingOrders = row?.total || 0;
                    
                    // Low stock products (less than 10)
                    db.all(`SELECT id, name, stock FROM products WHERE stock < 10 ORDER BY stock ASC`, [], (err, rows) => {
                        stats.lowStockProducts = rows || [];
                        res.json(stats);
                    });
                });
            });
        });
    });
});

// Update product stock (admin only)
router.put('/products/:id/stock', verifyToken, verifyAdmin, (req, res) => {
    const { stock } = req.body;
    
    db.run(`UPDATE products SET stock = ? WHERE id = ?`, [stock, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Stock updated', stock });
    });
});

// Get all active sessions (users logged in)
router.get('/active-users', verifyToken, verifyAdmin, (req, res) => {
    db.all(`
        SELECT id, name, email, is_admin, 
        datetime(created_at) as last_active 
        FROM users 
        WHERE datetime(created_at) > datetime('now', '-30 minutes')
        ORDER BY created_at DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Delete user (admin only)
router.delete('/users/:id', verifyToken, verifyAdmin, (req, res) => {
    const userId = req.params.id;
    
    // Check if trying to delete self
    if (userId == req.userId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted' });
    });
});

module.exports = router;