const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

const cancelAppointmentSMS
 = async (appointment) =>{
    await client.messages.create({
        // to: `+54${appointment.owner.phone}`,
        to:'+543492659902',
        from: process.env.PHONE_NUMBER,
        body: 'Turno cancelado'
    })
    .then(message =>{
        console.log(message.sid)
    })
    .catch(err => {
        console.log(err)
    })
}
module.exports= { cancelAppointmentSMS }