import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table-do-appointment',
  templateUrl: './table-do-appointment.component.html',
  styleUrls: ['./table-do-appointment.component.css']
})
export class TableDoAppointmentComponent implements OnInit {

  @Input() availableAppointments;
  @Input() searchON;
  @Input() fieldID;
  userLogged: User;
  appointment: any = {};


  
  @Input() field;

  constructor(private appointmentsService: AppointmentService,
              private userService: UserService,
              private router: Router,
              private loaderService: LoaderService,
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
    this.appointment = {
      date: appointmentDate,
      user: this.userService.user.uid,
      field: this.field.id,
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
      this.router.navigate(['/appointments']);
    }
    if (this.userLogged.role === 'CENTER-ADMIN' || this.userLogged.role === 'CENTER-SUPER-ADMIN'){
      this.router.navigate(['/admin/appointments']);
    }
  }

}
