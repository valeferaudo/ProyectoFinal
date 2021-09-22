import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { Appointment } from 'src/app/models/appointment.model';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carousel-appointment',
  templateUrl: './carousel-appointment.component.html',
  styleUrls: ['./carousel-appointment.component.css']
})
export class CarouselAppointmentComponent implements OnInit {
  @Input() appointments: any[] = [];
  @Input() type: 'Por comenzar' |  'Reservados';
  @Output() getAppointments = new EventEmitter<string>();
  @Output() goGPSModal = new EventEmitter<Appointment>();
  @Output() goPaymentModal = new EventEmitter<Appointment>();
  @Output() goPaymentCenterModal = new EventEmitter<Appointment>();

  userLogged: User;
  constructor(private _config: NgbCarouselConfig,
              private sweetAlertService: SweetAlertService,
              private loaderService: LoaderService,
              private userService: UserService,
              private appointmentService: AppointmentService,
              private errorService: ErrorsService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.setConfig();
  }
  setConfig(){
    this._config.interval =  5000;
    this._config.pauseOnHover = true;
  }
  async cancelAppointment(appointment){
    if(this.userLogged.role !== 'USER'){
      this.cancelSportCenter(appointment)
    }else{
      this.cancelUser(appointment)
    }
  }
  async cancelSportCenter(appointment){
    if(appointment.totalPaid === 0){
      this.sweetAlertService.showSwalConfirmation({
        title: '¿Cancelar el turno?',
        text: '',
        icon: 'question',
      }).then((result) => {
        if (result.value) {
          this.cancel(appointment,null)
        }
      });
    }else{
      let text = 'Se generará una deuda';
      let description;
      await Swal.fire({
      title: '¿Cancelar turno?',
      customClass: {
        validationMessage: 'my-validation-message'
      },
      html:
        `<p>${text}</p>`+
        '<textarea  id="swal-cancel-description" placeholder="Motivo" cols="30" class="swal2-input" rows="50"></textarea>',
      focusConfirm: false,
      allowOutsideClick: false,
      showCancelButton: true,
      preConfirm: (value) => {
        console.log(value)
        return [
         description = (document.getElementById('swal-cancel-description') as HTMLInputElement).value
        ];
      }
      }).then((result) => {
        if (result.value) {
          this.cancel(appointment,description)
        }
      });
    }
  }
  async cancelUser(appointment){
    if(appointment.totalPaid === 0){
      this.sweetAlertService.showSwalConfirmation({
        title: '¿Cancelar el turno?',
        text: '',
        icon: 'question',
      }).then((result) => {
        if (result.value) {
          this.cancel(appointment,null)
        }
      });
    }else{
      let text = '';
      let strong = '';
      if (this.breakPolicy(appointment)){
        text = 'Por política de cancelación del Centro Deportivo usted '
        strong = 'recibirá un reembolso.'
      }else{
        text = 'Por política de cancelación del Centro Deportivo usted '
        strong = 'perderá su dinero.'
      }
      let description;
      await Swal.fire({
      title: '¿Cancelar turno?',
      customClass: {
        validationMessage: 'my-validation-message'
      },
      html:
      `<span>${text}</span>`+`<strong>${strong}</strong>`+
      '<textarea  id="swal-cancel-description" placeholder="Motivo" cols="30" class="swal2-input" rows="50"></textarea>',
      focusConfirm: false,
      allowOutsideClick: false,
      showCancelButton: true,
      preConfirm: (value) => {
        return [
         description = (document.getElementById('swal-cancel-description') as HTMLInputElement).value
        ];
      }
      }).then((result) => {
        if (result.value) {
          this.cancel(appointment,description)
        }
      });
    }
  }
  cancel(appointment, description){
    this.loaderService.openLineLoader();
          this.appointmentService.deleteAppointment(appointment.id,description)
                                .subscribe((resp: any) => {
                                  if(resp.ok){
                                    this.loaderService.closeLineLoader();
                                    this.sendResponse(resp.param.userPhone);
                                  }
                                },(err)=>{
                                  console.log(err);
                                  this.loaderService.closeLineLoader();
                                  this.errorService.showErrors(err.error.code,err.error.msg);
                                })
  }
  sendResponse(phone){
    if(this.userLogged.role === 'CENTER-ADMIN' || this.userLogged.role === 'CENTER-SUPER-ADMIN'){
      this.sweetAlertService.showSwalResponseConfirm({
        title: 'Notifique al usuario',
        text: `Teléfono: ${phone}`,
        icon: 'info',
      }).then((result) => {
        if (result.value) {
          this.sweetAlertService.showSwalResponse({
            title: 'Turno cancelado',
            text:'',
            icon: 'success',
          })
          this.getAppointments.emit();
        }
      })
    }
    else if(this.userLogged.role === 'USER'){
      this.sweetAlertService.showSwalResponse({
        title: 'Turno cancelado',
        text:'',
        icon: 'success',
      })
      this.getAppointments.emit();
    }
  }
  breakPolicy(appointment){
    const diffInMs = Date.parse(appointment.date) - Date.parse(new Date().toISOString());
    const diffInHours = (diffInMs / 1000 / 60 / 60) +   3 ;
    console.log(diffInHours, appointment.sportCenter.cancelationHour )
    if(diffInHours >= appointment.sportCenter.cancelationHour){
      //no rompe politica
      return true;
    }else{
      return false
    }
  }
  goGPS(appointment){
    this.goGPSModal.emit(appointment)
  }
  goPayment(appointment){
    if(this.userLogged.role === 'USER'){
      this.goPaymentModal.emit(appointment);
    }
    else{
      this.goPaymentCenterModal.emit(appointment);
    }
  }
}
