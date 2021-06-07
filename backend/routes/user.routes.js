/*
RUTA: http:localhost:3000/api/users
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
                validateSuperRole],userCtrl.getUsers);
router.get('/:id',[validateJWT,
                validateUserID,
                validateSuperRoleOrSameUser],userCtrl.getUser);
router.post('/',[check('name','Name field is required').not().isEmpty(),
                check('lastName','Last name field is required').not().isEmpty(),
                check('phone','Phone field is required').not().isEmpty(),
                check('email','Email field is incorrect').isEmail(),
                check('password','Password field is required').not().isEmpty(),
                validateFields],userCtrl.createUser);
router.put('/:id',[validateJWT,
                validateUserID,
                validateSuperRoleOrSameUser,
                check('name','Name field is required').not().isEmpty(),
                check('lastName','Last name field is required').not().isEmpty(),
                check('phone','Phone field is required').not().isEmpty(),
                check('email','Email field is incorrect').isEmail(),
                validateFields],userCtrl.updateUser);
router.put('/password/:id',[validateJWT,
                validateUserID,
                validateSameUser],userCtrl.changePassword);
router.put('/acceptBlock/:id',[validateJWT,
                validateUserID,
                validateSuperRole],userCtrl.activateBlockUser);
router.put('/changeRole/:id',[validateJWT,
                validateUserID,
                validateSuperRole],userCtrl.changeRole);
module.exports = router;