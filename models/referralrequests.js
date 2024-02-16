const mongoose = require("mongoose")

const referralSchema = new mongoose.Schema({
    asked_by: {
        type: String,
        required: true,
    },
    asked_to: {
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
    price: {
        type: String,
        required: true,
    },
    resume:{
        type:String,
        default:""
    },
    proof:{
        type:String,
        default:""
    },
    status:{
        type:Boolean,
        default:false
    }
})
module.exports = mongoose.model("Referral request", referralSchema)