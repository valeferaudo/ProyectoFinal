const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const SportSchema = new Schema({
    name:{type:String, required: true},
    description:{type:String},
    deletedDate:{type: Date, default:null},
},{collection:'sports'})

SportSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('Sport',SportSchema);