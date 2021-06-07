import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SportCenterService } from 'src/app/services/sport-center.service';

@Component({
  selector: 'app-sport-center-info-modal',
  templateUrl: './sport-center-info-modal.component.html',
  styleUrls: ['./sport-center-info-modal.component.css']
})
export class SportCenterInfoModalComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Input() sportCenterSelectedID: string;
  @Output() closeModal = new EventEmitter<string>();

  sportCenterForm: FormGroup;
  sportCenter: SportCenter;
  slideElectricity: boolean = false;
  slideMercadoPago:boolean = false;
  deletedDate = null;
  constructor(private fb: FormBuilder,
              private sportCenterService: SportCenterService,
              private errorService: ErrorsService,
              private loaderService: LoaderService) { }

  ngOnInit(): void {
    this.createSportCenterForm();
    this.getSportCenter();
    console.log('soprsa')
  }
  closedModal(){
    this.closeModal.emit()
  }

  createSportCenterForm(){
    this.sportCenterForm = this.fb.group({
      name:[{value:'',disabled:true}],
      address:[{value:'',disabled:true}],
      phone:[{value:'',disabled:true}],
      aditionalElectricityHour:[{value:'',disabled:true}],
      aditionalElectricity:[{value:null,disabled:true}],
      mercadoPago:[{value:null,disabled:true}]
    })
  }
  setSlide(){
    if (this.sportCenterForm.controls['aditionalElectricity'].value > 0){
      this.slideElectricity = true;
    }
    else{
      this.slideElectricity = false;
    }
    if(this.sportCenterForm.controls['mercadoPago'].value){
      this.slideMercadoPago = true;
    }
    else{
      this.slideMercadoPago = false;
    }
  }
  getSportCenter(){
    this.loaderService.openLineLoader();
    this.sportCenterService.getSportCenter(this.sportCenterSelectedID)
                  .subscribe((resp:any)=>{
                    this.loaderService.closeLineLoader();
                    if (resp.ok){
                      this.sportCenter = resp.param.sportCenter;
                      this.fillForm();
                    }
                  }, (err) => {
                    console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada')
                  })
  }
  fillForm(){
    this.sportCenterForm.patchValue({
      name: this.sportCenter.name,
      address: this.sportCenter.address,
      phone: this.sportCenter.phone,
      aditionalElectricityHour: this.sportCenter.aditionalElectricityHour,
      aditionalElectricity: this.sportCenter.aditionalElectricity,
      mercadoPago: this.sportCenter.mercadoPago
    })
    this.deletedDate = this.sportCenter.deletedDate;
    this.setSlide();
  }

}
