const Sport = require ('../models/sport.model');
const Field = require ('../models/field.model');
const { request, response} = require ('express');
const sportCtrl = {};


sportCtrl.getSports = async (req = request , res = response) => {
    searchText = req.query.text;
    state = req.query.state;
    page = parseInt(req.query.page);
    registerPerPage = parseInt(req.query.registerPerPage);
    try {
        let sports;
        let booleanState;
        let selectedFilters = [];
        if(state === 'Activo'){
            booleanState = true;
        }
        else if(state === 'Bloqueado'){
            booleanState = false;
        }
        let query = {
            '$and': []
        };
        if(searchText !== ''){
            query['$and'].push({ name: new RegExp(searchText, 'i')});
            selectedFilters.push(`"${searchText}"`);
        }
        if(state !== ''){
            booleanState === false ? query['$and'].push({deletedDate: {$ne: null}}) : query['$and'].push({deletedDate: null})
            selectedFilters.push(state);
        }
        if(query['$and'].length > 0){
            [sports,total] = await Promise.all([Sport.find(query).skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                Sport.find(query).countDocuments()
                                               ])
        }else{
            [sports,total] = await Promise.all([Sport.find().skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                Sport.find().countDocuments()
                                               ])
        }
        total = Math.ceil(total / registerPerPage);
        res.json({
            ok: true,
            msg:'Found sports',
            param: {
                sports,
                selectedFilters,
                paginator:{
                    totalPages: total,
                    page: page
                }
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
            await Field.updateMany({}, {$pull:{sports:{sport:sportDB.id}}})
            await Field.updateMany({sports:{$exists:true,$eq:[]}},{state:false})
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
        let sports = await Sport.find({deletedDate:  null},'id name');
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