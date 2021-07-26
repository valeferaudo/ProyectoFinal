const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
var moment = require('moment');
moment().format();

const cancelAppointmentSMS
 = async (appointment) =>{
    await client.messages.create({
        // to: `+54${appointment.owner.phone}`,
        to:'+543492659902',
        from: process.env.PHONE_NUMBER,
        body: `Turno cancelado. Fecha: ${getDate(appointment.date)}. 
            Centro Deportivo: ${appointment.field.sportCenter.name}. 
            Cancha: ${appointment.field.name}. 
            Usuario: ${appointment.user.name}.
            Total pagado: ${appointment.totalPaid}.
            ${appointment.totalPaid > 0 ? 'Comuníquese para obtener el reembolso.' : ''}`
    })
    .then(message =>{
        console.log(message.sid)
    })
    .catch(err => {
        console.log(err)
    })
}
function getDate(appointmentDate){
    let date = moment(appointmentDate).add(3,'h').format("YYYY-MM-DDTHH:mm")
    return date;
}
module.exports= { cancelAppointmentSMS }