const express = require('express');
const db = require('../models/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get user's wishlist (ONLY current user's items)
router.get('/', verifyToken, (req, res) => {
    const userId = req.userId;  // This comes from the JWT token
    
    db.all(`
        SELECT w.id, w.product_id, p.name, p.price, p.image_url, p.description, c.name as category_name
        FROM user_wishlist w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    `, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// Add to wishlist (for current user only)
router.post('/', verifyToken, (req, res) => {
    const { product_id } = req.body;
    const userId = req.userId;  // Current logged-in user
    
    if (!product_id) {
        return res.status(400).json({ message: 'Product ID required' });
    }
    
    // Check if already in this user's wishlist
    db.get(`SELECT id FROM user_wishlist WHERE user_id = ? AND product_id = ?`, 
        [userId, product_id], (err, existing) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (existing) {
                return res.status(400).json({ message: 'Already in wishlist' });
            }
            
            // Add to current user's wishlist only
            db.run(`INSERT INTO user_wishlist (user_id, product_id) VALUES (?, ?)`,
                [userId, product_id], function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json({ message: 'Added to wishlist' });
                });
        });
});

// Remove from wishlist (from current user's wishlist only)
router.delete('/:productId', verifyToken, (req, res) => {
    const userId = req.userId;
    const productId = req.params.productId;
    
    // Delete only if it belongs to current user
    db.run(`DELETE FROM user_wishlist WHERE user_id = ? AND product_id = ?`, 
        [userId, productId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Item not in wishlist' });
            res.json({ message: 'Removed from wishlist' });
        });
});

// Check if product is in current user's wishlist
router.get('/check/:productId', verifyToken, (req, res) => {
    const userId = req.userId;
    const productId = req.params.productId;
    
    db.get(`SELECT id FROM user_wishlist WHERE user_id = ? AND product_id = ?`, 
        [userId, productId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ inWishlist: !!row });
        });
});

module.exports = router;