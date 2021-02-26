const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const specialScheduleSchema = new Schema({
    sportCenter:{type:Schema.Types.ObjectId,ref:'SportCenter',required:true},
    date:{type:Date,required:true},
    sinceHour:{type: Number, required:true},
    untilHour:{type: Number, required:true},
    deletedDate:{type: Date, default:null}
},{collection:'specialSchedules'})

specialScheduleSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.uid = _id;
    return object;
})

module.exports= model('SpecialSchedule',specialScheduleSchema);