import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
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

  constructor(private paymentService: PaymentService,
              private loaderService: LoaderService,
              private userService: UserService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.getPayments();
  }
  getPayments(){
    this.filterON = true;
    this.loaderService.openLineLoader();
    this.paymentService.getSportCenterPayments(this.userLogged.sportCenter._id,this.page)
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
}
