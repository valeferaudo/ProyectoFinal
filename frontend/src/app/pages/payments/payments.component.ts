import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
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

  constructor(private paymentService: PaymentService,
              private router: Router,
              private userService: UserService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService,
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
    this.paymentService.getUserPayments(this.userLogged.uid,this.page)
                      .subscribe((resp: any)=> {
                        //traer solo algunos datos, no los criticos.
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
}
