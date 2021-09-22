import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Appointment } from 'src/app/models/appointment.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { LoaderService } from 'src/app/services/loader.service';
import { PaymentService } from 'src/app/services/payment.service';

declare function initMercadoPago(key,preferenceID);

@Component({
  selector: 'app-approve-payment',
  templateUrl: './approve-payment.component.html',
  styleUrls: ['./approve-payment.component.css']
})
export class ApprovePaymentComponent implements OnInit {
  @Input() hiddenPaymentModal: boolean;
  @Input() appointment: Appointment;
  @Input() type: 'new' | 'old';
  @Output() closeModal = new EventEmitter<string>();
  preferenceID;
  paymentBody;
  toPaid = null;
  typePayment : 'Seña' | 'Total' | 'Restante';
  constructor(private loaderService: LoaderService,
              private paymentService: PaymentService,
              private appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.setMode();
  }
  closedModal(){
    if(this.preferenceID !== undefined){
      this.paymentService.deletePayment(this.preferenceID)
                .subscribe()
    }
    this.closeModal.emit()
  }
  confirmPayment(){
    this.initPayment();
  }
  initPayment(){
    this.loaderService.openLineLoader();
    this.fillBody();
    this.paymentService.initPayment(this.paymentBody)
      .subscribe((resp:any)=>{
        this.preferenceID = resp.id;
        this.generetePayment();
        setTimeout(() => {
          initMercadoPago(this.appointment.sportCenter.credentials.publicKey,this.preferenceID);
          this.loaderService.closeLineLoader();
        }, 1);
      })
  }
  setMode(){
    if(this.type === 'new'){
      if(this.appointment.sportCenter.minimunAmount === null){
        this.toPaid = this.appointment.totalAmount;
        this.typePayment = 'Total';
      }
    }
    else if(this.type === 'old'){
      if(this.appointment.totalPaid > 0){
        this.toPaid = this.appointment.totalAmount - this.appointment.totalPaid;
        console.log(this.toPaid)
        this.typePayment = 'Restante';
      }
      else{
        this.toPaid = this.appointment.totalAmount;
        this.typePayment = 'Total';
      }
    }
  }
  fillBody(){
    this.paymentBody = {
      description: `Turno en ${this.appointment.sportCenter.name}, abona ${this.typePayment} = ${this.toPaid}$.`,
      price: this.toPaid,
      quantity: 1,
      sportCenterID: this.appointment.sportCenter._id
    }
  }
  generetePayment(){
    this.paymentService.createMercadoPagoPayment(this.setMercadoPagoObject())
                .subscribe((resp: any) => {
                  console.log(resp)
                })
  }
  setMercadoPagoObject(){
    return {
      preferenceID: this.preferenceID,
      amountPayment: this.toPaid,
      appointmentID: this.appointment.id
    }
  }
  setToPaid(paymentType: 'safe' | 'total'){
    if(paymentType === 'safe'){
      this.toPaid = (this.appointment.totalAmount * this.appointment.sportCenter.minimunAmount)/100;
      this.typePayment = 'Seña';
    }
    else if(paymentType === 'total'){
      this.toPaid = this.appointment.totalAmount;
      this.typePayment = 'Total';
    }
  }
}
