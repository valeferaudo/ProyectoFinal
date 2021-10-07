/*
RUTA: http:localhost:3000/api/reports
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const reportCtrl = require ('../controllers/report.controller');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateSuperAdminRole } = require('../middlewares/roleValidators/validateSuperAdminRole');
const { validateUserID } = require('../middlewares/validateUserID');


router.get('/payment/:sportCenterID',[validateJWT,
            validateUserID],reportCtrl.generatePaymentReport);
router.get('/debt/:sportCenterID',[validateJWT,
            validateUserID],reportCtrl.generateDebtReport);
router.get('/appointment/:sportCenterID',[validateJWT,
            validateUserID],reportCtrl.generateAppointmentReport);
router.get('/cash/:sportCenterID',[validateJWT,
            validateUserID],reportCtrl.generateCashReport);
router.get('/occupation/:sportCenterID',[validateJWT,
            validateUserID],reportCtrl.generateOccupationReport);
module.exports = router;