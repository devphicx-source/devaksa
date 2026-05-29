import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import { User, Product, Review, Enquiry, Order } from './models.js';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';

const app = express();
const PORT = process.env.PORT || 8989;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Error:', err));

// --- Custom OTP Auth (Twilio) ---
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && authToken && accountSid !== 'YOUR_TWILIO_SID') {
    client = twilio(accountSid, authToken);
}

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
    try {
        const { phone, name } = req.body; // 'phone' should include country code (e.g., +919876543210)
        if (!phone) return res.status(400).json({ message: 'Phone required' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        await User.findOneAndUpdate(
            { phone },
            { otp, otpExpiry: expiry, name },
            { upsert: true, new: true }
        );

        // Twilio API Call
        if (client && twilioNumber) {
            await client.messages.create({
                body: `Your Devaksa verification code is: ${otp}. Valid for 5 minutes.`,
                from: twilioNumber,
                to: phone
            });
            res.json({ message: 'OTP sent' });
        } else {
            console.log(`[DEV] OTP for ${phone}: ${otp}`);
            res.json({ message: 'OTP sent (Dev mode)', otp });
        }
    } catch (error) {
        if (error.code && (error.code === 21211 || error.code === 21608 || error.status)) {
            console.error('Twilio Error:', error.message);
            return res.status(400).json({ message: `Twilio Error: ${error.message}` });
        }
        console.error('Server Error:', error);
        res.status(500).json({ message: error.code === 11000 ? 'Phone number already in use or Database Index Error' : 'Failed to send OTP' });
    }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const user = await User.findOne({ phone });

        if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { phone: user.phone, name: user.name } });
    } catch (error) {
        res.status(500).json({ message: 'Verification error' });
    }
});

// Reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const review = new Review(req.body);
        await review.save();
        res.status(201).json({ message: 'Submitted' });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

// Enquiries
app.post('/api/enquiries', async (req, res) => {
    try {
        const enquiry = new Enquiry(req.body);
        await enquiry.save();
        res.status(201).json({ message: 'Sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

// Auth Middleware
function auth(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Cart
app.get('/api/cart', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.cart || []);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/cart', auth, async (req, res) => {
    try {
        const { productName, price, image } = req.body;
        const user = await User.findById(req.user.id);
        if (!user.cart) user.cart = [];
        const existing = user.cart.find(i => i.productName === productName);
        if (existing) existing.quantity += 1;
        else user.cart.push({ productName, price, image, quantity: 1 });
        await user.save();
        res.json({ cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

// --- ORDER ROUTES ---

// Create Order
app.post('/api/orders', auth, async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, totalAmount } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });

        const order = new Order({
            user: req.user.id,
            items,
            shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            totalAmount,
            status: 'Confirmed',
            tracking: [
                { status: 'Confirmed', message: 'Order placed and confirmed!', timestamp: new Date() }
            ]
        });
        await order.save();

        // Clear user cart after ordering
        await User.findByIdAndUpdate(req.user.id, { cart: [] });

        res.status(201).json({ message: 'Order placed!', orderId: order._id, order });
    } catch (error) {
        console.error('Order Error:', error);
        res.status(500).json({ message: 'Failed to place order' });
    }
});

// Get all orders of logged-in user
app.get('/api/orders/user', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Get single order by ID
app.get('/api/orders/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order' });
    }
});

// Cancel Order
app.patch('/api/orders/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
        
        if (order.status === 'Delivered' || order.status === 'Cancelled') {
            return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}` });
        }

        order.status = 'Cancelled';
        order.tracking.push({
            status: 'Cancelled',
            message: 'Order was cancelled by you.',
            timestamp: new Date()
        });

        await order.save();
        res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling order' });
    }
});

// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
        }
    });
}

app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
