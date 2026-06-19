const express = require('express');
const db = require('../models/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', (req, res) => {
    db.all(`SELECT * FROM categories ORDER BY name`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get single category with products
router.get('/:slug', (req, res) => {
    db.get(`SELECT * FROM categories WHERE slug = ?`, [req.params.slug], (err, category) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        
        db.all(`SELECT * FROM products WHERE category_id = ?`, [category.id], (err, products) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...category, products });
        });
    });
});

// Admin: Create category
router.post('/', verifyToken, verifyAdmin, (req, res) => {
    const { name, slug, icon } = req.body;
    
    db.run(`INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)`,
        [name, slug, icon],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, name, slug, icon });
        });
});

// Admin: Update category
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
    const { name, slug, icon } = req.body;
    
    db.run(`UPDATE categories SET name = ?, slug = ?, icon = ? WHERE id = ?`,
        [name, slug, icon, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Category updated' });
        });
});

// Admin: Delete category
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
    db.run(`DELETE FROM categories WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Category deleted' });
    });
});

module.exports = router;