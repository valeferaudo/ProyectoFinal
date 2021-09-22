import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DebtFilter } from 'src/app/interfaces/filters/debtFilter.interface';
import { Debt } from 'src/app/models/debt.model';
import { DebtService } from 'src/app/services/debt.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-debt-table',
  templateUrl: './debt-table.component.html',
  styleUrls: ['./debt-table.component.css']
})
export class DebtTableComponent implements OnInit {

  sportCenterID;
  debts: Debt [] = [];
  totalPages = null;
  page = 1;
  filters: DebtFilter = {
    state: 'Abiertas',
    payment: 'No Pagas'
  }
  @Input() hiddenModal: boolean;
  @Output() closeModal = new EventEmitter<string>();

  constructor(private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private userService: UserService,
              private debtService: DebtService,
              private errorService: ErrorsService) { }

  ngOnInit(): void {
    this.sportCenterID = this.userService.user.sportCenter.id;
    this.getDebts();
  }
  closedModal(){
    this.closeModal.emit()
  }
  getDebts(){
    this.loaderService.openLineLoader();
    this.debtService.getCenterDebts(this.sportCenterID,this.filters, this.page)
                    .subscribe((resp:any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.debts = resp.param.debts;
                        this.page = resp.param.paginator.page;
                        this.totalPages = resp.param.paginator.totalPages;
                        if(this.debts.length === 0){
                          this.closedModal();
                        }
                      }
                    }, (err) => {
                      console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                    })
  }
  paginate(page){
    this.page = page;
    this.getDebts();
  }
  async markAsPaid(debt){
    let description;
      await Swal.fire({
      title: '¿Confirmar pago?',
      customClass: {
        validationMessage: 'my-validation-message'
      },
      html:
        '<label><strong>Descripción</strong></label>'+ '<br>'+
        '<textarea  id="swal-cancel-description" cols="30" class="swal2-input" rows="50"></textarea>',
      focusConfirm: false,
      allowOutsideClick: false,
      showCancelButton: true,
      preConfirm: (value) => {
        return [
         description = (document.getElementById('swal-cancel-description') as HTMLInputElement).value
        ];
      }
      })
      .then((result) => {
        if (result.value) {
          this.loaderService.openLineLoader();
          this.debtService.markAsPaidCenter(debt.id,description)
                          .subscribe( (resp: any)=>{
                            if(resp.ok){
                              this.loaderService.closeLineLoader();
                              this.sweetAlertService.showSwalResponse({
                                title:'Devolución realizada',
                                text: debt.user === null ? '' : 'Solo resta esperar la confirmación del usuario',
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
      });
  }
}
