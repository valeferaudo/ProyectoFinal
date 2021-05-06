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

router.get('/',[validateJWT,
            validateUserID],fieldCtrl.getFields)
router.get('/:id',[validateJWT,
            validateUserID],fieldCtrl.getField)
//Este post crea solo la cancha y el precio.
router.post('/',[validateJWT,
            validateUserID,
            validateCSAandOwnerField,
            check('name','Name field is required').not().isEmpty(),
            check('price','Price field is required').not().isEmpty(),
            validateFields],fieldCtrl.createField)
router.put('/:id',[validateJWT,
            validateUserID,
            validateCSAandOwnerField,
            check('name','Name field is required').not().isEmpty(),
            check('price','Price field is required').not().isEmpty(),
            validateFields],fieldCtrl.updateField)

//No se si se usa
router.delete('/:id',[validateJWT],fieldCtrl.deleteField)
router.get('/admin/:id',[validateJWT],fieldCtrl.getFieldsByCenterAdmin)




module.exports = router;