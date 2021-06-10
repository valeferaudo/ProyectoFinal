import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-price-historial-modal',
  templateUrl: './price-historial-modal.component.html',
  styleUrls: ['./price-historial-modal.component.css']
})
export class PriceHistorialModalComponent implements OnInit {
  
  @Input() hiddenModal: boolean;
  @Input() fieldID: string = null;
  @Output() closeModal = new EventEmitter<string>();

  prices: any [] = [];

  constructor(private fieldService: FieldService,
              private loaderService: LoaderService,
              private errorService: ErrorsService) { }

  ngOnInit(): void {
    this.getPrices();
  }
  getPrices(){
    this.loaderService.openLineLoader();
    this.fieldService.getPriceHistorial(this.fieldID)
                .subscribe((resp: any) =>{
                  this.loaderService.closeLineLoader();
                  if(resp.ok){
                    console.log(resp)
                    this.prices = resp.param.priceHistorial ;
                  }
                },(err) => {
                  console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada');
                })
  }
  closedModal(){
    this.closeModal.emit();
  }
}
