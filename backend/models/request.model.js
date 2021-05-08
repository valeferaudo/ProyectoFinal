const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const RequestSchema = new Schema({
    sportCenter: {type:Schema.Types.ObjectId,ref:'SportCenter',required:true},
    creatorEmail:{type:String, required: true},
    date:{type:Date, required: true},
    description:{type:String, require},
    section:{type:String, enum: ['DEPORTE', 'CARACTERÍSTICA', 'SERVICIO'],require},
    seen:{type:Boolean, default:false},
    state:{type:Boolean, default:null}
},{collection:'requests'})

RequestSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('Request',RequestSchema);