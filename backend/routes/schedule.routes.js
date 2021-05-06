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

//             router.get('/',[validateJWT,
//                 validateUserID],featureCtrl.getFeatures);
// router.post('/:id',[validateJWT,
//              validateUserID,
//              validateSuperRole,
//              check('schedules','Schedule field is required').not().isEmpty(),
//              validateFields],scheduleCtrl.createSchedule);
//  router.put('/:id',[validateJWT,
//              validateUserID,
//              validateSuperRole,
//              check('name','Name field is required').not().isEmpty(),
//              validateFields],scheduleCtrl.updateSchedule);
// router.put('/activateBlock/:id',[validateJWT,
//             validateUserID,
//             validateSuperAdminRole],featureCtrl.activateBlockFeature);


module.exports = router;