const mongoose = require('mongoose');

const {Schema , model} = mongoose;

const SportCenterSchema = new Schema({
    name:{type:String, required: true, unique:true},
    address:{type:String,required:true},
    phone:{type:String, required:true},
    deletedDate:{type: Date, default:null},
    aditionalElectricityHour:{type:String, default:null},
    aditionalElectricity:{type:Number, default:null},
    mercadoPago:{type:Boolean, default: false},
    images: {type:Array, default:[]},
    schedules: [{day:{type:Number, enum:[1,2,3,4,5,6,7] ,default:null},
                openingHour:{type: Date, default:null},
                closingHour:{type: Date, default:null}
            }],
    services: [{service:{type:Schema.Types.ObjectId,ref:'Service',required:true, default:null},
            description:{type:String, required:true, default:null}
           }]
},{collection:'sportCenters'})

SportCenterSchema.method('toJSON',function(){
    const {__v,_id, ...object}=this.toObject();
    object.id = _id;
    return object;
})

module.exports= model('SportCenter',SportCenterSchema);