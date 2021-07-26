import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Appointment } from 'src/app/models/appointment.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { PaymentService } from 'src/app/services/payment.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.component.html',
  styleUrls: ['./add-payment.component.css']
})
export class AddPaymentComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Input() appointment: Appointment;
  @Output() closeModal = new EventEmitter<boolean>();
  toPaid = null;
  description = '';
  type: 'CASH' | 'OTHER' = null;
  amount: 'safe' | 'total';
  constructor(private loaderService:LoaderService,
              private sweetAlertService: SweetAlertService,
              private paymentService: PaymentService,
              private errorService: ErrorsService) { }

  ngOnInit(): void {
    this.setMode();
  }
  closedModal(){
    this.closeModal.emit(false)
  }
  setMode(){
    if(this.appointment.totalPaid > 0){
      this.toPaid = this.appointment.totalAmount - this.appointment.totalPaid
    }
  }
  setToPaid(paymentType: 'safe' | 'total'){
    this.amount = paymentType
    if(paymentType === 'safe'){
      this.toPaid = (this.appointment.totalAmount * this.appointment.field.sportCenter.minimunAmount)/100;
    }
    else if(paymentType === 'total'){
      this.toPaid = this.appointment.totalAmount;
    }
  }
  setType(type: 'CASH'| 'OTHER' ){
    this.type = type;
  }
  addPayment(){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Agregar pago?',
      text:'',
      icon: 'question'
      })
      .then((result) => {
        if (result.value) {
          this.loaderService.openLineLoader();
          this.paymentService.createSportCenterPayment(this.appointment.field.sportCenter._id,this.fillObject())
                          .subscribe((resp: any)=>{
                            this.loaderService.closeLineLoader();
                            if(resp.ok){
                              this.sweetAlertService.showSwalResponse({
                                title:'Pago agregado',
                                text:'',
                                icon: 'success'
                              })
                              this.closeModal.emit(true);
                            }
                          },(err)=>{
                            this.loaderService.closeLineLoader();
                            this.errorService.showErrors(err.error.code,err.error.msg);
                            console.log(err)
                          })
        }
      })
  }
  fillObject(){
    return {
      description: this.description,
      amountPayment: this.toPaid,
      type: this.type,
      appointmentID: this.appointment.id,
    }
  }
}
