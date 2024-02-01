const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        min: 3
    },
    otp: {
        type: String,
        required: true,
        max: 4,
    },
})
module.exports = mongoose.model("OTP", otpSchema)