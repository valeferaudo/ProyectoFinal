import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import { WeatherService } from 'src/app/services/weather.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table-do-appointment',
  templateUrl: './table-do-appointment.component.html',
  styleUrls: ['./table-do-appointment.component.css']
})
export class TableDoAppointmentComponent implements OnInit {

  @Input() availableAppointments;
  @Input() page;
  @Input() registerPerPage;
  @Input() searchON;
  @Input() fieldID;
  userLogged: User;
  appointment: any = {};

  //Weather
  warm: boolean = false;
  cold: boolean = false;
  stormy: boolean = false;
  wrongWeatherArray = [200,201,202,210,211,212,221,230,231,232,300,301,302,310,311,312,313,314,321,500,501,502,503,504,511,520,521,522,531];

  constructor(private appointmentsService: AppointmentService,
              private userService: UserService,
              private router: Router,
              private fieldService: FieldService,
              private loaderService: LoaderService,
              private weatherService: WeatherService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {}

  ngOnInit(): void {
    this.userLogged = this.userService.user;
  }
  async reserveAppointment(appointmentDate: Date){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Reservar?',
      text: ``,
      icon: 'question',
    }).then((result) => {
      if (result.value) {
        if (this.userLogged.role === 'USER'){
          this.createUserAppointment(appointmentDate);
        }
        if (this.userLogged.role === 'CENTER-ADMIN' || this.userLogged.role === 'CENTER-SUPER-ADMIN'){
          this.createCenterAdminAppointment(appointmentDate);
        }
      }
    });
  }
  createUserAppointment(appointmentDate){
    this.loaderService.openLineLoader()
    this.fieldService.checkRoofed(this.fieldID)
                    .subscribe((resp:any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        //DESCOMENTAR ESTOY BORRAR EL FILLOBJECT DE AFUERA DEL IF
                        // if(!resp.param.roofed){
                        //   this.checkDay(appointmentDate);
                        // }
                        // else{
                        //   this.fillObject(appointmentDate)
                        // }
                        this.fillObject(appointmentDate)
                      }
                    }, (err) => {
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors('mejorar',99)
                    });
  }
  checkDay(appointmentDate){
    const appointmentDay = new Date(appointmentDate).getDate();
    const appointmentHour = new Date(appointmentDate).getHours();
    const today = new Date().getDate();
    const todayHour = new Date().getHours();
    if(appointmentDay === today){
      if(appointmentHour - todayHour <= 3){
        this.getCurrentWeather(appointmentDate);
      }
      else if (appointmentHour - todayHour > 3){
        this.getPerHourWeather(appointmentDate, appointmentHour - todayHour);
      }
    }
    else if(appointmentDay > today){
      this.getForecastWeather(appointmentDate, appointmentDay - today)
    }
  }
  getCurrentWeather(appointmentDate){
    this.loaderService.openFullScreenLoader();
    this.weatherService.getCurrentWeather()
            .subscribe((resp: any)=>{
              this.loaderService.closeLineLoader();
              console.log(resp)
              if(resp.main.temp > 30){
                this.warm = true;
              }
              else if(resp.main.temp < 5){
                this.cold = true;
              }
              if(this.wrongWeatherArray.includes(resp.weather.id)){
                this.stormy = true;
              }
              this.confirmWeather(appointmentDate);
            },(err) =>{
              console.log(err)
              this.errorService.showServerError()
              this.loaderService.closeLineLoader();
            });
  }
  getPerHourWeather(appointmentDate,hourDiff){
    this.loaderService.openLineLoader();
    this.weatherService.getPerHour()
                .subscribe((resp: any)=>{
                  this.loaderService.closeLineLoader();
                  let i = this.getHourIndex(hourDiff);
                  console.log(resp.list[i])
                  if(resp.list[i].main.temp > 30){
                    this.warm = true;
                  }
                  else if(resp.list[i].main.temp < 5){
                    this.cold = true;
                  }
                  if(this.wrongWeatherArray.includes(resp.list[i].weather[0].id)){
                    this.stormy = true;
                  }
                  this.confirmWeather(appointmentDate);
                },(err) =>{
                  console.log(err)
                  this.errorService.showServerError()
                  this.loaderService.closeLineLoader();
                });
  }
  getForecastWeather(appointmentDate,dayDiff){
    this.loaderService.openLineLoader();
    this.weatherService.getForecast()
              .subscribe((resp: any)=>{
                this.loaderService.closeLineLoader();
                let i = dayDiff - 1;
                console.log(resp.list[i])
                if((resp.list[i].temp.min + resp.list[i].temp.max)/2 > 30){
                  this.warm = true;
                }
                else if((resp.list[i].temp.min + resp.list[i].temp.max)/2 < 5){
                  this.cold = true;
                }
                if(this.wrongWeatherArray.includes(resp.list[i].weather[0].id)){
                  this.stormy = true;
                }
                this.confirmWeather(appointmentDate);
              },(err) =>{
                console.log(err)
                this.errorService.showServerError()
                this.loaderService.closeLineLoader();
              });
  }
  getHourIndex(hourDiff){
    let x = 0;
    if(hourDiff >= 3 && hourDiff < 6){
      x = 0;
    }
    else if(hourDiff >= 6 && hourDiff < 9){
      x = 1;
    }
    else if(hourDiff >= 9 && hourDiff < 12){
      x = 2;
    }
    else if(hourDiff >= 12 && hourDiff ){
      x = 3;
    }
    return x;
  }
  confirmWeather(appointmentDate){
    if(this.warm || this.cold || this.stormy){
      let text;
      this.warm && !this.cold && !this.stormy ? text = 'Altas temperaturas.' : text = '';
      this.warm && !this.cold &&  this.stormy ? text = 'Altas temperaturas y lluvia y/o tormenta eléctrica.' : text = '';
      !this.warm &&  this.cold && !this.stormy ? text = 'Bajas temperaturas.' : text = '';
      !this.warm && !this.cold && this.stormy ? text = 'Bajas temperaturas y lluvia y/o tormenta eléctrica.' : text = '';
      !this.warm && !this.cold && this.stormy ? text = 'Lluvia y/o tormenta eléctrica.' : text = '';
      this.sweetAlertService.showSwalConfirmation({
        title: '¿Confirmar de todos modos?',
        text: `Pronóstico del clima: ${text}`,
        icon: 'question',
      }).then((result) => {
        if (result.value) {
         this.fillObject(appointmentDate);
        }
      });
    }
    else{
      this.fillObject(appointmentDate);
    }
  }
  fillObject(appointmentDate){
    this.appointment = {
      date: appointmentDate,
      user: this.userService.user.uid,
      field: this.fieldID,
      owner: {
        name: this.userService.user.name,
        oid: this.userService.user.uid,
        phone: this.userService.user.phone
      }
    };
    this.sendAppointment();
  }
  async createCenterAdminAppointment(appointmentDate){
    let name;
    let oid;
    let phone;
    await Swal.fire({
      title: 'Datos de la reserva',
      customClass: {
        validationMessage: 'my-validation-message'
      },
      html:
        '<label><strong>Nombre</strong></label>'+
        '<input id="swal-name" placeholder="Nombre" class="swal2-input" required>' +
        '<label><strong>Documento</strong></label>'+ '<br>'+
        '<input style="width:100%" type="number" id="swal-oid" placeholder="DNI" class="swal2-input" required>' + '<br>'+
        '<label><strong>Teléfono</strong></label>'+ '<br>'+
        '<input type="number" id="swal-phone" placeholder="Teléfono" class="swal2-input" required>',
      focusConfirm: false,
      allowOutsideClick: false,
      showCancelButton: true,
      preConfirm: (value) => {
        if ((document.getElementById('swal-name') as HTMLInputElement).value === ''|| 
            (document.getElementById('swal-oid') as HTMLInputElement).value === '' ||
            (document.getElementById('swal-phone') as HTMLInputElement).value === '') {
          Swal.showValidationMessage(
            '<i class="fa fa-info-circle"></i> Complete todos los datos'
          )
        }
        return [
         name = (document.getElementById('swal-name') as HTMLInputElement).value,
         oid =  (document.getElementById('swal-oid') as HTMLInputElement).value,
         phone =  (document.getElementById('swal-phone') as HTMLInputElement).value
        ];
      }
    });
    if(name !== undefined){
      this.appointment = {
        date: appointmentDate,
        user: this.userLogged.uid,
        field: this.fieldID,
        owner: {
          name,
          oid,
          phone
        }
      };
      await this.sendAppointment();
    }
  }
  sendAppointment(){
    this.loaderService.openLineLoader();
    this.appointmentsService.createAppointments(this.appointment)
                    .subscribe((resp: any) => {
                      this.loaderService.closeLineLoader();
                      if (resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Turno Reservado',
                          text: `¡Que te diviertas!`,
                          icon: 'success',
                        })
                        this.goAppointments();
                      }
                    }, (err) => {
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors('mejorar',99)
                      // Swal.fire('Error al reservar', 'Ingrese correctamente los datos solicitados', 'error');
                    });
  }
  goAppointments(){
    if (this.userLogged.role === 'USER'){
      this.router.navigate(['/user/appointments']);
    }
    if (this.userLogged.role === 'CENTER-ADMIN' || this.userLogged.role === 'CENTER-SUPER-ADMIN'){
      this.router.navigate(['/admin/appointments']);
    }
  }
}
