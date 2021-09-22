const Day = require ('../models/day.model');
const Payment = require ('../models/payment.model');
const Debt = require ('../models/debt.model')
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
        let query = {
            '$and': []
        };
        query['$and'].push({$and: [ { date: { $gte: moment(req.body.date).add(parseInt(req.body.sinceHour),'h').subtract(3,'h') } },
                                    { date: { $lt: moment(req.body.date).add(parseInt(req.body.untilHour),'h').subtract(3,'h') }}]})
        appointmentDelete = await Appointment.find(query).populate('user').populate('field')
        appointmentDelete.forEach(appointment => {
            if(appointment.user.role === 'USER'){
                cancelAppointmentCenterEmail(appointment.user, appointment);
                // cancelAppointmentSMS(appointment)
            }
            else{
                // cancelAppointmentSMS(appointment)
            }
            checkPayment(appointment);
        });
        await Appointment.deleteMany(query);
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
checkPayment = async (appointment) => {
    try {
        const [ids, updates] = await Promise.all([Payment.find({appointment:appointment.id},'id'),
                                            Payment.updateMany({appointment:appointment.id},{appointment:null})]);
        if(updates.n !== 0){
            createDebtManual(appointment)
        } 
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error ocurred'
        })
    }
}
createDebtManual = async (appointment) => {
    let debt = new Debt({
        createdDate: moment().subtract(3,'h'),
        appointment: appointment.date,
        field:appointment.field,
        totalDebt:appointment.totalPaid,
        sportCenter: appointment.sportCenter,
        user: appointment.user.role === 'USER' ? appointment.user : null,
        owner:{
            oid: appointment.owner.oid,
            name: appointment.owner.name,
            phone: appointment.owner.phone,
        },
        description: null,
        cancelDescription: 'Creado de horario especial',
        centerApprove: false,
        userApprove: appointment.user.role === 'USER' ? false: null,
        payments: appointment.payments,
        closeDate: null,
        cancelDoer: 'SPORTCENTER'
    })
    await debt.save();
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
