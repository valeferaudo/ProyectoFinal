//RUTA: http:localhost:3000/api/upload'

const express = require ('express');
const router = express.Router();
const uploadCtrl = require ("../controllers/uploadFile.controller")
const { validateJWT } = require('../middlewares/validateJWT');
const fileUpload = require('express-fileupload');

//Da acceso a los files
router.use(fileUpload());

router.put('/:type/:id', [validateJWT],uploadCtrl.fileUpload);
router.get('/:type/:image',uploadCtrl.getImage)
router.put('/delete/:type/:id/:image',uploadCtrl.deleteImage)

module.exports=router;