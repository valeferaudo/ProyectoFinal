import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { RowInput, UserOptions } from 'jspdf-autotable';
import { Combo } from 'src/app/interfaces/combo.interface';
import { PaymentFilter } from 'src/app/interfaces/filters/paymentFilter.interface';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
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
  totalAmount = 0;
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
  constructor(private loaderService: LoaderService,
              private reportService: ReportService,
              private fieldService: FieldService,
              private errorService: ErrorsService,
              private userService: UserService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.getFieldCombo();
    this.fillFilterObject()
    this.getPayments();
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
    this.loaderService.openLineLoader();
    this.reportService.generatePaymentReport(this.userLogged.sportCenter.id,this.filters)
                  .subscribe((resp: any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.payments = resp.param.payments;
                        this.selectedFilters = resp.param.selectedFilters;
                        this.totalAmount = resp.param.total
                        this.formatDate(this.payments[0].appointmentDate)
                      }
                    },(err)=>{
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                      console.log(err)
                    })
  }
  refreshTable(){
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
  generateReport(){
    const doc = new jsPDF('p','px','a4') as jsPDFWithPlugin
    this.loaderService.openFullScreenLoader();
    let body: RowInput[] = [];
    let i = 1;
    this.payments.forEach(payment => {
      const item: string[] = [`${i}`,
                            payment.type,
                            `${this.formatDate(payment.date)}- ${this.formatHour(payment.date)}`,
                            payment.amountPayment,payment.appointmentField.name,
                            `${this.formatDate(payment.appointmentDate)}- ${this.formatHour(payment.appointmentDate)}`,
                          payment.state === 'APPROVED' ? 'Aprobado' : 'Pendiente']
      body.push(item)
      i++;
    });
    const lastItem2: string[] = [``,
                                ``,
                                `Total: `,
                                `${ this.totalAmount}$`];
    body.push(lastItem2)
    doc.setFontSize(30);
    doc.text('Reporte - Pagos',15,30,{renderingMode:'fillThenStroke'});
    doc.setFontSize(10);
    let fechaReporte = this.reportTime.toLocaleDateString();
    let horaReporte = this.reportTime.toLocaleTimeString().slice(0, -3);
    doc.text(`Fecha: ${fechaReporte}`,15,50);
    doc.text(`Hora: ${horaReporte}`,90,50);
    doc.text(`Total registros: ${this.payments.length}`,300,50);
    this.selectedFilters.length > 0 ? doc.text(`Filtrando por: ${this.selectedFilters}`,15,65): null;
    doc.autoTable({
      startY:75,
      theme:'striped',
      head:[['#','Medio','Fecha Pago', 'Monto', 'Cancha','Turno', 'Estado']],
      body: body,
      bodyStyles: {overflow:'linebreak', lineColor:[189,195,199], lineWidth:0.75},
      tableWidth: 390,
      styles: {overflow: 'ellipsize'},
      // styles: {overflow: 'linebreak'},
      columnStyles: {
        0: {cellWidth: 15},
        1: {cellWidth: 90},
        2: {cellWidth: 75},
        3: {cellWidth: 35},
        4: {cellWidth: 50},
        5: {cellWidth: 75},
        6: {cellWidth: 50},
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
  formatDate(date){
    return (new Date(new Date(date).setHours(new Date(date).getHours() - 3)).toISOString().slice(0,10))
  }
  formatHour(date){
    return (new Date(new Date(date).setHours(new Date(date).getHours() - 3)).toISOString().slice(11,16))
  }
}
