/*
RUTA: http:localhost:3000/api/sportcenters
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const sportCenterCtrl = require ('../controllers/sportCenter.controller');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateSuperAdminRole } = require('../middlewares/roleValidators/validateSuperAdminRole');
const { validateUserID } = require('../middlewares/validateUserID');
const { validateUserOrSuperAdmin } = require ('../middlewares/roleValidators/validateUserOrSuperAdmin');
const sportCtrl = require('../controllers/sport.controller');
const { validateCSAandOwner } = require('../middlewares/roleValidators/validateCSAandOwner');


router.get('/',[validateJWT,
            validateUserID,
            validateUserOrSuperAdmin],sportCenterCtrl.getSportCenters);
router.get('/combo',[validateJWT,
            validateUserID],sportCenterCtrl.getCombo);
router.get('/:id',[validateJWT,
            validateUserID],sportCenterCtrl.getSportCenter);
router.post('/',[validateJWT,
            validateUserID,
            check('name','Name field is required').not().isEmpty(),
            check('address','Address field is required').not().isEmpty(),
            check('latitude','Latitude field is required (Mark in the map)').not().isEmpty(),
            check('longitude','Longitude field is required (Mark in the map)').not().isEmpty(),
            check('phone','Phone field is required').not().isEmpty(),
            validateFields],sportCenterCtrl.createSportCenter);
 router.put('/:id',[validateJWT,
            validateUserID,
            validateCSAandOwner,
            check('name','Name field is required').not().isEmpty(),
            check('address','Address field is required').not().isEmpty(),
            check('latitude','Latitude field is required (Mark in the map)').not().isEmpty(),
            check('longitude','Longitude field is required (Mark in the map)').not().isEmpty(),
            check('phone','Phone field is required').not().isEmpty(),
            validateFields],sportCenterCtrl.updateSportCenter);
router.put('/delete/:id',[validateJWT,
            validateUserID],sportCenterCtrl.deleteSportCenter);
router.put('/activateBlock/:id',[validateJWT,
            validateUserID,
            validateSuperAdminRole],sportCenterCtrl.activateBlockSportCenter);
router.put('/schedule/:id',[validateJWT,
            validateUserID,
            validateCSAandOwner,
            check('schedules','Schedules fields are required').not().isEmpty(),
            validateFields],sportCenterCtrl.updateSchedule);
router.put('/services/:id',[validateJWT,
            validateUserID,
            validateCSAandOwner],sportCenterCtrl.updateService);

module.exports = router;