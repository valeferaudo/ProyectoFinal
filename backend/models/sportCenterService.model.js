const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const SportCenterServiceSchema = new Schema({
    sportCenter:{type:Schema.Types.ObjectId,ref:'SportCenter',required:true},
    service:{type:Schema.Types.ObjectId,ref:'Service',required:true},
    price:{type:Number, default: -1},
    images:{type:Array},
    observation:{type:String},
},{collection:'users'})

SportCenterServiceSchema.index({ sporCenter: 1, service: 1 }, { unique: true})

SportCenterServiceSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.uid = _id;
    return object;
})

module.exports= model('SportCenterService',SportCenterServiceSchema);