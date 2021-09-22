const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const UserSchema = new Schema({
    name:{type:String, required: true},
    lastName:{type:String, required: true},
    phone:{type:String, required:true},
    address:{type:String,default: null},
    email:{type:String, required: true,lowercase:true, unique: true},
    password:{type:String, required: true},
    deletedDate:{type: Date, default:null},
    favorites:{type: Array, default:[]},
    sportCenter:{type:Schema.Types.ObjectId,ref:'SportCenter',default:null},
    state:{type:Boolean, default: true},
    paymentNotification:{type:Boolean, default: null},
    debtNotification: {type:Boolean, default: null},
    role:{type:String, enum: ['USER', 'CENTER-ADMIN', 'CENTER-SUPER-ADMIN', 'SUPER-ADMIN'], required:true},
},{collection:'users'})

UserSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.uid = _id;
    return object;
})

module.exports= model('User',UserSchema);