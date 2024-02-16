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
const askreferral=require('../controllers/auth')
const myreferrals=require('../controllers/auth')
const appliedreferrals=require('../controllers/auth')
const accept=require('../controllers/auth')

const auth=require('../middleware/auth')

router.post('/referrerlogin',referrerlogin)
router.post('/referrerregister',referrerregister)
router.post('/referrerverify',referrerverify)

router.post('/studentlogin',studentlogin)
router.post('/studentregister',studentregister)
router.post('/studentverify',studentverify)

router.post('/addreferral',auth,addreferral)
router.get('/referrals',auth,referrals)
router.post('/referrals',auth,referrals)

router.get('/logout',auth,logout)
router.post('/upload',auth,upload)

router.post('/askreferral',auth,askreferral)
router.post('/myreferrals',auth,myreferrals)
router.post('/appliedreferrals',auth,myreferrals)
router.post('/accept',auth,accept)
router.post('/upload',auth,upload)

module.exports=router