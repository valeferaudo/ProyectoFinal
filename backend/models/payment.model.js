const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const PaymentSchema = new Schema({
    preferenceID:{type:String,default: null},
    mercadoPagoPaymentID:{type:String, default: null},
    description:{type:String, default: null},
    amountPayment:{type:Number,required: true},
    date: {type: Date, default:null},
    state: {type:String, enum: ['APPROVED', 'PENDING'],required: true},
    type: {type:String, enum: ['MERCADO-PAGO', 'CASH', 'OTHER'],required: true},
    appointment: {type:Schema.Types.ObjectId,ref:'Appointment',required:true},
    appointmentDate: {type:Date},
    appointmentField: {type:Schema.Types.ObjectId,ref:'Field',required:true},
    appointmentSportCenter: {type:Schema.Types.ObjectId,ref:'SportCenter',required:true},
    user:{type:Schema.Types.ObjectId,ref:'User',},
},{collection:'payments'})


PaymentSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('Payment',PaymentSchema);