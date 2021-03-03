var nodemailer = require('nodemailer');
const User = require('../../models/user.model')

const sendAcceptService = async (newService) =>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sporturno@gmail.com',
          pass: 'losvagabun2'
        }
      });
    users = await User.find({},{email:1})
    for (let index = 0; index < users.length; index++) {
        const userRole = await UserRoleHistorial.findOne({user: users[index].id}).sort({'sinceDate' : -1}).limit(1);
        if (userRole.role !== 'CENTER-SUPER-ADMIN'){
            users.splice(i,1);
            index--;
        }
    }
    for (let index = 0; index < users.length; index++) {
        var mailOptions = {
              from: 'sporturno@gmail.com',
              to: users.email,
              subject: 'Aviso - Nuevo servicio disponible en la cartera',
              html: '<h1>NUEVO Service</h1><p>+newService.name+</p>'
            }
         await transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    }
}
module.exports= { sendAcceptService }