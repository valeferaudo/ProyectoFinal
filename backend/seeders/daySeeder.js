const Day = require ('../models/day.model');


const fillDayCollection = async () => {
  try {
    const exitsDays = await Day.findOne()
    if(exitsDays){
      return;
    }
            const day1 = new Day({
                idDia: 1,
                name: 'Lunes'
              });
              await day1.save()
              const day2 = new Day({
                  idDia: 2,
                  name: 'Martes'
                });
                await day2.save()
                const day3 = new Day({
                idDia: 3,
                name: 'Miércoles'
              });
              await day3.save()
              const day4 = new Day({
                  idDia: 4,
                  name: 'Jueves'
                });
                await day4.save()
                const day5 = new Day({
                  idDia: 5,
                  name: 'Viernes'
                });
                await day5.save()
              const day6 = new Day({
                  idDia: 6,
                  name: 'Sábado'
              });
              await day6.save()
              const day7 = new Day({
                idDia: 7,
                name: 'Domingo'
              });
              await day7.save()
              const days = await Day.find()
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    fillDayCollection
}