//Valida que sea usuario de tipo SUPER-ADMIN o SUPER-CENTER-ADMIN 
const User = require ('../models/user.model');

const validateSuperRoleOrSameUser = async (req, res, next) =>{
    const uid = req.uid;
    const userID = req.params.id;
    try {
        const userDB = await User.findById(uid);
        if ((userDB.role !== 'CENTER-SUPER-ADMIN' || userDB.role !== 'SUPER-ADMIN') && uid !== userID){
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
    validateSuperRoleOrSameUser
}