/*
RUTA: http:localhost:3000/api/features
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const featureCtrl = require ('../controllers/feature.controller');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateSuperAdminRole } = require('../middlewares/roleValidators/validateSuperAdminRole');
const { validateUserID } = require('../middlewares/validateUserID');

router.get('/',[validateJWT,
            validateUserID],featureCtrl.getFeatures);
router.get('/combo',[validateJWT,
            validateUserID],featureCtrl.getCombo)
// router.get('/id',[validateJWT],featureCtrl.getFeature)
router.post('/',[validateJWT,
            validateUserID,
            validateSuperAdminRole,
            check('name','Name field is required').not().isEmpty(),
            validateFields],featureCtrl.createFeature);
router.put('/:id',[validateJWT,
            validateUserID,
            validateSuperAdminRole,
            check('name','Name field is required').not().isEmpty(),
            validateFields],featureCtrl.updateFeature);
router.put('/activateBlock/:id',[validateJWT,
            validateUserID,
            validateSuperAdminRole],featureCtrl.activateBlockFeature);


module.exports = router;