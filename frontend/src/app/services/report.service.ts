import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { OccupationFilter } from '../interfaces/filters/occupationFilter.interface';
import { PaymentFilter } from '../interfaces/filters/paymentFilter.interface';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }

  generatePaymentReport(sportCenterID,filters: PaymentFilter){
    let params = new HttpParams();
    params = params.append('state',filters.state);
    params = params.append('type',filters.type);
    params = params.append('sincePaymentDate',filters.sincePaymentDate);
    params = params.append('untilPaymentDate',filters.untilPaymentDate);
    params = params.append('sinceAppointmentDate',filters.sinceAppointmentDate);
    params = params.append('untilAppointmentDate',filters.untilAppointmentDate);
    params = params.append('field',filters.fieldID);
    return this.http.get(`${baseUrl}/reports/payment/${sportCenterID}`,{params});
  }
  generateAppointmentReport(sportCenterID, filterObject){
    let params = new HttpParams();
    params = params.append('state', `${filterObject.state}`);
    params = params.append('sinceDate', filterObject.sinceDate);
    params = params.append('untilDate', filterObject.untilDate);
    params = params.append('sinceHour', filterObject.sinceHour);
    params = params.append('untilHour', filterObject.untilHour);
    params = params.append('fieldID', filterObject.fieldID);
    params = params.append('payment', filterObject.payment);
    return this.http.get(`${baseUrl}/reports/appointment/${sportCenterID}`,{params})
  }
  generateDebtsReport(sportCenterID, filters){
    let params = new HttpParams();
    params = params.append('state',filters.state);
    params = params.append('payment',`${filters.payment}`);
    return this.http.get(`${baseUrl}/reports/debt/${sportCenterID}`,{params})
  }
  generateCashReport(sportCenterID){
    let params = new HttpParams();
    return this.http.get(`${baseUrl}/reports/cash/${sportCenterID}`,{params})
  }
  generateOccupationReport(sportCenterID, filters: OccupationFilter){
    let params = new HttpParams();
    params = params.append('fieldID', `${filters.fieldID}`);
    params = params.append('sinceDate', filters.sinceDate);
    params = params.append('untilDate', filters.untilDate);
    params = params.append('day', filters.day);
    params = params.append('sinceHour', filters.sinceHour);
    params = params.append('untilHour', filters.untilHour);
    return this.http.get(`${baseUrl}/reports/occupation/${sportCenterID}`,{params})
  }
}
