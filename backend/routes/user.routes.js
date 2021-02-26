/*
RUTA: http:localhost:3000/api/users
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const userCtrl = require ('../controllers/user.controller');
const {validateJWT} = require('../middlewares/validateJWT');


router.get('/',[validateJWT],userCtrl.getUsers);
router.get('/:id',[validateJWT],userCtrl.getUser);
router.post('/',[check('name','Name field is required').not().isEmpty(),
                check('secondName','Second name field is required').not().isEmpty(),
                check('phone','Phone field is required').not().isEmpty(),
                check('email','Email field is incorrect').isEmail(),
                check('password','Password field is required').not().isEmpty(),
                validateFields],userCtrl.createUser);
router.put('/:id',[validateJWT,
                check('name','Name field is required').not().isEmpty(),
                check('email','Email field is incorrect').isEmail(),
                validateFields],userCtrl.updateUser);
router.put('/delete/:id',[validateJWT],userCtrl.deleteUser);
router.put('/activate/:id',[validateJWT],userCtrl.activateUser);
router.put('/accept/:id',[validateJWT],userCtrl.activateSuperCenterAdmin);


module.exports = router;