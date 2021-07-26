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
          from: 'sporturno@gmail.com',
          to: user.email,
          subject: 'Aviso - Baja de usuario',
          html: `Estimado Usuario, su cuenta ha sido bloqueada para publicar canchas en la plataforma. 
          Toda la información y canchas relacionadas a su centro deportivo permanecerá inactivo. 
          En caso de ser un error, comuníquese con soporte.
          Saludos`
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