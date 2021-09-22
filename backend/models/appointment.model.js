const mongoose = require('mongoose');
const {Schema , model} = mongoose;


const AppointmentSchema = new Schema({
    createdDate:{type:Date, required: true},
    date:{type:Date, required: true},
    state:{type:String,enum:['Reserved','AboutToStart','InProgress','Completed'],default:'Reserved', required: true},
    totalAmount:{type:Number, required:true},
    totalPaid:{type:Number, required:true,default:0},
    lightTime: {type: Boolean, default: false},
    owner:{
        oid:{type:String, required:true},
        name:{type:String, required:true},
        phone:{type:Number,required:true}
    },
    description: {type:String, default: null},
    user:{type:Schema.Types.ObjectId,ref:'User',required:true},
    field:{type:Schema.Types.ObjectId,ref:'Field',required:true},
    sportCenter:{type:Schema.Types.ObjectId,ref:'SportCenter',required:true},
    payments:[{type:Schema.Types.ObjectId,ref:'Payment'}],
},{collection:'appointments'})

AppointmentSchema.index({ date: 1, field: 1 }, { unique: true});

// AppointmentSchema.index({ date: 1, user: 1 }, { unique: true})

AppointmentSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('Appointment',AppointmentSchema);
