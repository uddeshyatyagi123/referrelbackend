const mongoose = require("mongoose")

const referralSchema = new mongoose.Schema({
    posted_by: {
        type: String,
        required: true,
    },
    company_name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    qualifications: {
        type: String,
        required: true,
    },
    salary: {
        type: String,
        required: true,
    }
})
module.exports = mongoose.model("Referral", referralSchema)