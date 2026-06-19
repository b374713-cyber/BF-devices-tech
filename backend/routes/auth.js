const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        [name, email, hashedPassword],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                return res.status(500).json({ message: err.message });
            }
            res.status(201).json({ 
                message: 'User created successfully',
                user: { id: this.lastID, name, email }
            });
        });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ message: 'Invalid email or password' });
        
        const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin }
        });
    });
});

// Get current user
router.get('/me', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        db.get(`SELECT id, name, email, is_admin FROM users WHERE id = ?`, [decoded.userId], (err, user) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(user);
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;