const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Field = require('../models/field.model');
const FieldPrice = require('../models/fieldPrice.model');
const SportCenter = require('../models/sportCenter.model');
var moment = require('moment');
moment().format();

const cron = require('node-cron');

const { request , response } = require('express');
const appointmentCtrl = {};

appointmentCtrl.getFieldAvailableAppointments = async (req = request , res = response) =>{
    const fieldID = req.params.id
    const dateSince = req.query.sinceDate;
    const dateUntil = req.query.untilDate;
    const sinceHour = req.query.sinceHour;
    const untilHour = req.query.untilHour;
    try {
        const fieldDB = await Field.findById(fieldID,'sportCenter duration')
        if(!fieldDB){
            return unknownIDResponse(res);
        }
        const sportCenterDB = await SportCenter.findById(fieldDB.sportCenter)
        //Armo las fechas desde y hasta
        let sinceDate = moment(dateSince)
        let untilDate = moment(dateUntil)
        //calculo la duracion del turno en horas
        const hourDuration = (fieldDB.duration / 60)
        //armo el arreglo de turnos entre las horas indicadas
        let appointments = new Array;
        do {
            //Horas de busqueda
            let openingTime = parseInt(sinceHour)
            let closingTime = parseInt(untilHour)
            do {
                date = moment(sinceDate).add(openingTime,'h')
                appointments.push(date)
                openingTime = openingTime + hourDuration
            } while (openingTime <= closingTime );
            sinceDate = moment(sinceDate).add(1,'day')
         } while (sinceDate <= untilDate);
         //Ir por dia y si no esta abierto quitar todos, si esta abierto verificar las horas.
         //Armo arreglo de dias abiertos
        let openDays = [];
        sportCenterDB.schedules.forEach( schedule => {
            openDays.push(schedule)
        });
        //QUITO LAS HORAS DONDE LOS DIAS ESTAN CERRADOS y las horas que esta cerrado de los dias abiertos
        let daysAppointments= []
        //Horas de busqueda
        for (let i = 0; i < openDays.length; i++) {
            for (let j = 0; j < appointments.length; j++) {
                if(moment(appointments[j]).isoWeekday() === openDays[i].day){
                    if(moment(appointments[j]).hours() >= moment(openDays[i].openingHour).add(3,'h').hours() &&  moment(appointments[j]).hours() <= moment(openDays[i].closingHour).add(3,'h').hours())
                    daysAppointments.push(appointments[j])
                }
            }
        }
        appointments = daysAppointments;
        //verificar si fecha = hoy --> no traiga los menores a ahora
        sinceDate = moment(dateSince)
        daysAppointments = [];
        if(sinceDate.date() === moment().date()){
            if(parseInt(sinceHour) < moment().hour()){
                for (let j = 0; j < appointments.length; j++) {
                    if(moment(appointments[j]).date() ===  moment().date()){
                        if (moment(appointments[j]).hour() > moment().hour()){
                            daysAppointments.push(appointments[j])
                        }
                    }
                    else{
                        daysAppointments.push(appointments[j])
                    }
                }
                appointments = daysAppointments;
            }
        }
        //3- Limpiar los ya reservados
        //Obtengo los reservados de BD entre los parametros.
        let reserved = [];
        reserved = await Appointment.find({$and: [ { date: { $gte: moment(sinceDate).add(parseInt(sinceHour),'h') } },
                                                    { date: { $lte: moment(untilDate).add(parseInt(untilHour),'h') } },
                                                {field:fieldID} ] } );
        //Quito los ya reservados.
        for (let i = 0; i < reserved.length; i++) {
            for (let j = 0; j < appointments.length; j++) {
                if(moment(reserved[i].date).add(3,'h').isSame(moment(appointments[j]))){
                    appointments.splice(j,1);
                }
            }
        }
        //4- ORDENARLOS DE MAS RECIENTES A MAS LEJOS PARA MOSTRARLOS BIEN
        appointments.sort((elem1,elem2)=>{
            return (moment(elem1).diff(moment(elem2)))
        })
        res.json({
            ok:true,
            msg:'Available Appointments',
            param:{
                appointments
            }
        })

    } catch (error) {
    console.log(error)
    res.status(500).json({
        ok:false,
        msg:'An unexpected error ocurred'
    })
    }
}
appointmentCtrl.createAppointment = async (req = request, res = response) =>{
    const body = req.body;
    try {
        //obtener la hora de cobro adicional luz, el monto y  el precio de la cancha
        const fieldDB = await Field.findById(body.field).populate('sportCenter')
        if(!fieldDB){
            return unknownIDResponse(res);
        }
        let fieldPrice = await FieldPrice.findOne({field: body.field}).sort({'sinceDate' : -1}).limit(1);
        let aditionalPrice = 0;
        if (fieldDB.sportCenter.aditionalElectricity){
            if(parseInt(fieldDB.sportCenter.aditionalElectricityHour.slice(0,2)) <= moment(body.date).hours()){
                aditionalPrice = fieldDB.sportCenter.aditionalElectricity
            }
        }
        let totalAmount = 0;
        totalAmount = fieldPrice.price + aditionalPrice;
        //Le resto 3 a la hora porque la trae con 3 hs mas
        const appointment = new Appointment({
            createdDate: moment().subtract(3,'h'),
            date: moment(body.date).subtract(3,'h'),
            totalAmount: totalAmount,
            lightTime: fieldDB.sportCenter.aditionalElectricity ? true: false,
            owner:{
                oid: body.owner.oid,
                name: body.owner.name,
                phone: body.owner.phone
            },
            user: body.user,
            field: body.field,
        })
        await appointment.save()
        res.json({
            ok:true,
            msg:'Created Appointment',
        })
    } catch (error) {
        console.log(error);
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(400).json({
                    ok:false,
                    msg:'The Field is already reserved for the requested date'
            })
        }
        res.status(500).json({
            ok:false,
            msg:'An unexpected error ocurred'
        })
    }
}
appointmentCtrl.getSportCenterAppointments = async (req = request , res = response) => {
    const sportCenterID = req.params.id;
    const state = req.query.state;
    const sinceDate = req.query.sinceDate === "null" || req.query.sinceDate === "undefined" ? null : req.query.sinceDate;
    const untilDate = req.query.untilDate === "null" || req.query.untilDate === "undefined" ? null : req.query.untilDate;
    const sinceHour = req.query.sinceHour !== undefined ? parseInt(req.query.sinceHour) : '1';
    const untilHour = req.query.untilHour !== undefined ? parseInt(req.query.untilHour) : '23';
    const fieldID = req.query.fieldID === "null" || req.query.fieldID === "undefined" ? null : req.query.fieldID;
    try {
        const sportCenterDB = await SportCenter.findById(sportCenterID)
        if(!sportCenterDB){
            return unknownIDResponse(res);
        }
        let query = {
            '$and': []
        };
        state !== null ? query['$and'].push({ state: state}) : query ;
        fieldID !== null ? query['$and'].push({field: fieldID}) : query;
        if(sinceDate !== null && untilDate !== null){
            query['$and'].push({$and: [ { date: { $gte: moment(sinceDate).add(parseInt(sinceHour),'h').subtract(3,'h') } },
                                        { date: { $lte: moment(untilDate).add(parseInt(untilHour),'h').subtract(3,'h') }}]})
        }
        if(sinceDate === null && untilDate === null){
            query['$and'].push({
                "$expr": {
                    "$and": [
                      { "$gte": [{ "$hour": "$date" }, sinceHour] },
                      { "$lte": [{ "$hour": "$date"}, untilHour]}
                    ]
                  }
            })
        }

        const appointments = await Appointment.find(query)
                                         .populate('user','name')
                                         .populate({
                                            path: "field",
                                            match: {
                                                sportCenter: sportCenterID,
                                            }})
                                            // lo que andaba pero no filtraba por centro deportivo era .populate('field')
        if(appointments.length > 0){
            if(appointments[0].state === 'Completed'){
                sortDateFromLargest(appointments);
            }
            else{
                sortDateFromSmallest(appointments);
            }
        }
        res.json({
            ok:true,
            msg:'Found Appointments',
            param:{
                appointments,
            }
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error ocurred'
        })
    }
}
appointmentCtrl.getUserAppointments = async (req = request , res = response) => {
    const userID = req.params.id;
    const state = req.query.state;
    const sinceDate = req.query.sinceDate === "null" || req.query.sinceDate === "undefined" ? null : req.query.sinceDate;
    const untilDate = req.query.untilDate === "null" || req.query.untilDate === "undefined" ? null : req.query.untilDate;
    const sinceHour = req.query.sinceHour !== undefined ? parseInt(req.query.sinceHour) : '1';
    const untilHour = req.query.untilHour !== undefined ? parseInt(req.query.untilHour) : '23';
    const fieldID = req.query.fieldID === "null" || req.query.fieldID === "undefined" ? null : req.query.fieldID;
    try {
        const userDB = await User.findById(userID)
        if(!userDB){
            return unknownIDResponse(res);
        }
        let query = {
            '$and': []
        };
        state !== null ? query['$and'].push({ state: state}) : query ;
        fieldID !== null ? query['$and'].push({field: fieldID}) : query;
        if(sinceDate !== null && untilDate !== null){
            query['$and'].push({$and: [ { date: { $gte: moment(sinceDate).add(parseInt(sinceHour),'h').subtract(3,'h') } },
                                        { date: { $lte: moment(untilDate).add(parseInt(untilHour),'h').subtract(3,'h') }}]})
        }
        if(sinceDate === null && untilDate === null){
            query['$and'].push({
                "$expr": {
                    "$and": [
                      { "$gte": [{ "$hour": "$date" }, sinceHour] },
                      { "$lte": [{ "$hour": "$date"}, untilHour]}
                    ]
                  }
            })
        }
        query['$and'].push({ user: userID})
        const appointments = await Appointment.find(query)
                                         .populate('user','name')
                                         .populate({ 
                                            path: 'field',
                                            model: 'Field',
                                            populate: {
                                                path: 'sportCenter',
                                                model: 'SportCenter'
                                            }
                                        })
        if(appointments.length > 0){
            if(appointments[0].state === 'Completed'){
                sortDateFromLargest(appointments);
            }
            else{
                sortDateFromSmallest(appointments);
            }
        }
        res.json({
            ok:true,
            msg:'Found Appointments',
            param:{
                appointments,
            }
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error ocurred'
        })
    }
}
appointmentCtrl.deleteAppointment = async (req = request, res = response) =>{
    const id = req.params.id;
    const userID = req.uid;
    try {
        const appointmentDB = await Appointment.findById(id).populate('user');
        if (!appointmentDB) {
            return unknownIDResponse(res)
        }
        const userDB = await User.findById(userID);
        if(userDB.role === 'USER'){
            if(userDB.id !== appointmentDB.user.id){
                return res.status(404).json({
                    ok:false,
                    code:18,
                    msg:'The appointment cannot be deleted by this User'
                })
            }
        }
        if(appointmentDB.state !== 'Reserved' || moment(appointmentDB.date).add(3,'h').subtract(12,'h') < moment()){
            return res.status(404).json({
                ok:false,
                code:12,
                msg:'The appointment cannot be deleted due to cancelation policies'
            })
        }
        let userPhone;
        if (appointmentDB.owner.phone !== null){
            userPhone = appointmentDB.owner.phone
        }
        else if(appointmentDB.owner.phone === null){
            userPhone = appointmentDB.user.phone
        }
        await Appointment.findByIdAndDelete(id);
        res.json({
            ok:true,
            msg:'Deleted Appointment',
            param: {
                userPhone
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error ocurred'
        })
    }
}
function unknownIDResponse(res){
    return res.status(404).json({
        ok:false,
        code: 3,
        msg:'Unknown ID. Please insert a correct ID'
    })
}
sortDateFromSmallest = (array) => {
    array = array.sort((a,b)=>{
        if(a.date.getTime() > b.date.getTime()){
            return 1;
        }
        if(a.date.getTime() < b.date.getTime()){
            return -1
        }
    })
    return array
}
sortDateFromLargest = (array)=>{
    array = array.sort((a,b)=>{
        if(a.date.getTime() > b.date.getTime()){
            return -1;
        }
        if(a.date.getTime() < b.date.getTime()){
            return 1
        }
    })
    return array
}

cron.schedule('0,10,20,30,43,50 * * * *', async () => {
     try {
        const appointmentsDB = await Appointment.find()
        appointmentsDB.forEach(element=>{
            const difference = (element.date.getTime() - (new Date().getTime()- process.env.UTC_ARG))
            changeState(element,difference)
        })

     } catch (error) {
         console.log(error)
     }
 })

changeState = async (element,difference) =>{
    if(difference < 3600000 && difference > 0){
        const change={
            state: 'AboutToStart'
        }
        await Appointment.findByIdAndUpdate(element.id,change)
    }
    else if(difference<0 && difference> -3600000){
        const change={
            state: 'InProgress'
        }
        await Appointment.findByIdAndUpdate(element.id,change)
    }
    else if(difference< -3600000){
        const change={
            state: 'Completed'
        }
        await Appointment.findByIdAndUpdate(element.id,change)
    }
 }

module.exports = appointmentCtrl;

