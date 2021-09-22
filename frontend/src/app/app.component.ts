import { Component, OnInit } from '@angular/core';

declare function customInitFunctions();
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';

  ngOnInit(){
    customInitFunctions();
  }
}
