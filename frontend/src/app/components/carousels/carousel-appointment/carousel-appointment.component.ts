import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { Appointment } from 'src/app/models/appointment.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

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

  constructor(private _config: NgbCarouselConfig,
              private sweetAlertService: SweetAlertService,
              private loaderService: LoaderService,
              private appointmentService: AppointmentService,
              private errorService: ErrorsService) { }

  ngOnInit(): void {
    this.setConfig();
  }
  setConfig(){
    this._config.interval =  5000;
    this._config.pauseOnHover = true;
  }
  cancelAppointment(appointment){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Cancelar el turno?',
      text: ``,
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
                                    text:'',
                                    icon: 'success',
                                  })
                                  this.getAppointments.emit();                                }
                              },(err)=>{
                                console.log(err);
                                this.loaderService.closeLineLoader();
                                this.errorService.showErrors(99,'nada');
                              })
      }
    });
  }
  goGPS(appointment){
    this.goGPSModal.emit(appointment)
  }
}
