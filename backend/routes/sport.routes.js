/*
RUTA: http:localhost:3000/api/sports'
*/
const express = require('express');
const router = express.Router();
const {check} = require ('express-validator')
const { validateFields } = require('../middlewares/validateFields');
const sportCtrl = require('../controllers/sport.controller');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateSuperAdminRole } = require('../middlewares/roleValidators/validateSuperAdminRole');
const { validateUserID } = require('../middlewares/validateUserID');

router.get('/',[validateJWT,
            validateUserID],sportCtrl.getSports)
router.get('/id',[validateJWT],sportCtrl.getSport)
router.post('/',[validateJWT,
            validateUserID,
            validateSuperAdminRole,
            check('name','Name field is required').not().isEmpty(),
            validateFields],sportCtrl.createSport);
router.put('/:id',[validateJWT,
            validateUserID,
            validateSuperAdminRole,
            check('name','Name field is required').not().isEmpty(),
            validateFields],sportCtrl.updateSport);
router.put('/activateBlock/:id',[validateJWT,
            validateUserID,
            validateSuperAdminRole],sportCtrl.activateBlockSport);

module.exports = router;