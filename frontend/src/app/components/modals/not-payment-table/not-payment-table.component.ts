import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Appointment } from 'src/app/models/appointment.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-not-payment-table',
  templateUrl: './not-payment-table.component.html',
  styleUrls: ['./not-payment-table.component.css']
})
export class NotPaymentTableComponent implements OnInit {

  totalPages = null;
  page = 1;
  appointments = [];
  sportCenterID;
  @Input() hiddenModal: boolean;
  @Output() closeModal = new EventEmitter<string>();
  @Output() openPaymentModal = new EventEmitter<Appointment>();


  constructor(private userService: UserService,
              private appointmentService: AppointmentService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService,
              private loaderService: LoaderService) { }

  ngOnInit(): void {
    this.sportCenterID = this.userService.user.sportCenter.id
    this.getAppointments();
  }
  closedModal(){
    this.closeModal.emit()
  }
  paginate(page){
    this.page = page;
    this.getAppointments();
  }
  getAppointments(){
    this.loaderService.openLineLoader();
    this.appointmentService.getNotPayAppointments(this.sportCenterID, this.page)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.appointments = resp.param.appointments;
                                          this.page = resp.param.paginator.page;
                                          this.totalPages = resp.param.paginator.totalPages;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showErrors(err.error.code,err.error.msg)
                                        this.loaderService.closeLineLoader();
                                      });
  }
  async deleteAppointment(appointment: Appointment){
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
      }
      this.closedModal();
    })
  }
  addPayment(appointment){
    this.openPaymentModal.emit(appointment)
  }
}
