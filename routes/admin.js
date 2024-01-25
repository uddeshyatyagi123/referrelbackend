const express=require('express')
const router=express.Router()

const studentlogin=require('../controllers/auth')
const studentregister=require('../controllers/auth')
const studentverify=require('../controllers/auth')
const refreelogin=require('../controllers/auth')
const refreeregister=require('../controllers/auth')
const refreeverify=require('../controllers/auth')
// const home=require('../controllers/auth')
const logout=require('../controllers/auth')
const upload=require('../controllers/auth')

router.post('/refreelogin',refreelogin)
router.post('/refreeregister',refreeregister)
router.post('/refreeverify',refreeverify)
router.post('/studentlogin',studentlogin)
router.post('/studentregister',studentregister)
router.post('/studentverify',studentverify)
// router.get('/home',home)
router.get('/logout',logout)
router.post('/upload',upload)

module.exports=router