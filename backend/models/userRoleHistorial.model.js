const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const UserRoleHistorialSchema = new Schema({
    user: {type:Schema.Types.ObjectId,ref:'User',required:true},
    sinceDate: {type: Date, required:true},
    role: {type: String, enum:['USER','CENTER-ADMIN','CENTER-SUPER-ADMIN','SUPER-ADMIN'],required:true}
},{collection:'userRoleHistorials'})

UserRoleHistorialSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.uid = _id;
    return object;
})

module.exports= model('UserRoleHistorial',UserRoleHistorialSchema);