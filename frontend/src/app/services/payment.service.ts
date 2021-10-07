import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PaymentFilter } from '../interfaces/filters/paymentFilter.interface';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  registerPerPage = '15';

  constructor(private http: HttpClient) { }

  initPayment(paymentBody){
    return this.http.post(`${baseUrl}/payments/create_preference`, paymentBody );
  }
  createMercadoPagoPayment(paymentBody){
    return this.http.post(`${baseUrl}/payments/mercado_pago`, paymentBody );
  }
  updateMercadoPagoPayment(paymentBody){
    return this.http.put(`${baseUrl}/payments/mercado_pago/${paymentBody.preferenceID}`, paymentBody );
  }
  getUserPayments(filters: PaymentFilter,userID,page){
    let params = new HttpParams();
    params = params.append('state',filters.state);
    params = params.append('type',filters.type);
    params = params.append('sincePaymentDate',filters.sincePaymentDate);
    params = params.append('untilPaymentDate',filters.untilPaymentDate);
    params = params.append('sinceAppointmentDate',filters.sinceAppointmentDate);
    params = params.append('untilAppointmentDate',filters.untilAppointmentDate);
    params = params.append('page',`${page}`);
    params = params.append('registerPerPage',this.registerPerPage);
    return this.http.get(`${baseUrl}/payments/user/${userID}`,{params});
  }
  getSportCenterPayments(filters: PaymentFilter, sportCenterID,page){
    let params = new HttpParams();
    params = params.append('state',filters.state);
    params = params.append('type',filters.type);
    params = params.append('sincePaymentDate',filters.sincePaymentDate);
    params = params.append('untilPaymentDate',filters.untilPaymentDate);
    params = params.append('sinceAppointmentDate',filters.sinceAppointmentDate);
    params = params.append('untilAppointmentDate',filters.untilAppointmentDate);
    params = params.append('field',filters.fieldID);
    params = params.append('page',`${page}`);
    params = params.append('registerPerPage',this.registerPerPage);
    return this.http.get(`${baseUrl}/payments/sportCenter/${sportCenterID}`,{params});
  }
  deletePayment(preferenceID){
    return this.http.delete(`${baseUrl}/payments/mercado_pago/${preferenceID}`);
  }
  acceptPayment(paymentID){
    return this.http.put(`${baseUrl}/payments/sportCenter/mercado_pago/${paymentID}`,{});
  }
  cancelPayment(paymentID){
    return this.http.delete(`${baseUrl}/payments/sportCenter/mercado_pago/${paymentID}`,{});
  }
  createSportCenterPayment(sportCenterID,paymentBody){
    return this.http.post(`${baseUrl}/payments/sportCenter/${sportCenterID}`, paymentBody );
  }
}
