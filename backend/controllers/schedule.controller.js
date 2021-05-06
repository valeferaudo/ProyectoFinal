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

//NO SE USAN
scheduleCtrl.createSchedule = async (req = request, res = respones) => {
    const newSchedules = req.body.schedules;
    const fieldID = req.params.id;
    try {
        const fieldDB = await Field.findById(fieldID);
        if(!fieldDB){
            return unknownIDResponse(res);
        }
        //preguntar si ya tiene horarios y si ya tiene mandarlo al update
        const oldSchedules = await Day.find({field:fieldID});
        if (oldSchedules === []){
            return scheduleCtrl.updateSchedule
        }
        const days = await Day.find();
        // falta crear los otros en 0
        newSchedules.forEach(schedule => {
            const fieldDay = new FieldDay({
                field: fieldID,
                day: schedule.day,
                sinceHour: setDate(schedule.openingHour),
                untilHour: setDate(schedule.closingHour)
            })
            fieldDay.save()
        });
        res.json({
            ok:true,
            msg:'Created Field Schedules'
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
scheduleCtrl.updateSchedule = async (req = request, res = respones) => {
    
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
function setDate(hour){
    const date = new Date(`1970/01/01 ${hour}:00`) 
    return new Date(date.getTime() - process.env.UTC_ARG)
}
module.exports = scheduleCtrl;
