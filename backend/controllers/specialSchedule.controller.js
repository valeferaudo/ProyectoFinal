const SpecialSchedule = require ('../models/specialSchedule.model');
const SportCenter = require ('../models/sportCenter.model');
const { request, response} = require ('express');
const specialScheduleCtrl = {};

specialScheduleCtrl.getSpecialSchedules = async (req = request,res = response)=>{
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
        const user = await User.findById(userID)
        if (user.sporCenter !== sportCenterID) {
            return res.status(404).json({
                ok:false,
                msg:'This User doesn´t have the permissions to get this information'
            })
        }
        specialSchedules = await SpecialSchedule.find({sportCenter: sportCenterID})
        //ordenarlas por fechas 
        specialSchedules.sort((a, b) => new Date(a.date).getTime() > new Date(b.date).getTime())
        res.json({
            ok: true,
            msg:'Found Special Schedules',
            param: specialSchedules
        })
        
    } catch (error) {
        console.log(error);
        res.stat(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}

specialScheduleCtrl.createSpecialSchedule = async (req = request, res = response) =>{
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
        const user = await User.findById(userID)
        if (user.sportCenter !== sportCenterID) {
            return res.status(404).json({
                ok:false,
                msg:'This User doesn´t have the permissions to create Special Schedules to this Sport Center'
            })
        }
        const userRole = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if(userRole.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to create Special Schedules'
            })
        }
        specialSchedule = new SpecialSchedule({
            sportCenter: sportCenterID,
            date: req.body.date,
            sinceHour: req.body.sinceDate,
            untilHour: req.body.untilHour,
        })
        await specialSchedule.save()
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
specialScheduleCtrl.deleteSpecialSchedule = async (req = request, res = response) =>{
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
        const user = await User.findById(userID)
        if (user.sportCenter !== specialScheduleDB.sportCenter) {
            return res.status(404).json({
                ok:false,
                msg:'This User doesn´t have the permissions to update Special Schedules to this Sport Center'
            })
        }
        const userRole = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if(userRole.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to update Special Schedules'
            })
        }
        if(specialScheduleDB.deletedDate !== null){
            return res.status(404).json({
                ok:false,
                msg:'This Special Schedule is already blocked'
            })
        }
        specialScheduleDB.deletedDate = Date.now();
        await SpecialSchedule.findByIdAndUpdate(specialScheduleID,specialScheduleDB,{new:true})
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

module.exports = specialScheduleCtrl;