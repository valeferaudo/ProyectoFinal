import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Combo } from 'src/app/interfaces/combo.interface';
import { PaymentFilter } from 'src/app/interfaces/filters/paymentFilter.interface';
import { User } from 'src/app/models/user.model';
import { DebtService } from 'src/app/services/debt.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PaymentService } from 'src/app/services/payment.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-payments',
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.css']
})
export class AdminPaymentsComponent implements OnInit {
  userLogged : User;
  payments : [] = [];
  totalPages = null;
  page = 1;
  filterON: boolean = false;
  hiddenDebtModal = false;
  debtSelected: any;
  filters: PaymentFilter = {
    state: null,
    type: null,
    sincePaymentDate: null,
    untilPaymentDate: null,
    sinceAppointmentDate: null,
    untilAppointmentDate: null,
    fieldID: null
  }
  fieldsCombo: Combo[] = [];
  fieldSelected: Combo = null;
  datePaymentRangeForm = new FormGroup({
    sinceDateSelected :new FormControl(''),
    untilDateSelected : new FormControl('')
  })
  sincePaymentDateSelected: any = null;
  untilPaymentDateSelected: any = null;
  dateAppointmentRangeForm = new FormGroup({
    sinceDateSelected :new FormControl(''),
    untilDateSelected : new FormControl('')
  })
  sinceAppointmentDateSelected: any = null;
  untilAppointmentDateSelected: any = null;
  states = ['Aprobado','Pendiente'];
  stateSelected: 'Aprobado' | 'Pendiente' | null = null;
  types = ['Efectivo', 'Mercado Pago', 'Otro'];
  typeSelected: null | 'Efectivo' | 'Mercado Pago' | 'Otro' = null;
  doNotCloseMenu = (event) => event.stopPropagation();

  constructor(private paymentService: PaymentService,
              private loaderService: LoaderService,
              private userService: UserService,
              private fieldService: FieldService,
              private sweetAlertService: SweetAlertService,
              private debtService: DebtService,
              private errorService: ErrorsService,
              private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.getFieldCombo();
    this.getPayments();
    this.throwNotification();
  }
  getFieldCombo(){
    this.fieldService.getFieldCombo(this.userLogged.sportCenter.id)
                  .subscribe((resp: any) => {
                    if(resp.ok){
                      this.fieldsCombo = resp.param.combo;
                    }
                  }, (err) => {
                    console.log(err)
                    this.loaderService.closeLineLoader();
                    this.errorService.showErrors(err.error.code,err.error.msg)
                  });
  }
  getPayments(){
    this.filterON = true;
    this.loaderService.openLineLoader();
    this.paymentService.getSportCenterPayments(this.filters, this.userLogged.sportCenter.id,this.page)
                    .subscribe((resp: any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.payments = resp.param.payments;
                        this.page = resp.param.paginator.page;
                        this.totalPages = resp.param.paginator.totalPages;
                        this.filterON = false;
                      }
                    },(err)=>{
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                      console.log(err)
                    })
  }
  acceptPayment(paymentID){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Aceptar pago?',
      text:'',
      icon: 'question'
      })
      .then((result) => {
        if (result.value) {
          this.loaderService.openLineLoader();
          this.paymentService.acceptPayment(paymentID)
                          .subscribe((resp: any)=>{
                            this.loaderService.closeLineLoader();
                            if(resp.ok){
                              this.sweetAlertService.showSwalResponse({
                                title:'Pago aceptado',
                                text:'',
                                icon: 'success'
                              })
                              this.getPayments()
                            }
                          },(err)=>{
                            this.loaderService.closeLineLoader();
                            this.errorService.showErrors(err.error.code,err.error.msg);
                            console.log(err)
                          })
        }
      })
  }
  cancelPayment(paymentID){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Cancelar pago?',
      text:'',
      icon: 'question'
      })
      .then((result) => {
        if (result.value) {
          this.loaderService.openLineLoader();
          this.paymentService.cancelPayment(paymentID)
                          .subscribe((resp: any)=>{
                            this.loaderService.closeLineLoader();
                            if(resp.ok){
                              this.sweetAlertService.showSwalResponse({
                                title:'Pago cancelado',
                                text:'',
                                icon: 'success'
                              })
                              this.getPayments()
                            }
                          },(err)=>{
                            this.loaderService.closeLineLoader();
                            this.errorService.showErrors(err.error.code,err.error.msg);
                            console.log(err)
                          })
        }
      })
  }
  paginate(page){
    this.page = page;
    this.getPayments();
  }
  throwNotification(){
    if(this.userService.haveDebt){
      this.notificationService.showDebtNotification();
    }
    if(this.userService.nonPayment){
      this.notificationService.showNonPaymentNotification();
    }
    if(this.userService.pendingPayment){
      this.notificationService.showPendingNotification();
    }
  }
  getDebtPayment(item){
    console.log(item.id)
    this.loaderService.openLineLoader();
    this.debtService.getDebtPayment(item.id)
                .subscribe((resp: any)=> {
                        this.loaderService.closeLineLoader();
                        if(resp.param.debt === null){
                          this.sweetAlertService.showSwalResponseConfirm({
                            title:'No tiene deuda generada',
                            text:'',
                            icon: 'info'
                          })
                        }else{
                          this.debtSelected = resp.param.debt;
                          this.openDebtModal()
                        }
                      },(err)=>{
                        console.log(err);
                        this.loaderService.closeLineLoader();
                        this.errorService.showErrors(err.error.code,err.error.msg);
                      })
  }
  openDebtModal(){
    this.hiddenDebtModal = true;
  }
  closeDebtModal(){
    this.hiddenDebtModal = false;
  }
  refreshTable(){
    this.filterON = false;
    this.stateSelected = null;
    this.typeSelected = null;
    this.datePaymentRangeForm.reset();
    this.sincePaymentDateSelected = null;
    this.untilPaymentDateSelected = null;
    this.dateAppointmentRangeForm.reset();
    this.sinceAppointmentDateSelected = null;
    this.untilAppointmentDateSelected = null;
    this.fieldSelected = null;
    this.fillFilterObject();
    this.getPayments();
  }
  fillFilterObject(){
    this.filters = {
      state: this.stateSelected,
      type: this.typeSelected,
      sincePaymentDate: this.sincePaymentDateSelected,
      untilPaymentDate: this.untilPaymentDateSelected,
      sinceAppointmentDate: this.sinceAppointmentDateSelected,
      untilAppointmentDate: this.untilAppointmentDateSelected,
      fieldID: this.fieldSelected === null ? null : this.fieldSelected.id
    }
  }
  setFieldID(){
    this.fillFilterObject();
    this.getPayments();
  }
  resetFields(){
    this.fieldSelected = null;
    this.fillFilterObject();
  }
  filterPaymentDates(){
    if (this.datePaymentRangeForm.invalid){
      Object.values(this.datePaymentRangeForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.filterON = true;
    this.sincePaymentDateSelected = this.datePaymentRangeForm.controls['sinceDateSelected'].value;
    this.untilPaymentDateSelected = this.datePaymentRangeForm.controls['untilDateSelected'].value;
    this.formatPaymentDates();
    this.fillFilterObject();
    this.getPayments();
  }
  resetPaymentDates(){
    this.datePaymentRangeForm.reset();
    this.sincePaymentDateSelected = null;
    this.untilPaymentDateSelected = null;
    // this.formatDates();
    this.fillFilterObject();
    this.getPayments();
  }
  filterAppointmentDates(){
    if (this.dateAppointmentRangeForm.invalid){
      Object.values(this.dateAppointmentRangeForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.filterON = true;
    this.sinceAppointmentDateSelected = this.dateAppointmentRangeForm.controls['sinceDateSelected'].value;
    this.untilAppointmentDateSelected = this.dateAppointmentRangeForm.controls['untilDateSelected'].value;
    this.formatAppointmentDates();
    this.fillFilterObject();
    this.getPayments();
  }
  resetAppointmentDates(){
    this.dateAppointmentRangeForm.reset();
    this.sinceAppointmentDateSelected = null;
    this.untilAppointmentDateSelected = null;
    // this.formatDates();
    this.fillFilterObject();
    this.getPayments();
  }
  formatPaymentDates(){
    let since = this.sincePaymentDateSelected.toISOString();
    let until = this.untilPaymentDateSelected.toISOString();
    this.sincePaymentDateSelected = since.slice(0,10);
    this.untilPaymentDateSelected = until.slice(0,10);
  }
  formatAppointmentDates(){
    let since = this.sinceAppointmentDateSelected.toISOString();
    let until = this.untilAppointmentDateSelected.toISOString();
    this.sinceAppointmentDateSelected = since.slice(0,10);
    this.untilAppointmentDateSelected = until.slice(0,10);
  }
  filterState(){
    this.fillFilterObject();
    this.getPayments();
  }
  resetState(){
    this.stateSelected = null;
    this.fillFilterObject();
    this.getPayments();
  }
  filterType(){
    this.fillFilterObject();
    this.getPayments();
  }
  resetType(){
    this.typeSelected = null;
    this.fillFilterObject();
    this.getPayments();
  }
}
