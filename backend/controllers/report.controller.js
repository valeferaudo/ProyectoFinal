const SportCenter = require('../models/sportCenter.model');
const Appointment = require('../models/appointment.model');
const Payment = require('../models/payment.model');
const Field = require('../models/field.model');
const SpecialSchedule = require('../models/specialSchedule.model');
const Debt = require('../models/debt.model');
const { request, response} = require ('express');
const reportCtrl = {};
var moment = require('moment');
moment().format();

reportCtrl.generatePaymentReport = async (req = request , res = response) => {
    const state = req.query.state === "null" || req.query.state === "undefined" ? null : req.query.state;
    const type = req.query.type === "null" || req.query.type === "undefined" ? null : req.query.type;
    const sincePaymentDate = req.query.sincePaymentDate === "null" || req.query.sincePaymentDate === "undefined" ? null : req.query.sincePaymentDate;
    const untilPaymentDate = req.query.untilPaymentDate === "null" || req.query.untilPaymentDate === "undefined" ? null : req.query.untilPaymentDate;
    const sinceAppointmentDate = req.query.sinceAppointmentDate === "null" || req.query.sinceAppointmentDate === "undefined" ? null : req.query.sinceAppointmentDate;
    const untilAppointmentDate = req.query.untilAppointmentDate === "null" || req.query.untilAppointmentDate === "undefined" ? null : req.query.untilAppointmentDate;
    const field = req.query.field === "null" || req.query.field === "undefined" ? null : req.query.field;
    const sportCenterID = req.params.sportCenterID;
    try {
        let selectedFilters = [];
        let query = {
            '$and': []
        };
        query['$and'].push({ appointmentSportCenter: sportCenterID});
        if (state !== null){
            if (state === 'Aprobado'){
                state !== null ? query['$and'].push({ state: 'APPROVED'}) : query ;
            }
            else if (state === 'Pendiente'){
                state !== null ? query['$and'].push({ state: 'PENDING'}) : query ;
            }
            selectedFilters.push(state)
        }
        if (type !== null){
            if (type === 'Mercado Pago'){
                type !== null ? query['$and'].push({ type: 'MERCADO-PAGO'}) : query ;
            }
            else if (type === 'Otro'){
                type !== null ? query['$and'].push({ type: 'OTHER'}) : query ;
            }
            else if (type === 'Efectivo'){
                type !== null ? query['$and'].push({ type: 'CASH'}) : query ;
            }
            selectedFilters.push(type)
        }
        if(sincePaymentDate !== null && untilPaymentDate !== null){
            query['$and'].push({$and: [ { date: { $gte: moment(sincePaymentDate) } },
                                        { date: { $lte: moment(untilPaymentDate).add(1,'d') }}]})
            selectedFilters.push(`Pago: ${sincePaymentDate} - ${untilPaymentDate}`)
        }
        if(sinceAppointmentDate !== null && untilAppointmentDate !== null){
            query['$and'].push({$and: [ { appointmentDate: { $gte: moment(sinceAppointmentDate) } },
                                        { appointmentDate: { $lte: moment(untilAppointmentDate).add(1,'d') }}]})
            selectedFilters.push(`Turno: ${sinceAppointmentDate} - ${untilAppointmentDate}`)
        }
        field !== null ? query['$and'].push({appointmentField: field}) : query;
        if(query['$and'].length > 0){
            payments = await Payment.find(query).populate('appointment').populate({path:'appointment.user'}).populate('appointmentField')
                                                                .populate('appointmentSportCenter')                                                                
                                                                .sort({date: -1})
        }else{
            payments = await Payment.find().populate('appointment').populate({path:'appointment.user'}).populate('appointmentField')
                                                                .populate('appointmentSportCenter')                                                                
                                                                .sort({date: -1})
        }
        let total = 0;
        payments.forEach(payment => {
            total = total + payment.amountPayment
        });
        res.json({
            ok:true,
            msg:'Sport Center´s Payments found',
            param: {
                payments,
                selectedFilters,
                total
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
reportCtrl.generateDebtReport = async (req = request , res = response) => {
    const sportCenterID = req.params.sportCenterID;
    const state = req.query.state === undefined ? '' : req.query.state;
    const payment = req.query.payment === undefined ? '' : req.query.payment;
    try {
        let booleanState;
        let selectedFilters = [];
        let paymentState;
        if(state === 'Abiertas'){
            booleanState = true;
        }
        else if(state === 'Cerradas'){
            booleanState = false;
        }
        if(payment === 'Pagas'){
            paymentState = true;
        }
        else if(payment === 'No Pagas'){
            paymentState = false;
        }
        let query = {
            '$and': []
        };
        query['$and'].push({sportCenter: sportCenterID});
        if (state !== ''){
            booleanState === false ? query['$and'].push({closeDate: {$ne: null}}) : query['$and'].push({closeDate: null});
            selectedFilters.push(state);
        }
        if (payment !== ''){
            paymentState === false ? query['$and'].push({centerApprove: false}) : query['$and'].push({centerApprove: true});
            selectedFilters.push(payment);
        }
        if(query['$and'].length > 0){
            debts = await Debt.find(query).sort({createdDate: -1}).populate('field').populate('sportCenter')                                            
        }else{
                debts = await Debt.find().sort({createdDate: -1}).populate('field').populate('sportCenter')                                                
        }
        let total = 0;
        debts.forEach(debt => {
            total = total + debt.totalDebt
        });
        res.json({
            ok: true,
            msg:'Found SportCenter Debts',
            param: {
                debts: debts,
                selectedFilters: selectedFilters,
                total
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
reportCtrl.generateAppointmentReport = async (req = request , res = response) => {
    const sportCenterID = req.params.sportCenterID;
    const state = req.query.state;
    const sinceDate = req.query.sinceDate === "null" || req.query.sinceDate === "undefined" ? null : req.query.sinceDate;
    const untilDate = req.query.untilDate === "null" || req.query.untilDate === "undefined" ? null : req.query.untilDate;
    const sinceHour = req.query.sinceHour !== undefined ? parseInt(req.query.sinceHour) : '1';
    const untilHour = req.query.untilHour !== undefined ? parseInt(req.query.untilHour) : '23';
    const fieldID = req.query.fieldID === "null" || req.query.fieldID === "undefined" ? null : req.query.fieldID;
    const payment = req.query.payment === "null" || req.query.payment === "undefined" ? null : req.query.payment;
    try {
        const sportCenterDB = await SportCenter.findById(sportCenterID)
        if(!sportCenterDB){
            return unknownIDResponse(res);
        }
        let selectedFilters = [];
        let query = {
            '$and': []
        };
        query['$and'].push({ sportCenter: sportCenterID})
        if (state !== null) {
            query['$and'].push({ state: state});
            if(state === 'Completed'){
                selectedFilters.push('Completado')
            }
            else if(state === 'Reserved'){
                selectedFilters.push('Reservado')
            }
            else if(state === 'InProgress'){
                selectedFilters.push('En progreso')
            }
            else if(state === 'AboutToStart'){
                selectedFilters.push('Por comenzar')
            }
        }
        if (fieldID !== null){
            query['$and'].push({field: fieldID});
            field = await Field.findById(fieldID,'name')
            selectedFilters.push(field.name)
        }
        if (payment !== null){
            payment === 'Total'? query['$and'].push({'$expr': { $eq: [ '$totalAmount' , '$totalPaid']}}) : query;
            payment === 'Parcial'? query['$and'].push({'$expr': { $lt: [ '$totalPaid' , '$totalAmount']}}) : query;
            payment === 'Sin Pagos'? query['$and'].push({ totalPaid: { $eq: 0 } }) : query;
            selectedFilters.push(payment)
        }
        if(sinceDate !== null && untilDate !== null){
            query['$and'].push({$and: [ { date: { $gte: moment(sinceDate).add(parseInt(sinceHour),'h').subtract(3,'h') } },
                                        { date: { $lte: moment(untilDate).add(parseInt(untilHour),'h').subtract(3,'h') }}]});
            selectedFilters.push(`Fecha: ${sinceDate} - ${untilDate}`)
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
        if(sinceHour !== 0 || untilHour !== 23 ){
            selectedFilters.push(`Hora: ${sinceHour} - ${untilHour}`)
        }
        if(query['$and'].length > 0){
            appointments = await Appointment.find(query).populate('user','name').populate('field').populate('sportCenter')                                            
        }else{
            appointments = await Appointment.find().populate('user','name').populate('field').populate('sportCenter')                                            
        }
        if(appointments.length > 0){
            if(appointments[0].state === 'Completed'){
                sortDateFromLargest(appointments);
            }
            else{
                sortDateFromSmallest(appointments);
            }
        }
        let totalAmount = 0;
        let totalPaid = 0;
        appointments.forEach(appointment => {
            totalAmount = totalAmount + appointment.totalAmount;
            totalPaid = totalPaid + appointment.totalPaid;
        });
        res.json({
            ok:true,
            msg:'Found Appointments',
            param:{
                appointments,
                selectedFilters,
                totalAmount,
                totalPaid
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
reportCtrl.generateCashReport = async (req = request , res = response) => {
    const sportCenterID = req.params.sportCenterID;
    try {
        const sportCenterDB = await SportCenter.findById(sportCenterID)
        if(!sportCenterDB){
            return unknownIDResponse(res);
        }
        let query = {
            '$and': []
        };
        query['$and'].push({ sportCenter: sportCenterID})
        query['$and'].push({'$expr': { $lt: [ '$totalPaid' , '$totalAmount']}});
        if(query['$and'].length > 0){
            appointments = await Appointment.find(query).populate('user','name').populate('field').populate('sportCenter')                                            
        }else{
            appointments = await Appointment.find().populate('user','name').populate('field').populate('sportCenter')                                            
        }
        if(appointments.length > 0){
            if(appointments[0].state === 'Completed'){
                sortDateFromLargest(appointments);
            }
            else{
                sortDateFromSmallest(appointments);
            }
        }
        //CALCULAR EL TOTAL DE DEUDA 
        totalPaid = 0;
        totalAmount = 0;
        appointments.forEach(element => {
            totalPaid = totalPaid + element.totalPaid;
            totalAmount = totalAmount + element.totalAmount;
        });
        res.json({
            ok:true,
            msg:'Found Appointments',
            param:{
                appointments,
                totalPaid,
                totalAmount
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
reportCtrl.generateOccupationReport = async (req = request , res = response) => {
    const sportCenterID = req.params.sportCenterID;
    const fieldID = req.query.fieldID === "null" || req.query.fieldID === "undefined" ? null : req.query.fieldID;
    let dateSince = req.query.sinceDate === "null" || req.query.sinceDate === "undefined" ? null : req.query.sinceDate;
    let dateUntil = req.query.untilDate === "null" || req.query.untilDate === "undefined" ? null : req.query.untilDate;
    const day = req.query.day === "null" || req.query.day === "undefined" ? null : req.query.day;
    const sinceHour = req.query.sinceHour;
    const untilHour = req.query.untilHour;
    try {
        const sportCenterDB = await SportCenter.findById(sportCenterID)
        if(!sportCenterDB){
            return unknownIDResponse(res);
        }
        const fieldDB = await Field.findById(fieldID,'name sportCenter duration')
        if(!fieldDB){
            return unknownIDResponse(res);
        }
        let selectedFilters = [];
        selectedFilters.push(`Cancha: ${fieldDB.name}`)
        //Armo las fechas desde y hasta
        let sinceDate;
        let untilDate;
        dateSince === null ? sinceDate = moment(sportCenterDB.createdDate).add(3,'h').startOf("day") : sinceDate = moment(dateSince);
        dateUntil === null ? untilDate = moment(new Date()) : untilDate = moment(dateUntil);
        if (dateSince === null){
            selectedFilters.push(`Fecha: Histórico`)
        }
        else{
            selectedFilters.push(`Fecha: ${dateSince} - ${dateUntil}`)
        }
        if (parseInt(sinceHour) !== 0 || parseInt(untilHour) !== 23){
            selectedFilters.push(`Horario: ${sinceHour} - ${untilHour}`)
        }
        else{
            selectedFilters.push(`Horario: Completo`)
        }
        //calculo la duracion del turno en horas
        const hourDuration = (fieldDB.duration / 60)
        //1- Armo el arreglo de turnos entre las horas indicadas
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
        //2-QUITO LAS HORAS DONDE LOS DIAS ESTAN CERRADOS y las horas que esta cerrado de los dias abiertos
        //Ir por dia y si no esta abierto quitar todos, si esta abierto verificar las horas.
        //Armo arreglo de dias abiertos
        let openDays = [];
        sportCenterDB.schedules.forEach( schedule => {
            openDays.push(schedule)
        });
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
        //3- QUITO LAS FECHAS ESPECIALES
        dateSince === null ? sinceDate = moment(sportCenterDB.createdDate).add(3,'h').startOf("day") : sinceDate = moment(dateSince);
        //Obtengo las fechas especiales
        let specialSchedulesDB = await SpecialSchedule.find({ $and: [ { sportCenter: sportCenterDB.id }, 
            { date: { $gte: moment(sinceDate).startOf('day') } },
            { date: { $lte: moment(untilDate).startOf('day') } } ] })
        //Armo el arreglo de horarios
        let specialSchedules = [];
        specialSchedulesDB.forEach(item => {
            let minHour = moment(item.sinceHour).add(3,'h').hour() - 1;
            let maxHour = moment(item.untilHour).add(3,'h').hour() - 1;
            do {
                minHour = minHour +1;
                specialSchedules.push(moment(item.date).add(minHour,'h'))
            } while (moment(item.date).add(minHour,'h').isBefore(moment(item.date).add(maxHour,'h')));
        });
        //filtro el arreglo de turnos disponibles
        for (let i = 0; i < specialSchedules.length; i++) {
            for (let j = 0; j < appointments.length; j++) {
                if(moment(specialSchedules[i]).isSame(moment(appointments[j]))){
                    appointments.splice(j,1);
                }
            }
        }
        //4- FILTRO POR DIA (1-2-3-4-5-6-7). Quito los que no son del día indicado.
        let notDayAppointments = [];
        if (day !== null){
            for (let j = 0; j < appointments.length; j++) {
                if(moment(appointments[j]).isoWeekday() !== parseInt(day)){
                    notDayAppointments.push(appointments[j]);
                }
            }
            let dayName = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
            selectedFilters.push(`Día: ${dayName[parseInt(day)-1]}`)
        }
        for (let i = 0; i < notDayAppointments.length; i++) {
            for (let j = 0; j < appointments.length; j++) {
                if(moment(notDayAppointments[i]).isSame(moment(appointments[j]))){
                    appointments.splice(j,1);
                }
            }
        }
        //5- Calculo los ya reservados
        //Obtengo los reservados de BD entre los parametros.
        let reserved = [];
        let query2 = {
            '$and': []
        };
        query2['$and'].push({field:fieldID})
        if(dateSince !== null){
            query2['$and'].push({$and: [ { date: { $gte: moment(sinceDate).add(parseInt(sinceHour),'h').subtract(3,'h') } },
                                        { date: { $lte: moment(untilDate).add(parseInt(untilHour),'h').subtract(3,'h') }}]})
        }
        if(dateSince === null){
            query2['$and'].push({
                "$expr": {
                    "$and": [
                      { "$gte": [{ "$hour": "$date" }, parseInt(sinceHour)] },
                      { "$lte": [{ "$hour": "$date"},parseInt(untilHour)]}
                    ]
                  }
            })
        }
        reserved = await Appointment.find(query2);
        let notDayAppointments2 = [];
        if (day !== null){
            for (let j = 0; j < reserved.length; j++) {
                if(moment(reserved[j].date).isoWeekday() !== parseInt(day)){
                    notDayAppointments2.push(reserved[j]);
                }
            }
        }
        for (let i = 0; i < notDayAppointments2.length; i++) {
            for (let j = 0; j < reserved.length; j++) {
                if(moment(notDayAppointments2[i].date).isSame(moment(reserved[j].date))){
                    reserved.splice(j,1);
                }
            }
        }
         res.json({
            ok:true,
            msg:'Found Occupations',
            param:{
                field: fieldDB,
                sportCenter: sportCenterDB,
                occupation:{
                    total: appointments.length,
                    reserved: reserved.length,
                },
                selectedFilters
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
module.exports = reportCtrl;