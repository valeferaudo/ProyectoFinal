var nodemailer = require('nodemailer');

const sendNewServiceEmail = async (newService) =>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sporturno@gmail.com',
          pass: 'losvagabun2'
        }
      });
      var mailOptions = {
          from: 'sporturno@gmail.com',
          to: 'sporturno@gmail.com',
          subject: 'Solicitud - Solicitud de nuevo servicio',
          html: '<h1>Crear nuevo servicio</h1><p>+newService.email+</p>'
        }
    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
module.exports= { sendNewServiceEmail }