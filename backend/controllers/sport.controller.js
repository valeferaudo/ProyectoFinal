const Sport = require ('../models/sport.model');

const { request, response} = require ('express');
const sportCtrl = {};


sportCtrl.getSports = async (req = request , res = response) => {
    searchText = req.query.text;
    state = req.query.state;
    try {
        let sports;
        let booleanState;
        let selectedFilters;
        if(state === 'Activo'){
            booleanState = true;
        }
        else if(state === 'Bloqueado'){
            booleanState = false;
        }

        if(searchText === '' && state === '' ){
            sports = await Sport.find();
            selectedFilters = [];
        }
        else if(searchText !== '' && state === ''){
            sports = await Sport.find({ 
                                        name: new RegExp(searchText, 'i')
            })
            selectedFilters = ['Texto: ', searchText];
        }
        else if(searchText === '' && state !== ''){
            if(booleanState){
                sports = await Sport.find({deletedDate: null})
            }
            else{
                sports = await Sport.find({deletedDate: {$ne: null} })
            }
            selectedFilters = ['Estado: ',state];
        }
        else if(searchtext !== '' && state !== ''){
            if(booleanState){
                sports = await Sport.find({deletedDate: null,
                                            name: new RegExp(searchText, 'i')})
            }
            else{
                sports = await Sport.find({deletedDate: {$ne: null},
                                            name: new RegExp(searchText, 'i')})
            }
            selectedFilters = ['Texto: ', searchText,' - ','Estado: ',state];
        }
        res.json({
            ok: true,
            msg:'Found sports',
            param: {
                sports,
                selectedFilters
            }
        })
        
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
sportCtrl.getSport = async (req = request , res = response) => {

}
sportCtrl.createSport = async (req = request , res = response) => {
    const {name} = req.body
    try {
        const existsName = await Sport.findOne({name});
        if(existsName){
            return existsNameResponse(res);
        }
        sport = new Sport({
            name: req.body.name,
            description: req.body.description,
        });
        await sport.save();
        res.json({
            ok:true,
            msg: 'Created Sport',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
sportCtrl.updateSport = async (req = request , res = response) => {
    const sportID = req.params.id
    const name = req.body.name
    try {
        const sportDB = await Sport.findById(sportID);
        if(!sportDB){
            return unknownIDResponse(res);
        }
        const changes = req.body;
        //si no modifica el name (porque sino chocan por ser iguales)
        if(changes.name === sportDB.name){
            delete changes.name
        }else{
            const nameExists = await Sport.findOne({name});
            if(nameExists){
                return existsNameResponse(res);
            }
        }
        await Sport.findByIdAndUpdate(sportID,changes,{new:true})
        res.json({
            ok:true,
            msg:'Updated Sport'
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
sportCtrl.activateBlockSport = async (req = request, res = response) =>{
    const sportID = req.params.id;
    const action= req.body.action;
    try {
        const sportDB = await Sport.findById(sportID)
        if(!sportDB){
            return unknownIDResponse(res);
        }
        if (action === 'block'){
            if(sportDB.deletedDate !== null){
                return sportBlockedResponse(res);
            }
            else{
                sportDB.deletedDate = new Date();
                //ACA FALTA DAR DE BAJA TODAS LA CANCHAS DE ESTE DEPORTE
            }
        }
        else if (action === 'active'){
            if(sportDB.deletedDate === null){
                return sportActiveResponse(res);
            }
            else{
                sportDB.deletedDate = null;
            }
        }
        await Sport.findByIdAndUpdate(sportID,sportDB,{new:true});
        if (action === 'block'){
            res.json({
                ok:true,
                msg:'Blocked Sport'
            })
        }
        else if(action === 'active'){
            res.json({
                ok:true,
                msg:'Activated Sport'
            })
        }
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
sportCtrl.getCombo = async (req = request, res = response)=> {
    try {
        let sports = await Sport.find({},'id name');
        let combo = [];
        sports.forEach(sport => {
            let x = {id:sport.id, text:sport.name};
            combo.push(x);
        });
        res.json({
            ok: true,
            msg:'Found Sport combo',
            param: {
                combo
            }
        })
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

function existsNameResponse(res){
    return res.status(400).json({
        ok:false,
        code: 10,
        msg:'A Sport already exists with this name'
    })
}
function unknownIDResponse(res){
    return res.status(404).json({
        ok:false,
        code: 3,
        msg:'Unknown ID. Please insert a correct ID'
    })
}
function sportBlockedResponse(res){
    return res.status(404).json({
        ok:false,
        code: 6,
        msg:'This Sport is blocked'
    })
}
function sportActiveResponse(res){
    return res.status(404).json({
        ok:false,
        code: 7,
        msg:'This Sport is active'
    })
}
module.exports = sportCtrl;