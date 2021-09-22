import { Component, OnInit } from '@angular/core';
import { DebtFilter } from 'src/app/interfaces/filters/debtFilter.interface';
import { User } from 'src/app/models/user.model';
import { DebtService } from 'src/app/services/debt.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-debts',
  templateUrl: './debts.component.html',
  styleUrls: ['./debts.component.css']
})
export class DebtsComponent implements OnInit {

  userLogged: User;
  debts :any [] = []
  selectedFilters: string [] = [];
  debtStates = ['Abiertas', 'Cerradas'];
  debtStateSelected: '' | 'Abiertas' | 'Cerradas' = '';
  paymentStates = ['Pagas', 'No Pagas'];
  paymentStateSelected: '' | 'Pagas' | 'No Pagas' = '';
  filterON: boolean = false;
  filters: DebtFilter = {
    state: '',
    payment: ''
  }
  totalPages = null;
  page = 1;
  doNotCloseMenu = (event) => event.stopPropagation();

  constructor(private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private debtService: DebtService,
              private userService: UserService,
              private errorService: ErrorsService,
              ) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.fillFilterObject();
    this.getDebts();
  }
  setCheckValue(){
    if(!this.filterON){
      this.debtStateSelected = '';
      this.paymentStateSelected = '';
    }else{
      this.debtStateSelected = this.filters.state;
      this.paymentStateSelected = this.filters.payment;
    }
  }
  clearFilter(type: 'all' | 'state' | 'payment'){
    this.filterON = false;
    if (type === 'all'){
      this.debtStateSelected = '';
      this.paymentStateSelected = '';    
    }else if (type === 'state'){
      this.debtStateSelected = '';
    }else if (type === 'payment'){
      this.paymentStateSelected = '';    
    }
    this.selectedFilters = [];
    this.fillFilterObject();
    this.getDebts();
  }
  refreshTable(){
    this.clearFilter('all'); 
  }
  fillFilterObject(){
    this.filters = {
      state: this.debtStateSelected,
      payment: this.paymentStateSelected
    }
  }
  getDebts(){
    this.filterON = true;
    this.loaderService.openLineLoader();
    this.debtService.getUserDebts(this.userLogged.uid,this.filters, this.page)
                    .subscribe((resp:any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.debts = resp.param.debts;
                        this.selectedFilters = resp.param.selectedFilters;
                        this.page = resp.param.paginator.page;
                        this.totalPages = resp.param.paginator.totalPages;
                        this.filterON = false;
                      }
                    }, (err) => {
                      console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                    })
  }
  filterDebts(){
    this.filterON = true;
    this.fillFilterObject();
    this.getDebts();
  }
  paginate(page){
    this.page = page;
    this.getDebts();
  }
  async markAsPaid(debt){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Cerrar devolución?',
      text: 'Aceptando, usted confirma que recibió la devolución de su pago.',
      icon: 'question',
      }).then((result) => {
        if (result.value) {
          this.loaderService.openLineLoader();
          this.debtService.markAsPaidUser(debt.id)
                          .subscribe( (resp: any)=>{
                            if(resp.ok){
                              this.loaderService.closeLineLoader();
                              this.sweetAlertService.showSwalResponse({
                                title:'Devolución Cerrada',
                                text: '',
                                icon:'success'
                              });
                              this.getDebts();
                            }
                          }, (err) => {
                            console.log(err)
                            this.errorService.showErrors(err.error.code,err.error.msg);
                            this.loaderService.closeLineLoader();
                          })
        }
      });;
  }
}
