import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { UserService } from 'src/app/services/user.service';

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
  userLogged: User;
  constructor(private _config: NgbCarouselConfig,
            private userService: UserService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
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
