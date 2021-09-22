const mongoose = require('mongoose');
const {Schema , model} = mongoose;


const debtSchema = new Schema({
    createdDate:{type:Date,},
    closeDate:{type:Date,default:null},
    appointment:{type:Date,},
    totalDebt:{type:Number},
    field:{type:Schema.Types.ObjectId,ref:'Field',},
    sportCenter:{type:Schema.Types.ObjectId,ref:'SportCenter',},
    user:{type:Schema.Types.ObjectId,ref:'User',},
    owner:{
        oid:{type:String, },
        name:{type:String, },
        phone:{type:Number,},
    },
    description:{type:String, },
    cancelDescription:{type:String, },
    centerApprove: {type: Boolean, default: false},
    userApprove: {type: Boolean, default: null},
    payments:[{type:Schema.Types.ObjectId,ref:'Payment'}],
    cancelDoer: {type:String,enum:['USER','SPORTCENTER']},
},{collection:'debts'})



debtSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('Debt',debtSchema);
