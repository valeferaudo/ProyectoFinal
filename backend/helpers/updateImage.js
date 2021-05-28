const SportCenter = require('../models/sportCenter.model');
const Field = require('../models/field.model');

const fs = require('fs');


//FALLTA REVISAR SI YA EXISTE Y NO SUBIRLA, FALTA ELIMINARLA SI NO VIENE OTRA VEZ
const updateImage = async (type, id, fileName) =>{
    switch (type) {
        //Feature for sportCenter images
        case 'sportCenter':
            const sportCenterDB = await SportCenter.findById(id);
            if(!sportCenterDB){
                return false;
            }
            sportCenterDB.images.push(fileName);
            await sportCenterDB.save();
            return true
            
            break;
        case 'field':
            const fieldDB = await Field.findById(id);
            if(!fieldDB){
                return false
            }
            fieldDB.images.push(fileName)
            await fieldDB.save();
            return true
        
        break;
        default:
            break;
    }
}
module.exports= { updateImage }