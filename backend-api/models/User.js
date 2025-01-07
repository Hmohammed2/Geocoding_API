const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true, index: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    occupation: { type: String },
    isPayingCustomer: { type: String, enum: ['yes', 'no'], default: 'no' },
    password: { type: String, required: true }
})

module.exports = mongoose.model('User', userSchema);