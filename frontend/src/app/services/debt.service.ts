import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DebtFilter } from '../interfaces/filters/debtFilter.interface';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class DebtService {
  registerPerPage = '10';

  constructor(private http: HttpClient) { }

  getCenterDebts(sportCenterID, filters: DebtFilter, page: number){
    let params = new HttpParams();
    params = params.append('state',filters.state);
    params = params.append('payment',`${filters.payment}`);
    params = params.append('page',`${page}`);
    params = params.append('registerPerPage',this.registerPerPage);
    return this.http.get(`${baseUrl}/debts/sportCenter/${sportCenterID}` ,{params});
  }
  markAsPaidCenter(debtID,description){
    return this.http.put(`${baseUrl}/debts/sportCenter/${debtID}`,{description});
  }
  getUserDebts(userID, filters: DebtFilter, page: number){
    let params = new HttpParams();
    params = params.append('state',filters.state);
    params = params.append('payment',`${filters.payment}`);
    params = params.append('page',`${page}`);
    params = params.append('registerPerPage',this.registerPerPage);
    return this.http.get(`${baseUrl}/debts/user/${userID}` ,{params});
  }
  markAsPaidUser(debtID){
    return this.http.put(`${baseUrl}/debts/user/${debtID}`,{});
  }
  getDebtPayment(paymentID){
    return this.http.get(`${baseUrl}/debts/payment/${paymentID}`);
  }
}
