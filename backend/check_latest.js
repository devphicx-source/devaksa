const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Enquiry } = require('./models');

dotenv.config();

async function checkLatest() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const latest = await Enquiry.findOne().sort({ createdAt: -1 });
        if (latest) {
            console.log("LATEST ENQUIRY:");
            console.log("Name:", latest.name);
            console.log("Country Code:", latest.countryCode || "MISSING");
            console.log("Mobile:", latest.mobile || "MISSING");
            console.log("Full Object:", JSON.stringify(latest, null, 2));
        } else {
            console.log("No enquiries found.");
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}
checkLatest();
