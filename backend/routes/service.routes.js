/*
RUTA: http:localhost:3000/api/services
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const serviceCtrl = require ('../controllers/service.controller');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateSuperAdminRole } = require('../middlewares/roleValidators/validateSuperAdminRole');
const { validateUserID } = require('../middlewares/validateUserID');

router.get('/',[validateJWT,
            validateUserID],serviceCtrl.getServices)
// router.get('/id',[validateJWT],serviceCtrl.getService)
router.post('/',[validateJWT,
            validateUserID,
            validateSuperAdminRole,
            check('name','Name field is required').not().isEmpty(),
            validateFields],serviceCtrl.createService);
router.put('/:id',[validateJWT,
            validateUserID,
            validateSuperAdminRole,
            check('name','Name field is required').not().isEmpty(),
            validateFields],serviceCtrl.updateService);
router.put('/activateBlock/:id',[validateJWT,
            validateUserID,
            validateSuperAdminRole],serviceCtrl.activateBlockService);


module.exports = router;