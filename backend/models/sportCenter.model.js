const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const SportCenterSchema = new Schema({
    name:{type:String, required: true, unique:true},
    address:{type:String,default:'No Address'},
    phone:{type:String, required:true},
    deletedDate:{type: Date, default:null},
    email:{type:String, required: true,lowercase:true, unique: true},
    aditionalElectricityHour:{type:Number, default:null},
    aditionalElectricity:{type:Number, default:null},
    mercadoPago:{type:Boolean, default: false},
    images: {type:Array}
},{collection:'sportCenters'})

SportCenterSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.uid = _id;
    return object;
})

module.exports= model('SportCenter',SportCenterSchema);