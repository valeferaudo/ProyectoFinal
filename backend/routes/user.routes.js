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
const { validateSuperRoleOrSameUser } = require('../middlewares/validateSuperRoleOrSameUser');
const { validateSuperRole } = require('../middlewares/validateSuperRole');
const { validateSameUser } = require('../middlewares/validateSameUser');
const { validateSuperAdminRole } = require('../middlewares/validateSuperAdminRole');
const { validateUserRole } = require('../middlewares/validateUserRole');


router.get('/',[validateJWT,
                validateUserID,
                validateSuperRole],userCtrl.getUsers);
router.get('/:id',[validateJWT,
                validateUserID,
                validateSuperRoleOrSameUser],userCtrl.getUser);
router.post('/',[check('name','Name field is required').not().isEmpty(),
                check('secondName','Second name field is required').not().isEmpty(),
                check('phone','Phone field is required').not().isEmpty(),
                check('email','Email field is incorrect').isEmail(),
                check('password','Password field is required').not().isEmpty(),
                validateFields],userCtrl.createUser);
router.put('/:id',[validateJWT,
                validateUserID,
                validateSuperRoleOrSameUser,
                check('name','Name field is required').not().isEmpty(),
                check('secondName','Second name field is required').not().isEmpty(),
                check('phone','Phone field is required').not().isEmpty(),
                check('email','Email field is incorrect').isEmail(),
                validateFields],userCtrl.updateUser);
router.put('/password/:id',[validateJWT,
                validateUserID,
                validateSameUser],userCtrl.changePassword);
router.put('/favorite/:id',[validateJWT,
                validateUserID,
                validateSameUser,
                validateUserRole],userCtrl.addFavorite);
router.put('/delete/:id',[validateJWT,
                validateUserID,
                validateSuperRoleOrSameUser],userCtrl.deleteUser);
router.put('/activate/:id',[validateJWT,
                validateUserID,
                validateSuperRole],userCtrl.activateUser);
router.put('/acceptBlock/:id',[validateJWT,
                validateUserID,
                validateSuperAdminRole],userCtrl.activateBlockSuperCenterAdmin);


module.exports = router;