import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SportCenter } from 'src/app/models/sportCenter.model';

@Component({
  selector: 'app-one-point-map',
  templateUrl: './one-point-map.component.html',
  styleUrls: ['./one-point-map.component.css']
})
export class OnePointMapComponent implements OnInit {
  
  @Input() hiddenOnePointMap: boolean;
  @Input() sportCenter: SportCenter;

  @Output() closeModal = new EventEmitter<string>();
  @Output() goGPSModal = new EventEmitter<any>();

  lat: number;
  lng: number;
  zoom: number = 15;
  mapTypeId: string = 'roadmap';
  loadON = false;
  constructor() { }

  ngOnInit(): void {
    this.centerMap();
  }
  closedModal(){
    this.closeModal.emit()
  }
  centerMap(){
    this.lat = this.sportCenter.coords.latitude;
    this.lng = this.sportCenter.coords.longitude;
    this.loadON = true;
  }
  goGps(){
    this.goGPSModal.emit(this.sportCenter)
  }
}
