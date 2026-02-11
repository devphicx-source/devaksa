const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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
    message: { type: String, required: true },
    status: { type: String, default: 'new' }, // new, contacted, closed
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Enquiry = mongoose.model('Enquiry', EnquirySchema);

module.exports = { User, Product, Review, Enquiry };
