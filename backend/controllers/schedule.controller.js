const Day = require ('../models/day.model');
const Field = require ('../models/field.model');
const { request, response} = require ('express');
const scheduleCtrl = {};


scheduleCtrl.getCombo = async (req = request, res = response)=> {
    try {
        let days = await Day.find({},'id name');
        let combo = [];
        days.forEach(day => {
            let x = {id:day.id, text:day.name};
            combo.push(x);
        });
        res.json({
            ok: true,
            msg:'Found day combo',
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
module.exports = scheduleCtrl;
