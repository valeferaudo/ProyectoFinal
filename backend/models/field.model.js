const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const FieldSchema = new Schema({
    name:{type:String, required: true, unique:true},
    description:{type:String},
    images:{type:Array},
    sizes:{type:String},
    deletedDate: {type: Date, default:null},
    duration:{type:Number, default: 1},
    sportCenter: {type:Schema.Types.ObjectId,ref:'SportCenter',required:true},
    features: [{ type : Schema.Types.ObjectId, ref: 'Feature' }]
},{collection:'fields'})

FieldSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('Field',FieldSchema);