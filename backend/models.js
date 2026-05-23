import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String },
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, sparse: true },
    password: { type: String }, // Optional for OTP flow
    otp: { type: String },
    otpExpiry: { type: Date },
    cart: [{
        productName: String,
        price: Number,
        image: String,
        quantity: { type: Number, default: 1 }
    }],
    createdAt: { type: Date, default: Date.now }
});

// Product Schema
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // URL or path
    badge: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Review Schema
const ReviewSchema = new mongoose.Schema({
    productName: { type: String, required: true }, // Store name for simplicity or ObjectId if referenced
    reviewerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Enquiry Schema
const EnquirySchema = new mongoose.Schema({
    productName: { type: String },
    name: { type: String, required: true },
    email: { type: String },
    countryCode: { type: String },
    mobile: { type: String },
    phone: { type: String },
    message: { type: String, required: true },
    status: { type: String, default: 'new' }, // new, contacted, closed
    createdAt: { type: Date, default: Date.now }
});

// Order Schema
const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productName: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        quantity: { type: Number, default: 1 }
    }],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    paymentMethod: { type: String, default: 'COD', enum: ['COD', 'Prepaid'] },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'] },
    tracking: [{
        status: { type: String },
        message: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export const Product = mongoose.model('Product', ProductSchema);
export const Review = mongoose.model('Review', ReviewSchema);
export const Enquiry = mongoose.model('Enquiry', EnquirySchema);
export const Order = mongoose.model('Order', OrderSchema);
