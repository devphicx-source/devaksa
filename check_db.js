require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to DB');
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);
        users.forEach(u => {
            console.log(`User: ${u.email}`);
            console.log(`Cart (${u.cart ? u.cart.length : 0} items):`, JSON.stringify(u.cart, null, 2));
            console.log('-------------------');
        });
        mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
