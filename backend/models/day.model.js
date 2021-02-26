const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const DaySchema = new Schema({
    name:{type:String, required: true},
},{collection:'days'})

DaySchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.uid = _id;
    return object;
})

module.exports= model('Day',DaySchema);