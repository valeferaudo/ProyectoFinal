//Valida que el usuario que viene en la req sea valido
const User = require ('../models/user.model');

const validateUserID = async (req, res, next) =>{
    const uid = req.uid
    try {
        const userDB = await User.findById(uid);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        next();
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg:'An unexpected error occurred'
        })
    }
}

module.exports = {
    validateUserID
}