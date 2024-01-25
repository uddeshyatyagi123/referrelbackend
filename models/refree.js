const mongoose = require("mongoose")

const refreeSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        max: 20,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        min: 3,
        max: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        max: 50,
    },
    company: {
        type: String,
        required: true,
        max: 50,
    },
    password: {
        type: String,
        required: true,
        min: 8,
    }
})
module.exports = mongoose.model("Refree", refreeSchema)