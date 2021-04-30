//Valida que sea usuario sea el mismo.
const User = require ('../models/user.model');

const validateSameUser = async (req, res, next) =>{
    const uid = req.uid;
    const userID = req.params.id;
    try {
        if ( uid !== userID){
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
    validateSameUser
}