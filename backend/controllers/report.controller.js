const SportCenter = require('../models/sportCenter.model');
const Appointment = require('../models/appointment.model');
const Payment = require('../models/payment.model');
const { request, response} = require ('express');
const reportCtrl = {};
var moment = require('moment');
moment().format();

reportCtrl.generatePaymentReport = async (req = request , res = response) => {
    const sportCenterID = req.params.sportCenterID;
    const sinceDate = req.query.sinceDate === "null" || req.query.sinceDate === "undefined" ? null : req.query.sinceDate;
    const untilDate = req.query.untilDate === "null" || req.query.untilDate === "undefined" ? null : req.query.untilDate;
    console.log(sinceDate, untilDate)
    try {
        let query = {
            '$and': []
        };
        sportCenterID !== null ? query['$and'].push({appointmentSportCenter: sportCenterID}) : query;
        if(sinceDate !== null && untilDate !== null){
            query['$and'].push({$and: [ { date: { $gte: moment(sinceDate) } },
                                        { date: { $lte: moment(untilDate)}}]})
        }
        let payments = []
        payments = await Payment.find({})
        res.json({
            ok:true,
            msg:'Sport Center´s Payments found',
            param: {
                payments
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
module.exports = reportCtrl;