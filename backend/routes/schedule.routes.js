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
router.get('/special/:id',[validateJWT],scheduleCtrl.getSpecialSchedules);
router.post('/special/:id',[validateJWT,
                check('date','Date field is required').not().isEmpty(),
                check('sinceHour','Since Hour field is required').not().isEmpty(),
                check('untilHour','Until Hour field is required').not().isEmpty(),
                validateFields],scheduleCtrl.createSpecialSchedule);
 router.delete('/special/delete/:id',[validateJWT,
                 validateFields],scheduleCtrl.deleteSpecialSchedule);
module.exports = router;