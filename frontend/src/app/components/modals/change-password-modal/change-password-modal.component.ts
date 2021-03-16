import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.css']
})
export class ChangePasswordModalComponent implements OnInit {

  @Input() hiddenPasswordModal: boolean;
  passwordForm: FormGroup;
  @Output() closeModalOutput: EventEmitter<boolean>;

  constructor(private fb: FormBuilder,
              private validator: ValidatorService,
              private userService: UserService,
              private errorService: ErrorsService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService) {
                this.closeModalOutput = new EventEmitter(); 
                this.createPasswordForm()
  }

  ngOnInit(): void {
  }
  createPasswordForm(){
    this.passwordForm = this.fb.group({
      oldPassword:[,[Validators.required,Validators.minLength(6),Validators.maxLength(20)],],
      password:[,[Validators.required, Validators.minLength(6),Validators.maxLength(20)]],
      password2:[,[Validators.required,Validators.minLength(6),Validators.maxLength(20)]]
    },{validators: this.validator.passEqual("password","password2")})
  }

  closeModal(){
    this.hiddenPasswordModal=false;
    this.passwordForm.reset();
    this.closeModalOutput.emit(this.hiddenPasswordModal)
  }
  changePassword(){
    if (this.passwordForm.invalid){
      Object.values(this.passwordForm.controls).forEach(control=>{
        control.markAsTouched();
      })
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Confirmar cambio de contraseña?',
      text: `Al confirmar, se realizará el cambio de contraseña solicitado`,
      icon:'question'
    })
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.userService.changePassword( this.passwordForm.value )
                              .subscribe((resp: any) => {
                                if(resp.ok === true){
                                  this.loaderService.closeLineLoader();
                                  this.sweetAlertService.showSwalResponse({
                                    title: 'Contraseña cambiada',
                                    text:'',
                                    icon: "success",
                                  })
                                   this.closeModal(); 
                                 }
                                 else if (resp.ok === false){
                                   this.loaderService.closeLineLoader();
                                   console.log(resp)
                                   this.errorService.showErrors(resp.responseCode,resp.descriptionCode);
                                   this.passwordForm.reset();
                                   this.passwordForm.controls['oldPassword'].markAsTouched()
                                 }
                             }, (err) => {
                               console.log(err)
                              this.errorService.showServerError()
                              this.loaderService.closeLineLoader();
                            })
      }
    })
  }
  getFieldValid(field : string){
    return this.passwordForm.get(field).invalid &&
            this.passwordForm.get(field).touched
 }

}
