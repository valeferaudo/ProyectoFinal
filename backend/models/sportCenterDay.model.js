const mongoose = require('mongoose');
const {Schema , model} = mongoose;


const SportCenterDaySchema = new Schema({
    sportCenter:{type:Schema.Types.ObjectId,ref:'SportCenter',required:true},
    day:{type:Number,required:true},
    sinceHour:{type:Number, required: true},
    untilHour:{type:Number, required: true}
},{collection:'sportCenterDays'})

SportCenterDaySchema.index({ sportCenter: 1, day: 1 }, { unique: true})

SportCenterDaySchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('SportCenterDay',SportCenterDaySchema);
