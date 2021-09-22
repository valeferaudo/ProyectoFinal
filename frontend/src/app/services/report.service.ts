import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }

  generatePaymentReport(sportCenterID,filterObject){
    let params = new HttpParams();
    params = params.append('sinceDate', filterObject.sinceDate);
    params = params.append('untilDate', filterObject.untilDate);
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
    return this.http.get(`${baseUrl}/reports/appointment/reserved/${sportCenterID}`,{params})
  }
}
