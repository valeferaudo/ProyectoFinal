//Valida que sea usuario de tipo SUPER-ADMIN o SUPER-CENTER-ADMIN 
const User = require ('../models/user.model');

const validateSuperRole = async (req, res, next) =>{
    const uid = req.uid
    try {
        const userDB = await User.findById(uid);
        if (userDB.role !== 'CENTER-SUPER-ADMIN' && userDB.role !== 'SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                code: 1,
                msg: 'This User doesn´t have the permissions',
            })
        }
        next();
    } catch (error) {
        res.status(500).json({
            ok: false,
            code: 99,
            msg:'An unexpected error occurred'
        })
    }
}

module.exports = {
    validateSuperRole
}