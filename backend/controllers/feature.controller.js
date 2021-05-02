const Feature = require ('../models/feature.model');
const { request, response} = require ('express');
const featureCtrl = {};


featureCtrl.getFeature = async (req = request,res = response)=>{}

featureCtrl.getFeatures = async (req = request,res = response)=>{
    searchText = req.query.text;
    state = req.query.state;
    try {
        let features;
        let booleanState;
        let selectedFilters;
        if(state === 'Activo'){
            booleanState = true;
        }
        else if(state === 'Bloqueado'){
            booleanState = false;
        }

        if(searchText === '' && state === '' ){
            features = await Feature.find();
            selectedFilters = [];
        }
        else if(searchText !== '' && state === ''){
            features = await Feature.find({name : new RegExp(searchText, 'i')})
            selectedFilters = ['Texto: ', searchText];
        }
        else if(searchText === '' && state !== ''){
            features = await Feature.find({state:booleanState})
            selectedFilters = ['Estado: ',state];
        }
        else if(searchText !== '' && state !== ''){
            features = await Feature.find({name : new RegExp(searchText, 'i'),
                                    state:booleanState})
            selectedFilters = ['Texto: ', searchText,' - ','Estado: ',state];
        }
        res.json({
            ok: true,
            msg:'Found features',
            param: {
                features,
                selectedFilters
            }
        })
        
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
featureCtrl.createFeature = async (req = request, res = response) =>{
    const {name} = req.body
    try {
        const existsName = await Feature.findOne({name});
        if(existsName){
            return existsNameResponse(res);
        }
        feature = new Feature({
            name: req.body.name,
            description: req.body.description,
        });
        await feature.save();
        res.json({
            ok:true,
            msg: 'Created Feature',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}

featureCtrl.updateFeature = async (req = request, res = response) =>{
    const featureID = req.params.id
    const name = req.body.name
    try {
        const featureDB = await Feature.findById(featureID);
        if(!featureDB){
            return unknownIDResponse(res);
        }
        const changes = req.body;
        //si no modifica el name (porque sino chocan por ser iguales)
        if(changes.name === featureDB.name){
            delete changes.name
        }else{
            const nameExists = await Feature.findOne({name});
            if(nameExists){
                return existsNameResponse(res);
            }
        }
        await Feature.findByIdAndUpdate(featureID,changes,{new:true})
        res.json({
            ok:true,
            msg:'Updated Feature'
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
featureCtrl.activateBlockFeature = async (req= request, res= response) => {
    const featureID = req.params.id;
    const action= req.body.action;
    try {
        const featureDB = await Feature.findById(featureID)
        if(!featureDB){
            return unknownIDResponse(res);
        }
        if (action === 'block'){
            if(featureDB.state === false){
                return featureBlockedResponse(res);
            }
            else{
                featureDB.state = false;
            }
        }
        else if (action === 'active'){
            if(featureDB.state === true){
                return featureActiveResponse(res);
            }
            else{
                featureDB.state = true;
            }
        }
        await Feature.findByIdAndUpdate(featureID,featureDB,{new:true});
        if (action === 'block'){
            res.json({
                ok:true,
                msg:'Blocked Feature'
            })
        }
        else if(action === 'active'){
            res.json({
                ok:true,
                msg:'Activated Feature'
            })
        }
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
function errorResponse(res){
    res.status(500).json({
        ok:false,
        code: 99,
        msg:'An unexpected error occurred'
    })
}
function unknownIDResponse(res){
    return res.status(404).json({
        ok:false,
        code: 3,
        msg:'Unknown ID. Please insert a correct ID'
    })
}
function existsNameResponse(res){
    return res.status(400).json({
        ok:false,
        code: 10,
        msg:'A Feature already exists with this name'
    })
}
function featureBlockedResponse(res){
    return res.status(404).json({
        ok:false,
        code: 6,
        msg:'This Feature is blocked'
    })
}
function featureActiveResponse(res){
    return res.status(404).json({
        ok:false,
        code: 7,
        msg:'This Feature is active'
    })
}
module.exports = featureCtrl;
