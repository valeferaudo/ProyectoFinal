import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { RowInput, UserOptions } from 'jspdf-autotable';
import { User } from 'src/app/models/user.model';
import { LoaderService } from 'src/app/services/loader.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
interface jsPDFWithPlugin extends jsPDF{
  autoTable: (options: UserOptions) => jsPDF;
}
@Component({
  selector: 'app-payment-report',
  templateUrl: './payment-report.component.html',
  styleUrls: ['./payment-report.component.css']
})
export class PaymentReportComponent implements OnInit {

  reportTime = new Date();
  selectedFilters;
  payments = [];
  userLogged: User;

  doNotCloseMenu = (event) => event.stopPropagation();
  dateRangeForm = new FormGroup({
    sinceDateSelected :new FormControl('',[Validators.required]),
    untilDateSelected : new FormControl('',[Validators.required])
  })
  maxDate = new Date(new Date().getTime() + (25 * 86400000));
  sinceDateSelected = null;
  untilDateSelected = null;
  sinceDate: string;
  untilDate: string;
  filterObject = {
    sinceDate: null,
    untilDate: null,
  }
  constructor(private loaderService: LoaderService,
              private reportService: ReportService,
              private userService: UserService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.fillFilterObject()
    this.getPayments();
  }
  filterDates(){
    if (this.dateRangeForm.invalid){
      Object.values(this.dateRangeForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sinceDateSelected = this.dateRangeForm.controls['sinceDateSelected'].value;
    this.untilDateSelected = this.dateRangeForm.controls['untilDateSelected'].value;
    this.formatDates();
    this.fillFilterObject();
    this.getPayments();
  }
  resetDates(){
    this.dateRangeForm.reset();
    this.sinceDateSelected = null;
    this.untilDateSelected = null;
    this.sinceDate = null;
    this.untilDate = null;
    this.fillFilterObject();
    this.getPayments();
  }
  formatDates(){
    if(this.sinceDateSelected !== null && this.untilDateSelected !== null){
      let since = this.sinceDateSelected.toISOString();
      let until = this.untilDateSelected.toISOString();
      this.sinceDate = since.slice(0,10);
      this.untilDate = until.slice(0,10);
    }
    else{
      this.sinceDate = null;
      this.untilDate = null;
    }
  }
  fillFilterObject(){
    this.filterObject = {
      sinceDate: this.sinceDate,
      untilDate: this.untilDate,
    }
  }
  getPayments(){
    this.loaderService.openLineLoader();
    this.reportService.generatePaymentReport(this.userLogged.sportCenter.id,this.filterObject)
                  .subscribe((resp:any)=>{
                    this.payments = resp.param.payments
                  })
  }
  generateReport(){
    const doc = new jsPDF('p','px','a4') as jsPDFWithPlugin
    this.loaderService.openFullScreenLoader();
    let body: RowInput[] = [];
    let i = 1;
    this.payments.forEach(payment => {
      const item: string[] = [`${i}`,payment.type,payment.date,payment.amountPayment,payment.appointmentField,payment.appointmentDate]
      body.push(item)
      i++;
    });
    doc.setFontSize(30);
    doc.text('Reporte - Pagos',15,30,{renderingMode:'fillThenStroke'});
    doc.setFontSize(10);
    let fechaReporte = this.reportTime.toLocaleDateString();
    let horaReporte = this.reportTime.toLocaleTimeString().slice(0, -3);
    doc.text(`Fecha: ${fechaReporte}`,15,50);
    doc.text(`Hora: ${horaReporte}`,90,50)
    // doc.text(`Filtrado por: ${this.selectedFilters}`,15,60);
    doc.autoTable({
      startY:75,
      theme:'striped',
      head:[['#','Medio','Fecha Pago', 'Monto', 'Cancha','Turno']],
      body: body,
      bodyStyles: {overflow:'linebreak', lineColor:[189,195,199], lineWidth:0.75},
      tableWidth: 390,
      styles: {overflow: 'ellipsize'},
      // styles: {overflow: 'linebreak'},

      columnStyles: {
        0: {cellWidth: 20},
        1: {cellWidth: 120},
        2: {cellWidth: 30},
        3: {cellWidth: 50},
        4: {cellWidth: 30},
        5: {cellWidth: 110},
        6: {cellWidth: 30},
      },
      tableLineColor: [189, 195, 199],
      tableLineWidth: 0.75,
      },)
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setPage(i)
        doc.text(`${i}/${doc.getNumberOfPages()}`,420,620)
      }
      const date = new Date();
      doc.save(`Pagos.pdf`)
    this.loaderService.closeFullScreenLoader();
  }
}
