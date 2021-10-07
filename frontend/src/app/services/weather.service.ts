import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  apiKEY = '14bbec25da3d20c3543be0ab82e3a265';
  
  constructor(private http: HttpClient) { }

  getCurrentWeather(){
    const header = new HttpHeaders({
        "Access-Control-Allow-Origin": "*"
    })
    return this.http.get(`/data/2.5/weather?q=rosario&lang=sp&units=metric&appid=${this.apiKEY}`,{headers:header});
  }
  getPerHour(){
    return this.http.get(`/data/2.5/forecast?q=rosario%2Car&units=metric&lang=sp&cnt=4&appid=${this.apiKEY}`);
  }
  getForecast(){
    return this.http.get(`/data/2.5/forecast/daily?q=rosario%2Car&cnt=16&units=metric&appid=${this.apiKEY}`);
  }
}
