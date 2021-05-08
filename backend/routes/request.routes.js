/*
RUTA: http:localhost:3000/api/requests'
*/
const express = require('express');
const router = express.Router();
const {check} = require ('express-validator')
const { validateFields } = require('../middlewares/validateFields');
const requestCtrl = require('../controllers/request.controller');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateCSAandOwner } = require('../middlewares/roleValidators/validateCSAandOwner');
const { validateCSAandOwnerField } = require('../middlewares/roleValidators/validateCSAandOwnerfield');
const { validateSuperAdminRole } = require('../middlewares/roleValidators/validateSuperAdminRole');
const { validateUserID } = require('../middlewares/validateUserID');

router.get('/',[validateJWT,
            validateUserID,
            validateSuperAdminRole],requestCtrl.getRequests)
router.get('/:id',[validateJWT,
            validateUserID],requestCtrl.getSportCentetrRequests)
router.post('/',[validateJWT,
            validateUserID,
            validateCSAandOwnerField,
            check('section','Section field is required').not().isEmpty(),
            check('description','Description field is required').not().isEmpty(),
            validateFields],requestCtrl.createRequest)
router.put('/seen/:id',[validateJWT,
            validateUserID,
            validateSuperAdminRole],requestCtrl.seenRequest)
router.put('/activateBlock/:id',[validateJWT,
            validateUserID,
            validateSuperAdminRole],requestCtrl.activateBlockRequest)





module.exports = router;