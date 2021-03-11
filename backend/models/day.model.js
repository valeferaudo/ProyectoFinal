const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const DaySchema = new Schema({
    idDia: {type:Number,required:true, unique:true},
    name:{type:String, required: true},
},{collection:'days'})

DaySchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('Day',DaySchema);