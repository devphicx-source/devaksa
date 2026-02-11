require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const { User, Product, Review, Enquiry } = require('./models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env file");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('✅ MongoDB Connected Successfully'))
        .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

// --- API ROUTES ---

// 1. AUTHENTICATION
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// 2. REVIEWS
app.post('/api/reviews', async (req, res) => {
    try {
        const review = new Review(req.body);
        await review.save();
        res.status(201).json({ message: 'Review submitted' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting review', error });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
});

// 3. ENQUIRIES
app.post('/api/enquiries', async (req, res) => {
    try {
        const enquiry = new Enquiry(req.body);
        await enquiry.save();
        res.status(201).json({ message: 'Enquiry sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending enquiry', error });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
