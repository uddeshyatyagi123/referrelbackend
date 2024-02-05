const express=require('express')
const router=express.Router()

const studentlogin=require('../controllers/auth')
const studentregister=require('../controllers/auth')
const studentverify=require('../controllers/auth')
const refreelogin=require('../controllers/auth')
const refreeregister=require('../controllers/auth')
const refreeverify=require('../controllers/auth')
const logout=require('../controllers/auth')
const upload=require('../controllers/auth')
const addreferral=require('../controllers/auth')
const referrals=require('../controllers/auth')

const auth=require('../middleware/auth')

router.post('/refreelogin',refreelogin)
router.post('/refreeregister',refreeregister)
router.post('/refreeverify',refreeverify)

router.post('/addreferral',auth,addreferral)
router.get('/referrals',referrals)
router.post('/referrals',referrals)


router.post('/studentlogin',studentlogin)
router.post('/studentregister',studentregister)
router.post('/studentverify',studentverify)

router.get('/logout',logout)
router.post('/upload',upload)

module.exports=router