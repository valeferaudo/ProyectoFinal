import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  weatherHourURL = 'https://community-open-weather-map.p.rapidapi.com/weather?q=rosario&lang=sp&units=metric';
  weatherPerHour = 'https://community-open-weather-map.p.rapidapi.com/forecast?q=rosario%2Car&units=metric&lang=sp&cnt=4';
  forecastURL = 'https://community-open-weather-map.p.rapidapi.com/forecast/daily?q=rosario%2Car&cnt=16&units=metric';
  currentLocation = `https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyD3VgKPKtNrPpr-86YZT-s7SFLJtHSHyU4`
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> | any  {
    if(req.url !== this.weatherHourURL && req.url !== this.weatherPerHour && req.url !== this.forecastURL && req.url !== this.currentLocation){
      const token = localStorage.getItem('x-token') || '';
      const headers = new HttpHeaders({
        'x-token': token
      });
      const reqClone = req.clone({
        headers
      })
      return next.handle(reqClone); 
    }
    else{
      return next.handle(req)
    }
  //   return next.handle(reqClone).pipe(
  //     catchError(this.handleError)
  //   )
  // }

  // handleError(err: HttpErrorResponse){
  //   console.log(err)
  //   return throwError('manejando error en interceptor')
  // }    
  }
}
