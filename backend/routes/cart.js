const express = require('express');
const db = require('../models/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get user's cart (ONLY current user's items)
router.get('/', verifyToken, (req, res) => {
    const userId = req.userId;
    
    db.all(`
        SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url, p.stock
        FROM user_cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// Add to cart (for current user only)
router.post('/', verifyToken, (req, res) => {
    const { product_id, quantity } = req.body;
    const userId = req.userId;
    
    if (!product_id) {
        return res.status(400).json({ message: 'Product ID required' });
    }
    
    // Check if already in this user's cart
    db.get(`SELECT id, quantity FROM user_cart WHERE user_id = ? AND product_id = ?`, 
        [userId, product_id], (err, existing) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (existing) {
                // Update quantity for current user only
                const newQty = existing.quantity + (quantity || 1);
                db.run(`UPDATE user_cart SET quantity = ? WHERE id = ? AND user_id = ?`, 
                    [newQty, existing.id, userId], (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ message: 'Cart updated' });
                    });
            } else {
                // Add new item for current user only
                db.run(`INSERT INTO user_cart (user_id, product_id, quantity) VALUES (?, ?, ?)`,
                    [userId, product_id, quantity || 1], function(err) {
                        if (err) return res.status(500).json({ error: err.message });
                        res.status(201).json({ message: 'Added to cart' });
                    });
            }
        });
});

// Update cart item quantity (current user only)
router.put('/:id', verifyToken, (req, res) => {
    const { quantity } = req.body;
    const userId = req.userId;
    const cartId = req.params.id;
    
    if (quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    db.run(`UPDATE user_cart SET quantity = ? WHERE id = ? AND user_id = ?`, 
        [quantity, cartId, userId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Cart item not found' });
            res.json({ message: 'Cart updated' });
        });
});

// Remove from cart (current user only)
router.delete('/:id', verifyToken, (req, res) => {
    const userId = req.userId;
    const cartId = req.params.id;
    
    db.run(`DELETE FROM user_cart WHERE id = ? AND user_id = ?`, [cartId, userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Removed from cart' });
    });
});

module.exports = router;