const User = require ('../models/user.model');
const SportCenter = require('../models/sportCenter.model');
const Request = require ('../models/request.model');
const { request, response} = require ('express');
const requestCtrl = {};

requestCtrl.getSportCentetrRequests = async (req = request , res = response) => {
    const sportCenterID = req.params.id
    try {
        const sportCenterDB = await SportCenter.findById(sportCenterID);
        if(!sportCenterDB){
            return unknownIDResponse(res);
        }
        const requests = await Request.find({sportCenter:sportCenterID})
        res.json({
            ok:true,
            msg:'Found Requests',
            param:{
                requests: requests,
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
requestCtrl.getRequests = async (req = request , res = response) => {
    try {
        const requests = await Request.find()
        res.json({
            ok:true,
            msg:'Found Requests',
            param:{
                requests: requests,
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
requestCtrl.createRequest = async (req = request , res = response) => {
    const request = req.body;
    try {
        let section;
        if(request.section === '1'){
            section = 'DEPORTE', 'CARACTERÍSTICA', 'SERVICIO'
        }
        else if(request.section === '2'){
            section = 'CARACTERÍSTICA'
        }
        else if(request.section === '3'){
            section = 'SERVICIO'
        }
        let newRequest = new Request({
            section: section,
            description: request.description,
            sportCenter: request.sportCenter,
            creatorEmail: request.creatorEmail,
            date: setDate()
        })
        a = await newRequest.save();
        console.log(a)
        res.json({
            ok:true,
            msg:'Created Request',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
requestCtrl.seenRequest = async (req = request , res = response) => {
    const requestID = req.params.id;
    try {
        const requestDB = await Request.findById(requestID)
        if(!requestDB){
            return unknownIDResponse(res);
        }
        if(requestDB.seen === true){
            return requestSeenResponse(res);
        }
        else{
            requestDB.seen = true;
        }
        await Request.findByIdAndUpdate(requestID,requestDB,{new:true});
        res.json({
            ok:true,
            msg:'Seen Request'
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
requestCtrl.activateBlockRequest = async (req = request , res = response) => {
    const requestID = req.params.id;
    const action= req.body.action;
    try {
        const requestDB = await Request.findById(requestID)
        if(!requestDB){
            return unknownIDResponse(res);
        }
        if (action === 'block'){
            if(requestDB.state === false){
                return requestBlockedResponse(res);
            }
            else{
                requestDB.state = false;
                requestDB.seen = true;
            }
        }
        else if (action === 'active'){
            if(requestDB.state === true){
                return requestActiveResponse(res);
            }
            else{
                requestDB.state = true;
                requestDB.seen = true;
            }
        }
        await Request.findByIdAndUpdate(requestID,requestDB,{new:true});
        if (action === 'block'){
            res.json({
                ok:true,
                msg:'Blocked Request'
            })
        }
        else if(action === 'active'){
            res.json({
                ok:true,
                msg:'Accepted Request'
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
        msg:'A Field already exists with this name'
    })
}
function requestBlockedResponse(res){
    return res.status(404).json({
        ok:false,
        code: 6,
        msg:'This Request is blocked'
    })
}
function requestActiveResponse(res){
    return res.status(404).json({
        ok:false,
        code: 7,
        msg:'This Request is active'
    })
}
function requestSeenResponse(res){
    return res.status(404).json({
        ok:false,
        code: 7,
        msg:'This Request is seen'
    })
}
function setDate(){
    const date = new Date();
    return new Date(date.getTime() - process.env.UTC_ARG)
}
module.exports = requestCtrl;