const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const FieldPriceSchema = new Schema({
    field: {type:Schema.Types.ObjectId,ref:'Field',required:true},
    sinceDate: {type: Date, required:true},
    price:{type:Number, required:true}
},{collection:'fieldPrices'})

FieldPriceSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.uid = _id;
    return object;
})

module.exports= model('FieldPrice',FieldPriceSchema);