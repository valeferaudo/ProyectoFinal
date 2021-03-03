var nodemailer = require('nodemailer');

const sendAcceptUser = async (user) =>{
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
          subject: 'Aviso - Solicitud de registro aceptada',
          html: '<h1>BIENVENIDO</h1><p>+user.email+</p>'
        }
    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
module.exports= { sendAcceptUser }