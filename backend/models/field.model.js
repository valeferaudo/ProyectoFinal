const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const FieldSchema = new Schema({
    name:{type:String, required: true},
    description:{type:String},
    images:{type:Array},
    sizes:{type:String},
    deletedDate: {type: Date, default:null},
    state: {type: Boolean, default:false},
    duration:{type:Number, default: 1},
    price: {type: Number, required:true},
    sportCenter: {type:Schema.Types.ObjectId,ref:'SportCenter',required:true},
    features: [{ type : Schema.Types.ObjectId, ref: 'Feature' }],
    sports: [{sport:{type:Schema.Types.ObjectId,ref:'Sport',required:true, default:null},
             cantPlayers:{type:Number, required:true, default:null}
            }]
},{collection:'fields'})

FieldSchema.index({ sportCenter: 1, name: 1 }, { unique: true});

FieldSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('Field',FieldSchema);