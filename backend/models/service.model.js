const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const ServiceSchema = new Schema({
    name:{type:String, required: true, unique:true},
    description:{type:String},
    state:{type:Boolean, default:false}
},{collection:'services'})

ServiceSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.uid = _id;
    return object;
})

module.exports= model('Service',ServiceSchema);