var nodemailer = require('nodemailer');

const sendBlockUser = async (user) =>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sporturno@gmail.com',
          pass: 'losvagabun2'
        }
      });
      var mailOptions = {
          from: 'sporturno.new.user@gmail.com',
          to: user.email,
          subject: 'Aviso - Baja de usuario',
          html: '<h1>Usuario bloqueado</h1><p>+user.email+</p>'
        }
    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
module.exports= { sendBlockUser }