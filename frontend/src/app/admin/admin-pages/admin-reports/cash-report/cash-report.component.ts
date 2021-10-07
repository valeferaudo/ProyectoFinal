import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { RowInput, UserOptions } from 'jspdf-autotable';

interface jsPDFWithPlugin extends jsPDF{
  autoTable: (options: UserOptions) => jsPDF;
}
@Component({
  selector: 'app-cash-report',
  templateUrl: './cash-report.component.html',
  styleUrls: ['./cash-report.component.css']
})
export class CashReportComponent implements OnInit {

  reportTime = new Date();
  appointments = [];
  userLogged: User;
  totalPaid = 0;
  totalAmount = 0;
  constructor(private loaderService: LoaderService,
            private reportService: ReportService,
            private fieldService: FieldService,
            private errorService: ErrorsService,
            private userService: UserService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user
    this.getDebtAppointments();
  }
  getDebtAppointments(){
    this.loaderService.openLineLoader();
    this.reportService.generateCashReport(this.userLogged.sportCenter.id)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.appointments = resp.param.appointments;
                                          this.totalPaid = resp.param.totalPaid;
                                          this.totalAmount = resp.param.totalAmount;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showErrors(err.error.code,err.error.msg)
                                        this.loaderService.closeLineLoader();
                                      });
  }
  generateReport(){
    const doc = new jsPDF('p','px','a4') as jsPDFWithPlugin
    this.loaderService.openFullScreenLoader();
    let body: RowInput[] = [];
    let i = 1;
    this.appointments.forEach(appointment => {
      const item: string[] = [`${i}`,
                            appointment.owner.name,
                            `${appointment.owner.phone}`,
                            appointment.field.name,
                            `${this.formatDate(appointment.date)} ${this.formatHour(appointment.date)}`,
                            `${appointment.totalPaid} / ${ appointment.totalAmount}$`]
      body.push(item)
      i++;
    });
    const lastItem: string[] = [``,
                                ``,
                                ``,
                                ``,
                                `Totales: `,
                                `${this.totalPaid} / ${ this.totalAmount} $`];
    body.push(lastItem)
    const lastItem2: string[] = [``,
                                ``,
                                ``,
                                ``,
                                `Total deuda: `,
                                `${ this.totalAmount - this.totalPaid} $`];
    body.push(lastItem2)
    doc.setFontSize(30);
    doc.text('Reporte - Falta pagos',15,30,{renderingMode:'fillThenStroke'});
    doc.setFontSize(10);
    let fechaReporte = this.reportTime.toLocaleDateString();
    let horaReporte = this.reportTime.toLocaleTimeString().slice(0, -3);
    doc.text(`Fecha: ${fechaReporte}`,15,50);
    doc.text(`Hora: ${horaReporte}`,90,50);
    doc.text(`Total registros: ${this.appointments.length}`,300,50);
    doc.autoTable({
      startY:75,
      theme:'striped',
      head:[['#','A nombre de','Teléfono', 'Cancha', 'Día y hora','Pagado']],
      body: body,
      bodyStyles: {overflow:'linebreak', lineColor:[189,195,199], lineWidth:0.75},
      tableWidth: 390,
      styles: {overflow: 'ellipsize'},
      // styles: {overflow: 'linebreak'},
      columnStyles: {
        0: {cellWidth: 15},
        1: {cellWidth: 75},
        2: {cellWidth: 70},
        3: {cellWidth: 70},
        4: {cellWidth: 90},
        5: {cellWidth: 70},
      },
      tableLineColor: [189, 195, 199],
      tableLineWidth: 0.75,
      },)
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setPage(i)
        doc.text(`${i}/${doc.getNumberOfPages()}`,420,620)
      }
      const date = new Date();
      doc.save(`FaltaPagos.pdf`)
    this.loaderService.closeFullScreenLoader();
  }
  formatDate(date){
    return (new Date(new Date(date).setHours(new Date(date).getHours() - 3)).toISOString().slice(0,10))
  }
  formatHour(date){
    return (new Date(new Date(date).setHours(new Date(date).getHours() - 3)).toISOString().slice(11,16))
  }
}
