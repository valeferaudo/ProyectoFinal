import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Appointment } from 'src/app/models/appointment.model';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-gps-map',
  templateUrl: './gps-map.component.html',
  styleUrls: ['./gps-map.component.css']
})
export class GpsMapComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Input() sportCenter: SportCenter;
  @Output() closeModal = new EventEmitter<string>();

  locationISActive: boolean = false;
  //Selector origen
  zoom: number = 13;
  originMapHidden: boolean = false;
  mapTypeId: string = 'roadmap';
  selection: 'map' | 'origin' | '' = '';
  //GPS
  map:any;
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  origin = null;
  // { lat: -32.9498518, lng: -60.6816259 }
  transport: 'car' | 'bike' | 'bus' = 'car';
  trasnportMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  searchON: boolean = false;
  constructor(private userService: UserService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) { }

  ngOnInit(): void {
    this.locationActive();
  }
  locationActive(){
    if ("geolocation" in navigator) {
      this.locationISActive = true;
    } else {
      this.locationISActive = false;
      /* la geolocalización NO está disponible */
      this.errorService.showServerError();
    }
  }
  closedModal(){
    this.closeModal.emit()
  }
  loadMap(){
    // create a new map by passing HTMLElement
    const mapEle: HTMLElement = document.getElementById('map');
    const indicatorsEle: HTMLElement = document.getElementById('indicators');
    // create map
    this.map = new google.maps.Map(mapEle, {
      center: this.origin,
      zoom: 13,
      scrollwheel: true
    });
    this.directionsDisplay.setMap(this.map);
    this.directionsDisplay.setPanel(indicatorsEle);
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      mapEle.classList.add('show-map');
      this.calculateRoute();
    });
  }
  private calculateRoute() {
    this.directionsService.route({
      origin: this.origin,
      destination: {lat:this.sportCenter.coords.latitude, lng:this.sportCenter.coords.longitude},
      travelMode: this.trasnportMode
    }, (response, status)  => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsDisplay.setDirections(response);
      } else {
        //PONER SWEET ALERTT
        alert('No se pudo calcular la ruta. Error: ' + status);
        this.errorService.showErrors(95,'');
      }
    });
  }
  openOriginMap(){
    this.selection = 'map';
    this.originMapHidden = true;
    this.origin = null;
  }
  setUserPosition(){
    navigator.geolocation.getCurrentPosition(resp => {
      this.origin = {lng: resp.coords.longitude, lat: resp.coords.latitude};
      this.originMapHidden = false;
      this.selection = 'origin';
    },
    err => {
        console.log(err);
    });
    // this.userService.getLocation()
    //               .subscribe((resp:any)=>{
    //                 this.origin = {lng: resp.location.lng, lat: resp.location.lat};
    //                 this.originMapHidden = false;
    //                 this.selection = 'origin';
    //               },(err) => {
    //                 console.log(err);
    //                 this.errorService.showServerError();
    //               });
  }
  setOrigin(coords){
    this.origin = coords.coords;
  }
  changeTransport(transport: 'car' | 'bike' | 'bus'){
    this.transport = transport;
    if(transport === 'car'){
      this.trasnportMode = google.maps.TravelMode.DRIVING
    }
    else if(transport === 'bike'){
      this.trasnportMode = google.maps.TravelMode.BICYCLING
    }
    else if(transport === 'bus'){
      this.trasnportMode = google.maps.TravelMode.TRANSIT
    }
  }
  confirmGPS(){
    this.originMapHidden = false;
    this.searchON = true;
    setTimeout(() => {
      this.loadMap();
    }, 1);
  }
  cancel(){
    this.origin = null;
    this.selection = '';
    this.searchON = false;
  }
}
