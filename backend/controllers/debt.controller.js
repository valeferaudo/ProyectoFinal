const Debt = require('../models/debt.model');
const Payment = require('../models/payment.model');
var moment = require('moment');
moment().format();
const cron = require('node-cron');
const { request , response } = require('express');
const debtCtrl = {};


debtCtrl.centerApprove = async (req = request, res = response) => {
    const debtID = req.params.id;
    const description = req.body.description;
    try {
        const debtDB = await Debt.findById(debtID)
        if(!debtDB){
            return unknownIDResponse(res);
        }
        await Debt.findByIdAndUpdate(debtID,{centerApprove: true,description:description, closeDate: debtDB.user === null ? moment().subtract(3,'h') : null});
        res.json({
            ok: true,
            msg:'Debt Updated',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
debtCtrl.userApprove = async (req = request, res = response) => {
    const debtID = req.params.id;
    try {
        const debtDB = await Debt.findById(debtID)
        if(!debtDB){
            return unknownIDResponse(res);
        }
        await Debt.findByIdAndUpdate(debtID,{userApprove: true, closeDate: moment().subtract(3,'h')});
        res.json({
            ok: true,
            msg:'Debt Updated',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
debtCtrl.getCenterDebts = async (req = request, res = response) => {
    const sportCenterID = req.params.id;
    const state = req.query.state === undefined ? '' : req.query.state;
    const payment = req.query.payment === undefined ? '' : req.query.payment;
    page = parseInt(req.query.page);
    registerPerPage = parseInt(req.query.registerPerPage);
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
            [debts,total] = await Promise.all([Debt.find(query).sort({createdDate: -1}).skip(registerPerPage*(page -1))
                                                                .limit(registerPerPage).populate('field').populate('sportCenter'),
                                                Debt.find(query).countDocuments()
                                            ])
        }else{
                [debts,total] = await Promise.all([Debt.find().sort({createdDate: -1}).skip(registerPerPage*(page -1))
                                                                .limit(registerPerPage).populate('field').populate('sportCenter'),
                                                    Debt.find().countDocuments()
                                                ])
        }
        total = Math.ceil(total / registerPerPage);
        res.json({
            ok: true,
            msg:'Found SportCenter Debts',
            param: {
                debts: debts,
                selectedFilters: selectedFilters,
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
debtCtrl.getUserDebts = async (req = request, res = response) => {
    const userID = req.params.id;
    const state = req.query.state === undefined ? '' : req.query.state;
    const payment = req.query.payment === undefined ? '' : req.query.payment;
    page = parseInt(req.query.page);
    registerPerPage = parseInt(req.query.registerPerPage);
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
        query['$and'].push({user: userID});
        if (state !== ''){
            booleanState === false ? query['$and'].push({closeDate: {$ne: null}}) : query['$and'].push({closeDate: null});
            selectedFilters.push(state);
        }
        if (payment !== ''){
            paymentState === false ? query['$and'].push({centerApprove: false}) : query['$and'].push({centerApprove: true});
            selectedFilters.push(payment);
        }
        if(query['$and'].length > 0){
            [debts,total] = await Promise.all([Debt.find(query).sort({createdDate: -1}).skip(registerPerPage*(page -1))
                                                               .limit(registerPerPage).populate('field').populate('sportCenter'),
                                                Debt.find(query).countDocuments()
                                            ])
        }else{
                [debts,total] = await Promise.all([Debt.find().sort({createdDate: -1}).skip(registerPerPage*(page -1))
                                                                .limit(registerPerPage).populate('field').populate('sportCenter'),
                                                    Debt.find().countDocuments()
                                                ])
        }
        total = Math.ceil(total / registerPerPage);
        res.json({
            ok: true,
            msg:'Found User Debts',
            param: {
                debts: debts,
                selectedFilters: selectedFilters,
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
debtCtrl.getDebtPayment = async (req = request, res = response) => {
    const paymentID = req.params.id;
    try {
        const paymentDB = await Payment.findById(paymentID)
        if(!paymentDB){
            return unknownIDResponse(res);
        }
        debt = await Debt.find({payments:{ $in: [paymentID]}}).populate('payments')
        res.json({
            ok: true,
            msg:'Debt Found',
            param:{
                debt: debt.length === 0 ? null : debt[0]
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
function unknownIDResponse(res){
    return res.status(404).json({
        ok:false,
        code: 3,
        msg:'Unknown ID. Please insert a correct ID'
    })
}
// cron.schedule('*  * * *', () => {
//     updateAutomatic();
// })
updateAutomatic = async () => {
    try {
        const time = moment().subtract(30,'d');
        const debtsDB = await Debt.updateMany({closeDate: null, createdDate: {$lt: time }},{$set: { closeDate: moment().subtract(3,'h') } })
    } catch (error) {
          console.log(error)
      }
}
module.exports = debtCtrl;
