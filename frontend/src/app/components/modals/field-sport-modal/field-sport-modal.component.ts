import { formattedError } from '@angular/compiler';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Combo } from 'src/app/interfaces/combo.interface';
import { Field } from 'src/app/models/field.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SportService } from 'src/app/services/sport.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-field-sport-modal',
  templateUrl: './field-sport-modal.component.html',
  styleUrls: ['./field-sport-modal.component.css']
})
export class FieldSportModalComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Input() mode: 'create' | 'update';
  @Input() fieldSelected: Field;
  @Input() sportCenterID: string;
  @Output() closeModal = new EventEmitter<string>();
  @Output() getFields = new EventEmitter<string>();

  sportsCombo: Combo [] = [];
  fieldSportForm: FormGroup;

  constructor(private fb: FormBuilder,
              private fieldService: FieldService,
              private sportService: SportService,
              private loaderService: LoaderService,
              private errorService: ErrorsService,
              private sweetAlertService: SweetAlertService) { }

  get sportFields(){
    return this.fieldSportForm.get('sportFields') as FormArray;
  }

  ngOnInit(): void {
    this.getSportsCombo();
    this.createFieldSportForm();
    this.getMode();
  }
  getSportsCombo(){
    this.sportService.getSportCombo()
                      .subscribe((resp: any) => {
                        if(resp.ok){
                          this.sportsCombo = resp.param.combo
                        }
                      },(err)=>{
                        console.log(err);
                        this.errorService.showErrors(err.error.code,err.error.msg);
                      })
  }
  getMode(){
    if(this.mode === 'update'){
      this.getField();
    }
  }
  getField(){
    this.loaderService.openLineLoader();
    this.fieldService.getField(this.fieldSelected.id)
                .subscribe((resp: any) =>{
                  this.loaderService.closeLineLoader();
                  if(resp.ok){
                    this.fieldSelected = resp.param.field;
                    this.fillForm();
                  }
                },(err) => {
                  console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                })
  }
  fillForm(){
    let i = 0;
    this.fieldSelected.sports.forEach(fs => {
      this.addSportField();
      this.sportFields.controls[i].patchValue({
        sport: fs.sport._id,
        cantPlayers: fs.cantPlayers
      })
      i++
    });
  }
  createFieldSportForm(){
    this.fieldSportForm = this.fb.group({
      sportFields: this.fb.array([])
    })
  }
  addSportField(){
    this.sportFields.push(this.addSportFieldGroup())
  }
  addSportFieldGroup(){
    return this.fb.group({
      sport: [,[Validators.required],],
      cantPlayers: ['',[Validators.required],],
    });
  }
  deleteSportField(index){
    this.sportFields.removeAt(index);
  }
  createFieldSport(){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Crear cancha-deporte?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.fieldService.updateFieldSport(this.fieldSelected.id,this.fieldSportForm.value)
                  .subscribe((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Cancha-Deporte creado',
                          text:'',
                          icon: 'success'
                        })
                        this.getFields.emit();
                        this.closedModal();
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                    })
      }
    })
  }
  closedModal(){
    this.closeModal.emit();
  }
  updateFieldSport(){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Modificar cancha-deporte?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.fieldService.updateFieldSport(this.fieldSelected.id,this.fieldSportForm.value)
                  .subscribe((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Cancha-Deporte modificado',
                          text:'',
                          icon: 'success'
                        })
                        this.getFields.emit();
                        this.closedModal();
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                    })
      }
    })
  }
  getFieldValid(field : string){
    return this.fieldSportForm.get(field).invalid &&
            this.fieldSportForm.get(field).touched
  }
}
