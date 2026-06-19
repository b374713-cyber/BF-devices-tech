const express = require('express');
const db = require('../models/database');
const { verifyToken } = require('../middleware/auth');
const { generateInvoice } = require('../utils/invoice');

const router = express.Router();

// Create order from cart (SIMPLIFIED VERSION)
router.post('/', verifyToken, async (req, res) => {
    const userId = req.userId;
    const { shipping_address, payment_method } = req.body;
    
    console.log('📦 Creating order for user:', userId);
    
    if (!shipping_address) {
        return res.status(400).json({ message: 'Shipping address required' });
    }
    
    db.all(`
        SELECT c.product_id, c.quantity, p.price, p.name
        FROM user_cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `, [userId], async (err, cartItems) => {
        if (err) {
            console.error('❌ Cart error:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log('💰 Order total:', total);
        
        db.run(`INSERT INTO orders (user_id, total, shipping_address, payment_method, status) VALUES (?, ?, ?, ?, ?)`,
            [userId, total, shipping_address, payment_method || 'cod', payment_method === 'stripe' ? 'processing' : 'pending'],
            async function(err) {
                if (err) {
                    console.error('❌ Order insert error:', err);
                    return res.status(500).json({ error: err.message });
                }
                
                const orderId = this.lastID;
                console.log('✅ Order created ID:', orderId);
                
                // Add order items
                const stmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`);
                cartItems.forEach(item => {
                    stmt.run([orderId, item.product_id, item.quantity, item.price]);
                });
                stmt.finalize();
                
                // Clear cart
                db.run(`DELETE FROM user_cart WHERE user_id = ?`, [userId]);
                
                let invoiceUrl = null;
                
                // Generate invoice for COD orders
                if (payment_method === 'cod') {
                    try {
                        console.log('📄 Generating invoice for order:', orderId);
                        
                        const user = await new Promise((resolve, reject) => {
                            db.get(`SELECT name, email FROM users WHERE id = ?`, [userId], (err, row) => {
                                if (err) reject(err);
                                resolve(row);
                            });
                        });
                        
                        const orderItems = cartItems.map(item => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price
                        }));
                        
                        const orderData = {
                            id: orderId,
                            total: total,
                            shipping_address: shipping_address,
                            payment_method: 'cod',
                            status: 'pending',
                            created_at: new Date().toISOString()
                        };
                        
                        const invoice = await generateInvoice(orderData, orderItems, user);
                        invoiceUrl = `http://localhost:5000/invoices/${invoice.filename}`;
                        
                        // Save invoice URL
                        db.run(`UPDATE orders SET invoice_url = ? WHERE id = ?`, [invoiceUrl, orderId]);
                        console.log('✅ Invoice URL saved:', invoiceUrl);
                        
                    } catch (invoiceError) {
                        console.error('❌ Invoice generation error:', invoiceError);
                    }
                }
                
                res.status(201).json({ 
                    message: 'Order placed successfully', 
                    orderId: orderId,
                    total: total,
                    invoiceUrl: invoiceUrl
                });
            });
    });
});
// Get user's orders
router.get('/', verifyToken, (req, res) => {
    const userId = req.userId;
    
    db.all(`
        SELECT o.*, 
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    `, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// Get single order details
router.get('/:id', verifyToken, (req, res) => {
    const userId = req.userId;
    const orderId = req.params.id;
    
    db.get(`SELECT * FROM orders WHERE id = ? AND user_id = ?`, [orderId, userId], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        db.all(`
            SELECT oi.*, p.name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...order, items });
        });
    });
});

// Cancel order (only if pending)
router.put('/:id/cancel', verifyToken, (req, res) => {
    const userId = req.userId;
    const orderId = req.params.id;
    
    db.run(`UPDATE orders SET status = 'cancelled' WHERE id = ? AND user_id = ? AND status IN ('pending', 'processing')`,
        [orderId, userId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(400).json({ message: 'Order cannot be cancelled' });
            res.json({ message: 'Order cancelled' });
        });
});

module.exports = router;