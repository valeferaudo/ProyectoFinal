/*
RUTA: http:localhost:3000/api/fields'
*/
const express = require('express');
const router = express.Router();
const {check} = require ('express-validator')
const { validateFields } = require('../middlewares/validateFields');
const fieldCtrl = require('../controllers/field.controller');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateCSAandOwnerField } = require('../middlewares/roleValidators/validateCSAandOwnerField');
const { validateUserID } = require('../middlewares/validateUserID');

router.get('/combo',[validateJWT,
            validateUserID],fieldCtrl.getCombo);
router.get('/minMaxPrices',[validateJWT,
            validateUserID],fieldCtrl.getMinMaxPrices);
router.get('/:id',[validateJWT,
            validateUserID],fieldCtrl.getField);
router.get('/',[validateJWT,
            validateUserID],fieldCtrl.getFields);
router.get('/priceHistorial/:id',[validateJWT,
            validateUserID],fieldCtrl.getPriceHistorial);
//Este post crea solo la cancha y el precio.
router.post('/',[validateJWT,
            validateUserID,
            validateCSAandOwnerField,
            check('name','Name field is required').not().isEmpty(),
            check('price','Price field is required').not().isEmpty(),
            validateFields],fieldCtrl.createField);
router.put('/activateBlock/:id',[validateJWT,
            validateUserID],fieldCtrl.activateBlockField);
router.put('/:id',[validateJWT,
            validateUserID,
            validateCSAandOwnerField,
            check('name','Name field is required').not().isEmpty(),
            check('price','Price field is required').not().isEmpty(),
            validateFields],fieldCtrl.updateField)
router.put('/sport/:id',[validateJWT,
            validateUserID],fieldCtrl.updateFieldSport);


module.exports = router;