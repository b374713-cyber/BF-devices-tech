const express = require('express');
const db = require('../models/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all reviews for a product
router.get('/product/:productId', (req, res) => {
    const productId = req.params.productId;
    
    db.all(`
        SELECT r.*, u.name as user_name 
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    `, [productId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Calculate average rating
        if (rows.length > 0) {
            const total = rows.reduce((sum, r) => sum + r.rating, 0);
            const average = total / rows.length;
            res.json({
                reviews: rows,
                averageRating: Math.round(average * 10) / 10,
                totalReviews: rows.length
            });
        } else {
            res.json({
                reviews: [],
                averageRating: 0,
                totalReviews: 0
            });
        }
    });
});

// Add a review (authenticated)
router.post('/', verifyToken, (req, res) => {
    const { product_id, rating, title, comment } = req.body;
    const userId = req.userId;
    
    if (!product_id || !rating) {
        return res.status(400).json({ message: 'Product ID and rating required' });
    }
    
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Check if user already reviewed this product
    db.get(`SELECT id FROM reviews WHERE product_id = ? AND user_id = ?`, 
        [product_id, userId], (err, existing) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (existing) {
                return res.status(400).json({ message: 'You already reviewed this product' });
            }
            
            db.run(`INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)`,
                [product_id, userId, rating, title || '', comment || ''],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json({ 
                        message: 'Review added successfully', 
                        reviewId: this.lastID 
                    });
                });
        });
});

// Check if user has reviewed a product
router.get('/check/:productId', verifyToken, (req, res) => {
    const userId = req.userId;
    const productId = req.params.productId;
    
    db.get(`SELECT id, rating, title, comment FROM reviews WHERE product_id = ? AND user_id = ?`,
        [productId, userId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ reviewed: !!row, review: row });
        });
});

// Delete a review (user can delete their own)
router.delete('/:id', verifyToken, (req, res) => {
    const userId = req.userId;
    const reviewId = req.params.id;
    
    db.run(`DELETE FROM reviews WHERE id = ? AND user_id = ?`,
        [reviewId, userId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Review not found' });
            res.json({ message: 'Review deleted' });
        });
});

module.exports = router;