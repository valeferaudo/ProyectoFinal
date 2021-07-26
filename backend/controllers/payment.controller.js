const SportCenter = require('../models/sportCenter.model');
const Appointment = require('../models/appointment.model');
const Payment = require('../models/payment.model');
const { request, response} = require ('express');
const paymentCtrl = {};
const mercadopago = require ('mercadopago');
const Cryptr = require('cryptr');
const { payment } = require('mercadopago');
var moment = require('moment');
moment().format();

paymentCtrl.createPreference = async (req = request , res = response) => {
    const sportCenter = await SportCenter.findById(req.body.sportCenterID, 'credentials');
//este es el de valentin TEST-4707330542009115-062319-7ea9aa54282604efd39eed2b2848809c-203179708
    const cryptr = new Cryptr(process.env.CRYTPR);
    mercadopago.configurations.setAccessToken(cryptr.decrypt(sportCenter.credentials.accessToken)); 
    let preference = {
        items: [{
            title: req.body.description,
            unit_price: Number(req.body.price),
            quantity: Number(req.body.quantity),
        }],
        back_urls: {
            "success": "http://localhost:4200/user/payments",
            "failure": "http://localhost:4200/user/payments",
            "pending": "http://localhost:4200/user/payments"
        },
        auto_return: 'all',
        payment_methods: {
            "excluded_payment_types": [
                {
                    "id": "ticket"
                }
            ],
        },
        binary_mode: true,
    };
  
    mercadopago.preferences.create(preference)
        .then(function (response) {
        //   console.log(response)
            res.json({id :response.body.id})
        }).catch(function (error) {
            console.log(error);
            res.status(500).json({
            ok:false,
            code: 9,
            msg:'Error generating payment.(MercadoPago)'
        })
        });
}
paymentCtrl.createMercadoPagoPayment = async (req = request , res = response) => {
    const paymentBody = req.body;
    try {
        const appointmentDB = await Appointment.findById(paymentBody.appointmentID).populate({ 
            path: 'field',
            model: 'Field',
            populate: {
                path: 'sportCenter',
                model: 'SportCenter'
            }})
        if(!appointmentDB){
        return canceledAppointmentResponse(res);
        }
        let mercadoPagoPayment = new Payment({
            preferenceID: paymentBody.preferenceID,
            mercadoPagoPaymentID: null,
            description: null,
            amountPayment: paymentBody.amountPayment,
            date: moment().subtract(3,'h'),
            state: 'PENDING',
            type: 'MERCADO-PAGO',
            appointment: paymentBody.appointmentID,
            appointmentDate: moment(appointmentDB.date).add(3,'h'),
            appointmentField: appointmentDB.field.name,
            appointmentSportCenter: appointmentDB.field.sportCenter.name,
        })
        await mercadoPagoPayment.save();
        res.json({
            ok:true,
            msg:'Created MercadoPago Payment',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
paymentCtrl.updateMercadoPagoPayment = async (req = request , res = response) => {
    const paymentBody = req.body;
    const preferenceID = req.params.preferenceID
    try {
        const paymentDB = await Payment.findOne({preferenceID: preferenceID});
        if(!paymentDB){
            return unknownPaymentResponse(res);
        }
        if(moment().subtract(3,'h').diff(moment(paymentDB.date),'h') > 24 || paymentBody.status === 'rejected'){
            await Payment.deleteOne({preferenceID: paymentBody.preferenceID})
        }
        else{
            let changes = {
                mercadoPagoPaymentID: paymentBody.mercadoPagoPaymentID,
                date: moment().subtract(3,'h'),
                state: 'APPROVED',
            };
            newPayment = await Payment.findOneAndUpdate({preferenceID: paymentBody.preferenceID},changes,{new:true});
            let appointmentDB = await Appointment.findById(paymentDB.appointment);
            if(!appointmentDB){
                return canceledAppointmentResponse(res);
            }
            appointmentDB.totalPaid = appointmentDB.totalPaid + paymentDB.amountPayment;
            appointmentDB.payments.push(newPayment._id)
            await Appointment.findByIdAndUpdate(appointmentDB._id,appointmentDB)
            res.json({
                ok:true,
                msg:'Updated MercadoPago Payment',
            })
        }
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
paymentCtrl.updateSportCenterMercadoPagoPayment = async (req = request , res = response) => {
    const paymentID = req.params.paymentID
    try {
        const paymentDB = await Payment.findById(paymentID);
        if(!paymentDB){
            return unknownPaymentResponse(res);
        }
        let changes = {
            state: 'APPROVED',
        };
        newPayment = await Payment.findByIdAndUpdate(paymentID,changes,{new:true});
        let appointmentDB = await Appointment.findById(paymentDB.appointment);
        if(!appointmentDB){
            return canceledAppointmentResponse(res);
        }
        appointmentDB.totalPaid = appointmentDB.totalPaid + paymentDB.amountPayment;
        appointmentDB.payments.push(newPayment._id)
        await Appointment.findByIdAndUpdate(appointmentDB._id,appointmentDB)
        res.json({
            ok:true,
            msg:'Updated MercadoPago Payment',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
paymentCtrl.getUserPayments = async (req = request , res = response) => {
    const userID = req.params.userID;
    page = parseInt(req.query.page);
    registerPerPage = parseInt(req.query.registerPerPage);
    try {
        [payments,total] = await Promise.all([Payment.find({},'date appointment amountPayment preferenceID type').populate('appointment')
                                                                            .populate({path:'appointment',populate:{path: 'field', populate:{path:'sportCenter'}}})
                                                                            .populate({path:'appointment.user',match:{'id': userID}})
                                                                            .sort({date: -1}).skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                    Payment.find({},'date appointment amountPayment').populate('appointment')
                                                                            .populate({path:'appointment',populate:{path: 'field', populate:{path:'sportCenter'}}})
                                                                            .populate({path:'appointment.user',match:{'role': 'USER'}})
                                                                            .sort({date: -1}).countDocuments()]);
        total = Math.ceil(total / registerPerPage);
        res.json({
            ok:true,
            msg:'User´s Payments found',
            param: {
                payments,
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
paymentCtrl.getSportCenterPayments = async (req = request , res = response) => {
    const sportCenterID = req.params.sportCenterID;
    page = parseInt(req.query.page);
    registerPerPage = parseInt(req.query.registerPerPage);
    try {
        [payments,total] = await Promise.all([Payment.find({}).populate({path:'appointment',populate:{path: 'field'}})
                                                                .populate({path:'appointment.field' ,match:{sportCenter: sportCenterID},populate:{path:'sportCenter'}})
                                                                .populate({path:'appointment.user'})
                                                                .sort({date: -1}).skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                    Payment.find({}).populate({path:'appointment',populate:{path: 'field'}})
                                                                .populate({path:'appointment.field.sportCenter' ,match:{sportCenter: sportCenterID}})
                                                                .populate({path:'appointment.user'})
                                                                .sort({date: -1}).countDocuments()]);
        total = Math.ceil(total / registerPerPage);
        res.json({
            ok:true,
            msg:'Sport Center´s Payments found',
            param: {
                payments,
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
paymentCtrl.deleteMercadoPagoPayment = async (req = request , res = response) => {
    const preferenceID = req.params.preferenceID
    try {
        const paymentDB = await Payment.findOne({preferenceID: preferenceID});
        if(!paymentDB){
            return unknownPaymentResponse(res);
        }
        await Payment.findOneAndRemove({preferenceID:preferenceID})
        res.json({
            ok:true,
            msg:'Deleted MercadoPago Payment',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
paymentCtrl.deleteSportCenterMercadoPagoPayment = async (req = request , res = response) => {
    const paymentID = req.params.paymentID
    try {
        const paymentDB = await Payment.findById(paymentID);
        if(!paymentDB){
            return unknownPaymentResponse(res);
        }
        await Payment.findByIdAndRemove(paymentID)
        res.json({
            ok:true,
            msg:'Deleted MercadoPago Payment',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
paymentCtrl.createSportCenterPayment = async (req = request , res = response) => {
    const sportCenterID = req.params.sportCenterID
    const paymentBody = req.body;
    try {
        const appointmentDB = await Appointment.findById(paymentBody.appointmentID).populate({ 
                                                                                                path: 'field',
                                                                                                model: 'Field',
                                                                                                populate: {
                                                                                                    path: 'sportCenter',
                                                                                                    model: 'SportCenter'
                                                                                                }})
        if(!appointmentDB){
        return canceledAppointmentResponse(res);
        }
        let mercadoPagoPayment = new Payment({
            description: paymentBody.description,
            amountPayment: paymentBody.amountPayment,
            date: moment().subtract(3,'h'),
            state: 'APPROVED',
            type: paymentBody.type,
            appointment: paymentBody.appointmentID,
            appointmentDate: moment(appointmentDB.date).add(3,'h'),
            appointmentField: appointmentDB.field.name,
            appointmentSportCenter: appointmentDB.field.sportCenter.name,
        })
        const newPayment = await mercadoPagoPayment.save();
        appointmentDB.totalPaid = appointmentDB.totalPaid + newPayment.amountPayment;
        appointmentDB.payments.push(newPayment._id)
        await Appointment.findByIdAndUpdate(appointmentDB._id,appointmentDB)
        res.json({
            ok:true,
            msg:'Created MercadoPago Payment',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
function unknownPaymentResponse(res){
    return res.status(404).json({
        ok:false,
        code: 20,
        msg:'Unknown Payment'
    })
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
function errorResponse(res){
    res.status(500).json({
        ok:false,
        code: 99,
        msg:'An unexpected error occurred'
    })
}
function canceledAppointmentResponse(res){
    res.status(404).json({
        ok:false,
        code: 21,
        msg:'The Appointment was canceled, plese contact the Sport Center to get the repayment'
    })
}
module.exports = paymentCtrl;