import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { RowInput, UserOptions } from 'jspdf-autotable';
import { Combo } from 'src/app/interfaces/combo.interface';
import { AppointmentTableFilter } from 'src/app/interfaces/filters/appointmentTableFilter.Interface';
import { LoaderService } from 'src/app/services/loader.service';
import { ReportService } from 'src/app/services/report.service';
import { DateAdapter } from '@angular/material/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { FieldService } from 'src/app/services/field.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ErrorsService } from 'src/app/services/errors.service';

interface jsPDFWithPlugin extends jsPDF{
  autoTable: (options: UserOptions) => jsPDF;
}
@Component({
  selector: 'app-appointment-report',
  templateUrl: './appointment-report.component.html',
  styleUrls: ['./appointment-report.component.css']
})
export class AppointmentReportComponent implements OnInit {

  reportTime = new Date();
  selectedFilters = [];
  appointments = [];
  userLogged: User;
  totalAmount = 0;
  totalPaid = 0;
  //FILTROS
  states = ['Reservado','Por comenzar','En progreso','Completado']
  statesSelected = null;
  fieldsCombo: Combo[] = [];
  fieldSelected = null;
  fieldID = null;
  doNotCloseMenu = (event) => event.stopPropagation();
  dateRangeForm = new FormGroup({
    sinceDateSelected :new FormControl('',[Validators.required]),
    untilDateSelected : new FormControl('',[Validators.required])
  })
  sinceDateSelected = null;
  untilDateSelected = null;
  sinceDate: string;
  untilDate: string;
  sinceHourSelected = 0;
  untilHourSelected = 23;
  maxDate = new Date(new Date().getTime() + (25 * 86400000));
  filterObject: AppointmentTableFilter = {
    state: null,
    sinceDate: null,
    untilDate: null,
    sinceHour: 0,
    untilHour: 23,
    fieldID: null,
    payment: null
  }
  payments = ['Total','Parcial','Sin Pagos'];
  paymentSelected: 'Total' | 'Parcial' | 'Sin Pagos';
  filterON = false;

  constructor(private loaderService: LoaderService,
              private reportService: ReportService,
              private dateAdapter: DateAdapter<Date>,
              private fieldService: FieldService,
              private errorService: ErrorsService,
              private userService: UserService) { }

  ngOnInit(): void {
    this.dateAdapter.setLocale('es-AR');
    this.userLogged = this.userService.user
    this.formatDates();
    this.getFieldCombo();
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
                    this.errorService.showErrors(99,'nada')
                  });
  }
  getAppointments(){
    if(this.statesSelected === 'Reservado'){
      this.filterObject.state= 'Reserved';
      this.getReservedAppointments();
    }
    if(this.statesSelected === 'Por comenzar'){
      this.filterObject.state= 'AboutToStart';
      this.getAboutToStartAppointments()
    }
    if(this.statesSelected === 'En progreso'){
      this.filterObject.state= 'InProgress';
      this.getInProgressAppointments();
    }
    if(this.statesSelected === 'Completado'){
      this.filterObject.state= 'Completed';
      this.getCompletedAppointments();
    }
  }
  getReservedAppointments(){
    this.loaderService.openLineLoader();
    this.reportService.generateAppointmentReport(this.userLogged.sportCenter.id,this.filterObject)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.appointments = resp.param.appointments;
                                          this.selectedFilters = resp.param.selectedFilters;
                                          this.totalAmount = resp.param.totalAmount;
                                          this.totalPaid = resp.param.totalPaid;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showErrors(err.error.code,err.error.msg)
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getAboutToStartAppointments(){
    this.loaderService.openLineLoader();
    this.reportService.generateAppointmentReport(this.userLogged.sportCenter.id,this.filterObject)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.appointments = resp.param.appointments;
                                          this.selectedFilters = resp.param.selectedFilters;
                                          this.totalAmount = resp.param.totalAmount;
                                          this.totalPaid = resp.param.totalPaid;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showErrors(err.error.code,err.error.msg)
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getInProgressAppointments(){
    this.loaderService.openLineLoader();
    this.reportService.generateAppointmentReport(this.userLogged.sportCenter.id,this.filterObject)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.appointments = resp.param.appointments;
                                          this.selectedFilters = resp.param.selectedFilters;
                                          this.totalAmount = resp.param.totalAmount;
                                          this.totalPaid = resp.param.totalPaid;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showErrors(err.error.code,err.error.msg)
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getCompletedAppointments(){
    this.loaderService.openLineLoader();
    this.reportService.generateAppointmentReport(this.userLogged.sportCenter.id,this.filterObject)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.appointments = resp.param.appointments;
                                          this.selectedFilters = resp.param.selectedFilters;
                                          this.totalAmount = resp.param.totalAmount;
                                          this.totalPaid = resp.param.totalPaid;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showErrors(err.error.code,err.error.msg)
                                        this.loaderService.closeLineLoader();
                                      });
  }
  fillFilterObject(){
    this.filterObject = {
      state: null,
      sinceDate: this.sinceDate,
      untilDate: this.untilDate,
      sinceHour: this.sinceHourSelected,
      untilHour: this.untilHourSelected,
      fieldID: this.fieldID,
      payment: this.paymentSelected
    }
    if(this.fieldSelected === null && this.statesSelected === null && this.sinceDateSelected === null && this.untilDateSelected === null 
                                  && this.sinceHourSelected === 0 && this.untilHourSelected === 23 && this.fieldSelected === null){
      this.filterON = false;
    }
    else{
      this.filterON = true;
    }
  }
  clearFilters(){
    this.appointments = [];
    this.fieldSelected = null;
    this.statesSelected = null;
    this.sinceDateSelected = null;
    this.sinceDate = null;
    this.untilDateSelected = null;
    this.untilDate = null;
    this.sinceHourSelected = 0;
    this.untilHourSelected = 23;
    this.fieldSelected = null;
    this.fieldID = null;
    this.fillFilterObject();
  }
  changeStateSelected(event:MatCheckboxChange,state){
    if(event.checked){
      this.statesSelected.push(state)
    }
    else{
      var i = this.statesSelected.indexOf( state );
      if ( i !== -1 ) {
          this.statesSelected.splice( i, 1 );
      }
    }
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
    this.getAppointments();
  }
  resetDates(){
    this.dateRangeForm.reset();
    this.sinceDateSelected = null;
    this.untilDateSelected = null;
    this.sinceDate = null;
    this.untilDate = null;
    this.fillFilterObject();
    this.getAppointments();
  }
  filterHour(){
    this.fillFilterObject();
    this.getAppointments();
  }
  resetHour(){
    this.sinceHourSelected = 0;
    this.untilHourSelected = 23;
    this.fillFilterObject();
    this.getAppointments();
  }
  filterField(){
    this.fieldID = this.fieldSelected.id;
    this.fillFilterObject();
    this.getAppointments();
  }
  resetField(){
    this.fieldSelected = null;
    this.fillFilterObject();
    this.getAppointments();
  }
  filterStates(){
    this.fillFilterObject();
    this.getAppointments();
  }
  resetStates(){
    this.statesSelected = ['Reservado'];
    this.fillFilterObject();
    this.getAppointments();
  }
  filterPayment(){
    this.fillFilterObject();
    this.getAppointments();
  }
  resetPayment(){
    this.paymentSelected = null;
    this.fillFilterObject();
    this.getAppointments();
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
                            `${this.formatDate(appointment.date)}- ${this.formatHour(appointment.date)}`,
                            `${appointment.totalPaid} / ${ appointment.totalAmount}$`]
      body.push(item)
      i++;
    });
    const lastItem2: string[] = [``,
                                ``,
                                ``,
                                ``,
                                `Total: `,
                                `${this.totalPaid} / ${this.totalAmount}$`];
    body.push(lastItem2)
    doc.setFontSize(30);
    doc.text('Reporte - Turnos',15,30,{renderingMode:'fillThenStroke'});
    doc.setFontSize(10);
    let fechaReporte = this.reportTime.toLocaleDateString();
    let horaReporte = this.reportTime.toLocaleTimeString().slice(0, -3);
    doc.text(`Fecha: ${fechaReporte}`,15,50);
    doc.text(`Hora: ${horaReporte}`,90,50);
    doc.text(`Total registros: ${this.appointments.length}`,300,50);
    this.selectedFilters.length > 0 ? doc.text(`Filtrando por: ${this.selectedFilters}`,15,65): null;
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
      doc.save(`Turnos.pdf`)
    this.loaderService.closeFullScreenLoader();
  }
  formatDate(date){
    return (new Date(new Date(date).setHours(new Date(date).getHours() - 3)).toISOString().slice(0,10))
  }
  formatHour(date){
    return (new Date(new Date(date).setHours(new Date(date).getHours() - 3)).toISOString().slice(11,16))
  }
}
