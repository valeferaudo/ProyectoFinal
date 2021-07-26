var nodemailer = require('nodemailer');

const sendNewPasswordEmail = async (email,newPassword) =>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sporturno@gmail.com',
          pass: 'losvagabun2'
        }
      });
      var mailOptions = {
          from: 'sporturno@gmail.com',
          to: email,
          subject: 'Recuperar contraseña',
          html: `Estimado usuario, solicitó el recupero de la contraseña. Su nueva contrasela es: ${newPassword}. Desde el equipo de SporTurno le recomendamos cambiar la contraseña generada por una de su preferencia.`
        }
    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
module.exports= { sendNewPasswordEmail }