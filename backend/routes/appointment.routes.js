/*
RUTA: http:localhost:0000/api/appointments'
*/
const express = require('express');
const router  = express.Router();

const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');
const appointmentCtrl = require('../controllers/appointment.controller');
const {validateMaxTime} = require('../middlewares/validateMaxTime');
const {validateCreatedDate} = require('../middlewares/validateCreatedDate');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateUserID } = require('../middlewares/validateUserID');



router.get('/user',[validateJWT,
            validateUserID],appointmentCtrl.getUserAppointments);
router.get('/available/:id',[validateJWT,
            validateUserID,
            ],appointmentCtrl.getFieldAvailableAppointments)
router.post('/',[validateJWT,
            validateUserID,
            validateCreatedDate,
            check('date','Date field is required').not().isEmpty(),
            check('user','User field is required and must be a correct ID').isMongoId(),
            check('field','Field is required and must be a correct ID').isMongoId(),
            validateFields],appointmentCtrl.createAppointment);
router.delete('/:id',[validateJWT,
            validateUserID,
            validateMaxTime],appointmentCtrl.deleteAppointment);


module.exports = router;

