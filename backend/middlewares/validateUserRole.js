//Valida que sea usuario de tipo USER
const User = require ('../models/user.model');

const validateUserRole = async (req, res, next) =>{
    const uid = req.uid
    try {
        const userDB = await User.findById(uid);
        if (userDB.role !== 'USER'){
            return res.status(403).json({
                ok:false,
                msg: 'This User doesn´t have the permissions'

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
    validateUserRole
}