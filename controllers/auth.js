const dotenv = require('dotenv')
const jwt = require("jsonwebtoken")
const auth = require("../middleware/auth")
const User = require("../models/user")
const otpsave = require("../models/otp")
const refree = require("../models/refree")
const express = require("express")
const session = require("express-session")
const cookieParser = require('cookie-parser')
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer')
// const fs = require('fs').promises
const multer = require('multer')
const referrals = require('../models/referrals')
const askreferrals = require('../models/referralrequests')
const cloudinary = require("../config/cloudinary")
const upload = require("../middleware/multer")
// const FormData = require('form-data')
// const axios = require('axios')
// const upload = multer()

// let permanent

const app = express()

app.use(express.json())
app.use(cookieParser())
dotenv.config()

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {},
    })
)

const { SMTP_EMAIL, SMTP_PASS } = process.env

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASS,
    },
})

app.post("/studentlogin", async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body
        const user = await User.findOne({ username })
        if (!user)
            return res.json({ msg: "Incorrect Username or Password", status: false })
        if (password.length < 8)
            return res.status(400).json({ msg: "Password cant be less than 8 characters" });
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid)
            return res.json({ msg: "Incorrect Username or Password", status: false })
        delete user.password
        const expiresIn = rememberMe ? '7d' : '2h';
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.TOKEN_KEY, { expiresIn })
        res.cookie('jwt', token, {
            secure: true,
            maxAge: expiresIn === '7d' ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.json({ msg: 'Login successful', status: true })
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: 'Server error', status: false })
    }
})

app.post("/studentregister", async (req, res) => {
    try {
        const { username, email } = req.body
        if (!username || !email)
            return res.status(500).json({ msg: "Enter the email and username fields correctly" })
        const usernameCheck = await User.findOne({ username })
        if (usernameCheck)
            return res.status(404).json({ error: 'Username already used' })
        const emailCheck = await User.findOne({ email })
        if (emailCheck)
            return res.status(404).json({ error: 'Email already used' })
        // const otpreq={...req,body:{email}}
        // await otp(otpreq,res)
        // return res.status(200).json({ msg: 'Check Mail for further process' })
        const otp = Math.floor(1000 + Math.random() * 9000)
        console.log(otp)
        const user = await otpsave.create({
            email,
            otp
        })
        // req.session.otp = otp
        // permanent = otp
        const mailOptions = {
            from: SMTP_EMAIL,
            to: email,
            subject: "Welcome To Referral Site",
            html: `<body>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7;">
            <table role="presentation" cellspacing="0" cellpadding="0"  width="600"
            style="margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);">
            <tr>
            <td>
            <h3 style="color: #0838bc; font-size: 24px; text-align: center; margin-bottom: 10px;">Verification Mail</h3>
            <hr style="border: 1px solid #ccc; margin: 20px 0;">
            <h4 style="font-size: 20px; color: #333;">Hi there,</h4>
            <p style="font-size: 16px; color: #333; margin: 20px 0;">Here is the otp to confirm your mail ${otp}</p>
            <p style="font-size: 16px; color: #333;">We are happy to have you as a user of our site.</p>
                        <div style="font-size: 16px; color: #333; margin-top: 20px; text-align: center;">
                        <h5 style="font-size: 18px;">Best Regards</h5>
                        <h5 style="font-size: 18px;">Referral Site</h5>
                        </div>
                    </td>
                    </tr>
                    </table>
                    </body>
                </body>`,
        }
        transporter
            .sendMail(mailOptions)
            .then(() => {
                console.log("Mail sent to the user")
                return res.status(200).json({ msg: 'Check mail for otp and verify it for registering successfully' })
            })
            .catch((err) => {
                console.log(err);
            })
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: 'Error registering the user' })
    }
})

app.post("/studentverify", async (req, res) => {
    const { name, username, email, degree, password, otp } = req.body
    if (!name || !username || !email || !degree || !password || !otp)
        return res.status(400).json({ msg: "Fill all the required fields" });
    if (password.length < 8)
        return res.status(400).json({ msg: "Password cant be less than 8 characters" });
    const user = await otpsave.findOne({ email })
    // console.log(user)
    // console.log(user.otp)
    // console.log(user.email)
    if (user.otp == otp) {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            username,
            degree,
            password: hashedPassword,
        })

        await otpsave.deleteOne({ email })
        return res.status(200).json({
            message: "Registered Successfully", user: {
                name: user.name,
                email: user.email,
                username: user.username,
                degree: user.degree
            }
        })
    } else {
        return res.status(400).json({ msg: "Invalid OTP cant register" })
    }
})

app.post("/uploadresume", async (req, res) => {
    try {
        const { username, resumelink } = req.body
        if (!username || !resumelink)
            return res.status(400).json({ msg: "Username of student and resume link is required" });
        const exists = await User.findOne({ username: username })
        exists.resume = resumelink
        exists.save()
        return res.status(200).json({ msg: "Updated successfully" })
    }
    catch (error) {
        return res.status(400).json({ msg: "Failed to upload data" })

    }
})

app.post("/referrerlogin", async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body
        const user = await refree.findOne({ username })
        if (!user)
            return res.status(403).json({ msg: "Incorrect Username or Password", status: false })
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid)
            return res.status(403).json({ msg: "Incorrect Username or Password", status: false })
        delete user.password
        const expiresIn = rememberMe ? '7d' : '2h';
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.TOKEN_KEY, { expiresIn })
        res.cookie('jwt', token, {
            secure: true,
            maxAge: expiresIn === '7d' ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.json({ msg: 'Login successful', status: true })
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: 'Server error', status: false })
    }
})

app.post("/referrerregister", async (req, res) => {
    try {
        const { username, email } = req.body
        const usernameCheck = await refree.findOne({ username })
        if (usernameCheck)
            return res.status(403).json({ error: 'Username already used' })
        const emailCheck = await refree.findOne({ email })
        if (emailCheck)
            return res.status(403).json({ error: 'Email already used' })
        // const otpreq={...req,body:{email}}
        // await otp(otpreq,res)
        // return res.status(200).json({ msg: 'Check Mail for further process' })
        const otp = Math.floor(1000 + Math.random() * 9000)
        // console.log(otp)
        // req.session.otp = otp
        console.log(otp)
        const user = await otpsave.create({
            email,
            otp
        })
        // permanent = otp
        const mailOptions = {
            from: SMTP_EMAIL,
            to: email,
            subject: "Welcome To Referral Site",
            html: `<body>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7;">
            <table role="presentation" cellspacing="0" cellpadding="0"  width="600"
            style="margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);">
            <tr>
            <td>
            <h3 style="color: #0838bc; font-size: 24px; text-align: center; margin-bottom: 10px;">Verification Mail</h3>
            <hr style="border: 1px solid #ccc; margin: 20px 0;">
            <h4 style="font-size: 20px; color: #333;">Hi there,</h4>
            <p style="font-size: 16px; color: #333; margin: 20px 0;">Here is the otp to confirm your mail ${otp}</p>
            <p style="font-size: 16px; color: #333;">We are happy to have you as a referrer of our site.</p>
                        <div style="font-size: 16px; color: #333; margin-top: 20px; text-align: center;">
                        <h5 style="font-size: 18px;">Best Regards</h5>
                        <h5 style="font-size: 18px;">Referral Site</h5>
                        </div>
                    </td>
                    </tr>
                    </table>
                    </body>
                </body>`,
        }
        transporter
            .sendMail(mailOptions)
            .then(() => {
                console.log("Mail sent to the user")
                return res.status(200).json({ msg: 'Mail sent to the user' })
            })
            .catch((err) => {
                console.log(err);
            })
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: 'Error registering the user' })
    }
})

app.post("/referrerverify", async (req, res) => {
    const { name, username, email, company, password, otp } = req.body
    if (!name || !email || !username || !company || !password)
        return res.status(500).json({ message: "Make sure to enter all the fields correctly" })
    const user = await otpsave.findOne({ email })
    // console.log(user)
    // console.log(user.otp)
    // console.log(user.email)
    if (user.otp == otp) {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await refree.create({
            name,
            email,
            username,
            company,
            password: hashedPassword,
        })
        // delete user.password
        await otpsave.deleteOne({ email })
        return res.status(200).json({
            message: "Registered Successfully", user: {
                name: user.name,
                email: user.email,
                username: user.username,
                company: user.company
            }
        });
    } else {
        return res.status(400).json({ msg: "Invalid OTP cant register" })
    }
})


app.post("/addreferral", async (req, res) => {
    try {
        const existingData = await referrals.findOne({ posted_by: req.body.posted_by })
        // console.log(existingData)
        if (existingData)
            return res.status(400).json({ message: 'Cant add this data as this user has already posted a job' });
        const { posted_by, company_name, description, qualifications, price } = req.body
        if (!posted_by || !company_name || !description || !qualifications || !price)
            return res.status(500).json({ message: "Make sure to enter all the fields correctly as all the fields are mandatory" })
        const user = await referrals.create({
            posted_by,
            company_name,
            description,
            qualifications,
            price
        })
        return res.status(200).json({ message: "Added successfully" })
    } catch (error) {
        return res.status(400).json({ message: "Error occured while adding the referral" })
    }
})

app.get("/referrals", async (req, res) => {
    try {
        const data = await referrals.find({})
        return res.status(200).json({ message: "Here's list of all posted referrals", data })
    } catch (error) {
        return res.status(400).json({ message: "Error occured while fetching the referrals" })
    }
})

app.post("/referrals", async (req, res) => {
    try {
        const { username } = req.body
        const data = await referrals.find({ posted_by: username })
        console.log(data)
        if (data.length == 0)
            return res.status(400).json({ message: "No referrals found for this user" })
        return res.status(200).json({
            message: 'Here is list of all posted referrals of',
            user: username,
            data
        })
    } catch (error) {
        return res.status(400).json({ message: "Error occured while fetching the referrals" })
    }
})


app.get("/home", auth, (req, res) => {
    return res.status(200).json({ msg: 'User Logged in and Session is Active' })
})

app.get("/logout", async (req, res) => {
    try {
        res.clearCookie('jwt')
        return res.status(200).json({ msg: 'User Logged out and session ended' })
    } catch (ex) {
        return res.status(400).json({ msg: 'Failed request' })
    }
})

app.post('/askreferral', async (req, res) => {
    try {
        const { asked_by, asked_to, company_name, description, qualifications, price } = req.body
        const existingData = await askreferrals.findOne({ asked_to: asked_to, asked_by: asked_by })
        // console.log(existingData)
        if (existingData)
            return res.status(400).json({ message: 'Cant ask referral for same job or referrer twice' });
        if (!asked_by || !asked_to || !company_name || !resume || !description || !qualifications || !price)
            return res.status(500).json({ message: "Make sure to enter all the fields correctly as all the fields are mandatory" })
        const userdata = await User.findOne({ username: asked_by })
        const refdata = await referrals.findOne({ posted_by: asked_to })
        const user = await askreferrals.create({
            asked_by,
            asked_to,
            company_name:refdata.company_name,
            description:refdata.description,
            resume:userdata.resume,
            qualifications:refdata.qualifications,
            price:refdata.price
        })
        return res.status(200).json({ message: "Added successfully" })
    } catch (error) {
        console.error(error)
        return res.status(400).json({ message: "Error occured while adding the referral" })
    }
})


app.post('/myreferrals', async (req, res) => {
    try {
        const { asked_to } = req.body
        if (!asked_to)
            return res.status(400).json({ msg: "need a username to fetch data" })
        const data = await askreferrals.find({ asked_to: asked_to })
        return res.status(200).json(data)
    } catch (error) {
        console.error(error)
        return res.status(400).json({ msg: "Cant fetch data" })
    }
})
app.post('/appliedreferrals', async (req, res) => {
    try {
        const { asked_by } = req.body
        if (!asked_by)
            return res.status(400).json({ msg: "need a username to fetch data" })
        const data = await askreferrals.find({ asked_by: asked_by })
        return res.status(200).json(data)
    } catch (error) {
        console.error(error)
        return res.status(400).json({ msg: "Cant fetch data" })
    }
})

app.post('/accept', async (req, res) => {
    try {
        const { asked_to, asked_by, proof } = req.body
        if (!asked_to || !asked_by || !proof)
            return res.status(400).json({ msg: "need both the username to fetch data and image link" })
        const data = await askreferrals.findOne({ asked_to: asked_to, asked_by: asked_by })
        data.status = true
        data.proof = proof
        data.save()
        return res.status(400).json({ msg: "Referral accepted successfully", info: data })
    } catch (error) {
        console.error(error)
        return res.status(400).json({ msg: "Cant fetch data" })
    }
})

app.post('/upload', async (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            console.log(err)
            return res.status(200).send("Error occured while uploading")
        }
        cloudinary.uploader.upload(req.file.path, function (err, result) {
            if (err) {
                console.log(err)
                return res.status(500).send("Error occured with cloudinary")
            }
            return res.status(200).json({ msg: "Uploaded successfully", imageUrl: result.url })
        })
    }
    )
})



module.exports = app;