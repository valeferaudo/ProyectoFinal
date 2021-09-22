/*
RUTA: http:localhost:0000/api/appointments'
*/
const express = require('express');
const router  = express.Router();

const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');
const appointmentCtrl = require('../controllers/appointment.controller');
const {validateCreatedDate} = require('../middlewares/validateCreatedDate');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateUserID } = require('../middlewares/validateUserID');



router.get('/user/:id',[validateJWT,
            validateUserID],appointmentCtrl.getUserAppointments);
router.get('/sportCenter/:id',[validateJWT],appointmentCtrl.getSportCenterAppointments);
router.get('/sportCenter/reserved/:id',[validateJWT],appointmentCtrl.getReservedSportCenterAppointments);
router.get('/sportCenter/notPayment/:id',[validateJWT],appointmentCtrl.getNotPayAppointments);
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
router.put('/:id',[validateJWT,
            validateUserID],appointmentCtrl.deleteAppointment);
router.delete('/payment/:id',[validateJWT,
            validateUserID],appointmentCtrl.deleteAppointmentForPayment);


module.exports = router;

