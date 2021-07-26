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
          from: 'sporturno@gmail.com',
          to: user.email,
          subject: 'Aviso - Solicitud de registro aceptada',
          html: `Estimado Usuario, su cuenta ha sido aceptada para publicar canchas en la plataforma. 
          Al ingresar por primera vez se le solicitará la creación del centro deportivo. 
          ¡Bienvenido!`
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