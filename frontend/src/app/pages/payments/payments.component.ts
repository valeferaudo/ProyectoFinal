import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentFilter } from 'src/app/interfaces/filters/paymentFilter.interface';
import { User } from 'src/app/models/user.model';
import { DebtService } from 'src/app/services/debt.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { PaymentService } from 'src/app/services/payment.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {

  refreshMode: boolean = false;
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
              private router: Router,
              private userService: UserService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService,
              private debtService: DebtService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.getParams();
  }
  getParams(){
      this.activatedRoute.queryParams.subscribe(params => {
      if (params.preference_id === undefined, params.status === undefined, params.payment_id === undefined){
        this.refreshMode = false;
        this.getPayments();
      }
      else{
        this.loaderService.openFullScreenLoader();
        this.refreshMode = true;
        this.paymentService.updateMercadoPagoPayment(this.setPaymentObject(params))
                          .subscribe((resp: any)=>{
                            this.refreshMode = false;
                            this.router.navigate([], { queryParams: null, replaceUrl: true });
                            this.loaderService.closeFullScreenLoader();
                            if(resp.ok){
                              this.sweetAlertService.showSwalResponseDelay({
                                title:'Pago actualizado',
                                text:'',
                                icon: 'success'
                              })
                            }
                          }, (err)=> {
                            console.log(err)
                            this.sweetAlertService.showSwalResponseDelay({
                              title:'Error al registrar el pago',
                              text:'',
                              icon: 'error'
                            })
                          })
      }
    })
  }
  setPaymentObject(params){
    return {
      preferenceID: params.preference_id,
      status: params.status,
      mercadoPagoPaymentID: params.payment_id
    }
  }
  getPayments(){
    this.filterON = true;
    this.loaderService.openLineLoader();
    this.paymentService.getUserPayments(this.filters,this.userLogged.uid,this.page)
                      .subscribe((resp: any)=> {
                        this.payments = resp.param.payments;
                        this.page = resp.param.paginator.page;
                        this.totalPages = resp.param.paginator.totalPages;
                        this.filterON = false;
                        this.loaderService.closeLineLoader();
                      },(err)=>{
                        console.log(err);
                        this.loaderService.closeLineLoader();
                        this.errorService.showErrors(err.error.code,err.error.msg);
                      })
  }
  paginate(page){
    this.page = page;
    this.getPayments();
  }
  getTitle(preferenceID){
    return `ID Pago: ${preferenceID}`
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
      fieldID: null
    }
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
