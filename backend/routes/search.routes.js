/*
RUTA: http:localhost:3000/api/search
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const searchCtrl = require ('../controllers/search.controller');
const {validateJWT} = require('../middlewares/validateJWT');
const { validateSuperRole } = require('../middlewares/roleValidators/validateSuperRole');
const { validateUserID } = require('../middlewares/validateUserID');

router.get('/:searchText',[validateJWT,
            validateUserID],searchCtrl.search);
module.exports = router;