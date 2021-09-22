import { Component, OnInit } from '@angular/core';

declare function customInitFunctions();
declare function toastInitFunctions();


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    customInitFunctions();
    toastInitFunctions();
  }

}
