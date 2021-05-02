//Valida que el usuario que viene en la req sea valido
const User = require ('../models/user.model');

const validateUserID = async (req, res, next) =>{
    const uid = req.uid
    try {
        const userDB = await User.findById(uid);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                code: 2,
                msg:'Unknown ID'
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
    validateUserID
}