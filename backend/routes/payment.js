const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../models/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create Stripe Checkout Session
router.post('/create-checkout-session', verifyToken, async (req, res) => {
    const userId = req.userId;

    try {
        // Get user's cart items
        const cartItems = await new Promise((resolve, reject) => {
            db.all(`
                SELECT c.product_id, c.quantity, p.price, p.name, p.image_url
                FROM user_cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            `, [userId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create line items for Stripe
        const lineItems = cartItems.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: item.image_url ? [item.image_url] : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses cents
            },
            quantity: item.quantity,
        }));

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-cancel`,
            metadata: {
                userId: userId.toString(),
                items: JSON.stringify(cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name
                })))
            }
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Verify payment and create order
router.post('/verify-payment', verifyToken, async (req, res) => {
    const { sessionId } = req.body;
    const userId = req.userId;

    try {
        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        const metadata = session.metadata;
        const items = JSON.parse(metadata.items || '[]');
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create order in database
        const orderId = await new Promise((resolve, reject) => {
            db.run(`INSERT INTO orders (user_id, total, shipping_address, payment_method, status) VALUES (?, ?, ?, 'stripe', 'processing')`,
                [userId, total, 'Stripe Payment - ' + sessionId],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                });
        });

        // Add order items
        const stmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`);
        items.forEach(item => {
            stmt.run([orderId, item.product_id, item.quantity, item.price]);
        });
        stmt.finalize();

        // Clear user's cart
        db.run(`DELETE FROM user_cart WHERE user_id = ?`, [userId]);

        res.json({ 
            success: true, 
            orderId: orderId,
            message: 'Payment verified and order created!'
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;