/*
RUTA: http:localhost:3000/api/favorites
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const userCtrl = require ('../controllers/user.controller');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateUserID } = require('../middlewares/validateUserID');
const { validateSuperRoleOrSameUser } = require('../middlewares/roleValidators/validateSuperRoleOrSameUser');
const { validateSuperRole } = require('../middlewares/roleValidators/validateSuperRole');
const { validateSameUser } = require('../middlewares/roleValidators/validateSameUser');
const { validateSuperAdminRole } = require('../middlewares/roleValidators/validateSuperAdminRole');
const { validateUserRole } = require('../middlewares/roleValidators/validateUserRole');



router.get('/',[validateJWT,
                validateUserID,
                validateUserRole],userCtrl.getFavorites);
router.put('/:id',[validateJWT,
                validateUserID,
                validateUserRole],userCtrl.addRemoveFavorite);
module.exports = router;