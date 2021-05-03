const User = require ('../models/user.model');
const UserRoleHistorial = require ('../models/userRoleHistorial.model');
const bcrypt = require('bcryptjs');


const fillSuperAdmin = async () => {
  try {
        const existsSuperAdmin = await User.findOne({email:'admin@admin.com'})
        if(existsSuperAdmin){
        return;
        }
        const salt = bcrypt.genSaltSync();
        const passwordHash = bcrypt.hashSync('123456789',salt);
        const superAdmin = new User({
            name: 'Admin',
            lastName: 'Admin',
            phone: '5555555555',
            address: 'No Address',
            email: 'admin@admin.com',
            password: passwordHash,
            state: true,
            role:'SUPER-ADMIN'
        });
        await superAdmin.save();
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    fillSuperAdmin
}