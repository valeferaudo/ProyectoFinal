const {request, response} = require('express');


const sportCenterDayCtrl ={};

sportCenterDayCtrl.getSportCenterDays = async (req = request,res=response)=>{
    try {
        
    } catch (error) {
        console.log(error);
        res.stat(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
    
}

module.exports= sportCenterDayCtrl;