const express = require('express');
const db = require('../models/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all products with pagination
router.get('/', (req, res) => {
    const { category, search, page = 1, limit = 6 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `SELECT p.*, c.name as category_name, c.slug as category_slug 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id`;
    let countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id`;
    let params = [];
    let whereClause = '';
    
    if (category) {
        whereClause += ` WHERE c.slug = ?`;
        params.push(category);
    }
    
    if (search) {
        whereClause += params.length ? ` AND` : ` WHERE`;
        whereClause += ` (p.name LIKE ? OR p.brand LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }
    
    query += whereClause + ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    countQuery += whereClause;
    
    params.push(parseInt(limit), offset);
    
    // Get total count first
    db.get(countQuery, params.slice(0, -2), (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const total = countResult?.total || 0;
        
        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                products: rows,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            });
        });
    });
});

// Get single product
router.get('/:id', (req, res) => {
    db.get(`SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: 'Product not found' });
        res.json(row);
    });
});

// Admin: Create product
router.post('/', verifyToken, verifyAdmin, (req, res) => {
    const { name, description, price, category_id, brand, stock, image_url } = req.body;
    
    db.run(`INSERT INTO products (name, description, price, category_id, brand, stock, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, description, price, category_id, brand, stock, image_url],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, ...req.body });
        });
});

// Admin: Update product
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
    const { name, description, price, category_id, brand, stock, image_url } = req.body;
    
    db.run(`UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, brand = ?, stock = ?, image_url = ? WHERE id = ?`,
        [name, description, price, category_id, brand, stock, image_url, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product updated' });
        });
});

// Admin: Delete product
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
    db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted' });
    });
});

module.exports = router;