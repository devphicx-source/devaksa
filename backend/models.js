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
    email: { type: String, required: true },
    countryCode: { type: String, required: true },
    mobile: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'new' }, // new, contacted, closed
    createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export const Product = mongoose.model('Product', ProductSchema);
export const Review = mongoose.model('Review', ReviewSchema);
export const Enquiry = mongoose.model('Enquiry', EnquirySchema);
