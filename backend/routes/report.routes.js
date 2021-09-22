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


router.get('/payment/:id',[validateJWT,
            validateUserID],reportCtrl.generatePaymentReport);

module.exports = router;