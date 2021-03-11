const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const FieldSportSchema = new Schema({
    field:{type:Schema.Types.ObjectId,ref:'Field',required:true},
    sport:{type:Schema.Types.ObjectId,ref:'Sport',required:true},
    cantPlayers:{type:Number, required:true},
},{collection:'fieldSports'})

FieldSportSchema.index({ field: 1, sport: 1 }, { unique: true})

FieldSportSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('FieldSport',FieldSportSchema);