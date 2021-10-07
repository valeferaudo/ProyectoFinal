import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { Combo } from 'src/app/interfaces/combo.interface';
import { OccupationFilter } from 'src/app/interfaces/filters/occupationFilter.interface';
import { Field } from 'src/app/models/field.model';
import { SportCenter } from 'src/app/models/sportCenter.model';
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
interface jsPDFWithPlugin extends jsPDF{
  autoTable2: (options: UserOptions) => jsPDF;
}

@Component({
  selector: 'app-occupation-report',
  templateUrl: './occupation-report.component.html',
  styleUrls: ['./occupation-report.component.css']
})
export class OccupationReportComponent implements OnInit {

  reportTime = new Date();
  field: Field = null;
  sportCenter: SportCenter = null;
  totalAppointments = null;
  reservedAppointments = null;
  selectedFilters = [];
  userLogged: User;
  filterObject: OccupationFilter = {
    fieldID: null,
    sinceDate: null,
    untilDate: null,
    day: null,
    sinceHour: null,
    untilHour: null
    
  };
  fieldsCombo: Combo[] = [];
  fieldSelected = null;
  fieldID = null;
  dateRangeForm = new FormGroup({
    sinceDateSelected :new FormControl(''),
    untilDateSelected : new FormControl('')
  })
  sinceDateSelected = null;
  untilDateSelected = null;
  sinceDate: string;
  untilDate: string;
  minDate: Date;
  maxDate = new Date();
  days = [{value:1, text: 'Lunes'},{value:2, text: 'Martes'},{value:3, text: 'Miércoles'},
          {value:4, text: 'Jueves'},{value:5, text: 'Viernes'},{value:6, text: 'Sábado'},{value:7, text: 'Domingo'}]
  daySelected = null;
  sinceHourSelected = 0;
  untilHourSelected = 23;
  doNotCloseMenu = (event) => event.stopPropagation();
  openSlide: boolean [] = [false,false,false,false,false,false,false];

  constructor(private fieldService: FieldService,
              private userService: UserService,
              private reportService: ReportService,
              private loaderService: LoaderService,
              private dateAdapter: DateAdapter<Date>,
              private errorService: ErrorsService){ }

  ngOnInit(): void {
    this.dateAdapter.setLocale('es-AR');
    this.userLogged = this.userService.user;
    this.setMinDate();
    this.getFieldCombo();
  }
  setMinDate(){
    this.minDate = new Date(this.userLogged.sportCenter.createdDate);
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
  clearFilters(){
    this.fieldSelected = null;
    this.fieldID = null;
    this.sinceDateSelected = null;
    this.sinceDate = null;
    this.untilDateSelected = null;
    this.untilDate = null;
    this.daySelected = null;
    this.sinceHourSelected = null;
    this.untilHourSelected = null;
    this.field = null;
    this.totalAppointments = null;
    this.reservedAppointments = null;
    this.fillFilterObject();
  }
  filterField(){
    this.fieldID = this.fieldSelected.id;
    this.fillFilterObject();
    this.getOccupation();
  }
  resetField(){
    this.fieldSelected = null;
    this.fillFilterObject();
    this.getOccupation();
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
    this.getOccupation();
  }
  resetDates(){
    this.dateRangeForm.reset();
    this.sinceDateSelected = null;
    this.untilDateSelected = null;
    this.sinceDate = null;
    this.untilDate = null;
    this.fillFilterObject();
    this.getOccupation();
  }
  filterDays(){
    this.fillFilterObject();
    this.getOccupation();
  }
  resetDays(){
    this.daySelected = null;
    this.fillFilterObject();
    this.getOccupation();
  }
  filterHour(){
    this.fillFilterObject();
    this.getOccupation();
  }
  resetHour(){
    this.sinceHourSelected = 0;
    this.untilHourSelected = 23;
    this.fillFilterObject();
    this.getOccupation();
  }
  getOccupation(){
    this.loaderService.openLineLoader();
    this.reportService.generateOccupationReport(this.userLogged.sportCenter.id,this.filterObject)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.field = resp.param.field;
                                          this.sportCenter = resp.param.sportCenter;
                                          this.reservedAppointments = resp.param.occupation.reserved;
                                          this.totalAppointments = resp.param.occupation.total;
                                          this.selectedFilters = resp.param.selectedFilters;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showErrors(err.error.code,err.error.msg)
                                        this.loaderService.closeLineLoader();
                                      });
  }
  fillFilterObject(){
    this.filterObject = {
      fieldID: this.fieldID,
      sinceDate: this.sinceDate,
      untilDate: this.untilDate,
      day: this.daySelected,
      sinceHour: this.sinceHourSelected,
      untilHour: this.untilHourSelected
    }
  }
  generateReport(){
    const doc = new jsPDF('p','px','a4') as jsPDFWithPlugin
    this.loaderService.openFullScreenLoader();
    let body: RowInput[] = [];
    const item: string[] = [this.totalAppointments,
                            this.reservedAppointments,
                            `${(this.reservedAppointments/this.totalAppointments*100).toFixed(2)} %`];
    body.push(item)
    doc.setFontSize(30);
    doc.text(`Reporte - Ocupación - ${this.field.name}`,15,30,{renderingMode:'fillThenStroke'});
    doc.setFontSize(10);
    let fechaReporte = this.reportTime.toLocaleDateString();
    let horaReporte = this.reportTime.toLocaleTimeString().slice(0, -3);
    doc.text(`Fecha: ${fechaReporte}`,15,50);
    doc.text(`Hora: ${horaReporte}`,90,50);
    this.selectedFilters.length > 0 ? doc.text(`Filtrando por: ${this.selectedFilters}.`,15,65): null;
    doc.text(`Duración del turno: ${this.field.duration / 60} HS.`,15,80);
    //TABLA DE RESULTADOS
    doc.autoTable({
      startY:100,
      margin: {
        left: 85
      },
      theme:'striped',
      head:[['Turnos posibles','Reservados','Porcentaje de utilización']],
      body: body,
      bodyStyles: {overflow:'linebreak', lineColor:[189,195,199], lineWidth:0.75},
      tableWidth: 300,
      styles: {overflow: 'ellipsize'},
      // styles: {overflow: 'linebreak'},
      columnStyles: {
        0: {cellWidth: 100},
        1: {cellWidth: 100},
        2: {cellWidth: 100}
      },
      tableLineColor: [189, 195, 199],
      tableLineWidth: 0.75,
      },)
      //TABLA INFORMACIÓN
    let body2: RowInput[] = [];
    if(this.filterObject.day !== null){
      const item2: string[] = [`${this.days[this.daySelected -1].text}`,
                                            `${this.formatHour(this.sportCenter.schedules[this.daySelected -1].openingHour)} HS.`,
                                            `${this.formatHour(this.sportCenter.schedules[this.daySelected -1].closingHour)} HS.`];
      body2.push(item2)
    }else{
      this.sportCenter.schedules.forEach(schedule => {
        const item2: string[] = [`${this.days[(schedule.day - 1)].text}`,
                              `${this.formatHour(schedule.openingHour)} HS.`,
                              `${this.formatHour(schedule.closingHour)} HS.`]
        body2.push(item2)
      });
    }
    doc.text(`Horarios`,200,155,{renderingMode:'fillThenStroke'})
    doc.autoTable({
      startY:160,
      margin: {
        left: 85
      },
      theme:'plain',
      head:[['Día','Hora Inicio','Hora Fin']],
      body: body2,
      bodyStyles: {overflow:'linebreak', lineColor:[189,195,199], lineWidth:0.75},
      tableWidth: 300,
      styles: {overflow: 'ellipsize'},
      columnStyles: {
        0: {cellWidth: 100},
        1: {cellWidth: 100},
        2: {cellWidth: 100}
      },
      tableLineColor: [189, 195, 199],
      tableLineWidth: 0.75,
      },)
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setPage(i)
        doc.text(`${i}/${doc.getNumberOfPages()}`,420,620)
      }
      const date = new Date();
      doc.save(`Ocupación.pdf`)
    this.loaderService.closeFullScreenLoader();
  }
  formatHour(date){
    console.log((new Date(new Date(date).setHours(new Date(date).getHours() - 3)).toISOString().slice(11,16)))
    return (new Date(new Date(date).setHours(new Date(date).getHours() - 3)).toISOString().slice(11,16))
  }
}
