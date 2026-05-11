const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Enquiry } = require('./models');

dotenv.config();

async function checkEnquiries() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const enquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(5);
        console.log("Recent Enquiries:");
        console.log(JSON.stringify(enquiries, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

checkEnquiries();
