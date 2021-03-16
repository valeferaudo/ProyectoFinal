import { Component, Input, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-full-screen-loader',
  templateUrl: './full-screen-loader.component.html',
  styleUrls: ['./full-screen-loader.component.css']
})
export class FullScreenLoaderComponent implements OnInit {

  @Input() message: string;
  constructor(public loaderService: LoaderService) { }

  ngOnInit(): void {
  }

}
