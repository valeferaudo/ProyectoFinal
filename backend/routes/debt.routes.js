/*
RUTA: http:localhost:3000/api/debts
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const debtCtrl = require ('../controllers/debt.controller');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateSuperAdminRole } = require('../middlewares/roleValidators/validateSuperAdminRole');
const { validateUserID } = require('../middlewares/validateUserID');


router.get('/sportCenter/:id',[validateJWT,
            validateUserID],debtCtrl.getCenterDebts);
router.put('/sportCenter/:id',[validateJWT,
            validateUserID],debtCtrl.centerApprove);
router.get('/user/:id',[validateJWT,
            validateUserID],debtCtrl.getUserDebts);
router.put('/user/:id',[validateJWT,
            validateUserID],debtCtrl.userApprove);
router.get('/payment/:id',[validateJWT,
            validateUserID],debtCtrl.getDebtPayment);

module.exports = router;