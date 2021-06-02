import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UploadFileService } from 'src/app/services/upload-file.service';

@Component({
  selector: 'app-carousel-images',
  templateUrl: './carousel-images.component.html',
  styleUrls: ['./carousel-images.component.css']
})
export class CarouselImagesComponent implements OnInit {
  @Input() images: any[];
  @Output() deleteImage = new EventEmitter<string>();
  @Input() type: 'field' |  'sportCenter';
  @Input() mode: 'update' |  'get';
  constructor(private _config: NgbCarouselConfig,
            private  uploadFileService: UploadFileService,
            private loaderService: LoaderService,
            private errorService: ErrorsService,
            private sweetAlertService: SweetAlertService) { }

  ngOnInit(): void {
    this.setConfig();
  }
  setConfig(){
    this._config.interval =  3000;
    this._config.pauseOnHover = true;
  }
  deletedImage(image){
    this.deleteImage.emit(image)
  }
}
