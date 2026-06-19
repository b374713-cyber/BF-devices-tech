const express = require('express');
const db = require('../models/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Validate coupon (public)
router.post('/validate', (req, res) => {
    const { code, total } = req.body;
    
    db.get(`SELECT * FROM coupons WHERE code = ? AND expires_at > datetime('now') AND used_count < max_uses`,
        [code.toUpperCase()], (err, coupon) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon' });
            
            const discount = coupon.type === 'percentage' 
                ? (total * coupon.value / 100) 
                : coupon.value;
                
            res.json({
                valid: true,
                code: coupon.code,
                discount: Math.min(discount, total),
                totalAfterDiscount: total - Math.min(discount, total)
            });
        });
});

// Admin: Create coupon
router.post('/', verifyToken, verifyAdmin, (req, res) => {
    const { code, type, value, max_uses, expires_at } = req.body;
    
    db.run(`INSERT INTO coupons (code, type, value, max_uses, expires_at) VALUES (?, ?, ?, ?, ?)`,
        [code.toUpperCase(), type, value, max_uses || 100, expires_at],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, code });
        });
});

module.exports = router;