import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { Appointment } from 'src/app/models/appointment.model';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

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
  cancelAppointment(appointment){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Cancelar el turno?',
      text: appointment.totalPaid > 0 ? '¡Existen pagos registrados!' : '',
      icon: 'question',
    }).then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.appointmentService.deleteAppointment(appointment.id)
                              .subscribe((resp: any) => {
                                if(resp.ok){
                                  this.loaderService.closeLineLoader();
                                  this.sweetAlertService.showSwalResponse({
                                    title: 'Turno cancelado',
                                    text: appointment.totalPaid > 0 ? '¡Comunicarse con el Centro Deportivo para el reembolso!' : '',
                                    icon: 'success',
                                  })
                                  this.getAppointments.emit();                                }
                              },(err)=>{
                                console.log(err);
                                this.loaderService.closeLineLoader();
                                this.errorService.showErrors(err.error.code,err.error.msg);
                              })
      }
    });
  }
  goGPS(appointment){
    this.goGPSModal.emit(appointment)
  }
  goPayment(appointment){
    if(this.userLogged.role === 'USER'){
      this.goPaymentModal.emit(appointment)
    }
    else{
      //abrir modal de pago usuario
    }
  }
}
