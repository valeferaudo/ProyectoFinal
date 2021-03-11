const mongoose = require('mongoose');
const {Schema , model} = mongoose;


const FieldDaySchema = new Schema({
    field:{type:Schema.Types.ObjectId,ref:'Field',required:true},
    day:{type: Number,required:true},
    sinceHour:{type:Number, required: true},
    untilHour:{type:Number, required: true}
},{collection:'fieldDays'})

FieldDaySchema.index({ field: 1, day: 1 }, { unique: true})

FieldDaySchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('FieldDay',FieldDaySchema);
