const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const FeatureSchema = new Schema({
    name:{type:String, required: true, unique:true},
    description:{type:String}
},{collection:'features'})

FeatureSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('Feature',FeatureSchema);