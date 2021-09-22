import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-payment-debt-modal',
  templateUrl: './payment-debt-modal.component.html',
  styleUrls: ['./payment-debt-modal.component.css']
})
export class PaymentDebtModalComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Input() debt: any;
  @Output() closeModal = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }
  closedModal(){
    this.closeModal.emit()
  }

}
