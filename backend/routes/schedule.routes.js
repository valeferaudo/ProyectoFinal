/*
RUTA: http:localhost:3000/api/schedules
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const scheduleCtrl = require ('../controllers/schedule.controller');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateSuperRole } = require('../middlewares/roleValidators/validateSuperRole');
const { validateUserID } = require('../middlewares/validateUserID');

router.get('/combo',[validateJWT,
            validateUserID],scheduleCtrl.getCombo);
module.exports = router;