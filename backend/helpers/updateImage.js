const SportCenter = require('../models/sportCenter.model');
const Field = require('../models/field.model');

const fs = require('fs');

const deleteImage = (path)=>{
    if(fs.existsSync(path)){
        //Delete old image
        fs.unlinkSync(path);
    }
}
//FALLTA REVISAR SI YA EXISTE Y NO SUBIRLA, FALTA ELIMINARLA SI NO VIENE OTRA VEZ
const updateImage = async (type, id, fileName) =>{
    let oldPath ="";
    switch (type) {
        //Feature for sportCenter images
        case 'sportCenter':
            const sportCenterDB = await SportCenter.findById(id);
            if(!sportCenterDB){
                return false;
            }
            oldPath= `./uploads/sportCenter/${sportCenterDB.image}`;
            deleteImage(oldPath);
            sportCenterDB.images.push(fileName);
            await User.save();
            return true
            
            break;
        case 'field':
            const fieldDB = await Field.findById(id);
            if(!fieldDB){
                return false
            }
            fieldDB.images.forEach(image => {
                oldPath= `./uploads/field/${image}`;
                deleteImage(oldPath);
            });
            fieldDB.images.push(fileName)
            await fieldDB.save();
            return true
        
        break;
        default:
            break;
    }
}
module.exports= { updateImage }