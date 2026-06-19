const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./models/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/upload', require('./routes/upload'));  // <-- ADD THIS LINE
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
///
// Add these lines to server.js
app.use('/api/payment', require('./routes/payment'));

// Webhook needs raw body
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
//
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));
// Test route
app.get('/', (req, res) => {
    res.json({ message: 'BF Devices Tech API is running!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});