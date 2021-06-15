const Day = require ('../models/day.model');
const User = require ('../models/user.model');
const SpecialSchedule = require ('../models/specialSchedule.model');
const Appointment = require ('../models/appointment.model');
const SportCenter = require ('../models/sportCenter.model');
const { request, response} = require ('express');
const scheduleCtrl = {};
var moment = require('moment');
moment().format();
//Mails
const { cancelAppointmentCenterEmail } = require ('../helpers/emails/cancelAppointmentCenterEmail');
//SMS
const { cancelAppointmentSMS } = require ('../helpers/sms/cancelAppointmentSms');

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
scheduleCtrl.getSpecialSchedules = async (req = request,res = response)=>{
    // (poner un filtro de viejas y futuras?)
    userID = req.uid;
    sportCenterID = req.params.id;
    try {
        const sportCenterDB = await SportCenter.findById(sportCenterID);
        if (!sportCenterDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Sport Center ID'
            })
        }
        specialSchedules = await SpecialSchedule.find({ $and: [ { sportCenter: sportCenterID }, { date: { $gte: moment().startOf('day') } } ] });
        let indexes = [];
        specialSchedules.forEach(item => {
            if (moment().startOf('day').isSame(moment(item.date))){
                if(moment().hours() > moment(item.untilHour).add(3,'h').hours()){
                    indexes.push(specialSchedules.indexOf(item));
                }
                if(moment().hours() === moment(item.untilHour).add(3,'h').hours()){
                    if(moment().minutes() >= moment(item.untilHour).add(3,'h').minutes()){
                        indexes.push(specialSchedules.indexOf(item));
                    }
                }
            }
        });
        indexes.sort((a, b) => b - a);
        indexes.forEach(i => {
            specialSchedules.splice(i,1)
        });
        specialSchedules.sort((elem1,elem2)=>{
        return (moment(elem1.date).add(moment(elem1.sinceHour).hours(),'h').diff(moment(elem2.date).add(moment(elem2.sinceHour).hours(),'h')))
        })
        res.json({
            ok: true,
            msg:'Found Special Schedules',
            param: {
                specialSchedules
            }
        })
        
    } catch (error) {
        console.log(error);
        res.stat(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
scheduleCtrl.createSpecialSchedule = async (req = request, res = response) =>{
    userID = req.uid;
    sportCenterID = req.params.id;
    try {
        const sportCenterDB = await SportCenter.findById(sportCenterID);
        if (!sportCenterDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Sport Center ID'
            })
        }
        specialSchedule = new SpecialSchedule({
            sportCenter: sportCenterID,
            date: moment(req.body.date),
            sinceHour: setDate(req.body.sinceHour),
            untilHour: setDate(req.body.untilHour),
        })
        await specialSchedule.save();
        //ELIMINAR LOS TURNOS CARGADOS.
        let specialSchedules = [];
        let minHour = moment(specialSchedule.sinceHour).add(3,'h').hour() - 1;
        let maxHour = moment(specialSchedule.untilHour).add(3,'h').hour() - 1;
        do {
            minHour = minHour +1;
            specialSchedules.push(moment(specialSchedule.date).add(minHour,'h'))
        } while (moment(specialSchedule.date).add(minHour,'h').isBefore(moment(specialSchedule.date).add(maxHour,'h')));
        const minDate = specialSchedules[0];
        const maxDate = specialSchedules[specialSchedules.length - 1];
        appointmentDelete = await Appointment.find({ $and: [ { date: { $gte: moment(minDate).subtract(3,'h') } },
                                                            { date: { $lte: moment(maxDate).subtract(3,'h')} } ] }).populate('user')
        await Appointment.deleteMany({ $and: [ { date: { $gte: moment(minDate).subtract(3,'h') } },
                                                { date: { $lte: moment(maxDate).subtract(3,'h')} } ] })
        appointmentDelete.forEach(appointment => {
            if(appointment.user.role === 'USER'){
                cancelAppointmentCenterEmail(appointment.user, appointment);
                // cancelAppointmentSMS(appointment)
            }
            else{
                // cancelAppointmentSMS(appointment)
            }
        });
        res.json({
            ok: true,
            msg:'Created Special Schedule',
        })
    } catch (error) {
        console.log(error);
        res.stat(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
scheduleCtrl.deleteSpecialSchedule = async (req = request, res = response) =>{
    userID = req.uid;
    specialScheduleID = req.params.id;
    try {
        const specialScheduleDB = await SpecialSchedule.findById(specialScheduleID);
        if (!specialScheduleDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Special Schedule ID'
            })
        }
        // const user = await User.findById(userID)
        // if (user.sportCenter !== specialScheduleDB.sportCenter) {
        //     return res.status(404).json({
        //         ok:false,
        //         msg:'This User doesn´t have the permissions to update Special Schedules to this Sport Center'
        //     })
        // }
        // const userDB = await User.findById(userID)
        // if(userDB.role !== 'CENTER-SUPER-ADMIN'){
        //     return res.status(403).json({
        //         ok:false,
        //         msg:'This User role doesn´t have the permissions to update Special Schedules'
        //     })
        // }
        await SpecialSchedule.findByIdAndDelete(specialScheduleID)
        res.json({
            ok:true,
            msg:'Deleted Special Schedule'
        })
    } catch (error) {
        console.log(error);
        res.stat(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
function setDate(hour){
    if(hour === ''){
        return null
    }
    else{
        const date = new Date(`1970/01/01 ${hour}:00`) 
        return new Date(date.getTime() - process.env.UTC_ARG)
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
