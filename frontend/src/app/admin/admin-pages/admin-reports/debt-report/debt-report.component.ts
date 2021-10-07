import { Component, OnInit } from '@angular/core';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { RowInput, UserOptions } from 'jspdf-autotable';
import { DebtFilter } from 'src/app/interfaces/filters/debtFilter.interface';
import { Debt } from 'src/app/models/debt.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ReportService } from 'src/app/services/report.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

interface jsPDFWithPlugin extends jsPDF{
  autoTable: (options: UserOptions) => jsPDF;
}

@Component({
  selector: 'app-debt-report',
  templateUrl: './debt-report.component.html',
  styleUrls: ['./debt-report.component.css']
})
export class DebtReportComponent implements OnInit {

  reportTime = new Date();
  sportCenterID;
  debts: Debt [] = []
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
  totalAmount = 0;
  doNotCloseMenu = (event) => event.stopPropagation();

  constructor(private loaderService: LoaderService,
              private reportService: ReportService,
              private errorService: ErrorsService,
              private sweetAlertService: SweetAlertService,
              private userService: UserService) { }

  ngOnInit(): void {
    this.sportCenterID = this.userService.user.sportCenter.id;
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
    this.reportService.generateDebtsReport(this.sportCenterID,this.filters)
                    .subscribe((resp:any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.debts = resp.param.debts;
                        this.selectedFilters = resp.param.selectedFilters;
                        this.totalAmount = resp.param.total;
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
  generateReport(){
    const doc = new jsPDF('p','px','a4') as jsPDFWithPlugin
    this.loaderService.openFullScreenLoader();
    let body: RowInput[] = [];
    let i = 1;
    this.debts.forEach(debt => {
      const item: string[] = [`${i}`,
                            debt.owner.name,
                            `${debt.owner.phone}`,
                            debt.field.name,
                            `${this.formatDate(debt.appointment)}- ${this.formatHour(debt.appointment)}`,
                            `${this.formatDate(debt.createdDate)}- ${this.formatHour(debt.createdDate)}`,
                            `${this.getState(debt)}`,
                            `${debt.totalDebt}$`]
      body.push(item)
      i++;
    });
    const lastItem2: string[] = [``,
                                ``,
                                ``,
                                ``,
                                ``,
                                ``,
                                `Total: `,
                                `${ this.totalAmount}$`];
    body.push(lastItem2)
    doc.setFontSize(30);
    doc.text('Reporte - Devoluciones',15,30,{renderingMode:'fillThenStroke'});
    doc.setFontSize(10);
    let fechaReporte = this.reportTime.toLocaleDateString();
    let horaReporte = this.reportTime.toLocaleTimeString().slice(0, -3);
    doc.text(`Fecha: ${fechaReporte}`,15,50);
    doc.text(`Hora: ${horaReporte}`,90,50);
    doc.text(`Total registros: ${this.debts.length}`,300,50);
    this.selectedFilters.length > 0 ? doc.text(`Filtrando por: ${this.selectedFilters}`,15,65): null;
    doc.autoTable({
      startY:75,
      theme:'striped',
      head:[['#','Pagar a','Teléfono', 'Cancha', 'Turno','Cancelación', 'Estado','Total']],
      body: body,
      bodyStyles: {overflow:'linebreak', lineColor:[189,195,199], lineWidth:0.75},
      tableWidth: 390,
      styles: {overflow: 'ellipsize'},
      // styles: {overflow: 'linebreak'},
      columnStyles: {
        0: {cellWidth: 15},
        1: {cellWidth: 45},
        2: {cellWidth: 55},
        3: {cellWidth: 45},
        4: {cellWidth: 70},
        5: {cellWidth: 70},
        6: {cellWidth: 50},
        7: {cellWidth: 40},
      },
      tableLineColor: [189, 195, 199],
      tableLineWidth: 0.75,
      },)
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setPage(i)
        doc.text(`${i}/${doc.getNumberOfPages()}`,420,620)
      }
      const date = new Date();
      doc.save(`Devoluciones.pdf`)
    this.loaderService.closeFullScreenLoader();
  }
  formatDate(date){
    return (new Date(new Date(date).setHours(new Date(date).getHours() - 3)).toISOString().slice(0,10))
  }
  formatHour(date){
    return (new Date(new Date(date).setHours(new Date(date).getHours() - 3)).toISOString().slice(11,16))
  }
  getState(debt){
    if(debt.closeDate === null && !debt.centerApprove){
      return 'Falta pago'
    }
    else if(debt.closeDate === null &&debt.centerApprove && !debt.userApprove){
      return 'Falta Aprobación'
    }
    else if(debt.closeDate !== null && debt.centerApprove && (debt.userApprove || debt.userApprove === null)){
      return 'Cerrada'
    }
    else if(debt.closeDate !== null && !debt.centerApprove){
      return 'Cerrada - Sin Pago'
    }
    else if(debt.closeDate !== null && debt.centerApprove && debt.userApprove !== null && !debt.userApprove){
      return 'Cerrada - Sin Aprobación'
    }
  }
}
