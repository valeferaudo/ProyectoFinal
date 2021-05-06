//VALIDA QUE SEA CENTER-SUPAR-ADMIN Y ESTE ASOCIADO AL CENTRO DEPORTIVO por parametro viene el sportCenterID
const User = require ('../../models/user.model');

const validateCSAandOwner = async (req, res, next) =>{
    const uid = req.uid;
    const sportCenterID = req.params.id;
    try {
        const userDB = await User.findById(uid);
        if (userDB.role !== 'CENTER-SUPER-ADMIN' || userDB.sportCenter.toString() !== sportCenterID){
            return res.status(403).json({
                ok:false,
                code: 1,
                msg: 'This User doesn´t have the permissions'
            })
        }
        next();
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            code: 99,
            msg:'An unexpected error occurred'
        })
    }
}

module.exports = {
    validateCSAandOwner
}