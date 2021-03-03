/*
RUTA: http:localhost:3000/api/services
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const serviceCtrl = require ('../controllers/service.controller');
const {validateJWT} = require('../middlewares/validateJWT');


router.get('/',[validateJWT],serviceCtrl.getServices);
router.get('/:id',[validateJWT],serviceCtrl.getService);
router.post('/',[validateJWT,
                check('name','Name field is required').not().isEmpty(),
                validateFields],serviceCtrl.createService);
 router.put('/:id',[validateJWT,
                 check('name','Name field is required').not().isEmpty(),
                 validateFields],serviceCtrl.updateService);
router.delete('/:id',[validateJWT],serviceCtrl.deleteService);
router.put('/activate/:id',[validateJWT],serviceCtrl.activateService);


module.exports = router;