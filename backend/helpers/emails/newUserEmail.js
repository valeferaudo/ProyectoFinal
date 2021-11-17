var nodemailer = require('nodemailer');

const sendNewUserEmail = async (newUser) =>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sporturno.new.user@gmail.com',
          pass: 'losvagabun2'
        }
      });
      var mailOptions = {
          from: 'sporturno.new.user@gmail.com',
          to: 'sporturno@gmail.com',
          subject: 'Aviso - Solicitud de registro',
          html: `<h1>NUEVO USUARIO</h1>
                  <p>Bienvenido/a ${newUser.name} a Sporturno.</p>`
        }
    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
module.exports= { sendNewUserEmail }