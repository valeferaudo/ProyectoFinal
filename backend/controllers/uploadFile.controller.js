const {request, response} = require('express');
const path = require('path')
const fs = require ('fs')
//ID generator
const { v4: uuidv4 } = require('uuid');
//Helper
const {updateImage} = require('../helpers/updateImage');
//Cambiar Size
const sizeOf = require('image-size')
const sharp = require('sharp');

const SportCenter = require('../models/sportCenter.model');
const Field = require('../models/field.model');

const uploadCtrl ={};

uploadCtrl.fileUpload = async (req = request,res=response)=>{
    const type = req.params.type;
    const id = req.params.id;
    try {
        //Types validators 
    const validTypes = ['sportCenter','field'];
    if(!validTypes.includes(type)){
        return res.status(400).json({
            ok:false,
            code:13,
            msg:'Only sportCenter and fields can upload images'
        });
    }
    //Validate if exists a file
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('sale aca 1 ')
        return res.status(400).json({
            ok:false,
            code: 14,
            msg:'File does not exist'
        });
    }
    //Process file
    let notUploadImages = [];
    let uploadImages = [];
    let imagesKeys = Object.keys(req.files)
    for(let i=0; i< imagesKeys.length; i++){
        let key = imagesKeys[i];
        let file = req.files[key];
        const nameSplit = file.name.split('.');
        const fileExtension = nameSplit[nameSplit.length-1].toLowerCase();
        //Validate extension
        const validExtension = ['png','jpg','jpeg'];
        if(!validExtension.includes(fileExtension)){
            console.log('sale aca 2 ')

            return res.status(400).json({
                ok:false,
                code: 15,
                msg:'The file extension is not allowed'
            });
        }
        //MODIFICAR EL FILE PARA QUE SEA CCUADRADO, ANTES HACER VALIDACION DE TAMAÑo
        const dimensions = sizeOf(file.data);
        if(dimensions.width < 400 && dimensions.height < 400){
            notUploadImages.push(file.name)
        }
        else{
            //valido que no haya una proporción muy grande entre ancho y alto
            if(false){
            // if((dimensions.height / dimensions.width) < 0.90 || ((dimensions.height / dimensions.width) > 1.1)){
                // notUploadImages.push(file.name)
            }
            else{
            //Create unique file name with uuidv4
            const fileName = `${uuidv4()}.${fileExtension}`;
            uploadImages.push(fileName)
            //Create the path to save the file in a specific folder
            const path =`./uploads/${type}/${fileName}`;
            //Move the image to the path
            file.mv(path, (err)=> {
                if (err){
                  return res.status(500).json({
                      ok:false,
                      code: 16,
                      msg: 'An error ocurred while uploading a file'
                  })
                }
                updateImage(type,id, fileName);
            })
            }
        }
      }
      if(notUploadImages.length === imagesKeys.length){
        return res.status(404).json({
            ok:false,
            code: 17,
            msg:'Image/s size must be larger than 600 x 600 px and the ratio between height and width must be less than 20%',
            param: {
                notUploadImages,
            }
        })
      }
      else{
        res.json({
            ok: true,
            msg:'File uploads',
            param: {
                notUploadImages,
                uploadImages
            }
        })
      }
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
uploadCtrl.getImage = (req,res = response)=>{
    const type = req.params.type;
    const image = req.params.image;
    const imagePath = path.join(__dirname,`../uploads/${type}/${image}`);
    
    if(fs.existsSync(imagePath)){
        res.sendFile(imagePath);
    }else{
     const imagePath = path.join(__dirname,`../uploads/no-image.png`);
        res.sendFile(imagePath);
    }
}
uploadCtrl.deleteImage = async (req = request,res=response)=>{
    const image = req.params.image;
    const type = req.params.type;
    const id = req.params.id;
    try {
        const validTypes = ['sportCenter','field'];
        if(!validTypes.includes(type)){
            return res.status(400).json({
                ok:false,
                code:13,
                msg:'Only users and fields can upload images'
            });
        }
        if (type === 'sportCenter'){
            const sportCenterDB = await SportCenter.findById(id)
            if(!sportCenterDB){
                return unknownIDResponse(res);
            }
            //Borro la imagen del server
            oldPath= `./uploads/sportCenter/${image}`
            deleteImage(oldPath);
            //Borro la imagen de la BD
            sportCenterDB.images = sportCenterDB.images.filter(item => item !== image);
            await sportCenterDB.save();
        }
        else if(type === 'field'){
            const fieldDB = await Field.findById(id)
            if(!fieldDB){
                return unknownIDResponse(res);
            }
            oldPath= `./uploads/field/${image}`
            deleteImage(oldPath);
            fieldDB.images = fieldDB.images.filter(item => item !== image)
            await fieldDB.save();
        }
        res.json({
            ok: true,
            msg:'File deleted',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
const deleteImage = (path)=>{
    if(fs.existsSync(path)){
        //Delete old image
        fs.unlinkSync(path);
    }
}
function errorResponse(res){
    res.status(500).json({
        ok:false,
        code: 99,
        msg:'An unexpected error occurred'
    })
}
function unknownIDResponse(res){
    return res.status(404).json({
        ok:false,
        code: 3,
        msg:'Unknown ID. Please insert a correct ID'
    })
}
module.exports= uploadCtrl;