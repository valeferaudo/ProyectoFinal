var nodemailer = require('nodemailer');

const cancelAppointmentUserEmail
 = async (user, appointment) =>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sporturno@gmail.com',
          pass: 'losvagabun2'
        }
      });
      var mailOptions = {
          from: 'sporturno@gmail.com',
          to: user.email,
          subject: 'Aviso - Turno Cancelado',
          html: 'El usuario canceló el turno'
        }
    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
module.exports= { cancelAppointmentUserEmail }