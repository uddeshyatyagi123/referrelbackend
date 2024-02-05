const express=require('express')
const router=express.Router()

const studentlogin=require('../controllers/auth')
const studentregister=require('../controllers/auth')
const studentverify=require('../controllers/auth')
const referrerlogin=require('../controllers/auth')
const referrerregister=require('../controllers/auth')
const referrerverify=require('../controllers/auth')
const logout=require('../controllers/auth')
const upload=require('../controllers/auth')
const addreferral=require('../controllers/auth')
const referrals=require('../controllers/auth')

const auth=require('../middleware/auth')

router.post('/referrerlogin',referrerlogin)
router.post('/referrerregister',referrerregister)
router.post('/referrerverify',referrerverify)

router.post('/addreferral',auth,addreferral)
router.get('/referrals',referrals)
router.post('/referrals',referrals)


router.post('/studentlogin',studentlogin)
router.post('/studentregister',studentregister)
router.post('/studentverify',studentverify)

router.get('/logout',logout)
router.post('/upload',upload)

module.exports=router