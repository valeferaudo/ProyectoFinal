import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  
  constructor(private http: HttpClient) { }

  getCurrentWeather(){
    const header = new HttpHeaders({
        "x-rapidapi-key": 'a19ae69793mshb918e554e5b361bp17ee5cjsne73d3c546f76',
        "x-rapidapi-host": 'community-open-weather-map.p.rapidapi.com'
    })
    return this.http.get('https://community-open-weather-map.p.rapidapi.com/weather?q=rosario&lang=sp&units=metric',{headers:header});
  }
  getPerHour(){
    const header = new HttpHeaders({
        "x-rapidapi-key": "a19ae69793mshb918e554e5b361bp17ee5cjsne73d3c546f76",
        "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com"
    })
    return this.http.get('https://community-open-weather-map.p.rapidapi.com/forecast?q=rosario%2Car&units=metric&lang=sp&cnt=4',{headers:header});
  }
  getForecast(){
    const header = new HttpHeaders({
        "x-rapidapi-key": "a19ae69793mshb918e554e5b361bp17ee5cjsne73d3c546f76",
        "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com"
    })
    return this.http.get('https://community-open-weather-map.p.rapidapi.com/forecast/daily?q=rosario%2Car&cnt=16&units=metric',{headers:header});
  }
}
