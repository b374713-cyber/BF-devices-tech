const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// Upload single image (admin only)
router.post('/image', verifyToken, verifyAdmin, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err.message);
            return res.status(400).json({ message: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ 
            imageUrl, 
            filename: req.file.filename,
            message: 'Image uploaded successfully!'
        });
    });
});

module.exports = router;