/*
RUTA: http:localhost:3000/api/specialschedules
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const specialScheduleCtrl = require ('../controllers/specialSchedule.controller');
const {validateJWT} = require('../middlewares/validateJWT');


router.get('/:id',[validateJWT],specialScheduleCtrl.getSpecialSchedules);
router.post('/:id',[validateJWT,
                check('sportCenter','SportCenter field is required').not().isEmpty(),
                check('date','Date field is required').not().isEmpty(),
                check('sinceHour','Since Hour field is required').not().isEmpty(),
                check('untilHour','Until Hour field is required').not().isEmpty(),
                validateFields],specialScheduleCtrl.createSpecialSchedule);
 router.put('/delete/:id',[validateJWT,
                 validateFields],sportCenterCtrl.deleteSpecialSchedule);



module.exports = router;